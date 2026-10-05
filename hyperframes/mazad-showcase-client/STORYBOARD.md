---
format: 1920x1080
duration: 42s
message: "مزاد الفروسية — رحلة العميل: تصفح، زايد مباشرة، بيع حصانك، وتابع صفقاتك من حسابك"
arc: Brand → Client tour (home → marketplace → live auction → horse card → sell flow → my account) → CTA
audience: Clients of the platform (Arabic-speaking horse owners and buyers)
mode: autonomous
music: none
---

## Video direction

- **palette system** (frame.md, blue-professional remixed onto af brand): cream ground #F6F3EC; **teal #0E5F82 is the single accent** (eyebrows, numerals, CTA pill, rules, progress bar); ink #191510 headlines; muted #4C463D body; tinted cards = teal 4% fill / 20% border / 10–14px radius / no shadows. The navy of captured screens is the only dark surface — overlays stay on cream.
- **RTL Arabic film**: every frame root carries `dir="rtl" lang="ar"`; text right-aligned (start = right); layouts mirror (eyebrows/headers anchored top-right). Numerals stay Latin digits (`tabular-nums`, `dir="ltr"`). Font: Alexandria only (staged in assets/fonts).
- **motion grammar (silent film)**: each frame's on-screen headline is the pacing cue — reveal each piece on its reading beat, spreading reveals across the back ~50%; never front-load then freeze. Long-tail eases (power3). Captured screens sit inside a thin browser-card frame (12px radius, 20% teal border) — camera moves are slow pushes/zooms on the SCREEN CONTENT (inner wrapper), never on the timed clip element. Holds read still.
- **rhythm / held frames**: Frame 3 (live auction) is the climax with the most camera motion; Frame 6 (my account) is the proof-landing — measured and calm; Frame 7 (closing) near-still.
- **negative list**: no slideshow, no screensaver, no shadows on content, no second accent color, no fake UI on top of captured screens (only neutral highlight rings around what really exists), no invented numbers — figures come from the screens (170,000 leading bid, 85,000/60,000 asking prices, 95,000 confirmed purchase), no stock gradients, no admin UI anywhere.

## Frame 1 — Brand cover

- scene: مزاد الفروسية logo settles with the client-facing tagline on cream
- duration: 4.5s
- transition_in: cut
- poster: 3.5s
- status: animated
- blueprint: logo-assemble-lockup (Adapt)
- src: compositions/frames/01-cover.html
- asset_candidates: capture/assets/logo.svg, capture/assets/pattern.svg
- focal: capture/assets/logo.svg
- roles: logo.svg = cutout · pattern.svg = background (faint, ~6% opacity)

Adapt: the mark comes to exist then resolves into a centered lockup; tagline arrives as a second beat. Sub-line is client-facing: "بيع واشترِ وزايد — رحلتك مع خيل العرب تبدأ من حسابك".
Scene 1 (0.0–2.2s): cream ground + faint star-lattice (~6%); the logo mark comes to exist center-upper (~40% height, centered) — glow ignites, construction outline traces, fill wipes in with a spring settle; 2 depth layers.
Scene 2 (2.2–3.6s): wordmark "مزاد الفروسية" (h1, ink) fades up beneath the mark; the client sub-line (body, muted) follows a half-beat later.
Scene 3 (3.6–4.5s): teal accent-line (60×4) draws under the wordmark; hold the lockup centered and still.

## Frame 2 — Home (البداية من الرئيسية)

- scene: the real home page in a browser card, slow push toward the hero headline
- duration: 5.5s
- transition_in: blur-crossfade 0.6s
- poster: 4s
- status: animated
- blueprint: device-surface-showcase (Adapt: static tour variant)
- src: compositions/frames/02-home.html
- asset_candidates: capture/assets/pages/home-hero.png
- focal: capture/assets/pages/home-hero.png
- roles: home-hero.png = cutout (hero surface in browser card)

Adapt: floating-window-as-hero, single screen; the signed-in header on the screen shows the member's name (سلطان القحطاني) — keep it visible, it establishes "one client's journey". Camera pushes slowly toward the navy hero headline; mirrored RTL caption column on the RIGHT.
Scene 1 (0.0–1.5s): browser card with home-hero.png enters (slide-up + crossfade), left-of-center ~62% width; right column: eyebrow "رحلة العميل" + h2 "كل شيء يبدأ من الرئيسية" seated — only the card moves.
Scene 2 (1.5–4.0s): slow 1.0→1.06 push-in inside the card toward the hero headline; the body line "تصفّح المعروضات والمزادات المباشرة" (muted) fades up on its beat.
Scene 3 (4.0–5.5s): push eases to rest; hold and read.

## Frame 3 — Live auction (اللحظة المميزة)

- scene: open tight on the client's leading bid, zoom out to reveal the full auction room
- duration: 8s
- transition_in: zoom-through 0.6s
- poster: 6s
- status: animated
- blueprint: zoom-out-workspace-reveal (Reproduce)
- src: compositions/frames/03-auction.html
- asset_candidates: capture/assets/pages/auction-room.png
- focal: capture/assets/pages/auction-room.png
- roles: auction-room.png = cutout (the whole workspace surface)

Reproduce: the ONE continuous decelerating zoom-out is the engine — open tight (~2.5×) on the navy bid card (countdown + "أعلى مزايدة حالياً 170,000 ر.س."), the client's name سلطان القحطاني visible atop the bid feed; a teal ring pulses ONCE around the price, then the zoom-out reveals the whole room: bid feed, horse photo panel, specs. Lock, then payoff chips.
Scene 1 (0.0–2.0s): full-bleed tight crop on the navy bid card top; teal ring draws around the 170,000 figure and eases away — the only overlay.
Scene 2 (2.0–5.2s): ONE continuous decelerating zoom-out (2.5×→1.0×) reveals the whole room; eyebrow "المزاد المباشر" + h2 "زايد بالوقت الحقيقي" fade up on the right margin at the zoom midpoint.
Scene 3 (5.2–6.4s): zoom locks at 1.0×; tinted caption card slides up bottom-right with three check rows, staggered: "مزايداتك تتصدّر لحظياً" · "عدّاد تنازلي حي" · "أعلى مزايدة تفوز عند النهاية".
Scene 4 (6.4–8.0s): hold — the room reads still.

## Frame 4 — Marketplace (الخيل المعروضة)

- scene: the horses grid with real photos, chips cascade beside it
- duration: 5s
- transition_in: push-slide RIGHT
- poster: 3.5s
- status: animated
- blueprint: grid-card-assemble (Adapt)
- src: compositions/frames/04-horses.html
- asset_candidates: capture/assets/pages/horses.png
- focal: capture/assets/pages/horses.png
- roles: horses.png = cutout (hero surface in browser card)

Adapt: the grid inside the screen can't re-assemble — the cascade lives on the overlay: three tinted chips (صور حقيقية · أسعار معلنة · تفاصيل كاملة) spring-pop staggered under the headline while the browser card pushes slowly toward the photo cards.
Scene 1 (0.0–1.4s): browser card with horses.png seats LEFT ~58%, caption column RIGHT; eyebrow "السوق" + h2 "خيل معروضة للبيع" reveal with the card; slow push begins.
Scene 2 (1.4–3.4s): three chips cascade staggered (~0.35s apart) below the h2.
Scene 3 (3.4–5.0s): chips settle; card micro-settles; still read.

## Frame 5 — Horse card (بطاقة الحصان)

- scene: the horse detail page holds nearly still — one caption beat
- duration: 5s
- transition_in: blur-crossfade 0.6s
- poster: 3.5s
- status: animated
- blueprint: titlecard-reveal (Adapt)
- src: compositions/frames/05-horse.html
- asset_candidates: capture/assets/pages/horse-detail.png
- focal: capture/assets/pages/horse-detail.png
- roles: horse-detail.png = cutout (hero surface in browser card)

Adapt: calm breather — ONE restrained move: card slides up + crossfades; camera micro-drifts toward the horse photo and specs; single tinted line "صور حقيقية · نسب واضحة · سعر معلن" fades up on the right.
Scene 1 (0.0–1.8s): browser card with horse-detail.png enters (slide-up + crossfade), centered ~66% width; eyebrow "شفافية كاملة" + h2 "بطاقة حصان بكل التفاصيل" seated above (right-aligned).
Scene 2 (1.8–3.4s): the single muted line fades up; camera micro-drifts toward the photo/specs region.
Scene 3 (3.4–5.0s): still hold.

## Frame 6 — Sell + my account (بيع وتابع من حسابك)

- scene: the sell form with the three-step journey, then the account page as proof
- duration: 8s
- transition_in: push-slide RIGHT
- poster: 6s
- status: animated
- blueprint: cursor-ui-demo (Adapt: no cursor, two-surface stepwise flow)
- src: compositions/frames/06-sell-account.html
- asset_candidates: capture/assets/pages/sell.png, capture/assets/pages/account.png
- focal: capture/assets/pages/account.png
- roles: sell.png = cutout (surface A) · account.png = cutout (surface B)

Adapt: drop the cursor; one browser card holds BOTH real surfaces with an in-place cross-dissolve at the mid-beat: the sell form with three step-circles (١ ارفع الطلب → ٢ الإدارة تعاين → ٣ يُعرض للبيع أو المزاد), then the account page lands as the proof — "أهلاً، سلطان القحطاني" with طلبات البيع (قيد المراجعة), مزايداتي (مباشر الآن 170,000), صفقاتي (مؤكد). The swap is the signature.
Scene 1 (0.0–1.5s): browser card with sell.png seats LEFT ~58%; caption column RIGHT: eyebrow "لأصحاب الخيل" + h2 "اعرض حصانك للبيع".
Scene 2 (1.5–3.8s): three step-circles cascade (0.85s stagger), each filling teal with its label: "١ — ارفع طلب البيع بالصور والسعر" · "٢ — الإدارة تعاين وتعتمد" · "٣ — يُعرض للبيع أو في المزاد".
Scene 3 (3.8–5.6s): the card's screen cross-dissolves to account.png (in-place swap); h2 crossfades to "وتابع كل شيء من حسابك"; a teal highlight ring pulses once around the مزايداتي row (مباشر الآن · 170,000) — it really exists on the screen.
Scene 4 (5.6–8.0s): hold — the account dashboard reads: طلبات قيد المراجعة، مزايدات مباشرة، صفقة مؤكدة.

## Frame 7 — Closing / CTA

- scene: brand lockup returns with the ask and the domain pill
- duration: 5s
- transition_in: blur-crossfade 0.6s
- poster: 4s
- status: animated
- blueprint: logo-assemble-lockup (Adapt: already-assembled settle variant)
- src: compositions/frames/07-closing.html
- asset_candidates: capture/assets/logo.svg, capture/assets/pattern.svg
- focal: capture/assets/logo.svg
- roles: logo.svg = cutout · pattern.svg = background (faint ~6%)

Adapt: already-assembled settle — the lockup arrives whole, then the ask line and the domain pill land. Faint concentric teal closing-rings behind (CSS-only).
Scene 1 (0.0–1.4s): cream + faint pattern; logo + wordmark settle as one unit (scale 1.04 → 1.0).
Scene 2 (1.4–3.0s): h2 "سجّل اليوم — وابدأ رحلتك مع خيل العرب" fades up.
Scene 3 (3.0–4.2s): teal CTA pill "mazad.alfrusiyaar.com" (Latin, dir=ltr) spring-pops — the one solid element.
Scene 4 (4.2–5.0s): hold the end card — still.
