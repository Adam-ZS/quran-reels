# Quran Reels Studio 5

A build-free, browser-first Quran video editor for TikTok, Instagram Reels, YouTube Shorts, portrait, square, and landscape exports.

Studio 5 is primarily a reliability release. It fixes the silent Chromium MP4 and severely dropped-frame Firefox/Chromium exports by removing real-time canvas recording from the final render path.

## Studio 5 export fixes

- Deterministic frame-by-frame video rendering
- Explicit 24/30 fps timestamps instead of wall-clock recording
- Independent offline audio mastering and encoding
- MP4 H.264 + AAC output with an AAC encoder extension when required
- WebM VP9/VP8 + Opus output
- Final-file validation before download
- Refuses silent files or low-frame-rate files
- Timestamp-based video-background decoding
- Smooth generated-background fallback when a remote clip cannot be decoded
- Reduced-resolution editor preview for smoother interaction
- Performance, Balanced, and Quality preview modes
- Draft, High, and Ultra export modes

See `EXPORT-ENGINE.md` for the diagnosis of the supplied broken samples and the complete new pipeline.

## Content and design features

- All 114 surahs with individual ayah and range selection
- 65+ bundled verse-by-verse reciter editions
- Optional synchronization with the free Al Quran Cloud catalog
- Murattal, Mujawwad, and Muallim filters
- Reciter preview, favorites, uploaded audio, and microphone recording
- Multiple translations and optional transliteration
- Verified `quran-tajweed` text layer with rule colors
- Six recitation-focused mastering profiles
- 24 deterministic animated backgrounds
- Local video vault using IndexedDB
- Pexels and Pixabay search with the user's own API key
- Wikimedia Commons and Internet Archive search without an API key
- Intro/outro cards, templates, safe areas, captions, verse progress, watermarking, overlays, vignette, blur, grain, and typography controls
- JSON project save/load and PWA app shell

## Run locally

### Windows

Double-click `start.bat`, then open:

```text
http://127.0.0.1:4173
```

### macOS or Linux

```bash
chmod +x start.sh
./start.sh
```

Then open:

```text
http://127.0.0.1:4173
```

A static host such as Vercel, Netlify, GitHub Pages, Cloudflare Pages, or an ordinary web server also works.

## Recommended export workflow

1. Start with **High · 720p · 30 fps**.
2. Use a generated motion background or an imported local video for maximum reliability.
3. Choose MP4 in current Chrome/Edge. When H.264 is unavailable, choose WebM.
4. Keep the tab open until the validation step finishes.
5. Studio 5 downloads the result only when both audio and video tracks pass validation.

The first export needs internet access to load the browser media engine and, on browsers without native AAC encoding, its AAC extension. Service-worker caching may make later use faster, but remote Quran audio and stock media still require their providers.

## Source setup and rights

Pexels and Pixabay require a free personal API key. Keys remain in that browser and are excluded from project files.

Wikimedia Commons and Internet Archive do not require keys, but each item can have different rights information. Review the original source before publishing or monetizing. See `SOURCES-AND-RIGHTS.md`.

The tajweed layer is a visual aid and does not grade pronunciation. Audio presets improve clarity and ambience without cloning or impersonating a named reciter.

## Privacy

- No custom backend is included.
- Uploaded audio and video remain in the browser.
- Local media-vault items are stored in IndexedDB on that device.
- Settings, favorites, and optional API keys use browser storage.
- Quran text, reciter audio, optional stock media, fonts, and export modules are fetched from their configured providers.

## Project structure

```text
index.html             Quran browser, canvas base, catalogs, and legacy controls
pro-upgrade.js         Timeline, mastering, deterministic renderer, validation, projects
pro-upgrade.css        Main advanced-editor styles
studio-5.js            Media hub, reciter sync, tajweed layer, deterministic motions
studio-5.css           Media, tajweed, reciter, and performance controls
manifest.webmanifest   Installable application metadata
sw.js                  Studio 5 application-shell cache
EXPORT-ENGINE.md       Export diagnosis, architecture, and browser behavior
SOURCES-AND-RIGHTS.md  Provider, licensing, and cross-origin notes
tools/validate-project.py  Static project integrity checks
start.sh / start.bat   Local static-server launchers
```
