# OPCWISE

**AI · OPC 创业者大会** — 连接企业真实 AI 需求，发现具备细分能力与产业交付价值的 AI·OPC 创业者。

企业提出经营中的真实问题 → 平台梳理形成 AI 需求 → 征集技术、产品与解决方案 → 测试验证与供需对接 → 推动项目落地与持续合作。

## 项目概览

| 名称 | 描述 |
|---|---|
| 项目名 | OPCWISE |
| 包名 | `opcwise-website` |
| 前端 | React 19 + Vite 6 |
| 后端 | Node.js HTTP Server + SQLite (better-sqlite3) |
| 部署 | Cloudflare Workers (Sites) + PM2 |
| 语言 | 简体中文 |

## 功能模块

### 前端页面

大会官网包含以下页面（Hash 路由）：

| 路由 | 页面 | 功能 |
|---|---|---|
| `#/home` | 首页 | 大会介绍、数据展示、亮点模块、精彩瞬间 |
| `#/about` | 大会介绍 | 大会背景、为什么举办、重点关注方向、流程说明 |
| `#/schedule` | 赛程与说明 | 六个阶段、报名材料说明、评选方向 |
| `#/enterprise` | 企业需求 | 9 大类 AI 需求方向、提交流程说明、公开征集 |
| `#/aigc` | AIGC 产业实践单元 | 8 个实践方向、报名说明、机会介绍 |
| `#/opcwise` | 了解 OPCWISE | 平台运转链条、连接内容、宣传片展示 |
| `#/admin` | 管理后台 | 登录后可查看 AIGC / 企业报名数据 |

### 报名表单

- **企业 AI 需求表**：企业/机构名称、行业、城市、联系方式、需求方向（多选）、需求描述、合作意向、材料上传
- **AIGC 产业实践单元报名表**：姓名/团队、城市、联系方式、身份、发展路径（多选）、当前阶段、AIGC 方向（多选）、介绍、材料上传

### 管理后台

- 密码登录（默认密码 `admin123`，通过环境变量 `ADMIN_PASSWORD` 修改）
- 24 小时 Token 有效期
- 支持按手机号搜索
- 查看 AIGC 报名表和企业需求表

### API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/submit` | 提交报名表或企业需求 |
| POST | `/api/upload` | 文件上传（Base64，支持 JPG/PNG/WebP/PDF，≤10MB） |
| GET | `/api/uploads/{filename}` | 文件访问 |
| POST | `/api/admin/login` | 管理员登录 |
| GET | `/api/admin/submissions?type=aigc\|enterprise&phone=` | 查询报名数据（需 Bearer Token） |

## 技术栈

- **React 19** — 前端框架
- **Vite 6** — 构建工具，支持 HMR
- **@phosphor-icons/react** — 图标库
- **better-sqlite3** — 嵌入式数据库（WAL 模式）
- **Node.js HTTP Server** — 后端 API 与静态文件服务
- **Cloudflare Workers** — 生产部署（Sites 模式，SPA fallback）
- **PM2** — 进程管理

## 项目结构

```
opcwise-source/
├── src/                    # 前端源码
│   ├── main.jsx           # 入口
│   ├── App.jsx            # 主应用（路由、页面组件、表单）
│   ├── AdminPage.jsx      # 管理后台
│   └── styles.css         # 全局样式
├── server/
│   └── index.js           # Node.js HTTP 服务器（API + 静态文件）
├── worker/
│   └── index.js           # Cloudflare Workers 入口（SPA fallback）
├── scripts/
│   ├── dev.mjs            # 开发脚本（同时启动 API 和 Vite）
│   └── prepare-sites-build.mjs  # Sites 构建准备脚本
├── tests/
│   ├── sites-worker.test.mjs     # Worker 测试
│   └── e2e/                      # E2E 测试（预留）
├── public/
│   └── assets/            # 静态资源（品牌 logo、大会图片等）
├── migrations/
│   └── 0001_create_submissions.sql  # 数据库迁移
├── dist/                  # 构建产物（gitignore）
├── uploads/               # 上传文件目录（gitignore）
├── logs/                  # 日志目录（gitignore）
├── data.db                # SQLite 数据库（gitignore）
├── index.html             # HTML 入口
├── vite.config.mjs        # Vite 配置
├── ecosystem.config.cjs   # PM2 配置
├── AGENTS.md              # AI Agent 指令
├── design-qa.md           # 设计 QA 记录
└── package.json
```

## 本地开发

依赖要求：Node.js 18+

```bash
# 安装依赖
npm install

# 启动开发服务器（API + Vite 同时运行）
npm run dev:all

# 或分别启动
npm run dev            # 仅启动 Vite 前端（端口 80，代理 /api -> 5173）
npm run dev:server     # 仅启动 API 服务器（端口 5173）
```

### 开发模式说明

- **Vite 开发服务器**运行在 `http://localhost:80`，自动代理 `/api` 请求到 API 服务器
- **API 服务器**运行在 `http://localhost:5173`
- 开发模式下 API 服务器不提供静态文件，仅处理 API 请求

### 生产构建

```bash
# 构建前端
npm run build

# 生产模式运行
NODE_ENV=production npm start
```

生产模式下 API 服务器同时提供静态文件服务（SPA fallback 支持）。

### PM2 部署

```bash
npm run pm2:start      # 启动生产进程
npm run pm2:stop       # 停止
npm run pm2:restart    # 重启
npm run pm2:status     # 查看状态
npm run pm2:logs       # 查看日志
```

### Sites 部署

```bash
npm run build && npm run test:sites
```

构建产物结构要求：
- `dist/client/index.html`
- `dist/server/index.js`（从 `worker/index.js` 复制）
- `dist/.openai/hosting.json`

## 数据库

使用 SQLite（WAL 模式）存储报名数据：

- **`aigc_submissions`** — AIGC 产业实践单元报名数据
- **`enterprise_submissions`** — 企业 AI 需求数据

数据库文件 `data.db` 位于项目根目录，已配置 `.gitignore` 不纳入版本控制。

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `5173` | API 服务器端口 |
| `ADMIN_PASSWORD` | `admin123` | 管理后台登录密码 |
| `NODE_ENV` | — | 设为 `production` 启用静态文件服务和生产模式 |

## 设计 QA

项目经过完整的设计 QA 流程，包含：

- Desktop (1680×944) 和 Mobile (390×844) 双端对比
- 字体：Noto Sans SC（中文）+ Space Grotesk（英文）
- 颜色：深海军蓝底色 + 电光蓝/青色/紫色点缀
- 图标：Phosphor Icons 统一风格
- 交互：表单验证、文件上传、手机号查重、弹窗响应式
- 零 Console 错误

详见 `design-qa.md`。

## 许可

Private — 未经授权不得使用。
