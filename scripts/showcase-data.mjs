/**
 * Showcase data — new client account with a lived-in journey:
 * horses with photos, sale requests, leading bids in the live auction,
 * a completed purchase. Local PB on 127.0.0.1:8090.
 * Usage: node scripts/showcase-data.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PB = "http://127.0.0.1:8090";
const SU = { identity: "admin@mazad.local", password: "MazadAdmin2026!" };
const HORSE_IMG_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "hyperframes", ".capture-tools", "horses");

const SHOWCASE = { name: "سلطان القحطاني", phone: "0500000010", password: "Showcase1234" };
const RIVAL = { name: "ماجد الدوسري", phone: "0500000011", password: "Showcase1234" };

async function api(path, opts = {}, token) {
  const headers = { ...(token ? { Authorization: token } : {}), ...(opts.headers || {}) };
  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    opts = { ...opts, body: JSON.stringify(opts.body) };
  }
  const res = await fetch(PB + path, { ...opts, headers });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${path} → ${res.status} ${text.slice(0, 200)}`);
  return json;
}

async function uploadImage(token, horseId, file) {
  const fd = new FormData();
  fd.append("images", new Blob([readFileSync(file)], { type: file.endsWith(".png") ? "image/png" : "image/jpeg" }), file.split(/[\\/]/).pop());
  await api(`/api/collections/horses/records/${horseId}`, { method: "PATCH", body: fd }, token);
}

const main = async () => {
  const suTok = (await api("/api/collections/_superusers/auth-with-password", { method: "POST", body: SU })).token;

  // wipe
  for (const col of ["deals", "bids", "listings", "sale_requests", "horses"]) {
    const { items = [] } = await api(`/api/collections/${col}/records?perPage=200`, {}, suTok);
    for (const r of items) await api(`/api/collections/${col}/records/${r.id}`, { method: "DELETE" }, suTok);
  }
  const { items: oldUsers = [] } = await api(`/api/collections/users/records?filter=phone~"05"`, {}, suTok);
  for (const u of oldUsers) await api(`/api/collections/users/records/${u.id}`, { method: "DELETE" }, suTok);
  console.log("wiped");

  // users
  const admin = await api("/api/collections/users/records", { method: "POST", body: { name: "إدارة مزاد الفروسية", phone: "0500000001", password: "Mazad1234", passwordConfirm: "Mazad1234", role: "admin" } }, suTok);
  const showcase = await api("/api/collections/users/records", { method: "POST", body: { ...SHOWCASE, passwordConfirm: SHOWCASE.password, role: "client" } }, suTok);
  const rival = await api("/api/collections/users/records", { method: "POST", body: { ...RIVAL, passwordConfirm: RIVAL.password, role: "client" } }, suTok);
  const adminTok = (await api("/api/collections/users/auth-with-password", { method: "POST", body: { identity: "0500000001", password: "Mazad1234" } })).token;
  const showTok = (await api("/api/collections/users/auth-with-password", { method: "POST", body: { identity: SHOWCASE.phone, password: SHOWCASE.password } })).token;
  const rivalTok = (await api("/api/collections/users/auth-with-password", { method: "POST", body: { identity: RIVAL.phone, password: RIVAL.password } })).token;
  console.log("users ready");

  const mkAdminHorse = (body, img) =>
    api("/api/collections/horses/records", { method: "POST", body }, adminTok).then(async (h) => {
      if (img) await uploadImage(adminTok, h.id, join(HORSE_IMG_DIR, img));
      return h;
    });

  // admin-owned horses + listings
  const h1 = await mkAdminHorse({ name: "همّ الفخر", breed: "عربي أصيل", gender: "male", age_years: 6, color: "خمري", height_cm: 155, lineage: "من نسل الهمّاني الأصيل", description: "حصان سباقات محترف، سجل فوز في سباقات المملكة لفئة ٥ سنوات. لطيف مع الناس ومدرّب على الجليس والتحمل." }, "h1-window.jpg");
  const h2 = await mkAdminHorse({ name: "نجم الشرق", breed: "عربي أصيل", gender: "male", age_years: 4, color: "أشقر", height_cm: 152, lineage: "ابن سيحان", description: "بنية قوية وأصلح للسباقات القصيرة، صحي ومطعم بالكامل." }, "h2-gallop.jpg");
  const h3 = await mkAdminHorse({ name: "لؤلؤة الصحراء", breed: "مخيوط", gender: "female", age_years: 5, color: "رملي", height_cm: 150, description: "فرس أنثى هادئة، مناسبة للهواة والفروسية النسائية." }, "h3-herd.jpg");
  const h4 = await mkAdminHorse({ name: "صقر الليل", breed: "إنجليزي أصيل", gender: "male", age_years: 7, color: "أسود", height_cm: 160, description: "خبرة سباقات دولية، جاهز للنقل فوراً بعد إتمام الصفقة." }, "h4-dark.png");

  const liveAuction = await api("/api/collections/listings/records", { method: "POST", body: { type: "auction", horse: h1.id, start_price: 150000, min_increment: 5000, starts_at: new Date(Date.now() - 600e3).toISOString(), ends_at: new Date(Date.now() + 25 * 60e3).toISOString() } }, adminTok);
  await api("/api/collections/listings/records", { method: "POST", body: { type: "auction", horse: h2.id, start_price: 120000, min_increment: 3000, starts_at: new Date(Date.now() + 20 * 3600e3).toISOString(), ends_at: new Date(Date.now() + 24 * 3600e3).toISOString() } }, adminTok);
  const saleH3 = await api("/api/collections/listings/records", { method: "POST", body: { type: "direct_sale", horse: h3.id, price: 95000 } }, adminTok);
  await api("/api/collections/listings/records", { method: "POST", body: { type: "direct_sale", horse: h4.id, price: 180000 } }, adminTok);
  console.log("admin horses + listings ready");

  // rival bids first, showcase client leads
  await api("/api/collections/bids/records", { method: "POST", body: { listing: liveAuction.id, amount: 155000 } }, rivalTok);
  await api("/api/collections/bids/records", { method: "POST", body: { listing: liveAuction.id, amount: 160000 } }, showTok);
  await api("/api/collections/bids/records", { method: "POST", body: { listing: liveAuction.id, amount: 165000 } }, rivalTok);
  await api("/api/collections/bids/records", { method: "POST", body: { listing: liveAuction.id, amount: 170000 } }, showTok);
  console.log("bids: showcase client leading at 170,000");

  // showcase client buys لؤلؤة الصحراء (direct) → confirmed purchase
  const deal = await api("/api/collections/deals/records", { method: "POST", body: { type: "direct_sale", listing: saleH3.id } }, showTok);
  await api(`/api/collections/deals/records/${deal.id}`, { method: "PATCH", body: { status: "confirmed", payment_note: "تحويل بنكي — الراجحي" } }, adminTok);
  console.log("purchase deal confirmed (لؤلؤة الصحراء)");

  // showcase client's own horses + sale requests
  const h5 = await api("/api/collections/horses/records", { method: "POST", body: { name: "ظل السحاب", breed: "عربي أصيل", gender: "male", age_years: 3, color: "أبلق", height_cm: 148, lineage: "من نسل كحيلان", description: "مهران صغير بأصول ممتازة، مستعد للتدريب." } }, showTok);
  await uploadImage(showTok, h5.id, join(HORSE_IMG_DIR, "h5-rider.jpg"));
  await api("/api/collections/sale_requests/records", { method: "POST", body: { horse: h5.id, asking_price: 60000, note: "معاينة أي وقت بعد العصر" } }, showTok);

  const h6 = await api("/api/collections/horses/records", { method: "POST", body: { name: "سهم الفجر", breed: "عربي أصيل", gender: "female", age_years: 5, color: "كحيل", height_cm: 151, lineage: "من نسل عبيان", description: "فرس هادئة ذكية، خبطتها كاملة وجاهزة للعرض." } }, showTok);
  await uploadImage(showTok, h6.id, join(HORSE_IMG_DIR, "h3-herd.jpg"));
  await api("/api/collections/sale_requests/records", { method: "POST", body: { horse: h6.id, asking_price: 85000 } }, showTok);

  const { json: stats } = await api("/api/mazad/stats", {}, suTok).catch(() => ({ json: { raw: "" } }));
  console.log("showcase data ready. account:", SHOWCASE.phone, "/", SHOWCASE.password, "| stats:", JSON.stringify(stats));
};

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
