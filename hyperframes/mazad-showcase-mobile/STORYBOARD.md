---
format: 1080x1920
duration: 40s
message: "مزاد الفروسية في جيبك — كل رحلة العميل من الجوال"
arc: Brand → Client tour on mobile (home → marketplace → live auction → horse card → sell + account) → CTA
audience: Clients of the platform (Arabic-speaking, WhatsApp/Instagram viewers)
mode: autonomous
music: none
---

## Video direction

- **9:16 vertical film (1080×1920)**. Layout law for every content frame: Arabic headline block sits TOP (~upper 18%), the PHONE mockup is the hero CENTERED (~52–58% of frame width), one tinted chip row or payoff line sits BELOW the phone (~upper edge of the bottom band). Nothing left/right of the phone — vertical stack only.
- **palette system** (frame.md, blue-professional remixed onto af brand): cream ground #F6F3EC; teal #0E5F82 is the single accent; ink #191510 headlines; muted #4C463D body; tinted cards = teal 4% fill / 20% border / no shadows. The navy of captured screens is the only dark surface.
- **phone mockup**: dark ink bezel (rounded ~64px outer radius, ~14px bezel thickness), small notch pill at top, the captured screenshot filling the screen (the captures are 390×844 @3x — crisp). The phone casts NO shadow (frame.md rule) — the bezel itself is the lift. Camera moves act on an inner wrapper of the screenshot (object-fit cover), never on the timed clip element.
- **RTL Arabic film**: every frame root carries `dir="rtl" lang="ar"`; numerals Latin digits (`dir="ltr"`). Font: Alexandria only (assets/fonts).
- **motion grammar (silent film)**: headline + phone enter on beat one, then each further piece (chips, payoff lines) reveals on its reading beat across the back ~50%; long-tail eases (power3); holds read still. Phone screen content can push/zoom slightly inside the bezel.
- **rhythm**: Frame 3 (live auction) is the climax; Frame 6 (sell → account) carries the proof swap; Frame 7 near-still.
- **negative list**: no slideshow, no screensaver, no shadows, no second accent, no invented UI/figures, no desktop-width screenshots, nothing beside the phone.

## Frame 1 — Brand cover

- scene: مزاد الفروسية lockup settles vertically on cream
- duration: 4.5s
- transition_in: cut
- poster: 3.5s
- status: animated
- blueprint: logo-assemble-lockup (Adapt)
- src: compositions/frames/01-cover.html
- asset_candidates: capture/assets/logo.svg, capture/assets/pattern.svg
- focal: capture/assets/logo.svg
- roles: logo.svg = cutout · pattern.svg = background (faint ~6%)

Adapt: vertical lockup — mark center-upper (~30% height), wordmark + sub-line beneath, accent-line below that; nothing else. Sub-line: "بيع واشترِ وزايد — من جوالك، بثقة قبل أي صفقة".
Scene 1 (0.0–2.2s): cream + faint pattern; the mark comes to exist (glow, construction outline trace, fill wipe, spring settle) at ~30% height, centered.
Scene 2 (2.2–3.6s): wordmark "مزاد الفروسية" fades up beneath; client sub-line follows a half-beat later.
Scene 3 (3.6–4.5s): teal accent-line draws; hold still.

## Frame 2 — Home (من جوالك)

- scene: the real mobile home in a phone mockup, slow push toward the hero headline
- duration: 5.5s
- transition_in: blur-crossfade 0.6s
- poster: 4s
- status: animated
- blueprint: device-surface-showcase (Adapt: static tour, vertical)
- src: compositions/frames/02-home.html
- asset_candidates: capture/assets/pages/m-home.png
- focal: capture/assets/pages/m-home.png
- roles: m-home.png = cutout (phone screen)

Adapt: phone hero centered; headline above, one payoff chip below. The signed-in mobile header shows the member name on the screen.
Scene 1 (0.0–1.5s): eyebrow "من جوالك" + h1 "المزاد في جيبك" seat at top; the phone mockup with m-home.png enters (slide-up + crossfade) centered, screen pushing slowly toward the hero headline (scale 1→1.06 on the inner screenshot wrapper).
Scene 2 (1.5–4.0s): the payoff chip "تصفّح واعرض وزايد من أي مكان" fades up below the phone on its beat; push continues subtly.
Scene 3 (4.0–5.5s): push eases to rest; hold and read.

## Frame 3 — Live auction (زايد مباشرة)

- scene: the mobile bidding screen — countdown, bid form, and the client leading the feed
- duration: 8s
- transition_in: zoom-through 0.6s
- poster: 6s
- status: animated
- blueprint: zoom-out-workspace-reveal (Adapt: screen-crop reveal, vertical)
- src: compositions/frames/03-auction.html
- asset_candidates: capture/assets/pages/m-auction-card.png
- focal: capture/assets/pages/m-auction-card.png
- roles: m-auction-card.png = cutout (phone screen)

Adapt: the reveal happens INSIDE the phone screen: open with the screenshot crop zoomed ~1.8× on the navy price block ("170,000 ر.س." + countdown), teal ring pulses ONCE around the price, then ONE continuous decelerating zoom-out to full screen revealing the bid form + the feed with سلطان القحطاني leading. Headline above the phone swaps in at the midpoint; two payoff chips below land after the lock.
Scene 1 (0.0–2.0s): phone centered with tight crop on the navy block; ring draws around 170,000 and eases away.
Scene 2 (2.0–5.0s): ONE continuous decelerating zoom-out inside the screen (1.8×→1.0×); headline above the phone: eyebrow "المزاد المباشر" + h1 "زايد بالوقت الحقيقي" fades up at the midpoint.
Scene 3 (5.0–6.4s): two chips stagger below the phone: "مزايداتك تتصدّر لحظياً" · "أعلى مزايدة تفوز عند النهاية".
Scene 4 (6.4–8.0s): hold — the screen reads still.

## Frame 4 — Marketplace (خيل معروضة للبيع)

- scene: the mobile marketplace grid with real photos
- duration: 5s
- transition_in: push-slide UP
- poster: 3.5s
- status: animated
- blueprint: grid-card-assemble (Adapt: vertical)
- src: compositions/frames/04-horses.html
- asset_candidates: capture/assets/pages/m-horses-cards.png
- focal: capture/assets/pages/m-horses-cards.png
- roles: m-horses-cards.png = cutout (phone screen)

Adapt: phone centered showing the photo cards; headline above; two chips below cascade.
Scene 1 (0.0–1.4s): eyebrow "السوق" + h1 "خيل معروضة للبيع" seat at top; phone with m-horses-cards.png enters centered; slow push toward the cards.
Scene 2 (1.4–3.4s): two chips stagger below the phone: "صور حقيقية" · "أسعار معلنة".
Scene 3 (3.4–5.0s): chips settle; hold and read.

## Frame 5 — Horse card (بطاقة الحصان)

- scene: the mobile horse detail page — photo, specs, offer — near-still breather
- duration: 5s
- transition_in: blur-crossfade 0.6s
- poster: 3.5s
- status: animated
- blueprint: titlecard-reveal (Adapt: vertical)
- src: compositions/frames/05-horse.html
- asset_candidates: capture/assets/pages/m-horse-detail.png
- focal: capture/assets/pages/m-horse-detail.png
- roles: m-horse-detail.png = cutout (phone screen)

Adapt: ONE restrained move — phone enters, screen micro-drifts toward the horse photo; single line below.
Scene 1 (0.0–1.8s): eyebrow "شفافية كاملة" + h1 "بطاقة حصان بكل التفاصيل" seat at top; phone with m-horse-detail.png enters (slide-up + crossfade).
Scene 2 (1.8–3.4s): the single line "صور حقيقية · نسب واضحة · سعر معلن" fades up below; screen micro-drift.
Scene 3 (3.4–5.0s): still hold.

## Frame 6 — Sell + account (بيع وتابع من حسابك)

- scene: the mobile sell form swaps in-place to the client's account page
- duration: 8s
- transition_in: push-slide UP
- poster: 6s
- status: animated
- blueprint: cursor-ui-demo (Adapt: no cursor, two-surface stepwise flow, vertical)
- src: compositions/frames/06-sell-account.html
- asset_candidates: capture/assets/pages/m-sell.png, capture/assets/pages/m-account-bids.png
- focal: capture/assets/pages/m-account-bids.png
- roles: m-sell.png = cutout (surface A) · m-account-bids.png = cutout (surface B)

Adapt: one phone, two surfaces cross-dissolving in place: the sell form (with a compact three-step ladder BELOW the phone: ١ ارفع الطلب · ٢ الإدارة تعاين · ٣ يُعرض للبيع أو المزاد), then the account page showing "أهلاً، سلطان القحطاني" with طلبات البيع / مزايداتي — the swap is the signature. Teal ring pulses once around the مزايداتي region after the swap (that row exists on the screen — m-account-bids shows the bids section prominently).
Scene 1 (0.0–1.5s): eyebrow "لأصحاب الخيل" + h1 "اعرض حصانك للبيع" seat at top; phone with m-sell.png enters.
Scene 2 (1.5–3.8s): three step-circles cascade below the phone (0.8s stagger), filling teal with their labels.
Scene 3 (3.8–5.6s): the screen cross-dissolves to m-account-bids.png; h1 crossfades to "وتابع كل شيء من حسابك"; teal ring pulses once around the bids section.
Scene 4 (5.6–8.0s): hold — the account reads.

## Frame 7 — Closing / CTA

- scene: brand lockup with the ask and the domain pill, vertical
- duration: 4.5s
- transition_in: blur-crossfade 0.6s
- poster: 3.5s
- status: animated
- blueprint: logo-assemble-lockup (Adapt: already-assembled settle variant)
- src: compositions/frames/07-closing.html
- asset_candidates: capture/assets/logo.svg, capture/assets/pattern.svg
- focal: capture/assets/logo.svg
- roles: logo.svg = cutout · pattern.svg = background (faint ~6%)

Adapt: already-assembled settle; concentric teal rings behind (CSS-only); vertical stack: lockup → ask → pill.
Scene 1 (0.0–1.4s): cream + faint pattern; lockup (mark + wordmark) settles as one unit (scale 1.04→1.0) at ~38% height.
Scene 2 (1.4–2.8s): h1 "سجّل اليوم — وابدأ رحلتك مع خيل العرب" fades up.
Scene 3 (2.8–3.8s): teal CTA pill "mazad.alfrusiyaar.com" (Latin, dir=ltr) spring-pops.
Scene 4 (3.8–4.5s): hold the end card — still.
