# Contributing to Quran Reels Studio

Thanks for wanting to contribute! This project is a single-file browser app:
one `index.html` with the whole studio (UI, canvas rendering, Web Audio,
MediaRecorder export). No build step, no framework, no server.

## Getting started

```bash
git clone https://github.com/Adam-ZS/quran-reels.git
cd quran-reels
# no npm install needed — just open index.html
python3 -m http.server 8080   # or any static server
# open http://127.0.0.1:8080
```

Or test against the live demo: https://quran-reels-lyart.vercel.app

## What to work on

- New reciter variants (sources: everyayah.com) — keep the `RECITERS` list in
  alphabetical order and verify the audio URL actually resolves.
- New gradient presets / video backgrounds — keep them keyed by ID so existing
  user projects don't break.
- Export pipeline (MediaRecorder + AudioContext crossfade): frame timing,
  transition handling, cancel behavior.
- Typography: Arabic font loading and shaping (harfbuzz/`document.fonts`),
  stroke/shadow rendering for the watermark and ayah text.
- Accessibility and mobile layout.

## Guidelines

- Keep it a **single file**. No build step, no dependencies — that's the
  project's whole point. New features should fit in `index.html` or we discuss
  splitting the project.
- Test in at least two browsers (Chromium + Firefox) before submitting.
- Verify any new everyayah reciter URL with `curl -I` before adding it.
- Keep Arabic text rendering correct — test with a real short surah (e.g.
  Al-Ikhlas) and check letter joining.

## Pull request process

1. Fork the repo and create a branch: `git checkout -b feat/describe-change`.
2. Make your change and test it locally.
3. Open a PR. Describe what changed, why, and how you tested it.
4. Keep changes focused — one logical change per PR.

## Code of conduct

Be respectful and kind. See `CODE_OF_CONDUCT.md`.
