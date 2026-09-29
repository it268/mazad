import puppeteer from "puppeteer-core";

const url = process.argv[2] || "https://mazad.alfrusiyaar.com/register";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1400 });
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") {
    console.log("[" + m.type() + "]", m.text().slice(0, 500));
  }
});
page.on("pageerror", (e) => {
  console.log("[pageerror]", String(e).slice(0, 800));
});
await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
await new Promise((r) => setTimeout(r, 2500));
const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 400));
console.log("---- body:", bodyText.replace(/\n+/g, " | "));
await browser.close();
