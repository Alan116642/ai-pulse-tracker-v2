# AI Pulse Tracker v2 实现说明

## 1. 项目定位

这个 demo 不是普通新闻聚合器，而是一个面向 AI 产品动态的多 Agent 情报追踪系统。它重点强化对海外硅谷一手动态的快反捕捉，并把公开信息转换成可解释的产品判断。

## 2. 核心设计

### 2.1 源头优先

系统对 source 做硬编码分层：

- `T0`：官方博客 / docs / changelog / GitHub release
- `T1`：官方 X / 创始人 / 核心负责人
- `T2`：Hacker News / Product Hunt / Reddit / 开发者社区
- `T3`：科技媒体
- `T4`：自媒体 / 二次搬运

`source_tier` 直接参与：

- 信号打分
- 主源选择
- 前端可信感展示
- 趋势分析证据强度

### 2.2 双层时间机制

为了同时兼顾实时感与归并准确性，系统区分三类窗口：

- 实时信号窗口：3h / 6h / 12h
- 事件归并窗口：6h 到 36h
- 趋势分析窗口：7d / 30d / 90d

这样不会为了避免刷屏而牺牲前端的实时感。

### 2.3 可解释筛选

系统不是直接按热度排序，而是先判断：

1. `is_product_signal`
2. 再计算 `signal_score / usefulness_score`

关键增强字段：

- `novelty_score`
  - 近 7 天同公司同产品语义相似度反向分
  - 新关键词 / 新能力描述
  - 更高 `source_tier` 的新证据
- `evidence_type`
  - `official_release`
  - `changelog`
  - `docs_update`
  - `github_release`
  - `founder_post`
  - `media_report`
  - `community_signal`

### 2.4 三分法归并

事件归并不只是“合并/不合并”，而是：

- `duplicate`
- `same_event`
- `event_update`

`event_update` 表示同一能力演进链路中的补充更新，它不是重复，也不算完全独立的新主事件。

### 2.5 趋势分析

趋势 Agent 先做 `trend_snapshot`，再写趋势判断。

快照固定包含：

- 各主题事件数
- 7d / 30d / 90d 环比
- 海外 / 国内占比
- 一手源占比
- 高价值事件中官方源占比
- 热门公司 Top N
- 热门产品 Top N
- 发布类 vs 更新类占比

最终输出 5 段：

- 核心变化
- 证据事件
- 背后原因
- 趋势判断
- 后续观察点

## 3. 代码结构

### 后端

- [main.py](C:\Users\ROG\Desktop\codex\backend\app\main.py)
- [routes.py](C:\Users\ROG\Desktop\codex\backend\app\api\routes.py)
- [store.py](C:\Users\ROG\Desktop\codex\backend\app\services\store.py)
- [collector.py](C:\Users\ROG\Desktop\codex\backend\app\pipeline\agents\collector.py)
- [enhancer.py](C:\Users\ROG\Desktop\codex\backend\app\pipeline\agents\enhancer.py)
- [filter.py](C:\Users\ROG\Desktop\codex\backend\app\pipeline\agents\filter.py)
- [merger.py](C:\Users\ROG\Desktop\codex\backend\app\pipeline\agents\merger.py)
- [trend.py](C:\Users\ROG\Desktop\codex\backend\app\pipeline\agents\trend.py)
- [presenter.py](C:\Users\ROG\Desktop\codex\backend\app\pipeline\agents\presenter.py)
- [orchestrator.py](C:\Users\ROG\Desktop\codex\backend\app\pipeline\agents\orchestrator.py)

### 前端

- [page.tsx](C:\Users\ROG\Desktop\codex\frontend\app\page.tsx)
- [events/page.tsx](C:\Users\ROG\Desktop\codex\frontend\app\events\page.tsx)
- [reports/page.tsx](C:\Users\ROG\Desktop\codex\frontend\app\reports\page.tsx)
- [dashboard-shell.tsx](C:\Users\ROG\Desktop\codex\frontend\components\dashboard-shell.tsx)

### 静态 demo

- [index.html](C:\Users\ROG\Desktop\codex\app\index.html)
- [styles.css](C:\Users\ROG\Desktop\codex\app\styles.css)
- [app.js](C:\Users\ROG\Desktop\codex\app\app.js)

## 4. demo / live 双模式

### demo

- 使用 [demo_payload.json](C:\Users\ROG\Desktop\codex\data\seed\demo_payload.json)
- 不依赖网络和 OpenAI key
- 适合答辩稳定展示

### live

- 从公开源实时抓取
- 支持失败降级
- 更适合展示“系统正在持续追踪”

## 5. 当前环境说明

当前机器里 `node`、`python` 都不可直接运行，因此这次交付同时提供：

1. 完整工程代码
2. 可直接打开的静态 demo

这样即使现场环境不完整，也不影响展示最终效果。
