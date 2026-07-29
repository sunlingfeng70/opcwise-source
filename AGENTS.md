# OPCWISE Agent Instructions

## Project Identity

OPCWISE 是一个面向企业 AI 化与 AI·OPC 创业者的产业连接平台。当前实现为大会官网（AI·OPC 创业者大会），包含信息展示页、报名表单和管理后台。

## Quick Start

```bash
npm install         # 安装依赖
npm run dev:all     # 同时启动 API 服务器 (5173) 和 Vite 前端 (80)
```

开发模式下：
- Vite 运行在 `http://localhost:80`，自动代理 `/api` 请求到 `127.0.0.1:5173`
- API 服务器运行在 `http://localhost:5173`，仅处理 API 请求（不提供静态文件）

生产构建：

```bash
npm run build                 # Vite 构建 + 复制 Worker/配置到 dist/
NODE_ENV=production npm start # API 服务器同时提供静态文件 + SPA fallback
npm run test:sites            # 验证 Sites 构建产物完整性
```

## Architecture

### Monolith — 单一层级无分包

整个应用没有分包结构。前端所有页面组件写在一个 `src/App.jsx`（~945 行），样式全部在 `src/styles.css`（~2400 行）。后端 API 全部在 `server/index.js`（~407 行）。修改时直接编辑这些文件即可，不要拆分组件或创建新目录，除非明确要求。

### Frontend (React 19 + Vite 6)

- 入口：`index.html` → `src/main.jsx` → `src/App.jsx`
- 路由：基于 URL hash 的 `useHashRoute()` 自定义 hook
  - `#/home` — 首页
  - `#/about` — 大会介绍
  - `#/schedule` — 赛程与说明
  - `#/enterprise` — 企业 AI 需求
  - `#/aigc` — AIGC 产业实践单元
  - `#/opcwise` — 了解 OPCWISE
  - `#/admin` — 管理后台
- 所有路由数据硬编码在 `App.jsx` 的常量数组中
- 图标：`@phosphor-icons/react`（`<Icon weight="bold" />` 风格统一）
- 字体：Google Fonts — Noto Sans SC（中文）+ Space Grotesc（英文）
- 样式：CSS 变量驱动（`--bg`, `--panel`, `--blue`, `--cyan`, `--violet` 等）

### Backend (Node.js HTTP Server + SQLite)

- 纯 `node:http` 创建服务器（无 Express 或其他框架）
- 数据库：`better-sqlite3`（WAL 模式）
- 两张表：`aigc_submissions` / `enterprise_submissions`（JSON 数组字段存为 TEXT）
- 文件上传：Base64 JSON body → 存到 `uploads/` 目录
- 管理后台 Token：24h 有效期，存在内存 Map 中（重启后失效）
- 管理后台默认密码 `admin123`，通过环境变量 `ADMIN_PASSWORD` 覆盖
- 日志：按日期写入 `logs/YYYY-MM-DD.log`

### API Routes

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/submit` | 报名/需求提交，JSON body |
| POST | `/api/upload` | 文件上传，Base64 编码，≤10MB，仅 JPG/PNG/WebP/PDF |
| GET | `/api/uploads/:file` | 文件访问 |
| POST | `/api/admin/login` | `{ password }` → `{ token }` |
| GET | `/api/admin/submissions?type=aigc\|enterprise&phone=` | 需 `Authorization: Bearer <token>` |

### Deployment — Cloudflare Sites + PM2

- Worker 文件：`worker/index.js` — SPA fallback（未知路由 → `/index.html`）
- Sites 构建：`scripts/prepare-sites-build.mjs` 复制 `worker/index.js` → `dist/server/index.js`
- 关键文件（**不可删除或重命名**）：`.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, `tests/sites-worker.test.mjs`
- PM2：`ecosystem.config.cjs` 管理 `opcwise-api` 和 `opcwise-vite` 两个进程
- Vite 配置有 `--configLoader runner` 参数（来自上级工具链，勿移除）

## Key Commands

| 用途 | 命令 |
|------|------|
| Dev（全量） | `npm run dev:all` |
| Dev（仅前端） | `npm run dev` |
| Dev（仅 API） | `npm run dev:server` |
| 构建 | `npm run build` |
| Sites 测试 | `npm run test:sites` |
| 生产运行 | `NODE_ENV=production npm start` |
| PM2 启动 | `npm run pm2:start` |

## Conventions & Gotchas

- **中文内容为主** — 所有页面文字、表单文案、提示信息均为简体中文
- **无 lint / 无 formatter / 无 typecheck** — 仓库没有 eslint、prettier、tsconfig 配置。修改时自行保持代码风格一致
- **组件都在一个文件里** — 不要创建新的组件文件，除非改动量非常大且有明确理由
- **Vite 代理** — `vite.config.mjs` 配置了 `/api` → `127.0.0.1:5173` 代理。生产模式下 API 服务器直接 serve `dist/client/`
- **SPA fallback** — 生产模式下 API 服务器对未知路径返回 `index.html`（SPA 路由支持）。Worker 中也有相同逻辑
- **`.DS_Store` 未在 gitignore 中** — 提交前检查 `git status`，不要误提交系统文件
- **数据库字段** — `paths`, `directions`, `needs` 是 JSON 数组以 TEXT 存储，读取后需 `JSON.parse`
- **表单部分字段** — `material_links` 和 `material_link` 字段名不一致（AIGC 表复数 / 企业表单数）。提交时注意分别处理
- **管理后台 UI** — 在 `AdminPage.jsx` 中，包含两套独立列定义 `AIGC_COLUMNS` 和 `ENTERPRISE_COLUMNS`
- **文件重名安全** — 上传文件重命名为 `时间戳-清理后文件名.扩展名`，存储在 `uploads/`

## Visual Changes

在设计稿缺失或与当前目标不一致时，先查看 `design-qa.md` 了解之前的视觉对比记录。该文件记录了桌面端（1680×944）和移动端（390×844）的 QA 结论、间距/颜色/字体决策以及已通过的检查项。新增或修改视觉时，保持已有的 CSS 变量体系（`--panel`, `--line`, `--blue`, `--cyan`, `--violet` 等）和 Phosphor Icons 风格一致性。

## Previously Verified Constraints (preserved)

- Run the local server yourself and open the preview; do not give the user server-start instructions when you can run it
- Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact for Sites handoff
- Before Sites handoff: `npm run build && npm run test:sites`; build must produce `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`
