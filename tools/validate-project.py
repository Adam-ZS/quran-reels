#!/usr/bin/env python3
"""Static integrity checks for Quran Reels Studio 5."""
from html.parser import HTMLParser
from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    'index.html','pro-upgrade.js','pro-upgrade.css','studio-5.js','studio-5.css',
    'manifest.webmanifest','sw.js','EXPORT-ENGINE.md','SOURCES-AND-RIGHTS.md'
]
errors=[]
for name in required:
    if not (ROOT/name).is_file(): errors.append(f'missing {name}')

class Parser(HTMLParser):
    def error(self, message): errors.append(message)

html=(ROOT/'index.html').read_text(encoding='utf-8')
Parser().feed(html)
for ref in ['studio-5.css','studio-5.js','pro-upgrade.js']:
    if ref not in html: errors.append(f'index does not reference {ref}')

for name in ['package.json','manifest.webmanifest','vercel.json']:
    try: json.loads((ROOT/name).read_text(encoding='utf-8'))
    except Exception as exc: errors.append(f'{name}: {exc}')

pro=(ROOT/'pro-upgrade.js').read_text(encoding='utf-8')
checks={
    'CanvasSource':'fixed-frame video source',
    'AudioBufferSource':'independent audio source',
    'OfflineAudioContext':'offline audio master',
    'validateOutput':'post-render validator',
    'computePacketStats':'FPS validator',
    'getPrimaryAudioTrack':'audio-track validator',
    'getPrimaryVideoTrack':'video-track validator',
    '@mediabunny/aac-encoder@1.52.3':'AAC extension pin',
    'mediabunny@1.52.3':'media engine pin',
}
for token,label in checks.items():
    if token not in pro: errors.append(f'missing {label}')

# Executable legacy capture code must not remain. Comments are stripped first.
all_js='\n'.join((ROOT/n).read_text(encoding='utf-8') for n in ['pro-upgrade.js','studio-5.js'])
all_js=re.sub(r'/\*.*?\*/|//[^\n]*','',all_js,flags=re.S)
if 'captureStream(' in all_js: errors.append('legacy captureStream export remains')

if errors:
    print('FAILED')
    for e in errors: print('-',e)
    sys.exit(1)
print('OK — Studio 5 static integrity checks passed')
