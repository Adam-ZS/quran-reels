# Media, Quran text, and recitation sources

Quran Reels Studio is a client-side editor. It does not grant publishing rights to third-party media or recordings. Review the source page and current license/terms for each asset before publishing, monetizing, redistributing, or using it commercially.

## Quran text and recitation audio

- **Al Quran Cloud** — Quran editions, the `quran-tajweed` text edition, and dynamically discovered verse-by-verse audio editions.
- **EveryAyah-compatible endpoints** — the legacy bundled reciter catalog resolves selected ayahs to remote MP3 URLs. No recitation recordings are packaged in this repository.

The tajweed colors are an on-screen reading aid, not automated pronunciation assessment. Reciter names and recordings remain attributable to their respective providers and reciters.

## Video providers

- **Pexels** — requires the user's own API key. Source and creator information are stored with selected items when returned by the API.
- **Pixabay** — requires the user's own API key. Source and creator information are stored with selected items when returned by the API.
- **Wikimedia Commons** — no key required. Rights and license details vary by file; open the source page and review the file-specific information.
- **Internet Archive** — no key required for search. Rights statements vary by item; the app labels these results for manual review.
- **Direct URL / local file** — the user is responsible for having permission to use the supplied media.

## Export reliability

Remote providers can block canvas access or hotlinking. Generated motion backgrounds and user-imported local video are the most reliable choices for browser export. A preview working in the editor does not necessarily mean a remote server permits canvas-based export.

## API key handling

Pexels and Pixabay keys are stored only in the current browser's local storage. They are not included in exported project JSON files or in this repository.
