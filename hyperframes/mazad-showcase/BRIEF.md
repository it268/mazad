---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "مزاد الفروسية — منصة مزادات وبيع وشراء خيل العرب الأصيلة، بثقة قبل أي صفقة"
destination: client-handoff
aspect: 1920x1080
language: ar
length: 45s
angle: show-it-as-is
style_preset: ""
---

## Intent

A client-facing showcase (site tour) of mazad.alfrusiyaar.com — the Arabian-horse
auction marketplace built for the client. Show the real site as-is: its own
captured screens are the video's assets. Tone: premium, trustworthy, equestrian —
matching the af brand (deep navy/teal, warm cream, orange accents, Alexandria
Arabic type). The audience is the client (site owner) and their stakeholders, so
the video should make the platform feel alive: live auctions, real-time bidding,
a curated marketplace, and an admin back-office.

## Assets

- Local site at http://localhost:3100 (production build of the mazad TanStack Start app; PocketBase demo data on :8090) — capture source for all screens.
- /logo.svg, /pattern.svg, /favicon.svg — brand assets from the site's public/ folder.
- Brand tokens: teal #0e5f82, navy #2f3382, orange #f5730f, crimson #7d1300, cream #f6f3ec, sand #ece5d8, ink #191510; fonts Alexandria (Arabic), Montserrat (Latin/numerals), Quicksand (labels).

## Customizations

- Show-it-as-is: feature captured screens of the real pages (home, horses browse, live auction room with countdown and bids, sell flow, admin dashboard) inside device/browser frames.
- Silent film: no narration and no BGM (offline run, no HeyGen sign-in; Arabic TTS unavailable locally) — carry the story with Arabic on-screen typography.
- RTL Arabic throughout; numerals in Latin digits (tabular) for prices/timers.

## Notes

- The site language is Arabic; keep all on-screen copy Arabic.
- Do not invent UI that doesn't exist on the site; the screens are the truth.
- Keep each captured screen on screen long enough to be read (~4-6s).
- End card: مزاد الفروسية + mazad.alfrusiyaar.com (domain goes live after DNS).
