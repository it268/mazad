import puppeteer from "puppeteer-core";
import { mkdirSync } from "fs";

const OUT = "C:/Users/ymir5/OneDrive/Desktop/alfursya/mazad/hyperframes/mazad-showcase-mobile/capture/pages";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--disable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");

const BASE = "http://127.0.0.1:3100";
async function shot(path, name, { wait = 3500, scrollY = 0 } = {}) {
  await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, wait));
  if (scrollY) { await page.evaluate((y) => window.scrollTo(0, y), scrollY); await new Promise((r) => setTimeout(r, 800)); }
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("captured", name);
}

// login as showcase client
await page.goto(BASE + "/login", { waitUntil: "networkidle2" });
await page.type("input.field", "0500000010");
await page.type('input[type="password"]', "Showcase1234");
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
  page.click("button.btn-primary"),
]);
await new Promise((r) => setTimeout(r, 2000));
console.log("logged in:", page.url());

const live = await fetch("http://127.0.0.1:8090/api/collections/listings/records?filter=" + encodeURIComponent('status="live"')).then((r) => r.json());
const liveId = live.items[0].id;
const h1 = await fetch("http://127.0.0.1:8090/api/collections/horses/records?filter=" + encodeURIComponent('name="همّ الفخر"')).then((r) => r.json());

await shot("/", "m-home");
await shot("/horses", "m-horses", { wait: 4000 });
await shot("/horses", "m-horses-cards", { scrollY: 500 });
await shot("/auctions", "m-auctions");
await shot(`/auctions/${liveId}`, "m-auction-room", { wait: 4500 });
await shot(`/horses/${h1.items[0].id}`, "m-horse-detail", { wait: 3000 });
await shot("/sell", "m-sell");
await shot("/account", "m-account", { wait: 4000 });
await shot("/account", "m-account-bids", { scrollY: 650 });
await browser.close();
console.log("done ->", OUT);
