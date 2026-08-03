# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :white_check_mark: |

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Report privately
by opening a [private vulnerability report](https://github.com/Adam-ZS/quran-reels/security/advisories/new)
or by contacting the maintainer directly through GitHub.

You should receive a response within a few days. If the issue is confirmed, a
fix will be released and, where appropriate, the vulnerability disclosed after
users have had a chance to update.

## Security considerations

- The app is fully **client-side**: no server, no accounts, no data leaves the
  browser except the media requests to everyayah.com, alquran.cloud, and the
  Pixabay CDN that the user explicitly triggers by picking reciter/background.
- All rendering and export happen locally in the browser. Nothing you make is
  uploaded anywhere.
- If you self-host or fork the single HTML file, make sure you serve it over
  HTTPS and keep the third-party media endpoints as the only network calls.
- Fonts and backgrounds are loaded from public CDNs; a compromised CDN response
  could affect rendering — pin versions where possible.
