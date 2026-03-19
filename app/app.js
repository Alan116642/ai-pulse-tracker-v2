const API_BASE = "http://127.0.0.1:8010/api";
const FALLBACK_URL = "./dashboard_data.json";
const IS_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const state = {
  data: null,
  lastSuccessAt: "",
  isRefreshing: false
};

const themeLabels = {
  agent: "Agent 与工作流",
  developer_tooling: "开发工具化",
  multimodal: "多模态",
  enterprise: "企业化落地",
  open_source: "开源扩散"
};

const tierLabels = {
  T0: "T0 官方源",
  T1: "T1 官方账号",
  T2: "T2 社区首发",
  T3: "T3 科技媒体",
  T4: "T4 二次搬运"
};

const mergeLabels = {
  same_event: "主事件",
  event_update: "更新链",
  duplicate: "重复来源"
};

function maybeRepairMojibake(value) {
  if (typeof value !== "string" || !value) return value;
  if (!/[ÃæåäçèéêëîïôöûüÿŒœ]/.test(value) && !/æ|å|ç|é|è|ä|ö|ü/.test(value)) {
    return value;
  }
  try {
    const bytes = Uint8Array.from(Array.from(value, (char) => char.charCodeAt(0) & 0xff));
    const repaired = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    if (/[一-龥]/.test(repaired) || /AI|Agent|GitHub|OpenAI|Claude|Gemini/.test(repaired)) {
      return repaired;
    }
    return value;
  } catch {
    return value;
  }
}

function deepRepair(input) {
  if (Array.isArray(input)) {
    return input.map((item) => deepRepair(item));
  }
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, deepRepair(value)])
    );
  }
  if (typeof input === "string") {
    return maybeRepairMojibake(input);
  }
  return input;
}

function cleanText(value, fallback) {
  if (!value) return fallback;
  const repaired = deepRepair(value);
  if (typeof repaired !== "string") return fallback;
  if (/[�]/.test(repaired) || /\?{2,}/.test(repaired)) return fallback;
  return repaired.trim() || fallback;
}

function themeLabel(value) {
  const repaired = cleanText(value, value || "--");
  return themeLabels[repaired] || repaired || "--";
}

function tierLabel(value) {
  const repaired = cleanText(value, value || "--");
  return tierLabels[repaired] || repaired || "--";
}

function mergeLabel(value) {
  const repaired = cleanText(value, value || "--");
  return mergeLabels[repaired] || repaired || "--";
}

function percent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function decimal(value) {
  return Number(value || 0).toFixed(2);
}

function formatDateTime(value) {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return cleanText(value, "--");
  return `${parsed.getFullYear()}/${parsed.getMonth() + 1}/${parsed.getDate()} ${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return cleanText(value, "--");
  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractUrl(text) {
  const match = String(text || "").match(/https?:\/\/\S+/);
  return match ? match[0].replace(/[)>}\]]+$/, "") : "";
}

function normalizeReportText(text) {
  return cleanText(String(text || ""), "")
    .replace(/^- /, "")
    .replace(/[#*`]/g, "")
    .replace(/\s*[|｜]\s*主源[:：]?\s*https?:\/\/\S+/g, "")
    .trim();
}

function parseReport(markdown) {
  const lines = cleanText(markdown || "", "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  let current = { title: "摘要", items: [] };

  for (const line of lines) {
    if (line.startsWith("#")) {
      if (current.items.length || current.title !== "摘要") {
        sections.push(current);
      }
      current = { title: line.replace(/^#+\s*/, ""), items: [] };
      continue;
    }
    current.items.push({
      text: normalizeReportText(line),
      url: extractUrl(line)
    });
  }

  if (current.items.length || !sections.length) {
    sections.push(current);
  }

  return sections;
}

async function fetchJson(url, init) {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {})
      }
    });
    if (!response.ok) return null;
    return deepRepair(await response.json());
  } catch {
    return null;
  }
}

async function loadDashboard() {
  if (IS_LOCAL) {
    const live = await fetchJson(`${API_BASE}/dashboard/overview?t=${Date.now()}`);
    if (live) return live;
  }
  return await fetchJson(`${FALLBACK_URL}?t=${Date.now()}`);
}

async function loadHealth() {
  if (!IS_LOCAL) {
    return {
      status: "ok",
      mode: "static-live",
      scheduler: "github-actions",
      database: "published-json"
    };
  }
  return await fetchJson(`${API_BASE}/health?t=${Date.now()}`);
}

function defaultCopy() {
  return IS_LOCAL
    ? "页面每 60 秒自动更新一次最新信息，也支持手动触发完整实时抓取。"
    : "页面每 60 秒自动轮询一次站点最新信息，也支持手动刷新查看最近发布内容。";
}

function setStatus({ online, title, copy, note, error }) {
  const dot = document.getElementById("statusDot");
  const titleNode = document.getElementById("statusTitle");
  const copyNode = document.getElementById("statusCopy");
  const noteNode = document.getElementById("statusMessage");

  dot.classList.toggle("offline", !online);
  titleNode.textContent = cleanText(title, "实时引擎在线");
  copyNode.textContent = cleanText(
    copy,
    defaultCopy()
  );
  noteNode.textContent = cleanText(error || note || "", "");
  noteNode.style.color = error ? "#b3473a" : "";
}

function renderFocus(data) {
  const focus = data.events?.[0] || {};
  const processed = focus.processed_items?.[0] || {};

  document.getElementById("focusTitle").textContent = cleanText(
    focus.canonical_title,
    "正在等待最新信息…"
  );
  document.getElementById("focusSummary").textContent = cleanText(
    processed.summary_cn || focus.core_change,
    "系统会优先展示最近一次成功抓取的高价值事件。"
  );
  document.getElementById("focusLink").href = focus.primary_source_url || "#";
  document.getElementById("focusTrust").innerHTML = `
    <div><span>主体公司</span><strong>${escapeHtml(cleanText(focus.company, "AI 产品"))}</strong></div>
    <div><span>来源等级</span><strong>${escapeHtml(tierLabel(focus.primary_source_tier))}</strong></div>
    <div><span>支持来源</span><strong>${escapeHtml(String(focus.sources_count || 0))}</strong></div>
    <div><span>新颖度</span><strong>${escapeHtml(decimal(processed.novelty_score))}</strong></div>
  `;
}

function renderMetrics(data) {
  const metrics = [
    ["24 小时新事件", data.metrics?.new_events_24h || 0],
    ["一手源占比", percent(data.metrics?.first_party_ratio)],
    ["海外事件占比", percent(data.metrics?.overseas_ratio)],
    ["高优先级事件", data.metrics?.high_priority_events || 0]
  ];

  document.getElementById("lastSuccessChip").textContent = formatDateTime(
    data.metrics?.last_success_at
  );

  document.getElementById("metricGrid").innerHTML = metrics
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </article>
      `
    )
    .join("");
}

function renderTicker(data) {
  const events = (data.events || []).slice(0, 12);
  document.getElementById("tickerTrack").innerHTML = events
    .map(
      (event) => `
        <article class="ticker__item">
          <div class="ticker__company">
            <strong>${escapeHtml(cleanText(event.company, "AI 产品"))}</strong>
            <span>${escapeHtml(tierLabel(event.primary_source_tier))}</span>
          </div>
          <div class="ticker__title">${escapeHtml(cleanText(event.canonical_title, "实时产品动态"))}</div>
        </article>
      `
    )
    .join("");
}

function renderTrend(data) {
  const snapshot = data.trend_snapshot || {};
  document.getElementById("trendTheme").textContent = themeLabel(data.strongest_trend);
  document.getElementById("overview").textContent = cleanText(
    data.overview,
    "系统正在基于最新信息生成趋势判断。"
  );

  const trendStats = [
    ["证据最强趋势", themeLabel(data.strongest_trend)],
    ["证据偏弱趋势", themeLabel(data.weakest_evidence_trend)],
    ["热门公司", (snapshot.hot_companies || []).slice(0, 3).map((item) => cleanText(item, item)).join(" / ") || "暂无"],
    ["热门产品", (snapshot.hot_products || []).slice(0, 3).map((item) => cleanText(item, item)).join(" / ") || "暂无"]
  ];

  document.getElementById("trendStats").innerHTML = trendStats
    .map(
      ([label, value]) => `
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");

  const observations = data.observation_cards || data.reports?.observation_cards || [];
  document.getElementById("observationList").innerHTML = observations
    .slice(0, 3)
    .map((item) => `<div class="observation-card">${escapeHtml(cleanText(item, "系统已生成今日观察结论。"))}</div>`)
    .join("");
}

function renderEvidence(data) {
  const snapshot = data.trend_snapshot || {};

  document.getElementById("themeBadges").innerHTML = (snapshot.top_themes || [])
    .map((theme) => `<span class="badge">${escapeHtml(themeLabel(theme))}</span>`)
    .join("");

  const evidenceStats = [
    ["一手源占比", percent(snapshot.first_hand_ratio)],
    ["官方源占比", percent(snapshot.official_ratio_in_priority)],
    ["发布类占比", percent(snapshot.release_vs_update?.release)],
    ["更新类占比", percent(snapshot.release_vs_update?.update)]
  ];

  document.getElementById("evidenceGrid").innerHTML = evidenceStats
    .map(
      ([label, value]) => `
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");

  document.getElementById("evidenceLinks").innerHTML = (data.events || [])
    .slice(0, 4)
    .map(
      (event) => `
        <a href="${escapeHtml(event.primary_source_url || "#")}" target="_blank" rel="noreferrer">
          <div class="evidence-links__top">
            <span>${escapeHtml(tierLabel(event.primary_source_tier))}</span>
            <span>${escapeHtml(formatDate(event.event_date))}</span>
          </div>
          <strong>${escapeHtml(cleanText(event.canonical_title, "查看主源"))}</strong>
          <p>${escapeHtml(cleanText(event.core_change, "该动态已进入证据信息。"))}</p>
        </a>
      `
    )
    .join("");
}

function renderStream(data) {
  document.getElementById("streamList").innerHTML = (data.events || [])
    .slice(0, 12)
    .map((event) => {
      const processed = event.processed_items?.[0] || {};
      const explain = (processed.explain_score || []).slice(0, 3);
      const tags = (event.trend_tags || []).map((tag) => themeLabel(tag));

      return `
        <article class="stream-card">
          <div class="stream-card__time">
            <strong>${escapeHtml(formatDate(event.event_date))}</strong>
            <span class="time-pill">${escapeHtml(cleanText(processed.realtime_bucket, "12h"))}</span>
          </div>
          <div class="stream-card__body">
            <div class="stream-card__meta">
              <span>${escapeHtml(cleanText(event.company, "AI 产品"))}</span>
              <span>${escapeHtml(tierLabel(event.primary_source_tier))}</span>
              <span>${escapeHtml(mergeLabel(event.merge_type))}</span>
              <span>${escapeHtml(cleanText(processed.evidence_type, "official_release"))}</span>
            </div>
            <h3>${escapeHtml(cleanText(event.canonical_title, "实时产品动态"))}</h3>
            <p class="stream-card__summary">${escapeHtml(cleanText(processed.summary_cn || event.core_change, "该动态已进入实时快讯流。"))}</p>
            <div class="badge-row">
              ${tags.map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
            </div>
            <div class="badge-row">
              ${explain.map((line) => `<span class="badge">${escapeHtml(cleanText(line, "已完成筛选判断。"))}</span>`).join("")}
            </div>
            <div class="stream-card__footer">
              <div class="stream-card__stats">
                <span>新颖度 ${escapeHtml(decimal(processed.novelty_score))}</span>
                <span>来源 ${escapeHtml(String(event.sources_count || 0))}</span>
                <span>可信度 ${escapeHtml(decimal(event.confidence))}</span>
              </div>
              <a class="source-link" href="${escapeHtml(event.primary_source_url || "#")}" target="_blank" rel="noreferrer">打开主源</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function sourceHealthLabel(value) {
  const repaired = cleanText(value, "");
  if (!repaired) return "等待更新";
  if (repaired.startsWith("healthy_no_new_items")) return "本轮无新增";
  if (repaired.startsWith("healthy")) return "稳定在线";
  return "需要重试";
}

function renderSources(data) {
  document.getElementById("sourceList").innerHTML = (data.sources || [])
    .slice(0, 10)
    .map(
      (source) => `
        <div class="source-row">
          <div>
            <strong>${escapeHtml(cleanText(source.source_name, "重点来源"))}</strong>
            <p>${escapeHtml(cleanText(source.source_type, "source"))} / ${escapeHtml(cleanText(source.region, ""))}</p>
          </div>
          <div class="source-row__right">
            <strong>${escapeHtml(tierLabel(source.source_tier))}</strong>
            <small>${escapeHtml(sourceHealthLabel(source.health?.extractor_status || ""))}</small>
          </div>
        </div>
      `
    )
    .join("");
}

function renderReportSections(elementId, markdown) {
  const sections = parseReport(markdown);
  document.getElementById(elementId).innerHTML = sections
    .map(
      (section) => `
        <section class="report-group">
          <div class="report-group__head">
            <strong>${escapeHtml(cleanText(section.title, "摘要"))}</strong>
            <span class="report-group__title">${escapeHtml(String(section.items.length))} 条</span>
          </div>
          <div class="report-sections">
            ${section.items
              .map(
                (item, index) => `
                  <article class="report-item">
                    <span class="report-index">${String(index + 1).padStart(2, "0")}</span>
                    <div class="report-body">
                      <p>${escapeHtml(cleanText(item.text, ""))}</p>
                      ${item.url ? `<a class="report-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">查看链接</a>` : ""}
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function renderDashboard(data) {
  state.data = data;
  state.lastSuccessAt = data.metrics?.last_success_at || state.lastSuccessAt;
  renderMetrics(data);
  renderTicker(data);
  renderFocus(data);
  renderTrend(data);
  renderEvidence(data);
  renderStream(data);
  renderSources(data);
  renderReportSections("dailySections", data.reports?.daily_markdown || "");
  renderReportSections("weeklySections", data.reports?.weekly_markdown || "");
}

async function refreshDashboard() {
  if (state.isRefreshing) return;
  state.isRefreshing = true;

  const button = document.getElementById("refreshButton");
  button.classList.add("loading");
  button.textContent = "正在刷新…";

  setStatus({
    online: true,
    title: "实时引擎在线",
    copy: defaultCopy(),
    note: IS_LOCAL ? "正在触发实时抓取，请稍候…" : "正在拉取站点最近一次发布的信息…"
  });

  try {
    if (!IS_LOCAL) {
      const latest = await loadDashboard();
      if (!latest) {
        throw new Error("no data");
      }
      renderDashboard(latest);
      setStatus({
        online: true,
        title: "站点信息已更新",
        copy: defaultCopy(),
        note: `已重新拉取最近发布的信息：${formatDateTime(latest.metrics?.last_success_at)}`
      });
      return;
    }

    const run = await fetchJson(`${API_BASE}/jobs/run-now`, {
      method: "POST",
      body: JSON.stringify({ mode: "live" })
    });

    if (!run || run.status !== "ok") {
      throw new Error("run failed");
    }

    for (let index = 0; index < 8; index += 1) {
      const next = await loadDashboard();
      if (next?.metrics?.last_success_at && next.metrics.last_success_at !== state.lastSuccessAt) {
        renderDashboard(next);
        setStatus({
          online: true,
          title: "实时引擎在线",
          copy: defaultCopy(),
          note: `最新信息已同步：${formatDateTime(next.metrics.last_success_at)}`
        });
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
    }

    const latest = await loadDashboard();
    if (latest) {
      renderDashboard(latest);
      setStatus({
        online: true,
        title: "实时引擎在线",
        copy: defaultCopy(),
        note: `已刷新到最近一次成功更新：${formatDateTime(latest.metrics?.last_success_at)}`
      });
      return;
    }

    throw new Error("no data");
  } catch {
    setStatus({
      online: true,
      title: IS_LOCAL ? "当前展示最近一次成功更新的信息" : "当前展示最近一次发布的信息",
      copy: IS_LOCAL
        ? "当部分来源短时不可用时，页面会自动保留最近一次成功抓取的 live 内容。"
        : "如果站点暂时没有新的发布版本，页面会继续显示最近一次成功发布的信息。",
      error: IS_LOCAL ? "实时刷新失败，页面已保留最近一次有效信息。" : "站点刷新失败，页面已保留最近一次有效信息。"
    });
  } finally {
    state.isRefreshing = false;
    button.classList.remove("loading");
    button.textContent = "立即刷新";
  }
}

async function bootstrap() {
  const [data, health] = await Promise.all([loadDashboard(), loadHealth()]);

  if (data) {
    renderDashboard(data);
  }

  if (health?.status === "ok") {
    setStatus({
      online: true,
      title: IS_LOCAL ? "实时引擎在线" : "站点信息在线",
      copy: defaultCopy(),
      note: `最新信息已同步：${formatDateTime(data?.metrics?.last_success_at || "")}`
    });
  } else {
    setStatus({
      online: false,
      title: "当前展示最近一次成功更新的信息",
      copy: "后端暂时不可用时，页面会自动回退到最近一次成功写入的 live 数据。",
      error: "后端接口暂时不可访问，当前显示本地信息。"
    });
  }

  document.getElementById("refreshButton").addEventListener("click", refreshDashboard);

  window.setInterval(async () => {
    const next = await loadDashboard();
    if (next) {
      renderDashboard(next);
      setStatus({
        online: true,
        title: IS_LOCAL ? "实时引擎在线" : "站点信息在线",
        copy: defaultCopy(),
        note: `${IS_LOCAL ? "信息自动更新" : "站点内容已轮询更新"}：${formatDateTime(next.metrics?.last_success_at || "")}`
      });
    }
  }, 60000);
}

bootstrap();
