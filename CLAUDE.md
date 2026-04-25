# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

Static, dependency-free site for **veeewhy.com** — a placeholder while the full portfolio is in progress. There is **no build step, no `package.json`, no framework**. `index.html` ships as-is to the host (Netlify/Cloudflare-compatible — see `_headers`).

This is the exception to the workspace's default Vite+/React stack documented in `../CLAUDE.md`. Do not introduce a bundler, framework, or dependencies without explicit direction — the goal here is hand-authored HTML/CSS/JS.

## Running it

No tooling. Pick whatever serves a static directory:

```sh
python3 -m http.server 8000          # → http://localhost:8000
# or: npx serve .
# or: open index.html  (file:// works for everything except CSP fetches)
```

## Architecture

**Single page, three files of source.** Everything renders from `index.html`; styling lives in `styles/`; the only client logic is the theme switcher in `scripts/theming.js`.

### CSS layer order (declared in both `reset.css` and `style.css`)

```
@layer reset, base, tokens, layout, components, utilities, overrides;
```

Both files re-declare the same `@layer` statement — this is intentional, not a bug. CSS layer order is established by the **first** declaration the browser sees, and re-declaring is a no-op. Keeping the list in both files means either can be loaded standalone without breaking cascade priority.

When adding styles, place them in the correct layer. Do not add new layers without updating both declarations.

### Design tokens (three-tier)

Defined in `styles/style.css` under `@layer tokens`:

- **`--ref-*`** — raw primitives. Gray ramp expressed in `oklch()` from 0 → 100 (perceptually-uniform lightness). Add a new ref token only when you need a new primitive.
- **`--sys-*`** — semantic roles. Theming happens here via `light-dark()` — never hardcode a ref color in a component. Spacing scale is `--sys-space-NNN` where `NNN` is pixel-equivalent (`016` = `1rem`). Type sizes follow the same convention; fluid sizes use `clamp()`.
- Component CSS reads only from `--sys-*` tokens.

### Theming

Three-state cycle: `system → light → dark → system`. State lives in `localStorage['theme']`.

- **No-flash boot.** An inline `<script>` in `<head>` reads `localStorage` and sets `data-theme` *before* CSS paints. Touch this carefully — it is intentionally synchronous and runs before the deferred `theming.js`.
- **`color-scheme` + `light-dark()`** drive the actual swap. `data-theme="light"` / `data-theme="dark"` pin the scheme; absence of the attribute lets the OS decide.
- **CSP includes the inline script's hash** (`sha256-…` in `_headers`). If you modify the inline `<script>` in `index.html`, regenerate the hash and update `_headers` — otherwise the inline boot script will be blocked in production.

### Responsive

- Page layout: `.wrapper` is a 3-row grid sized to the viewport (`100svb`), capped at `72ch`.
- Container queries on `body` (`container-type: inline-size`) drive component-level responsiveness — see how `.site-footer__location[data-size]` swaps "BLR, IN" ↔ "Bengaluru, India" at `30rem`.
- All spacing/positioning uses **logical properties** (`inline-size`, `block-size`, `padding-block`, `inset-inline-end`). Do not introduce `width`/`height`/`left`/`top` for layout.

### Accessibility hooks already wired

- `:focus-visible` styling, `prefers-reduced-motion` overrides, `forced-colors: active` fallbacks, `.sr-only` utility, `aria-live` announcer for theme changes (`#theme-announce`).
- `<ul role="list">` strips list semantics where styled away.

## Production assets (don't break these)

- `_headers` — Netlify-style headers file. Defines CSP, HSTS, immutable font caching. **Edit when adding any inline script (hash), external origin (CSP `connect-src`/`script-src`/etc.), or new font/asset paths.**
- `robots.txt`, `sitemap.xml`, `llms.txt` — SEO/AI-discovery surface. `llms.txt` has explicit instructions for AI agents about not fabricating portfolio content.
- `assets/fonts/InterVariable.woff2` — preloaded in `index.html`. Single variable font file (weights 100–900) with feature settings `ss02 cv01 cv06 cv09 calt` enabled in `body`.
- Material Symbols Rounded loaded from Google Fonts with `&text=` subsetting — only the three icon glyphs (`desktop_windows`, `light_mode`, `dark_mode`) are fetched. Adding a new icon requires updating the `&text=` query string in `index.html`.

## Conventions

- **Single quotes**, **semicolons**, **trailing commas**, **`const`-by-default**, **strict equality**. Tabs for indentation (matches existing files).
- **Arrow functions** for everything in `theming.js`.
- **No external JS dependencies.** If you find yourself wanting one, push back first.
- Keep `index.html` semantic — `<header>`, `<main>`, `<footer>`, real headings. Don't reach for `<div>`.
