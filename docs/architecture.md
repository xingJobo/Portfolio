# Klixa portfolio — architecture

Zola static site for the Klixa one-page portfolio and project case studies.  
Visual target: parent repo `docs/mockups/Mockup_Portfolio_Klixa_filled.svg`.  
Task breakdown: parent repo `docs/planning/work_packages.md`.

## Stack

| Layer | Technology | Role |
|-------|------------|------|
| SSG | [Zola](https://www.getzola.org/) 0.22.x | Build Markdown + templates → static HTML |
| Templates | [Tera](https://keats.github.io/tera/docs/) | HTML layouts and macros |
| Styles | SCSS in `sass/` | Compiled to CSS at build time (`compile_sass = true`) |
| UI | Alpine.js (planned) | Scroll nav, mobile menu only |
| Data | YAML in `data/` | Nav sections, skills — loaded via `load_data()` |
| Lint (dev) | Stylelint, markdownlint, Prettier | `npm run lint` — not part of Zola build |
| Deploy | GitHub Actions | `getzola/github-pages` → GitHub Pages |

## Repository layout

Git root is this folder (`portfolio/`). The parent `Portfolio/` directory also holds planning docs and lerndoku outside git.

```
portfolio/                    # Zola site + git repo
├── zola.toml                 # Site config (base_url, title, sass, search)
├── content/                  # Markdown pages + front matter
├── data/                     # Structured YAML (nav, skills)
├── templates/                # Tera HTML + macros + shortcodes
├── sass/                     # SCSS → compiled to public/*.css
├── static/                   # Copied as-is (images, js, favicon)
├── public/                   # Build output (gitignored)
├── docs/
│   └── architecture.md       # This file
├── .github/workflows/        # CI deploy
└── package.json              # Dev-only lint scripts
```

## Build pipeline

```text
content/*.md  ──┐
data/*.yaml   ──┼──► zola build ──► public/
templates/    ──┤      │
sass/         ──┘      ├── HTML pages
                       ├── main.css (from sass/main.scss)
                       └── static/ assets copied
```

Local development:

```powershell
zola serve    # http://127.0.0.1:1111 — live reload
zola build    # writes public/
zola check    # internal link validation
npm run lint  # optional style/markdown checks
```

Production: push to `main` → GitHub Actions builds and deploys to GitHub Pages.

## Content model

### Sections and pages

| Path | Type | Purpose |
|------|------|---------|
| `content/_index.md` | Home page | Single scrolling portfolio (via `templates/index.html`) |
| `content/projects/_index.md` | Section | Project list config (planned) |
| `content/projects/*.md` | Pages | Case studies, e.g. `/projects/inventory-sync/` |

Tutorial content (`content/blog/`, `content/myAwesomePage/`) is legacy from Zola learning exercises — remove when building the real portfolio.

### Front matter

TOML between `+++` delimiters. Example:

```toml
+++
title = "Inventory Sync"
date = 2025-03-01
description = "Case study summary"
template = "projects/single.html"
+++
```

## Data layer

YAML files in `data/` keep lists editable without touching templates.

| File | Consumed by | Content |
|------|-------------|---------|
| `data/nav.yaml` | `macros/scroll-nav.html` (planned) | Six scroll sections 01–06; `id` matches DOM `id` on home |
| `data/skills.yaml` | `macros/skills.html` (planned) | Skill bars + “also comfortable with” tags |

Load in templates:

```tera
{% set nav = load_data(path="data/nav.yaml") %}
```

## Templates

| File | Role |
|------|------|
| `templates/base.html` | HTML shell, skip link, main landmark |
| `templates/index.html` | Home — assembles hero, work, skills, contact |
| `templates/page.html` | Default single page (planned) |
| `templates/projects/single.html` | Case study layout (planned) |
| `templates/macros/*.html` | Reusable partials (head, footer, hero, …) |
| `templates/shortcodes/*` | Markdown-only embeds (YouTube, etc.) |

Shortcodes are invoked from **Markdown only** (`{{ youtube(id="…") }}`), not from `.html` templates.

## Styles (`sass/`)

Zola compiles only files under `sass/` (not Hugo’s `assets/scss/`). One entry file produces the site stylesheet.

```
sass/
├── main.scss              # Entry → /main.css
├── common/
│   ├── _variables.scss    # Colors, spacing, type tokens
│   ├── _fonts.scss
│   └── _global.scss       # Reset, body, reduced-motion
├── layout/
│   ├── _header.scss
│   ├── _sidebar.scss      # Left rail / scroll nav
│   ├── _footer.scss
│   └── _pages.scss        # Section rhythm, container
└── components/            # Enable in main.scss as sections are built
    ├── _buttons.scss
    ├── _project-card.scss
    ├── _skills.scss
    └── _contact.scss
```

Partials are prefixed with `_` and imported via `@use` from `main.scss`.  
Design tokens: `#434343` (text), `#5aba86` (accent), `#193654` (contact panel).

Linked in `templates/macros/head.html`:

```html
<link rel="stylesheet" href="{{ get_url(path='main.css') | safe }}">
```

## Static assets (`static/`)

| Path | Purpose |
|------|---------|
| `static/js/main.js` | Alpine.js helpers (planned) |
| `static/images/projects/` | Thumbnails, case study heroes |
| `static/images/og/` | Social preview 1200×630 |
| `static/favicon.ico` | Favicon |

Files here are copied unchanged to the site root.

## URLs

Configured in `zola.toml` as `base_url` (must match GitHub Pages project URL).

| URL | Page |
|-----|------|
| `/` | Scrolling home |
| `/projects/<slug>/` | Case study |

## Deploy and git

- **Remote:** `https://github.com/xingJobo/Portfolio.git`
- **Git identity (local):** `xingJobo` / `xingjobo@gmail.com`
- **Workflow:** `.github/workflows/deploy.yml` — build job + deploy job
- **Pages source:** GitHub Actions (not `gh-pages` branch)

## Hugo → Zola mapping (reference)

| Hugo (legacy) | Zola (this project) |
|---------------|---------------------|
| `assets/scss/` | `sass/` |
| `layouts/` | `templates/` |
| `config.toml` | `zola.toml` |
| `assets/images`, `assets/js` | `static/images`, `static/js` |
| `{{ partial }}` | `{% include "macros/…" %}` |

Internal SCSS organization (`common/`, `layout/`, `components/`) is shared; only the **root folder** differs.

## Planned home page flow

```text
index.html
  ├── macros/scroll-nav.html   ← data/nav.yaml
  ├── macros/hero.html         ← content/_index.md front matter
  ├── macros/project-card.html ← featured projects
  ├── macros/skills.html       ← data/skills.yaml
  └── macros/contact.html      ← form + links
```

## Out of scope (v1)

- Bifrost theme / Wheel of Heaven toolchain
- Multi-language (v2)
- Heavy JS bundles, PWA, client search UI (index is built; UI optional later)

## Related docs

| Document | Location |
|----------|----------|
| Tech stack & folder plan | `../docs/planning/techstack_idea.md` (parent repo) |
| Work packages | `../docs/planning/work_packages.md` |
| Agent instructions | `../AGENTS.md` |
| Zola learning notes | `../lerndoku/lerndoku_zola.md` |
