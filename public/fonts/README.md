# Website Fonts

Self-hosted WOFF2 files from the Google Fonts CSS API, downloaded September 7, 2026.
The original language subsets are retained. Only the Latin subsets are preloaded.

- Barlow Semi Condensed: weight 600, version 1.408.
- Source Sans 3: variable font, declared range 400-750, version 3.052.
- JetBrains Mono: variable font, declared range 400-600, version 2.211.

The corresponding `*-OFL.txt` files contain the SIL Open Font Licenses.
Font declarations and Unicode ranges are in `src/styles/fonts.css`.

`npm run brand:render` regenerates the icons and social preview from the cut-W
SVG and these fonts. This optional asset command requires the FontTools CLI
with WOFF2 support. Normal site builds only use the checked-in assets.
