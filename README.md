# AI Pulse Tracker v2

一个面向国内外 AI 产品动态追踪的多 Agent 情报台 demo，重点强化海外硅谷一手动态的持续追踪、结构化筛选、事件归并与趋势判断。

## 当前交付

- `app/`
  - 可直接部署的静态 Live 网页
  - 默认展示最近一次成功更新的信息
  - 支持每 60 秒自动轮询最新信息
  - 支持手动刷新
- `backend/`
  - FastAPI + SQLite + APScheduler + 多 Agent 管线
- `scripts/run_pipeline.py`
  - 手动触发完整实时抓取和分析
- `data/reports/`
  - 日报、周报、管理摘要
- `docs/`
  - 实现说明与展示材料

## 7 个 Agent

1. 信息采集 Agent
2. 信号增强 Agent
3. 内容筛选 Agent
4. 事件归并 Agent
5. 趋势分析 Agent
6. 展示生成 Agent
7. 调度主控 Agent

## 核心能力

- `source_tier` 源头优先级硬规则
- 高频池 / 常规池分层调度
- 增量抓取与 `source_health`
- `novelty_score`
- `is_product_signal`
- `duplicate / same_event / event_update` 三分法归并
- `trend_snapshot -> 趋势判断`
- 实时快讯流、趋势判断、证据信息、实时日报、趋势周报

## 为什么它能体现“实时追踪能力”

- 页面每 60 秒自动轮询一次最新信息
- 支持手动刷新
- 本地模式下可直接触发完整实时抓取
- 部署模式下可稳定展示最近一次成功发布的数据
- 页面展示来源池、来源等级、一手源占比、海外事件占比、高优先级事件数

## 为什么它能体现“趋势判断能力”

- 基于 live 数据生成 `trend_snapshot`
- 输出“核心变化、证据最强趋势、证据偏弱趋势、观察结论卡”
- 日报和周报都直接来自最近一次 live 数据

## 目录结构

```text
.
├─ app/                          # 静态 Live 网页，可直接部署
├─ backend/                      # FastAPI + SQLite + scheduler + agents
├─ config/sources.json           # 追踪源配置
├─ data/
│  ├─ processed/                 # 最新 dashboard 数据
│  └─ reports/                   # 日报 / 周报 / 管理摘要
├─ docs/
│  ├─ implementation_guide_zh.md
│  └─ presentation_notes_zh.md
├─ frontend/                     # 之前的前端工程骨架（当前主展示不依赖它）
├─ scripts/run_pipeline.py       # 手动触发完整管线
├─ start_all.ps1                 # 本地一键启动
└─ stop_all.ps1                  # 本地一键停止
```

## 本地运行

### 1. 最稳的展示方式

直接打开静态页：

- [app/index.html](C:\Users\ROG\Desktop\codex\app\index.html)

### 2. 本地启动 Live 版本

```powershell
powershell -ExecutionPolicy Bypass -File .\start_all.ps1
```

启动后访问：

- 前端静态页：`http://127.0.0.1:3000`
- 后端接口：`http://127.0.0.1:8010`

### 3. 手动跑一次实时抓取

```powershell
py -3.12 scripts\run_pipeline.py --mode live --job-name manual
```

## 部署说明

### GitHub Pages

仓库里已经包含：

- `.github/workflows/pages.yml`
- `.github/workflows/refresh-live-data.yml`

作用分别是：

- `pages.yml`
  - 把 `app/` 发布到 GitHub Pages
- `refresh-live-data.yml`
  - 每 30 分钟运行一次 live 管线
  - 自动刷新 `app/dashboard_data.json`
  - 推送最新数据回仓库

这样部署后老师打开的是一个公网静态站，但看到的是持续刷新的 live 数据页面。

### 一键推送脚本

仓库根目录已提供：

- [publish_github_pages.ps1](C:\Users\ROG\Desktop\codex\publish_github_pages.ps1)

使用方式：

```powershell
powershell -ExecutionPolicy Bypass -File .\publish_github_pages.ps1
```

脚本会要求输入 GitHub 仓库地址，然后自动执行：

- 设置 `origin`
- 推送 `main`
- 提示后续开启 GitHub Pages

### 当前静态站行为

- 本地打开时：
  - 页面优先请求本地后端 API
- 部署后打开时：
  - 页面自动读取站点同目录的 `dashboard_data.json`
  - 手动刷新会重新拉取站点最新发布的信息

## 关键字段

- `source_tier`
  - `T0` 官方博客 / docs / changelog / GitHub release
  - `T1` 官方账号 / 创始人 / 核心负责人
  - `T2` 社区首发
  - `T3` 科技媒体
  - `T4` 二次搬运
- `novelty_score`
  - 近 7 天同公司同产品语义相似度的反向分
  - 新关键词 / 新能力描述
  - 是否来自更高 `source_tier` 的新证据
- `is_product_signal`
  - 是否属于真实的 AI 产品动态
- `merge_type`
  - `duplicate`
  - `same_event`
  - `event_update`

## 文档入口

- 实现说明：[docs/implementation_guide_zh.md](C:\Users\ROG\Desktop\codex\docs\implementation_guide_zh.md)
- 展示材料：[docs/presentation_notes_zh.md](C:\Users\ROG\Desktop\codex\docs\presentation_notes_zh.md)
