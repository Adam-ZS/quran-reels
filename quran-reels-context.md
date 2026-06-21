# Quran Reels Studio — Complete Project Context

## Overview
Single-file HTML application at `/home/zs/quran-reels.html` that generates TikTok/Reels-style video clips of Quran recitation verses. Users pick a surah, select specific verses, choose a reciter, customize visuals (backgrounds, fonts, colors), and export as `.webm` video with audio + crossfade transitions.

Opens from `file:///home/zs/quran-reels.html` — no server needed.

## Core Architecture

### Data Sources
- **Surahs & verses**: `api.alquran.cloud/v1/surah/{n}/editions/quran-uthmani,en.sahih` — fetches Arabic (Uthmani script) + English (Saheeh International) in one call. Cached in `VC` object.
- **Audio**: `https://everyayah.com/data/{reciter_folder}/{surah3digits}{verse3digits}.mp3` — BunnyCDN-backed per-verse MP3 files.
- **Reciters**: 33 entries (was 19). Folder mapping in `FOLDERS` object.
- **Video backgrounds**: 50 hardcoded Pixabay CDN URLs (`VIDS` array) — name-based search filtering across 2-column grid.
- **Gradient presets**: 12 color schemes in `PRESETS` array — animated with radial gradients + star particles.

### Reciter Variants (33 total)
| Group | Variants |
|-------|----------|
| **Al-Afasy** | 128kbps, 64kbps |
| **As-Sudais** | 64kbps, 192kbps |
| **Ash-Shaatree** | 64kbps, 128kbps |
| **Al-Husary** | 64kbps, 128kbps, **Mujawwad (tajweed)**, **Muallim (teaching)** |
| **Yasser Al-Dossari** | 128kbps (only one folder on everyayah) |
| **Al-Muaiqly** | 64kbps, 128kbps |
| **Ash-Shuraym** | 64kbps, 128kbps |
| **Al-Hudhaify** | 64kbps, 128kbps |
| **Ar-Rifai** | 64kbps, 192kbps |
| **Abdul Basit** | Murattal (64kbps), Murattal (192kbps), **Mujawwad** |
| **Al-Minshawi** | Murattal, **Mujawwad**, **Teacher** |
| **New Reciters** | Muhammad Ayyoub, Mustafa Ismail, Salah Al-Budair, Khaalid Al-Qahtaanee, Fares Abbad, Akram Al-Alaqimy, Ayman Sowaid, Ali Hajjaj, Karim Mansoori, Aziz Alili, Khalefa Al-Tunaiji, Salaah Bukhatir, Muhammad Jibreel |

### State Object (`S`)
All app state in a single global `S` object. Key fields: `surah`, `sel` (Set of selected verse indices), `vIdx` (current preview verse), `urls[]`, `fmt`, `rec`, font settings, text color, veil opacity, watermark, background type/preset/video index.

### Three Views
1. **Home** (`#vh`) — surah search grid + popular shortcuts
2. **Verses** (`#vv`) — verse list with multi-select checkboxes
3. **Studio** (`#vs`) — canvas preview + controls sidebar

### Canvas Rendering (`draw()`)
- Background: video (if loaded), image (if loaded), or preset gradient with animated stars
- Dark veil overlay (`S.veil` opacity)
- Arabic verse text: Uthmani font (Scheherazade New / Amiri / Aref Ruqaa / Noto Naskh), auto-wrapped with measureText, verse number marker
- English translation: configurable font (Inter / Cinzel / Playfair Display / Lora), positioned below Arabic with decorative gold divider line
- Watermark + bottom progress bar
- `drawVerseText(v, w, h, alpha)` draws a single verse at specified opacity (used for crossfade blend frames)

### Preview Audio (`playV()`)
- Sequential playback through `S.urls[]` 
- Uses `<audio>` element with `oncanplaythrough` / `onerror` / `onended` chain
- 2-second timeout fallback per verse
- Background video animation loop (`requestAnimationFrame`) runs while playing

### Export (`doExport()`)
- **MediaRecorder + AudioContext** — no external dependencies, works on `file://`
- Pre-downloads all MP3 files, decodes to AudioBuffers via `decodeAudioData()`
- Calculates cumulative start times from actual audio duration (`buf.duration`)
- Creates `MediaStream` combining `canvas.captureStream(30)` video + `AudioContext.createMediaStreamDestination()` audio
- Schedules verse changes + audio playback at precise real-duration timestamps
- Crossfade animation: last 0.4s of each verse blends out old text at decreasing opacity while next fades in at increasing opacity, via `requestAnimationFrame` loop
- Recording time = sum of all audio durations + 1.5s buffer
- Output: `.webm` with VP9+Opus codec (falls back to plain webm if VP9 unsupported)
- Progress overlay with progress bar + status text

## Fixed Issues

### Bug: Reciter change in Studio mapped ALL verses to URLs
**Old**: `S.va.map(v => ...)` — mapped ALL surah verses when reciter changed
**Fix**: `const ix = [...S.sel].sort(...); S.urls = ix.map(i => S.va[i])` — only selected verses

### Bug: Export timing was fixed 2.5s/verse instead of real audio duration
**Old**: `const perVerse = 2.5; ... src.start(baseTime + i*perVerse)`
**Fix**: Calculates `cum[]` array from `bufs[i].duration`, schedules everything at actual timestamps

### Bug: ffmpeg.wasm URL was wrong (404), file:// restrictions
**Old**: Importmap importing from `@ffmpeg/ffmpeg@0.12.10/dist/esm/ffmpeg.min.js`
**Issue**: Package is UMD format at `dist/umd/ffmpeg.min.js`, not ESM. Also `file://` has SharedArrayBuffer restrictions
**Fix**: Replaced entirely with native MediaRecorder + AudioContext approach — no CDN dependency

## Known Issues / Considerations
- **Yasser Al-Dossari 64kbps**: Only one folder (`Yasser_Ad-Dussary_128kbps`) exists on everyayah.com. No 64kbps variant available. Label kept as "128kbps" for clarity.
- **Video thumbnails**: Pixabay returns 403 on `_small.jpg` thumb URLs. Current approach uses CSS gradient cards with name hashed to unique color — visually consistent, no broken images
- **Audio failures**: If a verse MP3 returns 404 (some reciter/verse combos unavailable), the buffer is skipped silently. Export continues without audio for that verse.
- **Export blocking**: `MediaRecorder` requires real-time rendering. Total export time = sum of audio durations (~2-5s per verse). For 5 verses averaging 3s each = ~15s total.
- **Crossfade**: Only visible in exported video, not in Preview mode. Preview uses simple sequential play.
- **new AudioContext()**: May start in 'suspended' state in Chrome. Code calls `actx.resume()` if suspended.

## Key Code Locations
| Section | Line (approx) | Description |
|---------|--------------|-------------|
| `SURAH` array | 191 | All 114 surahs |
| `RECS` + `FOLDERS` | 220-270 | 33 reciter entries + everyayah folder mapping |
| `VIDS` array | 271-290 | 50 Pixabay background videos |
| `FMTS` | 270 | Format presets (9:16, 16:9, 1:1, 4:5) |
| `PRESETS` | 270-271 | 12 gradient presets |
| `S` state | 292-300 | Global state object |
| `draw()` | 308-330 | Main canvas render function |
| `drawVerseText()` | 332-358 | Verse text renderer (supports alpha) |
| `drawBg()` | 360-370 | Animated gradient background with stars |
| `goStudio()` | ~303-308 | Enter studio with selected verses |
| `playV()` | 378-388 | Preview audio playback |
| `doExport()` | 390-460 | Full export pipeline |
| `onCh()` | 462-470 | Controls change handler |
| `renderCtrl()` | 472-488 | Builds sidebar controls HTML |
| `searchVid()` | 490+ | Video background search |
| `pickVid()` | 495+ | Select/load video background |

## Cross-Referencing Guides

### Add new reciter variant
1. Add ID+folder to RECS array (~line 220)
2. Add ID+folder_path to FOLDERS object (~line 245)
3. Verify URL works: `curl -sI "https://everyayah.com/data/{folder}/001001.mp3"`

### Add video backgrounds
- Add entries to VIDS array (~line 271) — format `{n: 'Name', u: 'pixabay_tiny_url'}`
- Pixabay URL pattern: `https://cdn.pixabay.com/video/YYYY/MM/DD/ID_tiny.mp4`
- Verify: `curl -sI --max-time 5 "URL" | grep "HTTP/2 200"`
- Thumbnails auto-generate gradient from name hash

### Change export codec/output
- Edit `mime` variable in `doExport()` (~line 420)
- Change blob type and download extension (~line 450)

### Add new font
- Add Google Fonts link in `<head>` (~line 15-16)
- Add option to the relevant `<select>` in `renderCtrl()` (~line 478)

## Running / Testing
```bash
# Open in browser
firefox /home/zs/quran-reels.html

# Test CDN availability
curl -sI --max-time 5 "https://everyayah.com/data/Alafasy_128kbps/001001.mp3"

# Check Pixabay video
curl -sI --max-time 5 "https://cdn.pixabay.com/video/2024/12/04/244839_tiny.mp4"
```
