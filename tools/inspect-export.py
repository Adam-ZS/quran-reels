#!/usr/bin/env python3
"""Inspect a Studio export with ffprobe and report tracks and effective FPS."""
import json, shutil, statistics, subprocess, sys
from pathlib import Path

if len(sys.argv) != 2:
    raise SystemExit('Usage: python tools/inspect-export.py path/to/video.mp4')
if not shutil.which('ffprobe'):
    raise SystemExit('ffprobe was not found. Install FFmpeg first.')
path=Path(sys.argv[1]).expanduser().resolve()
if not path.is_file(): raise SystemExit(f'File not found: {path}')

def probe(args):
    return json.loads(subprocess.check_output(['ffprobe','-v','error',*args,'-of','json',str(path)]))

meta=probe(['-show_entries','format=duration,size','-show_entries','stream=index,codec_name,codec_type,width,height,sample_rate,channels'])
frames=probe(['-select_streams','v:0','-show_entries','frame=best_effort_timestamp_time'])['frames']
ts=[float(x['best_effort_timestamp_time']) for x in frames if 'best_effort_timestamp_time' in x]
gaps=[b-a for a,b in zip(ts,ts[1:])]
fps=(len(ts)-1)/(ts[-1]-ts[0]) if len(ts)>1 and ts[-1]>ts[0] else 0
video=[s for s in meta.get('streams',[]) if s.get('codec_type')=='video']
audio=[s for s in meta.get('streams',[]) if s.get('codec_type')=='audio']
print(f'File: {path.name}')
print(f'Duration: {meta.get("format",{}).get("duration","unknown")} s')
print(f'Video tracks: {len(video)} | Audio tracks: {len(audio)}')
if video: print(f'Video: {video[0].get("codec_name")} {video[0].get("width")}x{video[0].get("height")}')
if audio: print(f'Audio: {audio[0].get("codec_name")} {audio[0].get("sample_rate","?")} Hz, {audio[0].get("channels","?")} ch')
print(f'Decoded frames: {len(ts)} | Effective FPS: {fps:.2f}')
if gaps: print(f'Median frame gap: {statistics.median(gaps):.4f} s | Largest gap: {max(gaps):.4f} s')
healthy=bool(video and audio and fps>=21 and (not gaps or max(gaps)<=0.2))
print('Result:', 'PASS' if healthy else 'FAIL')
sys.exit(0 if healthy else 2)
