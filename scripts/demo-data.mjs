/**
 * Demo data for visual QA / screenshots (local PB on 127.0.0.1:8090).
 * Usage: node scripts/demo-data.mjs
 */
const PB = "http://127.0.0.1:8090";
const SU = { identity: "admin@mazad.local", password: "MazadAdmin2026!" };

async function api(path, opts = {}, token) {
  const res = await fetch(PB + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} → ${res.status} ${JSON.stringify(json)}`);
  return json;
}

const main = async () => {
  const su = await api("/api/collections/_superusers/auth-with-password", { method: "POST", body: SU });
  const suTok = su.token;

  // wipe
  for (const col of ["deals", "bids", "listings", "sale_requests", "horses"]) {
    const { items = [] } = await api(`/api/collections/${col}/records?perPage=200`, {}, suTok);
    for (const r of items) await api(`/api/collections/${col}/records/${r.id}`, { method: "DELETE" }, suTok);
  }
  const { items: oldUsers = [] } = await api(`/api/collections/users/records?filter=phone~"05"`, {}, suTok);
  for (const u of oldUsers) await api(`/api/collections/users/records/${u.id}`, { method: "DELETE" }, suTok);

  // users
  const admin = await api("/api/collections/users/records", { method: "POST", body: { name: "إدارة مزاد الفروسية", phone: "0500000001", password: "Mazad1234", passwordConfirm: "Mazad1234", role: "admin" } }, suTok);
  const c1 = await api("/api/collections/users/records", { method: "POST", body: { name: "عبدالله المطيري", phone: "0500000002", password: "Client123", passwordConfirm: "Client123", role: "client" } }, suTok);
  const c2 = await api("/api/collections/users/records", { method: "POST", body: { name: "سارة العتيبي", phone: "0500000003", password: "Client123", passwordConfirm: "Client123", role: "client" } }, suTok);

  const adminTok = (await api("/api/collections/users/auth-with-password", { method: "POST", body: { identity: "0500000001", password: "Mazad1234" } })).token;
  const c1Tok = (await api("/api/collections/users/auth-with-password", { method: "POST", body: { identity: "0500000002", password: "Client123" } })).token;
  const c2Tok = (await api("/api/collections/users/auth-with-password", { method: "POST", body: { identity: "0500000003", password: "Client123" } })).token;

  // admin horses
  const mk = (body) => api("/api/collections/horses/records", { method: "POST", body }, adminTok);
  const h1 = await mk({ name: "همّ الفخر", breed: "عربي أصيل", gender: "male", age_years: 6, color: "خمري", height_cm: 155, lineage: "من نسل الهمّاني الأصيل", description: "حصان سباقات محترف، سجل فوز في سباقات المملكة لفئة ٥ سنوات. لطيف مع الناس ومدرّب على الجليس والتحمل." });
  const h2 = await mk({ name: "نجم الشرق", breed: "عربي أصيل", gender: "male", age_years: 4, color: "أشقر", height_cm: 152, lineage: "ابن سيحان", description: "بنية قوية وأصلح للسباقات القصيرة، صحي ومطعم بالكامل." });
  const h3 = await mk({ name: "لؤلؤة الصحراء", breed: "مخيوط", gender: "female", age_years: 5, color: "رملي", height_cm: 150, description: "فرس أنثى هادئة، مناسبة للهواة والفروسية النسائية." });
  const h4 = await mk({ name: "صقر الليل", breed: "إنجليزي أصيل", gender: "male", age_years: 7, color: "أسود", height_cm: 160, description: "خبرة سباقات دولية، بحاجة لسبر معين فقط." });

  // h3 pending sale request from client 1
  const h5 = await api("/api/collections/horses/records", { method: "POST", body: { name: "ظل السحاب", breed: "عربي أصيل", gender: "male", age_years: 3, color: "أبلق", description: "مهران صغير بأصول ممتازة" } }, c1Tok);
  await api("/api/collections/sale_requests/records", { method: "POST", body: { horse: h5.id, asking_price: 60000, note: "معاينة أي وقت" } }, c1Tok);

  // live auction for h1
  const a1 = await api("/api/collections/listings/records", { method: "POST", body: { type: "auction", horse: h1.id, start_price: 150000, min_increment: 5000, starts_at: new Date(Date.now() - 600e3).toISOString(), ends_at: new Date(Date.now() + 25 * 60e3).toISOString() } }, adminTok);
  await api("/api/collections/bids/records", { method: "POST", body: { listing: a1.id, amount: 155000 } }, c1Tok);
  await api("/api/collections/bids/records", { method: "POST", body: { listing: a1.id, amount: 160000 } }, c2Tok);
  await api("/api/collections/bids/records", { method: "POST", body: { listing: a1.id, amount: 165000 } }, c1Tok);

  // scheduled auction for h2 (tomorrow)
  await api("/api/collections/listings/records", { method: "POST", body: { type: "auction", horse: h2.id, start_price: 120000, min_increment: 3000, starts_at: new Date(Date.now() + 20 * 3600e3).toISOString(), ends_at: new Date(Date.now() + 24 * 3600e3).toISOString() } }, adminTok);

  // direct sale listings
  await api("/api/collections/listings/records", { method: "POST", body: { type: "direct_sale", horse: h3.id, price: 95000 } }, adminTok);
  await api("/api/collections/listings/records", { method: "POST", body: { type: "direct_sale", horse: h4.id, price: 180000 } }, adminTok);

  console.log("demo data ready: live auction, scheduled auction, 2 direct sales, 1 pending request");
  console.log("admin: 0500000001 / Mazad1234 — clients: 0500000002, 0500000003 / Client123");
};

main().catch((e) => { console.error(e.message); process.exit(1); });
