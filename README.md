# Klixa portfolio

Zola static site — [architecture](docs/architecture.md).

## Commands

```powershell
zola serve          # http://127.0.0.1:1111
zola build
zola check
npm run lint        # optional: SCSS + Markdown
```

## Layout

- `content/` — Markdown pages
- `data/` — nav + skills YAML
- `templates/` — Tera HTML + macros
- `sass/` — SCSS (compiled to `/main.css`)
- `static/` — images, JS, favicon

Deployed via GitHub Actions to GitHub Pages.
