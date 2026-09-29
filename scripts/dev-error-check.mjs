import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1400 });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 1200)));
page.on("console", (m) => {
  const t = m.text();
  if (m.type() === "error" && !t.includes("favicon")) console.log("[console.error]", t.slice(0, 900));
});
await page.goto("http://localhost:3000/register", { waitUntil: "networkidle2", timeout: 60000 });
await page.type('input[placeholder="مثال: عبدالله المطيري"]', "مستخدم تجريبي");
await page.type('input[placeholder="05xxxxxxxx"]', "0511111116");
const pwds = await page.$$('input[type="password"]');
await pwds[0].type("Test12345");
await pwds[1].type("Test12345");
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
  page.click('button[type="submit"], form button'),
]);
await new Promise((r) => setTimeout(r, 5000));
console.log("---- final url:", page.url());
console.log("---- body:", (await page.evaluate(() => document.body.innerText.slice(0, 200))).replace(/\n+/g, " | "));
await browser.close();
