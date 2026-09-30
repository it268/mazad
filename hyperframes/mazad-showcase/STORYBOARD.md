---
format: 1920x1080
duration: 45s
message: "مزاد الفروسية — منصة مزادات وبيع وشراء خيل العرب الأصيلة، بثقة قبل أي صفقة"
arc: Brand → Site tour (home → marketplace → live auction → horse card → sell flow → admin) → CTA
audience: The site owner (client) and their stakeholders — Arabic-speaking
mode: autonomous
music: none
---

## Video direction

- **palette system** (frame.md, blue-professional remixed onto af brand): cream ground #F6F3EC; **teal #0E5F82 is the single accent** (eyebrows, numerals, CTA pill, rules, progress bar); ink #191510 headlines; muted #4C463D body; tinted cards = teal 4% fill / 20% border / 10–14px radius / no shadows. Crimson #7D1300 appears ONLY inside captured screens (never in overlay chrome). The navy of the captured site screenshots is the only dark surface — overlays stay on cream.
- **RTL Arabic film**: every frame root carries `dir="rtl" lang="ar"`; text right-aligned (start = right); layouts mirror (eyebrows/headers anchored top-right, screens lean left when asymmetric). Numerals stay Latin digits (`tabular-nums`, `dir="ltr"` spans for prices/timers). Font: Alexandria only (staged in assets/fonts).
- **motion grammar + reveal model (silent film)**: there is no voiceover — each frame's on-screen headline acts as the spoken cue: reveal each piece as the "reading beat" arrives, spreading reveals across the back ~50% of the frame; never front-load then freeze. Long-tail eases (power3, smooth over bouncy). Captured screens sit inside a thin browser-card frame (12px radius, 20% teal border, subtle lift) — camera moves are slow pushes/zooms on the SCREEN CONTENT (inner wrapper), never on the timed clip element. Holds read still — subtle jitter at most.
- **rhythm / held frames**: Frame 4 (auction room) is the climax — the most camera motion. Frames 5 (horse card) and 8 (closing) are deliberate near-still breathers.
- **negative list**: no slideshow (front-load then freeze), no screensaver (elements floating independently), no shadows on content, no second accent color, no fake UI added on top of captured screens (only neutral highlight rings / arrows around what really exists), no invented numbers — every figure comes from the captured screen itself, no purple-blue "AI" gradients, no stock imagery.

## Frame 1 — Brand cover

- scene: مزاد الفروسية logo builds and settles with the tagline on cream
- duration: 4.5s
- transition_in: cut
- poster: 3.5s
- status: animated
- blueprint: logo-assemble-lockup (Adapt)
- src: compositions/frames/01-cover.html
- asset_candidates: capture/assets/logo.svg, capture/assets/pattern.svg
- focal: capture/assets/logo.svg
- roles: logo.svg = cutout · pattern.svg = background (faint, ~6% opacity)

Adapt: keep the "mark comes to exist then resolves into centered lockup" signature; the mark is the site's real logo.svg blooming via outline-draw + settle, no orbiting satellites. Tagline arrives as a second beat, not simultaneously.
Scene 1 (0.0–2.2s): cream ground with the faint star-lattice pattern (background, ~6%); the logo mark draws in center-upper (~40% height, centered), outline traces then fills — Centered template, low density, 2 depth layers.
Scene 2 (2.2–3.6s): as the mark settles, the wordmark "مزاد الفروسية" (h1, ink) fades up beneath it and the muted sub-line "منصة مزادات وبيع وشراء خيل العرب الأصيلة" (body, muted) follows a half-beat later — both reveal on their reading beat.
Scene 3 (3.6–4.5s): hold the lockup centered and still; the teal accent-line (60×4) draws under the wordmark as the final settle. No exit motion.

## Frame 2 — Home hero (site tour opens)

- scene: the real home page in a browser card, slow push-in on the hero headline
- duration: 5.5s
- transition_in: blur-crossfade 0.6s
- poster: 4s
- status: animated
- blueprint: device-surface-showcase (Adapt: static tour variant)
- src: compositions/frames/02-home.html
- asset_candidates: capture/assets/pages/home-hero.png
- focal: capture/assets/pages/home-hero.png
- roles: home-hero.png = cutout (the hero surface inside a browser card)

Adapt: keep the floating-window-as-hero signature; single screen, no cycling — the camera does one slow push toward the headline block; a side caption column carries the beat's text (mirrored RTL: caption column on the RIGHT, screen card leaning left, asymmetric 60/40).
Scene 1 (0.0–1.5s): the browser card holding home-hero.png enters as a whole (slide-up + crossfade), positioned left-of-center ~62% width; right column shows the eyebrow "جولة في المنصة" (teal, uppercase-feel small) and h2 "واجهة عربية أنيقة" (ink) already seated — only the card moves.
Scene 2 (1.5–4.0s): inside the card, a slow 1.0→1.06 push-in toward the navy hero headline (the words "خيل العرب الأصيلة" in orange on the screen); meanwhile the right column's body line "سوق موثوق لعرض وبيع الخيل المنتقاة" (muted) fades up on its beat.
Scene 3 (4.0–5.5s): push eases to rest; the card and text hold and read — stillness. Nothing else moves.

## Frame 3 — Marketplace (الخيل المعروضة)

- scene: the horses browse grid assembles as cards cascade into view
- duration: 5s
- transition_in: push-slide RIGHT
- poster: 3.5s
- status: animated
- blueprint: grid-card-assemble (Adapt)
- src: compositions/frames/03-horses.html
- asset_candidates: capture/assets/pages/horses.png
- focal: capture/assets/pages/horses.png
- roles: horses.png = cutout (hero surface in browser card)

Adapt: the grid INSIDE the captured screen can't be re-assembled — the assembly language moves to the overlay: three small tinted label chips (سلالة أصيلة · معاينة من الإدارة · سعر واضح) cascade staggered under the headline while the browser card pushes in slowly; the cascade + push is the signature.
Scene 1 (0.0–1.4s): browser card with horses.png seats right-of-frame-lean-left (mirrored: card LEFT this time ~58%, caption column RIGHT), eyebrow "السوق" + h2 "خيل معروضة للبيع" reveal with the card; slow push-in begins on the grid area of the screen.
Scene 2 (1.4–3.4s): three tinted chips cascade in staggered (0.35s apart) below the h2 on the caption side — each pops on its reading beat; the push continues subtly.
Scene 3 (3.4–5.0s): chips settle; card holds with a final micro-settle of the push; still read.

## Frame 4 — Live auction room (اللحظة المميزة)

- scene: open tight on the live top-bid, zoom out to reveal the whole auction room
- duration: 8s
- transition_in: zoom-through 0.6s
- poster: 6s
- status: animated
- blueprint: zoom-out-workspace-reveal (Reproduce)
- src: compositions/frames/04-auction.html
- asset_candidates: capture/assets/pages/auction-room.png
- focal: capture/assets/pages/auction-room.png
- roles: auction-room.png = cutout (the whole workspace surface)

Reproduce: the signature ONE continuous decelerating zoom-out is the engine — open tight (1.0 crop-scale ≈ 2.2×) on the navy bid card (countdown + 165,000 ريال), micro-action in close-up (a teal highlight ring pulses ONCE around the top-bid figure — it really exists), then the single continuous zoom-out reveals the entire auction room: bid feed, horse panel, specs. Lock, then overlay payoff.
Scene 1 (0.0–2.0s): full-bleed tight crop on the navy bid card top (countdown chip "00:21:33" + "أعلى مزايدة حالياً 165,000 ر.س."); a teal ring draws around the price figure and eases away — the only overlay.
Scene 2 (2.0–5.2s): ONE continuous decelerating zoom-out (2.2× → 1.0×) reveals the whole room — bid feed rows (165,000 / 160,000 / 155,000) and the horse panel resolve as the crop widens; layer captions: eyebrow "المزاد المباشر" + h2 "زايد بالوقت الحقيقي" fade up on the right margin as the zoom passes its midpoint.
Scene 3 (5.2–6.4s): zoom locks at 1.0×; a tinted caption card slides up bottom-right (mirrored) carrying three mini rows with check glyphs: "عدّاد تنازلي حي" · "سجل مزايدات لحظي" · "أعلى مزايدة تتصدر" — staggered 0.3s.
Scene 4 (6.4–8.0s): hold everything still — the room reads. No further motion.

## Frame 5 — Horse card (بطاقة الحصان)

- scene: the horse detail page holds nearly still with one caption beat
- duration: 5s
- transition_in: blur-crossfade 0.6s
- poster: 3.5s
- status: animated
- blueprint: titlecard-reveal (Adapt)
- src: compositions/frames/05-horse.html
- asset_candidates: capture/assets/pages/horse-detail.png
- focal: capture/assets/pages/horse-detail.png
- roles: horse-detail.png = cutout (hero surface in browser card)

Adapt: the calm breather — ONE restrained move only: the browser card slides up + crossfades, camera drifts a hair toward the specs table; a single tinted line "سلالة · عمر · لون · نسب — كل التفاصيل في بطاقة واحدة" fades up on the right. Deliberate near-stillness is the point.
Scene 1 (0.0–1.8s): browser card with horse-detail.png enters (slide-up + crossfade), centered ~66% width; eyebrow "شفافية كاملة" + h2 "بطاقة حصان بكل التفاصيل" seated above (right-aligned).
Scene 2 (1.8–3.4s): the single muted body line fades up on its beat; the camera micro-drifts toward the specs table region of the screen.
Scene 3 (3.4–5.0s): still hold — the card and captions read.

## Frame 6 — Sell your horse (اعرض حصانك)

- scene: the sell form with a three-step journey building beside it
- duration: 5.5s
- transition_in: push-slide RIGHT
- poster: 4s
- status: animated
- blueprint: cursor-ui-demo (Adapt: no cursor, stepwise-flow variant)
- src: compositions/frames/06-sell.html
- asset_candidates: capture/assets/pages/sell.png
- focal: capture/assets/pages/sell.png
- roles: sell.png = cutout (hero surface in browser card)

Adapt: drop the cursor; keep the stepwise state-change signature as three step-circles (١ ٢ ٣) that fill in sequence beside the screen — طلب البيع → معاينة الإدارة → عرض أو مزاد — while the browser card holds the real form. No fake form-filling inside the screen; the steps carry the story.
Scene 1 (0.0–1.5s): browser card with sell.png seats left ~58% (caption column right); eyebrow "لأصحاب الخيل" + h2 "اعرض حصانك للبيع" reveal with the card.
Scene 2 (1.5–4.2s): three step-circles cascade down the right column, each filling teal with its label as it lands (staggered ~0.9s): "١ — ارفع طلب البيع بالصور والسعر" then "٢ — الإدارة تعاين وتعتمد" then "٣ — يُعرض للبيع أو في المزاد".
Scene 3 (4.2–5.5s): steps settle; hold and read.

## Frame 7 — Admin back office (لوحة الإدارة)

- scene: two real admin screens cycle inside one browser card while stat chips land
- duration: 6s
- transition_in: push-slide RIGHT
- poster: 4.5s
- status: animated
- blueprint: device-surface-showcase (Adapt: stepwise-flow cycling variant)
- src: compositions/frames/07-admin.html
- asset_candidates: capture/assets/pages/admin-dashboard.png, capture/assets/pages/admin-requests.png
- focal: capture/assets/pages/admin-dashboard.png
- roles: admin-dashboard.png = cutout (surface A) · admin-requests.png = cutout (surface B)

Adapt: the stepwise-flow cycling variant — one browser card holds both real screens, swapping in place (cross-dissolve) mid-frame; two tinted chips ("طلبات البيع للمراجعة" · "الصفقات والمزادات") land staggered on the caption side. The swap is the signature in-place token change.
Scene 1 (0.0–1.6s): browser card with admin-dashboard.png seats centered-left ~60%; eyebrow "لإدارة المنصة" + h2 "لوحة تحكم كاملة" reveal; slow push toward the stat-cards row.
Scene 2 (1.6–3.0s): the card's screen cross-dissolves to admin-requests.png (in-place swap, same card geometry); the first chip "طلبات البيع للمراجعة" pops on the swap beat.
Scene 3 (3.0–4.6s): second chip "مزادات وصفقات وإدارة عملاء" lands a beat later; push eases to rest.
Scene 4 (4.6–6.0s): hold — the back office reads.

## Frame 8 — Closing / CTA

- scene: brand lockup returns with the ask and the domain pill
- duration: 5s
- transition_in: blur-crossfade 0.6s
- poster: 4s
- status: animated
- blueprint: logo-assemble-lockup (Adapt: already-assembled settle variant)
- src: compositions/frames/08-closing.html
- asset_candidates: capture/assets/logo.svg, capture/assets/pattern.svg
- focal: capture/assets/logo.svg
- roles: logo.svg = cutout · pattern.svg = background (faint ~6%)

Adapt: already-assembled settle — the lockup arrives whole (no rebuild), satellites clear, then the ask line types in as one beat and the domain pill pops last. Concentric closing-rings (teal, faint) behind, per frame.md atmosphere.
Scene 1 (0.0–1.4s): cream + faint pattern; logo + wordmark lockup settles to center as one unit (scale 1.04 → 1.0 settle).
Scene 2 (1.4–3.0s): h2 "جاهز تبيع وتشتري بثقة؟" fades up beneath the lockup on its reading beat.
Scene 3 (3.0–4.2s): the teal CTA pill "mazad.alfrusiyaar.com" (Latin, dir=ltr) spring-pops below — the one solid element.
Scene 4 (4.2–5.0s): hold the end card — still.
