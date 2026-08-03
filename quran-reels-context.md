# Quran Reels Studio 4 — Developer Context

## Architecture

The application remains intentionally build-free. `index.html` contains the Quran browser, built-in reciter/video catalogs, canvas primitives, and legacy controls. `pro-upgrade.js` supplies the timeline, advanced renderer, audio chain, projects, and export pipeline. `studio-4.js` adds the provider-based media hub, IndexedDB media vault, cloud reciter synchronization, tajweed parsing, and procedural motion renderer.

The load order is important:

1. Inline application code in `index.html`
2. `pro-upgrade.js`
3. `studio-4.js`

## Important state

The shared `S` object includes:

- Quran: `surah`, `va`, `ve`, `vt`, `sel`
- Audio: `rec`, `urls`, `customAudioBlob`, `durations`
- Tajweed: `tajweedEnabled`, `tajweedAyahs`, `tajweedPalette`, `tajweedIntensity`
- Canvas: `fmt`, typography, veil, backgrounds, overlays
- Motion/media: `motionBg`, `freeProvider`, `mediaCredit`
- Mastering: `audioPreset`, `audioWarmth`, `audioPresence`, `audioDeEss`, `roomSize`, `roomDecay`
- Export: `exportType`, `exportQuality`, `_phase`, `_verseProgress`

Studio 3-compatible settings use `quran-reels-studio-v3`. Studio 4 additions use `qrs-studio-4`. API keys are stored separately and are intentionally omitted from project JSON files.

## Reciter providers

Bundled IDs use EveryAyah folder mappings. Cloud-synchronized IDs use the `aqc:` prefix and are resolved per surah from the Al Quran Cloud verse-by-verse audio response. The current catalog is cached in local storage, while resolved surah audio arrays are cached in memory.

## Tajweed rendering

`quran-tajweed` markup is parsed with `DOMParser`. Only text nodes and recognized `<tajweed class="...">` rules are retained. Verse-list rendering keeps character-level spans. Canvas rendering overlays rule colors on measured Arabic substrings while retaining the base shaped line.

## Media hub

- Pexels and Pixabay use user-provided keys.
- Wikimedia Commons and Internet Archive use public search endpoints without keys.
- Saved remote items use local storage.
- Imported local videos use the `qrs-media-vault` IndexedDB database.
- Generated motion scenes render directly to the project canvas and avoid CORS restrictions.

Remote video sources still need compatible CORS headers to be included in a canvas export.

## Audio chain

The export chain is:

1. High-pass cleanup
2. Low-shelf warmth EQ
3. Peaking de-esser
4. Presence EQ
5. Gentle compressor
6. Dry/wet room impulse mix
7. Brick-wall limiter

The profiles are neutral production presets and do not perform voice cloning or named-reciter imitation.

## Export pipeline

1. Fetch/decode selected ayah audio or decode custom audio.
2. Build intro, ayah, hold, and outro timing.
3. Schedule audio through the mastering chain.
4. Render the canvas in real time and capture WebM.
5. Convert to H.264/AAC MP4 through Mediabunny/WebCodecs when supported.
6. Fall back to WebM when MP4 encoding is unavailable.

## PWA

`sw.js` caches the local application shell, including both Studio 4 files. Remote Quran, audio, fonts, and media remain network requests.
