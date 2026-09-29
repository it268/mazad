import puppeteer from "puppeteer-core";
import { mkdirSync } from "fs";

const OUT = "C:/Users/ymir5/OneDrive/Desktop/alfursya/mazad/hyperframes/mazad-showcase/capture/pages";
mkdirSync(OUT, { recursive: true });

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://127.0.0.1:3100";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-first-run", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1"],
});

async function shot(page, path, name, { wait = 2500, scrollY = 0, fullPage = false } = {}) {
  await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, wait));
  if (scrollY) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await new Promise((r) => setTimeout(r, 800));
  }
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  console.log("captured", name);
}

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

// public pages
await shot(page, "/", "home-hero");
await shot(page, "/", "home-auctions", { scrollY: 900 });
await shot(page, "/horses", "horses");
await shot(page, "/auctions", "auctions");

// live auction room (first live listing)
const live = await fetch("http://127.0.0.1:8090/api/collections/listings/records?filter=" +
  encodeURIComponent('status="live"')).then((r) => r.json());
const liveId = live.items?.[0]?.id;
if (liveId) await shot(page, `/auctions/${liveId}`, "auction-room", { wait: 3500 });

// horse detail (first listed horse)
const horse = await fetch("http://127.0.0.1:8090/api/collections/horses/records?perPage=1&sort=-created")
  .then((r) => r.json());
if (horse.items?.[0]) await shot(page, `/horses/${horse.items[0].id}`, "horse-detail", { wait: 2500 });

// sell form
await shot(page, "/sell", "sell");

// admin: log in then capture
await page.goto(BASE + "/login", { waitUntil: "networkidle2" });
await page.type("input.field", "0500000001");
await page.type('input[type="password"]', "Mazad1234");
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
  page.click("button.btn-primary"),
]);
await new Promise((r) => setTimeout(r, 2500));
console.log("after login url:", page.url());
await shot(page, "/admin", "admin-dashboard", { wait: 3500 });
await shot(page, "/admin/requests", "admin-requests", { wait: 2500 });
await shot(page, "/admin/horses", "admin-horses", { wait: 2500 });

await browser.close();
console.log("done ->", OUT);
