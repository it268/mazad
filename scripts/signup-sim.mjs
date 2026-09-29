import puppeteer from "puppeteer-core";

const base = "https://mazad.alfrusiyaar.com";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1400 });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 600)));
page.on("console", (m) => {
  if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 400));
});
await page.goto(base + "/register", { waitUntil: "networkidle2", timeout: 45000 });

await page.type('input[placeholder="مثال: عبدالله المطيري"]', "مستخدم تجريبي");
await page.type('input[placeholder="05xxxxxxxx"]', "0511111117");
const pwds = await page.$$('input[type="password"]');
await pwds[0].type("Test12345");
await pwds[1].type("Test12345");
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
  page.click('button[type="submit"], form button'),
]);
await new Promise((r) => setTimeout(r, 4000));
const url = page.url();
const body = await page.evaluate(() => document.body.innerText.slice(0, 300));
console.log("---- final url:", url);
console.log("---- body:", body.replace(/\n+/g, " | "));
await page.screenshot({ path: ".shots/signup-result.png" });
await browser.close();
