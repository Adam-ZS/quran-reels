# Studio 5 export engine

Studio 5 replaces the old real-time `canvas.captureStream()` + `MediaRecorder` path with a deterministic frame renderer.

## Why the old files lagged

The two supplied exports were inspected with FFprobe:

| Sample | Tracks | Video frames | Effective frame rate | Largest frame gap |
|---|---|---:|---:|---:|
| Chromium MP4 | H.264 video only; **no audio track** | 383 over 52.01 s | 7.34 fps | 7.25 s |
| Firefox WebM | VP8 video + Opus audio | 69 over 57.70 s | 1.18 fps | 1.01 s |

A real-time canvas recorder can only save frames that the browser actually paints. Heavy canvas drawing, video decoding, background tabs, power saving, and browser throttling therefore become permanent dropped frames in the file. The old MP4 conversion also allowed a conversion to finish after its audio track had been discarded.

## New pipeline

1. Decode the selected recitation into `AudioBuffer` objects.
2. Render the complete mastering chain with `OfflineAudioContext` at 48 kHz.
3. Build the ayah timeline before video encoding begins.
4. Draw every video frame at an explicit timestamp (`frame / fps`).
5. Decode local/accessible video backgrounds at requested timestamps, rather than playing them in real time.
6. Encode MP4 as H.264 + AAC, or WebM as VP9/VP8 + Opus.
7. Re-open the finished file and verify:
   - a video track exists;
   - an audio track exists;
   - the audio duration covers the video;
   - the measured packet rate is at least 90% of the requested FPS;
   - the container has a valid duration.
8. Download only after validation succeeds.

If AAC is unavailable natively, Studio 5 loads Mediabunny's AAC encoder extension. If a required encoder is unavailable, export stops with a clear error instead of producing a silent file.

## Quality modes

- Draft: 540p, 24 fps, 2.8 Mbps
- High: 720p, 30 fps, 6 Mbps
- Ultra: 1080p, 30 fps, 10 Mbps

High is the recommended default. Ultra is intentionally 30 fps because Quran reels rarely benefit from 60 fps, while 30 fps substantially reduces memory pressure and encoding time.

## Background reliability

Generated motion backgrounds are deterministic and need no remote media decoding. Local videos are the next most reliable option. Remote stock clips must be fetchable with cross-origin permissions. If a selected remote clip cannot be decoded for export, Studio 5 switches to a generated background rather than recording a frozen or stuttering live video element.

## Browser behavior

- Chromium browsers: use MP4 when H.264 is available; AAC is polyfilled when needed.
- Firefox: use fixed-frame WebM when H.264 is unavailable.
- The editor preview may run at a reduced internal resolution. This does not lower export resolution.
- Keep the export tab open. Rendering is not real-time, so temporary UI slowdown changes export speed, not the output frame rate.
