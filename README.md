# AI 动态追踪笔试提交说明

这是一个面向国内外 AI 产品动态的追踪工具，重点强化对海外硅谷一手官方源的持续跟踪，并把公开信息整理成页面展示、简要分析和说明文档三部分结果。

## 一键查看

- 在线展示页：[https://alan116642.github.io/ai-pulse-tracker-v2/](https://alan116642.github.io/ai-pulse-tracker-v2/)

如果只想最快体验成品，直接打开上面的链接即可，不需要本地部署。

## 压缩包内优先查看内容

建议按以下顺序查看：

1. `docs/简要分析_最终版.docx`
   - 这是本次提交的“简要分析”正式版本，重点写我从页面里具体看到了哪些产品动态，以及我基于这些信号形成的判断。
2. `docs/说明文档_最终版.docx`
   - 这是本次提交的“说明文档”正式版本，重点写我是怎么一步步把这个工具做出来的、为什么这样取舍，以及过程中用了哪些 AI 工具。
3. `docs/产品使用演示.gif`
   - 这是一个轻量的页面演示动图，适合快速感受产品结构和使用路径。它用于说明页面怎么使用，不是启动程序本身。
4. `app/index.html`
   - 这是本地静态展示页入口；如果需要离线查看，可以直接打开。

## 两种体验方式

### 方式一：直接点开在线链接

- 访问 [https://alan116642.github.io/ai-pulse-tracker-v2/](https://alan116642.github.io/ai-pulse-tracker-v2/)
- 这是最轻量的体验方式，不需要部署，也不需要本地安装环境
- 页面会读取最近一次发布的 live 快照，适合快速查看成品和最新结果

### 方式二：本地运行 live 版

- 运行 `start_live_windows.ps1` 或 `start_live_macos.sh`
- 本地 live 版可以手动触发完整抓取链路，更适合验证“实时追踪 AI 动态”的能力
- `docs/产品使用演示.gif` 展示的就是页面层面的操作路径，而不是安装流程

## 这个项目解决什么问题

我没有把“AI 动态追踪”理解成普通 AI 新闻聚合，而是定义成“AI 产品动作追踪”。

我重点保留的信息包括：

- 新产品发布
- 功能或版本更新
- 模型 / API / SDK 变化
- Agent 工作流升级
- 企业接入 / 平台开放
- docs / changelog / GitHub release 中能体现能力演进的更新

这样做的原因是：真正能支撑商业判断的，往往不是媒体评论，而是厂商真实发生了哪些产品动作。

## 成品能看到什么

页面主入口是 `app/index.html`，当前展示包含：

- Live 实时追踪状态栏
- LIVE DESK 实时快讯
- 当前焦点与关键指标
- 趋势判断
- 证据信息
- 实时快讯流
- 重点来源池
- 实时日报
- 趋势周报

## 本地运行方式

### Windows

在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_live_windows.ps1
```

启动后访问：

- 前端页面：<http://127.0.0.1:3000>
- 后端接口：<http://127.0.0.1:8010>

停止命令：

```powershell
powershell -ExecutionPolicy Bypass -File .\stop_live_windows.ps1
```

### macOS

在项目根目录执行：

```bash
bash ./start_live_macos.sh
```

启动后访问：

- 前端页面：<http://127.0.0.1:3000>
- 后端接口：<http://127.0.0.1:8010>

停止命令：

```bash
bash ./stop_live_macos.sh
```

## 环境要求

- Windows 或 macOS
- Python 3.12
- 能访问公开网页源
- 本机可访问 `127.0.0.1:3000` 和 `127.0.0.1:8010`

## 目录结构

```text
.
├── app/                         当前主展示页
├── backend/                     Python + FastAPI + SQLite 后端
├── config/                      追踪源配置
├── data/                        快照、报告和处理结果
├── docs/                        分析与说明文档
├── frontend/                    早期前端工程骨架（当前主展示不依赖它）
├── scripts/                     手动脚本与辅助脚本
├── start_live_windows.ps1       Windows 启动脚本
├── stop_live_windows.ps1        Windows 停止脚本
├── start_live_macos.sh          macOS 启动脚本
└── stop_live_macos.sh           macOS 停止脚本
```

## 补充说明

- 在线展示页用于快速查看成品体验。
- 本地 live 版用于验证真实抓取、自动轮询和趋势输出能力。
- 如果希望最完整地了解项目，请优先阅读 `docs/简要分析_最终版.docx` 和 `docs/说明文档_最终版.docx`。
