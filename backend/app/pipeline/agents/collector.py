from __future__ import annotations

import hashlib
import json
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

import requests

from app.pipeline.models import RawItem, SourceRecord
from app.services.demo_seed import load_demo_payload


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []
        self._href = ""
        self._text: list[str] = []
        self._inside = False
        self.title = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            href = dict(attrs).get("href")
            if href:
                self._inside = True
                self._href = href
                self._text = []

    def handle_data(self, data: str) -> None:
        if self._inside:
            self._text.append(data.strip())

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._inside:
            text = " ".join(part for part in self._text if part).strip()
            if text:
                self.links.append((self._href, text))
            self._inside = False


class CollectorAgent:
    BLOCKED_LINK_TEXT = {
        "sign in",
        "log in",
        "privacy",
        "terms",
        "about",
        "contact",
        "careers",
        "pricing",
        "docs",
        "documentation",
        "download",
        "home",
    }

    def __init__(self, project_root: Path, sources_path: Path, seed_path: Path) -> None:
        self.project_root = project_root
        self.sources_path = sources_path
        self.seed_path = seed_path

    def load_sources(self) -> list[dict[str, Any]]:
        with self.sources_path.open("r", encoding="utf-8") as file:
            return json.load(file)["sources"]

    def collect(self, mode: str = "demo") -> tuple[list[SourceRecord], list[RawItem], list[dict[str, Any]]]:
        if mode == "demo":
            payload = load_demo_payload(self.seed_path)
            return (
                [SourceRecord(**source) for source in payload.get("sources", [])],
                [RawItem(**item) for item in payload.get("raw_items", [])],
                payload.get("source_health", []),
            )

        collected_sources: list[SourceRecord] = []
        collected_items: list[RawItem] = []
        health_rows: list[dict[str, Any]] = []

        for source in self.load_sources():
            if not source.get("enabled", True):
                continue

            started = time.perf_counter()
            try:
                items = self._collect_from_source(source)
                now_iso = datetime.now(timezone.utc).isoformat()
                collected_sources.append(
                    SourceRecord(
                        source_name=source["source_name"],
                        source_type=source["source_type"],
                        source_tier=source["source_tier"],
                        region=source["region"],
                        frequency_minutes=source["frequency_minutes"],
                        enabled=1,
                        last_success_at=now_iso,
                        last_error="",
                    )
                )
                health_rows.append(
                    {
                        "source_name": source["source_name"],
                        "last_success_at": now_iso,
                        "last_item_count": len(items),
                        "success_rate_7d": 1.0,
                        "avg_latency_ms": round((time.perf_counter() - started) * 1000, 2),
                        "extractor_status": "healthy" if items else "healthy_no_new_items",
                    }
                )
                collected_items.extend(items)
            except Exception as exc:  # noqa: BLE001
                collected_sources.append(
                    SourceRecord(
                        source_name=source["source_name"],
                        source_type=source["source_type"],
                        source_tier=source["source_tier"],
                        region=source["region"],
                        frequency_minutes=source["frequency_minutes"],
                        enabled=1,
                        last_success_at="",
                        last_error=str(exc),
                    )
                )
                health_rows.append(
                    {
                        "source_name": source["source_name"],
                        "last_success_at": "",
                        "last_item_count": 0,
                        "success_rate_7d": 0.0,
                        "avg_latency_ms": round((time.perf_counter() - started) * 1000, 2),
                        "extractor_status": f"error: {exc}",
                    }
                )

        return collected_sources, collected_items, health_rows

    def _collect_from_source(self, source: dict[str, Any]) -> list[RawItem]:
        mode = source["mode"]
        if mode == "rss":
            return self._collect_rss(source)
        if mode == "single_page":
            return self._collect_single_page(source)
        return self._collect_html(source)

    def _fetch(self, url: str) -> str:
        response = requests.get(
            url,
            timeout=20,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0 Safari/537.36",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            },
        )
        response.raise_for_status()
        response.encoding = response.apparent_encoding or response.encoding or "utf-8"
        return response.text

    def _collect_rss(self, source: dict[str, Any]) -> list[RawItem]:
        xml_text = self._fetch(source["url"])
        root = ET.fromstring(xml_text)
        items: list[RawItem] = []
        for index, item in enumerate(root.findall(".//item")[:8], start=1):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            if not title or not link:
                continue
            published = (item.findtext("pubDate") or datetime.now(timezone.utc).isoformat())[:64]
            description = (item.findtext("description") or "").strip()
            items.append(
                RawItem(
                    id=f"{source['source_name']}-{index}".replace(" ", "-").lower(),
                    source_name=source["source_name"],
                    source_type=source["source_type"],
                    source_tier=source["source_tier"],
                    source_item_key=self._make_item_key(source["source_name"], link, published),
                    title=title,
                    url=link,
                    raw_text=description[:1200],
                    published_at=published,
                    author=source["source_name"],
                    collected_at=datetime.now(timezone.utc).isoformat(),
                    language="en" if source["region"] == "global" else "zh",
                    region=source["region"],
                )
            )
        return items

    def _collect_single_page(self, source: dict[str, Any]) -> list[RawItem]:
        html = self._fetch(source["url"])
        title = source.get("title_hint") or self._extract_title(html) or source["source_name"]
        description = source.get("content_hint") or self._extract_meta_description(html) or f"Collected from {source['source_name']}"
        now = datetime.now(timezone.utc).isoformat()
        return [
            RawItem(
                id=f"{source['source_name']}-1".replace(" ", "-").lower(),
                source_name=source["source_name"],
                source_type=source["source_type"],
                source_tier=source["source_tier"],
                source_item_key=self._make_item_key(source["source_name"], source["url"], title),
                title=title[:160],
                url=source["url"],
                raw_text=description[:1200],
                published_at=now,
                author=source["source_name"],
                collected_at=now,
                language="en" if source["region"] == "global" else "zh",
                region=source["region"],
            )
        ]

    def _collect_html(self, source: dict[str, Any]) -> list[RawItem]:
        html = self._fetch(source["url"])
        parser = LinkParser()
        parser.feed(html)
        items: list[RawItem] = []
        seen: set[str] = set()
        base_url = source.get("base_url", "")
        link_contains = source.get("link_contains")

        for href, text in parser.links:
            if not self._is_useful_link(text, href, link_contains):
                continue
            if href.startswith("/"):
                url = f"{base_url}{href}"
            elif href.startswith("http"):
                url = href
            else:
                url = f"{base_url}/{href.lstrip('/')}"
            if url in seen:
                continue
            seen.add(url)
            index = len(items) + 1
            items.append(
                RawItem(
                    id=f"{source['source_name']}-{index}".replace(" ", "-").lower(),
                    source_name=source["source_name"],
                    source_type=source["source_type"],
                    source_tier=source["source_tier"],
                    source_item_key=self._make_item_key(source["source_name"], url, text),
                    title=text[:160],
                    url=url,
                    raw_text=f"Collected from {source['source_name']} for real-time monitoring.",
                    published_at=datetime.now(timezone.utc).isoformat(),
                    author=source["source_name"],
                    collected_at=datetime.now(timezone.utc).isoformat(),
                    language="en" if source["region"] == "global" else "zh",
                    region=source["region"],
                )
            )
            if len(items) >= 8:
                break
        return items

    def _is_useful_link(self, text: str, href: str, link_contains: str | None) -> bool:
        if not text or href.startswith("#"):
            return False
        normalized = " ".join(text.split()).strip()
        lower = normalized.lower()
        if link_contains and link_contains not in href:
            return False
        if len(normalized) < 8 or len(normalized) > 180:
            return False
        if any(keyword in lower for keyword in self.BLOCKED_LINK_TEXT):
            return False
        if lower.count("|") > 2:
            return False
        return True

    def _extract_title(self, html: str) -> str:
        start = html.lower().find("<title>")
        end = html.lower().find("</title>")
        if start == -1 or end == -1 or end <= start:
            return ""
        return html[start + 7:end].strip()

    def _extract_meta_description(self, html: str) -> str:
        lower = html.lower()
        marker = 'name="description"'
        if marker not in lower:
            marker = "property=\"og:description\""
        start = lower.find(marker)
        if start == -1:
            return ""
        content_marker = "content="
        content_start = lower.find(content_marker, start)
        if content_start == -1:
            return ""
        quote = html[content_start + len(content_marker)]
        if quote not in {'"', "'"}:
            return ""
        content_start += len(content_marker) + 1
        content_end = html.find(quote, content_start)
        if content_end == -1:
            return ""
        return html[content_start:content_end].strip()

    def _make_item_key(self, source_name: str, value: str, published: str) -> str:
        hashed = hashlib.sha1(f"{source_name}:{value}:{published}".encode("utf-8")).hexdigest()
        return hashed[:20]
