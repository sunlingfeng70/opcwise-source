# OPCWISE Agent Instructions

## Project Identity

OPCWISE 是一个面向企业 AI 化与 AI·OPC 创业者的产业连接平台。当前实现为大会官网（AI·OPC 创业者大会），包含信息展示页、报名表单和管理后台。现已扩展三个报名通道：AIGC 产业实践单元、企业 AI 需求、一分钟短片创作大赛。

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
npm run test:short-film       # 运行短片上传 API 集成测试
```

## Architecture

### Monolith — 单一层级，核心文件少

整个应用没有分包结构。核心文件（行数以 `wc -l` 为准）：
- `src/App.jsx`（~1274 行）— 所有页面组件、路由、表单组件
- `src/AdminPage.jsx`（~354 行）— 管理后台独立文件，被 App.jsx 引用
- `src/styles.css`（~2713 行）— 全局样式
- `server/index.js`（~499 行）— 后端 API + 静态文件服务

**组件文件规则**：绝大多数组件在 `App.jsx` 中。`AdminPage.jsx` 是唯一例外（因管理后台逻辑较独立）。除非改动量非常大且有明确理由，不要创建新的组件文件。

### Frontend (React 19 + Vite 6)

- 入口：`index.html` → `src/main.jsx` → `src/App.jsx`
- 路由：基于 URL hash 的 `useHashRoute()` 自定义 hook
  - `#/home` — 首页
  - `#/short-film` — 一分钟短片创作大赛介绍页
  - `#/short-film/upload` — 短片作品上传表单页
  - `#/about` — 大会介绍
  - `#/schedule` — 赛程与说明
  - `#/enterprise` — 企业 AI 需求
  - `#/aigc` — AIGC 产业实践单元
  - `#/opcwise` — 了解 OPCWISE
  - `#/admin` — 管理后台
- 导航顺序（`NAV_ITEMS` 数组，`src/App.jsx` 第 30-38 行）：首页 → 一分钟短片创作大赛 → 大会介绍 → 赛程与说明 → 企业需求 → AIGC 产业实践单元 → 了解 OPCWISE
- 所有路由数据硬编码在 `App.jsx` 的常量数组中
- 图标：`@phosphor-icons/react`（`<Icon weight="bold" />` 风格统一）
- 字体：Google Fonts — Noto Sans SC（中文）+ Space Grotesk（英文）
- 样式：CSS 变量驱动（`--bg`, `--panel`, `--blue`, `--cyan`, `--violet` 等）
- AdminPage 使用 localStorage 存储 token（key: `opcwise-admin-token`），Token 24h 有效期
- 页面标题动态设置：`"${页面名} | OPCWISE"`（见 `App.jsx` 第 1248-1251 行）

### Backend (Node.js HTTP Server + SQLite)

- 纯 `node:http` 创建服务器（无 Express 或其他框架）
- 数据库：`better-sqlite3`（WAL 模式）
- 三张表：`aigc_submissions` / `enterprise_submissions` / `short_film_submissions`
  - `aigc_submissions`：`paths`, `directions` 为 JSON 数组存为 TEXT，读取后需 `JSON.parse`
  - `enterprise_submissions`：`needs` 为 JSON 数组存为 TEXT
  - `short_film_submissions`：含 `work_title` 字段
  - 三表均支持软删除（`deleted_at TEXT` 字段）
- 文件上传：Base64 JSON body → 存到 `uploads/` 目录，文件名格式 `时间戳-随机码.扩展名`
  - 当前限制：≤ 50MB，支持 JPG/PNG/WebP/PDF/MP4/MOV/AVI/ZIP
  - 历史说明：上限曾为 10MB（仅图片+PDF），后扩展为 50MB 并加入视频格式
- 管理后台 Token：24h 有效期，存在内存 Map 中（重启后失效）
- 管理后台默认密码 `admin123`，通过环境变量 `ADMIN_PASSWORD` 覆盖
- 日志：按日期写入 `logs/YYYY-MM-DD.log`
- 服务端全局异常处理：`unhandledRejection` + `uncaughtException` 捕获，防止崩溃

### API Routes

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/submit` | 报名/需求提交，JSON body。type 字段为 `"aigc"` / `"enterprise"` / `"short-film"` |
| POST | `/api/upload` | 文件上传，Base64 编码，JSON body `{ name, data }` |
| GET | `/api/uploads/:file` | 文件访问 |
| POST | `/api/admin/login` | `{ password }` → `{ token }` |
| GET | `/api/admin/submissions?type=aigc\|enterprise\|short_film&phone=` | 需 `Authorization: Bearer <token>` |
| DELETE | `/api/admin/submissions/:id` | 软删除，需 Bearer Token |

提交 ID 格式：
- AIGC: `OPC-A-YYMMDD-XXXXX`
- Enterprise: `OPC-E-YYMMDD-XXXXX`
- Short Film: `OPC-S-YYMMDD-XXXXX`

### Deployment — Cloudflare Sites + PM2

- Worker 文件：`worker/index.js` — SPA fallback（未知路由 → `/index.html`）
- Sites 构建：`scripts/prepare-sites-build.mjs` 复制 `worker/index.js` → `dist/server/index.js`
- 关键文件（**不可删除或重命名**）：`.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, `tests/sites-worker.test.mjs`
- PM2：`ecosystem.config.cjs` 管理 `opcwise-api` 和 `opcwise-vite` 两个进程。Vite 进程的 NODE_ENV 为 `"development"`
- Vite 配置有 `--configLoader runner` 参数（来自上级工具链，勿移除）
- 生产部署：`deploy.sh` 通过 SSH 拉取远程仓库代码

## Key Commands

| 用途 | 命令 |
|------|------|
| Dev（全量） | `npm run dev:all` |
| Dev（仅前端） | `npm run dev` |
| Dev（仅 API） | `npm run dev:server` |
| 构建 | `npm run build` |
| Sites 测试 | `npm run test:sites` |
| 短片测试 | `npm run test:short-film` |
| 生产运行 | `NODE_ENV=production npm start` |
| PM2 启动 | `npm run pm2:start` |
| PM2 停止 | `npm run pm2:stop` |
| PM2 重启 | `npm run pm2:restart` |
| PM2 状态 | `npm run pm2:status` |
| PM2 日志 | `npm run pm2:logs` |

## Tests

- **`tests/sites-worker.test.mjs`** — Worker SPA fallback 行为验证，`node --test` 运行
- **`tests/short-film-upload.test.mjs`** — 短片上传 API 集成测试（启动独立服务器，端口 5179），测试文件上传、格式校验及提交流程。`node --test` 运行
- **`tests/e2e/submission-flow.test.mjs`** — Playwright E2E 测试，指向远程服务器 `http://8.152.223.119`，覆盖企业/AIGC/短片三个表单及管理后台。非本地运行，依赖 `playwright` 包

## Conventions & Gotchas

- **中文内容为主** — 所有页面文字、表单文案、提示信息均为简体中文
- **无 lint / 无 formatter / 无 typecheck** — 仓库没有 eslint、prettier、tsconfig 配置。修改时自行保持代码风格一致
- **npmrc** — `.npmrc` 配置了 `fund=false` 和 `audit=false`
- **组件在 App.jsx 中，AdminPage.jsx 是唯一例外** — 管理后台已独立为 `AdminPage.jsx`，其余页面组件仍在 `App.jsx` 中。不要创建新的组件文件，除非改动量非常大且有明确理由
- **Vite 代理** — `vite.config.mjs` 配置了 `/api` → `127.0.0.1:5173` 代理。生产模式下 API 服务器直接 serve `dist/client/`
- **SPA fallback** — 生产模式下 API 服务器对未知路径返回 `index.html`（SPA 路由支持）。Worker 中也有相同逻辑。Worker 的 fallback 仅对 GET/HEAD 请求且 Accept: text/html 时生效
- **`.DS_Store` 未在 gitignore 中** — 提交前检查 `git status`，不要误提交系统文件
- **数据库字段** — `paths`, `directions`, `needs` 是 JSON 数组以 TEXT 存储，读取后需 `JSON.parse`
- **表单字段名不一致** — AIGC 表用 `material_links`（复数），企业表用 `material_link`（单数），短片表无此字段（仅 `file_name`）。提交时注意分别处理
- **文件上传进度** — 前端使用 XMLHttpRequest 实现上传进度条（`upload.onprogress`），非 `fetch`。文件选择后立即自动上传，非表单提交时上传
- **管理后台 UI** — 在 `AdminPage.jsx` 中，包含三套独立列定义 `AIGC_COLUMNS`、`ENTERPRISE_COLUMNS`、`SHORT_FILM_COLUMNS`
- **管理后台 Token 存储** — 使用 localStorage key `opcwise-admin-token`，401 时自动清除并退回登录页
- **文件重名安全** — 上传文件重命名为 `时间戳-随机大写码.扩展名`，存储在 `uploads/`
- **手机号查重** — 同一手机号在相同类型中重复提交时，响应返回 `duplicate: true`，仍正常提交。前端在 AIGC/企业表单中显示提示条，短片表单无提示
- **软删除** — 管理后台的删除操作为软删除（设置 `deleted_at` 字段），管理员查询时自动过滤 `deleted_at IS NULL`
- **服务器启动** — 无 Express：纯 `node:http` + `createServer`。路由通过 `if (url === ...)` 链式判断
- **数据库迁移** — 迁移在 `server/index.js` 启动时通过 `try { ALTER TABLE ... } catch {}` 方式执行（幂等），不依赖迁移工具

## Visual Changes

在设计稿缺失或与当前目标不一致时，先查看 `design-qa.md` 了解之前的视觉对比记录。该文件记录了桌面端（1680×944）和移动端（390×844）的 QA 结论、间距/颜色/字体决策以及已通过的检查项。新增或修改视觉时，保持已有的 CSS 变量体系（`--panel`, `--line`, `--blue`, `--cyan`, `--violet` 等）和 Phosphor Icons 风格一致性。

## Previously Verified Constraints (preserved)

- Run the local server yourself and open the preview; do not give the user server-start instructions when you can run it
- Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact for Sites handoff
- Before Sites handoff: `npm run build && npm run test:sites`; build must produce `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`
