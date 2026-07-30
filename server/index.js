import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join, extname } from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const ROOT = join(import.meta.dirname, "..");
const STATIC_DIR = join(ROOT, "dist", "client");
const PORT = parseInt(process.env.PORT || "5173", 10);
const PROD = process.env.NODE_ENV === "production";

// ── Global error handlers (prevent server crash) ──────────────────
process.on("unhandledRejection", (reason) => {
  try { logError("process", "UnhandledRejection", String(reason)); } catch {}
});
process.on("uncaughtException", (err) => {
  try { logError("process", "UncaughtException", err.message); } catch {}
});
// ── Logger ─────────────────────────────────────────────────────────
const LOG_DIR = join(ROOT, "logs");
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

function logFilePath() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return join(LOG_DIR, y + "-" + m + "-" + day + ".log");
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

function log(level, event, msg, extra) {
  const time = new Date().toISOString().replace("T", " ").replace("Z", "");
  let line = "[" + time + "] [" + level + "] [" + event + "] " + msg;
  if (extra) {
    for (const k of Object.keys(extra)) {
      line += " | " + k + "=" + extra[k];
    }
  }
  line += "\n";
  try {
    appendFileSync(logFilePath(), line);
  } catch (e) {
    console.error("Log write failed:", e.message);
  }
}

const logInfo = log.bind(null, "INFO");
const logWarn = log.bind(null, "WARN");
const logError = log.bind(null, "ERROR");


// ── SQLite ────────────────────────────────────────────────────────
const db = new Database(join(ROOT, "data.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS aigc_submissions (
    id             TEXT PRIMARY KEY,
    phone          TEXT NOT NULL,
    name           TEXT NOT NULL,
    city           TEXT NOT NULL,
    wechat         TEXT NOT NULL,
    identity       TEXT NOT NULL,
    paths          TEXT NOT NULL,
    stage          TEXT NOT NULL,
    directions     TEXT NOT NULL,
    intro          TEXT NOT NULL,
    material_links TEXT,
    file_name      TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS enterprise_submissions (
    id             TEXT PRIMARY KEY,
    phone          TEXT NOT NULL,
    organization   TEXT NOT NULL,
    industry       TEXT NOT NULL,
    city           TEXT NOT NULL,
    contact        TEXT NOT NULL,
    wechat         TEXT,
    needs          TEXT NOT NULL,
    description    TEXT NOT NULL,
    cooperation    TEXT NOT NULL,
    material_link  TEXT,
    file_name      TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_aigc_phone ON aigc_submissions(phone);
  CREATE INDEX IF NOT EXISTS idx_enterprise_phone ON enterprise_submissions(phone);

  CREATE TABLE IF NOT EXISTS short_film_submissions (
    id             TEXT PRIMARY KEY,
    phone          TEXT NOT NULL,
    name           TEXT NOT NULL,
    wechat         TEXT NOT NULL,
    work_title     TEXT NOT NULL DEFAULT '',
    intro          TEXT NOT NULL,
    file_name      TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_short_film_phone ON short_film_submissions(phone);
`);

// Migration: add work_title column for existing databases
try { db.prepare(`ALTER TABLE short_film_submissions ADD COLUMN work_title TEXT NOT NULL DEFAULT ''`).run(); } catch {}

// ── Helpers ───────────────────────────────────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// ── File upload ────────────────────────────────────────────────────
const UPLOAD_DIR = join(ROOT, "uploads");
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_UPLOAD_EXT = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".mp4", ".mov", ".avi", ".zip"];
const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB

function safeFilename(original) {
  const ext = extname(original).toLowerCase();
  const base = original.slice(0, -ext.length).replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, "_");
  return `${Date.now()}-${base}${ext}`;
}

function generateId(type) {
  const date = new Date();
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  const prefix = type === "short-film" ? "S" : type === "enterprise" ? "E" : "A";
  return `OPC-${prefix}-${y}${m}${d}-${random}`;
}

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

// ── Validation ────────────────────────────────────────────────────
function validate(body) {
  const errors = [];
  if (!body.type || !["aigc", "enterprise", "short-film"].includes(body.type)) {
    errors.push("type must be 'aigc', 'enterprise', or 'short-film'");
  }
  if (!body.phone || !/^1[3-9]\d{9}$/.test(body.phone)) {
    errors.push("phone must be a valid Chinese mobile number");
  }
  const { type } = body;
  if (type === "aigc") {
    if (!body.name) errors.push("name is required");
    if (!body.city) errors.push("city is required");
    if (!body.wechat) errors.push("wechat is required");
    if (!body.identity) errors.push("identity is required");
    if (!body.paths?.length) errors.push("paths is required");
    if (!body.stage) errors.push("stage is required");
    if (!body.directions?.length) errors.push("directions is required");
    if (!body.intro) errors.push("intro is required");
  } else if (type === "short-film") {
    if (!body.name) errors.push("name is required");
    if (!body.wechat) errors.push("wechat is required");
    if (!body.workTitle) errors.push("workTitle is required");
    if (!body.intro) errors.push("intro is required");
  } else {
    if (!body.organization) errors.push("organization is required");
    if (!body.industry) errors.push("industry is required");
    if (!body.city) errors.push("city is required");
    if (!body.contact) errors.push("contact is required");
    if (!body.needs?.length) errors.push("needs is required");
    if (!body.description) errors.push("description is required");
    if (!body.cooperation) errors.push("cooperation is required");
  }
  return errors;
}

// ── API handlers ──────────────────────────────────────────────────
async function handleSubmit(req, res) {
  let body;
  try {
    body = await parseBody(req);
  } catch {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const errors = validate(body);
  if (errors.length) {
    logWarn("submit", "Validation failed", { phone: body.phone ? maskPhone(body.phone) : "none", errors: errors.join(", ") });
  return json(res, 400, { error: "Validation failed", details: errors });
  }

  const { type, phone } = body;
  const id = generateId(type);
  const table = type === "enterprise" ? "enterprise_submissions" : type === "short-film" ? "short_film_submissions" : "aigc_submissions";

  const existing = db.prepare(`SELECT id FROM ${table} WHERE phone = ?`).get(phone);

  if (type === "aigc") {
    db.prepare(
      `INSERT INTO aigc_submissions (id, phone, name, city, wechat, identity, paths, stage, directions, intro, material_links, file_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, phone, body.name, body.city, body.wechat, body.identity,
      JSON.stringify(body.paths), body.stage, JSON.stringify(body.directions),
      body.intro, body.materialLinks || null, body.fileName || null,
    );
  } else if (type === "short-film") {
    db.prepare(
      `INSERT INTO short_film_submissions (id, phone, name, wechat, work_title, intro, file_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, phone, body.name, body.wechat, body.workTitle, body.intro, body.fileName || null,
    );
  } else {
    db.prepare(
      `INSERT INTO enterprise_submissions (id, phone, organization, industry, city, contact, wechat, needs, description, cooperation, material_link, file_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, phone, body.organization, body.industry, body.city, body.contact,
      body.wechat || null, JSON.stringify(body.needs), body.description,
      body.cooperation, body.materialLink || null, body.fileName || null,
    );
  }

  const typeLabel = type === "short-film" ? "ShortFilm" : type === "enterprise" ? "Enterprise" : "AIGC";
  logInfo("submit", typeLabel + " submission created", { id: id, phone: maskPhone(phone), duplicate: String(!!existing) });
  json(res, 200, { id, duplicate: !!existing });
}

// ── File upload handler ────────────────────────────────────────────
async function handleUpload(req, res) {
  let body;
  try { body = await parseBody(req); }
  catch { return json(res, 400, { error: "Invalid JSON" }); }

  const { name, data } = body;
  if (!name || !data) return json(res, 400, { error: "name and data (base64) required" });

  const ext = extname(name).toLowerCase();
  if (!ALLOWED_UPLOAD_EXT.includes(ext)) {
    logWarn("upload", "File type rejected", { name: name, ext: ext });
  return json(res, 400, { error: `File type ${ext} not allowed. Accepted: ${ALLOWED_UPLOAD_EXT.join(", ")}` });
  }

  let buffer;
  try {
    buffer = Buffer.from(data, "base64");
  } catch (err) {
    logError("upload", "Base64 decode failed", err.message);
    return json(res, 400, { error: "文件数据解码失败，请重新选择文件" });
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    logWarn("upload", "File too large", { name: name, size: String(buffer.length) });
  return json(res, 400, { error: "文件过大，请上传不超过 500MB 的文件" });
  }

  let safeName;
  try {
    safeName = safeFilename(name);
    mkdirSync(UPLOAD_DIR, { recursive: true });
    writeFileSync(join(UPLOAD_DIR, safeName), buffer);
  } catch (err) {
    logError("upload", "File write failed", err.message);
    return json(res, 500, { error: "文件保存失败，请重试" });
  }
  logInfo("upload", "File uploaded", { name: safeName, size: String(buffer.length), type: ext });
  json(res, 200, { path: `/api/uploads/${safeName}`, name: safeName });
}

function handleServeUpload(req, res) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const fileName = pathname.replace("/api/uploads/", "");
  if (!fileName || fileName.includes("..") || fileName.includes("/")) {
    return json(res, 403, { error: "Forbidden" });
  }
  const filePath = join(UPLOAD_DIR, fileName);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return json(res, 404, { error: "Not found" });
  }
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const content = readFileSync(filePath);
  res.writeHead(200, { "Content-Type": contentType });
  res.end(content);
}

// ── Admin ──────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const adminTokens = new Map();
const TOKEN_TTL = 24 * 60 * 60 * 1000;

function generateToken() {
  return crypto.randomUUID();
}

function requireAdmin(res, req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const expiry = adminTokens.get(token);
  if (!expiry || Date.now() > expiry) {
    adminTokens.delete(token);
    return false;
  }
  return true;
}

async function handleAdminLogin(req, res) {
  let body;
  try { body = await parseBody(req); }
  catch { return json(res, 400, { error: "Invalid JSON" }); }

  if (body.password !== ADMIN_PASSWORD) {
    logWarn("login", "Admin login failed", { ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown" });
  return json(res, 401, { error: "密码错误" });
  }

  const token = generateToken();
  adminTokens.set(token, Date.now() + TOKEN_TTL);
  logInfo("login", "Admin login success", { ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown" });
  json(res, 200, { token });
}

function handleAdminSubmissions(req, res) {
  const url = new URL(req.url, "http://localhost");
  const type = url.searchParams.get("type") || "aigc";
  const phone = url.searchParams.get("phone") || "";

  const table = type === "short_film" ? "short_film_submissions" : type === "enterprise" ? "enterprise_submissions" : "aigc_submissions";

  let query = `SELECT * FROM ${table}`;
  const params = [];

  if (phone) {
    query += ` WHERE phone LIKE ?`;
    params.push(`%${phone}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT 200`;

  const rows = db.prepare(query).all(...params);

  const parsed = rows.map((row) => ({
    ...row,
    paths: row.paths ? tryParseJSON(row.paths) : row.paths,
    directions: row.directions ? tryParseJSON(row.directions) : row.directions,
    needs: row.needs ? tryParseJSON(row.needs) : row.needs,
  }));

  logInfo("query", "Admin queried submissions", { type: type, phone: phone ? maskPhone(phone) : "all", count: String(parsed.length) });
  json(res, 200, { data: parsed, total: parsed.length });
}

function tryParseJSON(str) {
  try { return JSON.parse(str); }
  catch { return str; }
}

// ── Static file serving (production only) ────────────────────────
function serveStatic(req, res) {
  let pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/") pathname = "/index.html";

  const filePath = join(STATIC_DIR, pathname);

  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    // SPA fallback: serve index.html for unknown routes
    const index = join(STATIC_DIR, "index.html");
    if (!existsSync(index)) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const content = readFileSync(index);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(content);
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const content = readFileSync(filePath);
  res.writeHead(200, { "Content-Type": contentType });
  res.end(content);
}

// ── Server ────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  try {
    const { method, url } = req;

    if (url === "/api/submit") {
      return await handleSubmit(req, res);
    }

    if (url === "/api/upload" && method === "POST") {
      return await handleUpload(req, res);
    }

    if (url.startsWith("/api/uploads/") && method === "GET") {
      return handleServeUpload(req, res);
    }

    if (url === "/api/admin/login" && method === "POST") {
      return await handleAdminLogin(req, res);
    }

    if (url.startsWith("/api/admin/submissions") && method === "GET") {
      if (!requireAdmin(res, req)) return json(res, 401, { error: "未登录" });
      return handleAdminSubmissions(req, res);
    }

    if (PROD) {
      return serveStatic(req, res);
    }

    // In dev mode, API-only — frontend is served by Vite
    res.writeHead(404);
    res.end("Not found");
  } catch (err) {
    logError("request", "Unhandled error", err.message);
    json(res, 500, { error: "服务器内部错误，请重试" });
  }
});

server.listen(PORT, () => {
  logInfo("server", "Server started", { port: String(PORT), mode: PROD ? "production" : "development" });
  if (PROD) console.log(`Serving static assets from ${STATIC_DIR}`);
});
