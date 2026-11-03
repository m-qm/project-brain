# Shoot brief · Post 1 Reel

Queue id: `ig-d01` (local, pending). File: `slides/out/ig-d01.mp4`

## Format

Instagram Reel. 1080 × 1920 (9:16). ~11s. Silent. Type only. No face, no voice, no licensed music.

Regenerate:

```bash
cd examples/content-ads-brain
node slides/render-01-reel.mjs
```

## Why this shape (not “viral as a feature”)

Reels beat carousels on cold reach. What we can design is **hold rate**, not a guarantee of going wide:

* Hook readable in the first second (two lines, full screen)
* Hard cuts under 2s. No fades
* One idea. Muted viewing still works (the type is the audio)
* Last beat repeats the hook so the loop does not feel like an ending
* CTA on screen, not a verbal ask for invoices or a personal number

Do not add trending audio that fights the type. Do not add a face. Do not promise reach in the caption.

## Caption (paste)

**ES.** El modelo escribe con fluidez. Si el precio no está en git, se lo inventa. Un cerebro en el repo dice qué es verdad. Un humano dice sí antes de publicar. No prometemos viralidad. agentkbase.com/company-brain

**EN.** The model is fluent. If the price is not in git, it makes one up. A brain in the repo holds what is true. A human says yes before anything goes live. We do not promise viral reach. agentkbase.com/company-brain

One language per upload. Same video.

## After you watch the mp4

```bash
cd examples/content-ads-brain
node workers/run.mjs approve ig-d01
```

Upload the Reel by hand. Then `node workers/run.mjs publish` (still no Meta API). Ads stays idle until real insights exist.
