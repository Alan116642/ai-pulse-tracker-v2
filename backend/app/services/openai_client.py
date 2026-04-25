from __future__ import annotations

import json
import urllib.error
import urllib.request

from app.core.config import Settings


class OpenAIClient:
    def __init__(self, settings: Settings) -> None:
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def summarize(self, system_prompt: str, user_prompt: str) -> str | None:
        if not self.enabled:
            return None

        payload = {
            "model": self.model,
            "input": [
                {"role": "system", "content": [{"type": "input_text", "text": system_prompt}]},
                {"role": "user", "content": [{"type": "input_text", "text": user_prompt}]}
            ]
        }
        request = urllib.request.Request(
            "https://api.openai.com/v1/responses",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                body = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, UnicodeEncodeError):
            return None

        outputs = []
        for block in body.get("output", []):
            for content in block.get("content", []):
                if content.get("type") == "output_text":
                    outputs.append(content.get("text", "").strip())
        return "\n".join(part for part in outputs if part) or None
