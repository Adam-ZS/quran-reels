# Quran Reels Studio 4

A build-free, browser-first editor for creating TikTok, Instagram Reels, YouTube Shorts, portrait, square, and landscape Quran recitation videos.

Choose a surah and ayah range, select a verse-by-verse reciter or supply your own recording, add verified tajweed colors, choose a motion or free-stock background, tune the layout and audio, then export the finished video locally.

## What is new in Studio 4

### Expanded visual library

- 24 animated motion scenes generated entirely on-device
- 215-item legacy stock-video catalog after runtime cleanup of duplicates and placeholder records
- Unified free-media search hub:
  - Pexels video search using your own free API key
  - Pixabay video search using your own free API key
  - Wikimedia Commons video search without an API key
  - Internet Archive movie search without an API key
- Direct MP4/WebM URL input
- Persistent local video vault powered by IndexedDB
- Saved remote-video library with source, creator, and license notes
- Provider-aware media credits stored with the project
- Clear cross-origin and licensing warnings before publication

The generated motion scenes are the most reliable export option because they do not depend on remote files, API availability, or cross-origin video permissions.

### Larger reciter system

- 65+ bundled EveryAyah reciter variants
- One-click synchronization of the current free Al Quran Cloud verse-by-verse audio catalog
- Search and favorites
- Murattal, Mujawwad, and Muallim filters
- Short voice preview before entering the studio
- Dynamic per-surah audio URL loading and caching
- Existing custom audio upload and microphone recording support

The app does not bundle or redistribute reciter recordings inside the ZIP. Audio is streamed from the configured Quran-audio providers when selected.

### Tajweed layer

- Verified `quran-tajweed` edition loaded per surah
- Safe parsing that retains only Quran text and recognized tajweed-rule classes
- Color rendering in the verse picker
- Tajweed emphasis in the exported canvas video
- Classic, high-contrast, and single-color palettes
- Adjustable color intensity
- Built-in legend for madd, ghunnah, ikhfā’, idghām, iqlāb, qalqalah, and hamzat al-waṣl

The tajweed layer is a visual aid. It does not listen to or grade pronunciation and is not a substitute for learning with a qualified teacher.

### Recitation-focused audio finishing

Six original mastering profiles are included:

- Natural Clean
- Dry Teaching
- Warm Masjid
- Broadcast Clear
- Wide Hall
- Intimate Soft

The processing chain now includes high-pass cleanup, warmth EQ, de-essing, presence control, gentle compression, adjustable room impulse, normalization, and limiting. These controls enhance a supplied recording; they do not clone or impersonate a named reciter.

## Existing editor features

- All 114 surahs with individual ayah and range selection
- Multiple translations and optional transliteration
- Custom MP3, WAV, M4A, and browser-supported audio uploads
- Browser microphone recording
- Automatic audio analysis and ayah timeline
- 9:16, 4:5, 1:1, and 16:9 formats
- Six complete design templates
- Arabic typography, translation styling, watermarking, safe areas, grain, vignette, overlays, blur, parallax, and zoom
- Intro and outro cards
- Karaoke reveal, fade, and static captions
- MP4 H.264/AAC conversion when WebCodecs is available
- WebM VP9/Opus fallback
- JSON project save/load
- Installable PWA app shell
- Keyboard controls

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

## Source setup

Pexels and Pixabay require a free personal API key. Keys are stored only in that browser and are not included in saved project files.

Wikimedia Commons and Internet Archive searches do not require keys. Individual assets can have different licenses or rights statements, so review the source metadata before publishing or monetizing a video.

Remote video export requires the media server to permit cross-origin canvas use. When a remote clip cannot be exported, use a generated motion background or import a local copy you are permitted to use.

## Privacy

- The application has no custom backend.
- Uploaded audio and video stay in the browser.
- Local videos saved to the media vault are stored in IndexedDB on that device.
- Style settings, favorites, API keys, and saved remote links use browser storage.
- Quran text, recitation audio, optional stock media, fonts, and MP4 conversion modules are fetched directly from their configured providers.

## Project structure

```text
index.html             Quran browser, original controls, data catalogs, and canvas base
pro-upgrade.js         Timeline, templates, audio mastering, projects, and export pipeline
pro-upgrade.css        Studio 3/4 base editor styles
studio-4.js            Media hub, reciter catalog sync, tajweed layer, motion backgrounds
studio-4.css           Studio 4 media, tajweed, and reciter interface styles
manifest.webmanifest   Installable application metadata
sw.js                  Offline application-shell cache
icon.svg               Application icon
SOURCES-AND-RIGHTS.md  Provider, licensing, and export notes
start.sh / start.bat   Local static-server launchers
```

## Browser recommendation

A current Chrome or Edge release provides the strongest support for MediaRecorder, Web Audio, WebCodecs, canvas capture, IndexedDB, and MP4 conversion. Other browsers can use the WebM export path when H.264/AAC encoding is unavailable.
