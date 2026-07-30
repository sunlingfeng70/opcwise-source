import { test, describe } from "node:test";
import assert from "node:assert";
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, unlinkSync, rmSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://8.152.223.119";
const ADMIN_PASSWORD = "admin123";

let browser;
let context;

const TMP = join(import.meta.dirname, "..", "..", ".e2e-tmp");

// tiny valid 1×1 PNG
const PNG_BUF = Buffer.from(
  "89504E470D0A1A0A0000000D4948445200000001000000010802020000907753DE" +
    "0000000C4944415408D763606060000000020001E62125770000000049454E44AE426082",
  "hex"
);
// fake .mov header (just enough bytes)
const MOV_BUF = Buffer.from(
  "0000001C667479706D703432000000006D70343269736F6D000000086D6F6F76",
  "hex"
);

function uid() {
  return String(Date.now()).slice(-6);
}

function ts() {
  return String(Date.now()).slice(-8);
}

describe("OPCWISE E2E submission flow", async () => {
  let page;

  test.before(async () => {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({ locale: "zh-CN" });
    mkdirSync(TMP, { recursive: true });
  });

  test.after(async () => {
    await browser.close();
    rmSync(TMP, { recursive: true, force: true });
  });

  // ──────────────── 1. Enterprise ────────────────
  test("Enterprise form submission", async () => {
    page = await context.newPage();
    const phone = `138${ts()}`;

    await page.goto(`${BASE}/#/enterprise`);
    await page.waitForSelector("text=发布企业 AI 需求");

    // Open modal - use .first() because there are two "提交企业需求" buttons
    await page.getByRole("button", { name: "提交企业需求" }).first().click();
    await page.waitForSelector("text=企业 AI 需求表");

    // Fill form
    await page.getByRole("textbox", { name: /企业\/机构名称/ }).fill("测试企业");
    await page.getByRole("combobox", { name: /所属行业/ }).selectOption("互联网/软件");
    await page.getByRole("combobox", { name: /所在城市/ }).selectOption("北京");
    await page.getByRole("textbox", { name: /联系人/ }).fill("张三");
    await page.getByPlaceholder("11位手机号").fill(phone);
    await page.getByRole("textbox", { name: /微信号/ }).fill("wechat_e2e");

    // Need checkbox
    await page.getByText("品牌宣传与广告").click();

    // Description
    await page.getByRole("textbox", { name: /简单描述需求/ }).fill(`自动化测试 ${uid()}`);

    // Cooperation intent
    await page.getByText("有明确项目，希望尽快对接").click();

    // Material link
    await page
      .getByRole("textbox", { name: /或填写作品集/ })
      .fill("https://example.com/portfolio");

    // Submit (scope to dialog to avoid matching the page trigger button)
    const resp = page.waitForResponse((r) => r.url().includes("/api/submit"));
    await page.getByRole("dialog").getByRole("button", { name: "提交企业需求" }).click();
    await resp;

    // Verify success
    await page.waitForSelector("text=提交成功");
    const id = await page.locator(".submission-id").textContent();
    assert.ok(id, "should have submission ID");
    console.log(`  ✓ Enterprise: ${id}`);

    // Close modal
    await page.getByRole("button", { name: "完成" }).click();
    await page.close();
  });

  // ──────────────── 2. AIGC ────────────────
  test("AIGC form submission", async () => {
    page = await context.newPage();
    const phone = `189${ts()}`;

    await page.goto(`${BASE}/#/aigc`);
    await page.waitForSelector("text=AIGC 产业实践单元");

    // Click "报名 AIGC 产业实践单元" to open the form directly
    await page.getByRole("button", { name: "报名 AIGC 产业实践单元" }).click();
    await page.waitForSelector("text=AIGC 产业实践单元报名表");

    // Fill
    await page.getByRole("textbox", { name: /姓名\/团队名称/ }).fill("测试创作者");
    await page.getByRole("combobox", { name: /所在城市/ }).selectOption("上海");
    await page.getByPlaceholder("11位手机号").fill(phone);
    await page.getByRole("textbox", { name: /微信号/ }).fill("wechat_aigc");

    // Identity
    await page.getByText("独立AIGC创作者").click();
    // Paths
    await page.getByText("承接企业项目和商业订单").click();
    await page.getByText("成为自由职业创作者").click();
    // Stage
    await page.getByText("已有作品，尚未获得收入").click();
    // Direction
    await page.getByText("AI影视/短片").click();

    // Intro
    await page.getByRole("textbox", { name: /一句话介绍/ }).fill(`自动化测试 ${uid()}`);

    // Material link (instead of file upload)
    await page
      .getByRole("textbox", { name: /或填写作品集/ })
      .fill("https://example.com/aigc-portfolio");

    // Submit
    const resp = page.waitForResponse((r) => r.url().includes("/api/submit"));
    await page.getByRole("button", { name: "提交报名" }).click();
    await resp;

    // Verify
    await page.waitForSelector("text=提交成功");
    const id = await page.locator(".submission-id").textContent();
    assert.ok(id, "should have submission ID");
    console.log(`  ✓ AIGC: ${id}`);

    await page.getByRole("button", { name: "完成" }).click();
    await page.close();
  });

  // ──────────────── 3. Short Film ────────────────
  test("Short film upload and submission", async () => {
    page = await context.newPage();
    const movPath = join(TMP, `test-${uid()}.mov`);
    writeFileSync(movPath, MOV_BUF);

    const phone = `136${ts()}`;

    await page.goto(`${BASE}/#/short-film/upload`);
    await page.waitForSelector("text=上传作品");

    // Fill fields - use placeholder-based selectors for uniqueness
    await page.getByPlaceholder("您的姓名或团队名称").fill("短片创作者");
    await page.getByPlaceholder("11 位手机号").fill(phone);
    await page.getByPlaceholder("您的微信号").fill("wechat_film");
    await page.getByPlaceholder("您的作品名称").fill("自动化测试短片");
    await page
      .getByPlaceholder("请用 200 字以内")
      .fill(`自动化测试提交，请忽略。${uid()}`);

    // Upload file via hidden file input
    await page
      .locator('.upload-box input[type="file"]')
      .setInputFiles(movPath);

    // Wait for upload completion
    await page.waitForSelector("text=上传成功", { timeout: 30000 });
    console.log("  ✓ Short film: file uploaded");

    // Check copyright checkbox
    await page.locator(".copyright-agreement input[type='checkbox']").check();

    // Submit
    const resp = page.waitForResponse((r) => r.url().includes("/api/submit"));
    await page.getByRole("button", { name: "提交作品" }).click();
    await resp;

    // Verify success page
    await page.waitForSelector("text=作品上传成功");
    const sid = await page.locator(".success-card strong").first().textContent();
    assert.ok(sid, "should have submission ID");
    console.log(`  ✓ Short film: ${sid}`);

    unlinkSync(movPath);
    await page.close();
  });

  // ──────────────── 4. Admin ────────────────
  test("Admin login and file link verification", async () => {
    page = await context.newPage();

    await page.goto(`${BASE}/#/admin`);
    await page.waitForSelector("text=OPCWISE 管理后台");

    // Login
    await page.getByRole("textbox", { name: /管理员密码/ }).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "登录" }).click();
    await page.waitForTimeout(800);

    // Should see admin tabs
    await page.waitForSelector("text=AIGC 报名表");

    // Helper: check a tab for file links
    async function checkTab(tabName) {
      await page.getByRole("button", { name: tabName }).click();
      await page.waitForTimeout(400);

      const row = page.locator(".data-table tbody tr").first();
      if (!(await row.isVisible({ timeout: 2000 }).catch(() => false))) {
        console.log(`  ⚠ ${tabName}: no rows`);
        return;
      }

      await row.click();
      await page.waitForSelector(".detail-modal", { timeout: 3000 });
      await page.waitForTimeout(300);

      const links = page.locator('.detail-modal a[href*="/api/uploads/"]');
      const count = await links.count();
      console.log(`  ✓ ${tabName}: ${count} file link(s)`);

      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute("href");
        const fullUrl = href.startsWith("http") ? href : `${BASE}${href}`;
        const res = await page.request.get(fullUrl);
        assert.ok(res.ok(), `${fullUrl} should be 200, got ${res.status()}`);
        console.log(`    ✓ [${res.status()}] ${fullUrl}`);
      }

      // Close modal
      await page.locator(".modal-close, .detail-modal-close").first().click();
      await page.waitForTimeout(300);
    }

    // Check each tab
    await checkTab("AIGC 报名表");
    await checkTab("企业需求表");
    await checkTab("一分钟短片");

    await page.close();
  });
});
