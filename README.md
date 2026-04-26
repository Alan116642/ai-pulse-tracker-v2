# AI实时news

这是我为“AI 动态追踪”题目完成的一版可直接展示的成品。

我把题目里的“AI 动态追踪”定义成 **AI 产品动作追踪**：重点追踪官方博客、产品页更新、GitHub release、开发工具更新和国内外头部平台的能力变化，再把这些零散信息整理成可读的快讯、趋势判断和日报周报。

## 最快体验方式

如果只是想直接看成品，不需要本地部署，直接打开这个在线链接即可：

- [在线体验链接](https://alan116642.github.io/ai-pulse-tracker-v2/)

如果想快速看一下页面怎么使用，可以直接打开：

- `docs/产品使用演示.gif`
- `docs/产品使用演示.mp4`

## 压缩包内建议查看顺序

1. 打开在线链接或 `app/index.html`
2. 阅读 `docs/简要分析_正式提交版.docx`
3. 阅读 `docs/说明文档_正式提交版.docx`
4. 如需验证本地 live 版，再运行 `start_live_windows.ps1` 或 `start_live_macos.sh`

## 这份提交包包含什么

- `app/`
  - 当前主展示网页
  - 支持自动轮询最近一次发布的信息
  - 支持手动刷新最近成功快照
- `backend/`
  - 本地 live 处理链路
  - 负责抓取、增强、筛选、归并、趋势分析和页面数据输出
- `config/sources.json`
  - 追踪源配置
  - 已覆盖 OpenAI、Anthropic、Google DeepMind、NVIDIA、Hugging Face、Replit、Runway、Mistral，以及 DeepSeek、智谱、Kimi、MiniMax、豆包、百度、阿里云、腾讯等重点源
- `docs/`
  - 简要分析
  - 说明文档
  - 页面截图素材
  - 产品使用演示 GIF / MP4

## 当前页面重点展示什么

- `LIVE DESK`
  - 快速看到当天最值得看的产品动作
- `本期焦点 + 指标卡`
  - 快速判断近期重点来自哪里、是不是一手源、是不是高优先级事件
- `趋势判断 + 证据信息`
  - 把零散事件压成可讨论的结论，并保留支撑证据
- `实时快讯流 + 重点来源池`
  - 回看事实层，避免判断脱离具体内容
- `实时日报 + 趋势周报`
  - 把当天和近几周变化整理成更适合阅读的输出

## 本地 live 版怎么运行

### Windows

```powershell
powershell -ExecutionPolicy Bypass -File .\start_live_windows.ps1
```

停止服务：

```powershell
powershell -ExecutionPolicy Bypass -File .\stop_live_windows.ps1
```

### macOS

```bash
chmod +x ./start_live_macos.sh
./start_live_macos.sh
```

停止服务：

```bash
chmod +x ./stop_live_macos.sh
./stop_live_macos.sh
```

启动后访问：

- 前端：`http://127.0.0.1:3000`
- 后端：`http://127.0.0.1:8010`

如需手动触发一次完整抓取链路：

```powershell
py -3.12 scripts\run_pipeline.py --mode live --job-name manual
```

## 为什么这版更适合体验

- 可以直接点在线链接打开，不需要先部署
- 页面自带最近成功更新时间、来源等级和快讯流
- 如果不想自己操作，也可以先看 `docs/产品使用演示.gif` 或 `docs/产品使用演示.mp4`
- 如果需要验证“这不是静态页”，再运行本地 live 版即可

## 关键文档

- 简要分析：`docs/简要分析_正式提交版.docx`
- 说明文档：`docs/说明文档_正式提交版.docx`
