# Quran Reels Studio 🎬

Generate TikTok/Reels-style Quran recitation videos directly in your browser. Pick a surah, select verses, choose a reciter, customize the visuals, and export as `.webm` — no server, no dependencies.

## Features

- **114 Surahs** with Arabic (Uthmani) + English (Saheeh International) text
- **44 reciter variants** including Mujawwad (tajweed) versions for Husary, Minshawi, Abdul Basit
- **50 video backgrounds** — nature, sky, clouds, stars, rain, and more
- **12 animated gradient presets** with star particles
- **Multi-font support** — Scheherazade New, Amiri, Aref Ruqaa for Arabic; Inter, Cinzel, Playfair Display, Lora for English
- **4 aspect ratios** — 9:16 (TikTok/Reels), 16:9, 1:1, 4:5
- **Export as `.webm`** with audio synced to actual verse durations
- **Crossfade transitions** between verses (0.4s smooth blend)
- **100% client-side** — everything runs in your browser

## Quick Start

Open **https://quran-reels-lyart.vercel.app** and you're set.

Or open the file locally — no build step needed.

## Usage

1. **Pick a surah** from the grid or search by name
2. **Select verses** — tap individual verses or use Select All
3. **Enter Studio** — choose a reciter, background, font, and colors
4. **Preview** to check how it sounds/looks
5. **Export MP4** — waits for all audio to download, then records in real-time

## Reciters

| Reciter | Variants |
|---------|----------|
| Mishary Al-Afasy | 128kbps, 64kbps |
| Abdurrahmaan As-Sudais | 64kbps, 192kbps |
| Abu Bakr Ash-Shaatree | 64kbps, 128kbps |
| Mahmoud Al-Husary | 64kbps, 128kbps, **Mujawwad**, **Muallim** |
| Yasser Al-Dossari | 128kbps |
| Maher Al-Muaiqly | 64kbps, 128kbps |
| Saood Ash-Shuraym | 64kbps, 128kbps |
| Ali Al-Hudhaify | 64kbps, 128kbps |
| Hani Ar-Rifai | 64kbps, 192kbps |
| Abdul Basit | Murattal 64k/192k, **Mujawwad** |
| Mohamed Al-Minshawi | Murattal, **Mujawwad**, **Teacher** |
| +13 more | Muhammad Ayyoub, Mustafa Ismail, Salah Al-Budair, etc. |

## Tech Stack

- Single HTML file (no framework, no build)
- Canvas API + `requestAnimationFrame` for rendering
- `MediaRecorder` + `AudioContext` for export
- everyayah.com for per-verse MP3 audio
- alquran.cloud for Arabic + English text
- Pixabay CDN for video backgrounds

## Audio Sources

All per-verse MP3s are sourced from **everyayah.com** (BunnyCDN). Quran text via **alquran.cloud** (AlQuran Cloud API).

## Project Files

| File | Purpose |
|------|---------|
| `index.html` | The entire application (single file) |
| `vercel.json` | Vercel deployment config |
| `quran-reels-context.md` | Detailed developer documentation |

## License

MIT
