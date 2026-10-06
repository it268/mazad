import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://localhost:8081/";
const out = process.argv[3] || ".shots/qa.png";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 500)));
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("favicon"))
    console.log("[console.error]", m.text().slice(0, 300));
});
await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 4000));
const metrics = await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  bodyScrollWidth: document.body.scrollWidth,
}));
console.log("metrics:", JSON.stringify(metrics));
console.log("body:", (await page.evaluate(() => document.body.innerText.slice(0, 250))).replace(/\n+/g, " | "));
await page.screenshot({ path: out });
console.log("saved:", out);
await browser.close();
