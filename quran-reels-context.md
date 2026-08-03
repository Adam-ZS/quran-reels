# Quran Reels Studio 5 — Developer Context

The app remains build-free. Load order is `index.html`, `pro-upgrade.js`, then `studio-5.js`.

## Export architecture

`pro-upgrade.js` owns final export. Do not reintroduce `canvas.captureStream()` or a wall-clock `MediaRecorder` loop for final videos. Studio 5 uses Mediabunny `CanvasSource` and `AudioBufferSource`, explicit timestamps, an `OfflineAudioContext` master, and post-render track/FPS validation.

The renderer sets `S._renderTime` for deterministic procedural motion. Background-video frames are requested by timestamp with `CanvasSink`. `draw()` scales the logical format dimensions onto either a low-resolution preview canvas or the full export canvas.

## State/storage

- Main settings: `quran-reels-studio-v5`
- Media/tajweed settings: `qrs-studio-5`
- Studio 4 media settings are migrated once when the Studio 5 key is absent.
- API keys are stored separately and never included in project JSON.

## Required guarantees

A successful export must contain:

- one primary video track;
- one primary audio track;
- audio duration covering the video;
- packet rate at least 90% of the selected 24/30 fps;
- valid duration.

If validation fails, do not download the file.

## Browser dependencies

The export module URLs are pinned to matching Mediabunny and AAC-extension patch versions. MP4 requires H.264. AAC is registered through `@mediabunny/aac-encoder` when native AAC encoding is absent. WebM chooses VP9 and falls back to VP8, with Opus audio.
