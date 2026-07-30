import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import http from "node:http";
import { spawn } from "node:child_process";
import { existsSync, readdirSync, rmSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const PORT = 5179;
const HOST = `http://localhost:${PORT}`;

let server;

function fetch(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: "localhost",
      port: PORT,
      path,
      method,
      headers: bodyStr
        ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(bodyStr) }
        : {},
    };
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

describe("一分钟短片创作大赛 · 文件上传与提交", () => {
  before(async () => {
    const env = { ...process.env, PORT: String(PORT) };
    server = spawn("node", ["server/index.js"], { cwd: ROOT, env, stdio: "pipe" });
    for (let i = 0; i < 30; i++) {
      try {
        await fetch("GET", "/api/uploads/test");
        return;
      } catch {}
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error("Server failed to start on port " + PORT);
  });

  after(() => {
    if (server) server.kill();
    // Clean up test uploads
    const uploadDir = join(ROOT, "uploads");
    if (existsSync(uploadDir)) {
      for (const f of readdirSync(uploadDir)) {
        if (f.includes("test-short-film")) {
          unlinkSync(join(uploadDir, f));
        }
      }
    }
  });

  it("上传文件：允许 MP4 视频格式", async () => {
    const data = Buffer.from("fake mp4 content for test").toString("base64");
    const res = await fetch("POST", "/api/upload", { name: "test-short-film.mp4", data });
    assert.equal(res.status, 200);
    assert.match(res.body.path, /^\/api\/uploads\//);
    assert.match(res.body.name, /-test-short-film\.mp4$/);
  });

  it("上传文件：允许 MOV 视频格式", async () => {
    const data = Buffer.from("fake mov content").toString("base64");
    const res = await fetch("POST", "/api/upload", { name: "test-short-film.mov", data });
    assert.equal(res.status, 200);
    assert.match(res.body.name, /-test-short-film\.mov$/);
  });

  it("上传文件：允许 AVI 视频格式", async () => {
    const data = Buffer.from("fake avi content").toString("base64");
    const res = await fetch("POST", "/api/upload", { name: "test-short-film.avi", data });
    assert.equal(res.status, 200);
    assert.match(res.body.name, /-test-short-film\.avi$/);
  });

  it("上传文件：允许 ZIP 压缩包", async () => {
    const data = Buffer.from("fake zip content").toString("base64");
    const res = await fetch("POST", "/api/upload", { name: "test-short-film.zip", data });
    assert.equal(res.status, 200);
    assert.match(res.body.name, /-test-short-film\.zip$/);
  });

  it("上传文件：拒绝不允许的格式（.exe）", async () => {
    const data = Buffer.from("bad").toString("base64");
    const res = await fetch("POST", "/api/upload", { name: "virus.exe", data });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /not allowed/);
  });

  it("上传文件：缺少必填字段返回 400", async () => {
    const res = await fetch("POST", "/api/upload", { name: "test.mp4" });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, "name and data (base64) required");
  });

  it("上传文件：非法 JSON 返回 400", async () => {
    const bodyStr = "not-json-at-all";
    const res = await new Promise((resolve, reject) => {
      const req = http.request(
        { hostname: "localhost", port: PORT, path: "/api/upload", method: "POST", headers: { "Content-Type": "application/json" } },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        }
      );
      req.on("error", reject);
      req.write(bodyStr);
      req.end();
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, "Invalid JSON");
  });

  it("完整流程：上传文件 → 提交报名表 → 验证结果", async () => {
    // Step 1: Upload file
    const fileContent = Buffer.from("test video content for short film").toString("base64");
    const upload = await fetch("POST", "/api/upload", { name: "test-short-film-competition.mp4", data: fileContent });
    assert.equal(upload.status, 200, "文件上传失败");
    assert.ok(upload.body.path, "缺少上传文件路径");

    // Step 2: Submit short-film form
    const submit = await fetch("POST", "/api/submit", {
      type: "short-film",
      phone: "13800138001",
      name: "测试参赛者",
      wechat: "testwx123",
      workTitle: "我的AI一分钟短片",
      intro: "这是一个端到端测试的参赛作品描述。",
      fileName: upload.body.path,
    });
    assert.equal(submit.status, 200, "报名提交失败");
    assert.match(submit.body.id, /^OPC-S-/, `提交编号格式不对: ${submit.body.id}`);

    // Step 3: Verify duplicate detection works for same phone
    const resubmit = await fetch("POST", "/api/submit", {
      type: "short-film",
      phone: "13800138001",
      name: "重复提交测试",
      wechat: "testwx456",
      workTitle: "重复提交",
      intro: "测试重复提交检测",
    });
    assert.equal(resubmit.status, 200);
    assert.equal(resubmit.body.duplicate, true, "重复手机号应标记为 duplicate");
  });

  it("服务端异常时返回中文错误（不返回 502 HTML）", async () => {
    // Send malformed base64 that may pass JSON parse but fail decoding
    const data = Buffer.from("big data").toString("base64") + "!!!invalid";
    const res = await fetch("POST", "/api/upload", { name: "test-short-film.mp4", data });
    // Server should handle gracefully and return JSON
    assert.equal(typeof res.body, "object", "响应应为 JSON 对象而非 HTML");
  });
});
