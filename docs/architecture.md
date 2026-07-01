# xingJobo portfolio — architecture

Zola static site for the xingJobo personal portfolio and project case studies.  
Task breakdown: parent repo `docs/planning/work_packages.md`. Agent instructions: `../AGENTS.md`.

## Stack

| Layer | Technology | Role |
|-------|------------|------|
| SSG | [Zola](https://www.getzola.org/) 0.22.1 | Build Markdown + templates → static HTML |
| Templates | [Tera](https://keats.github.io/tera/docs/) | HTML layouts and macros |
| Styles | SCSS in `sass/` | Compiled at build (`compile_sass = true`); light/dark via `data-theme` |
| UI | Alpine.js + vanilla JS | **fauxsh** terminal; scroll spy; theme toggle; mobile drawer planned |
| Data | YAML in `data/` | Sections, skills, contact, terminal content — `load_data()` |
| Contact | Web3Forms | Proxied via Cloudflare Worker (`data/contact.yaml` `form.endpoint`) |
| Lint (dev) | Stylelint, markdownlint, Prettier | `npm run lint` — not part of Zola build |
| Tests (dev) | Vitest | `npm test` — fauxsh `vfs.js` / `commands.js` |
| Deploy | GitHub Actions | `deploy.yml` on `main`; optional `ci.yml` on PRs |

`build_search_index = false` in `zola.toml` — no client search UI.

## Repository layout

Git root is this folder (`portfolio/`). Parent `Portfolio/` holds planning docs and lerndoku outside git.

```
portfolio/
├── zola.toml
├── content/                  # _index.md + projects/*.md
├── data/                     # nav, skills, about, process, contact, seo, terminal/
├── templates/                # base, index, section, 404, projects/single, macros/
├── sass/                     # main.scss → public/main.css
├── static/js/                # scroll-nav, theme, terminal/ (ES modules)
├── public/                   # build output (gitignored)
├── docs/architecture.md
├── .github/workflows/
└── package.json
```

## Build pipeline

```text
content/*.md  ──┐
data/*.yaml   ──┼──► zola build ──► public/
templates/    ──┤      ├── HTML
sass/         ──┘      ├── main.css
                       └── static/ copied
```

```powershell
zola serve    # http://127.0.0.1:1111
zola build
zola check    # 3 pages, 1 section (3 case studies + home)
npm run lint
npm test      # Vitest — terminal unit tests
```

Production: push to `main` → GitHub Actions → GitHub Pages (`base_url` in `zola.toml`).

### Local dev vs production URLs

| Mode | Asset URLs |
|------|------------|
| `zola serve` | `http://127.0.0.1:1111/...` (Zola rewrites for dev) |
| `zola build` / Pages | `https://xingJobo.github.io/portfolio/...` |

Do not open `public/index.html` via `file://`; use `zola serve`.

## Content model

| Path | Type | Purpose |
|------|------|---------|
| `content/_index.md` | Home | Hero copy in `[extra]`; renders via `templates/index.html` |
| `content/projects/_index.md` | Section | `sort_by = "date"`, `page_template = "projects/single.html"` |
| `content/projects/*.md` | Pages | Case studies: `wordle`, `infoscreen`, `swimrun-timer` |

Example front matter:

```toml
+++
title = "Wordle (Scrum module)"
date = 2025-02-01
description = "Short SEO summary"
template = "projects/single.html"

[extra]
thumbnail = "inventory"   # legacy CSS modifier — rename or use static/images/
role = "Scrum team member"
tags = ["Svelte", "Scrum"]
+++
```

Case study prev/next: use Zola `page.lower` / `page.higher` (section sorted by `date`) instead of manual front matter.

## Data layer

| File | Consumed by | Content |
|------|-------------|---------|
| `data/nav.yaml` | `scroll-nav.html` | Six scroll sections; `id` matches DOM on home |
| `data/skills.yaml` | `skills.html`, fauxsh `skills.md` | Bars, tags, frameworks |
| `data/about.yaml` | `about.html`, fauxsh `experience.md` | Bio, pillars, profile card |
| `data/process.yaml` | `process.html` | Timeline steps (not in fauxsh VFS yet) |
| `data/contact.yaml` | `contact.html` | Form endpoint, direct links, meta |
| `data/seo.yaml` | `head.html` | JSON-LD Person, optional `og_image` |
| `data/terminal/readme.yaml` | fauxsh | `README.md` on boot (`cat README.md`) |
| `data/terminal/easter-eggs.yaml` | fauxsh | Hidden dotfiles (`ls -a`) |

Hero leads live in `content/_index.md` `[extra]`; about body in `data/about.yaml`. Fauxsh `about.md` merges both at build time via `macros/terminal/vfs-markdown.html`.

```tera
{% set nav = load_data(path="data/nav.yaml") %}
```

## Home page flow

```text
index.html
  ├── macros/shell/scroll-nav.html   ← nav.yaml + theme toggle
  ├── macros/sections/hero.html      ← fauxsh + mobile expand CTA
  ├── macros/sections/work.html      ← projects section
  ├── macros/sections/about.html
  ├── macros/sections/process.html
  ├── macros/sections/skills.html
  └── macros/sections/contact.html   ← fetch → Worker → Web3Forms
```

Scripts in `index.html`: `terminal/index.js`, `scroll-nav.js`, `theme.js`, Alpine CDN (deferred; fauxsh registers on `alpine:init`).

## Templates

| File | Role |
|------|------|
| `base.html` | Shell, skip link, `main` landmark |
| `index.html` | Scrolling home (six sections) |
| `section.html` | `/projects/` grid (duplicates home work — optional redirect) |
| `projects/single.html` | Case study layout |
| `404.html` | Not found |
| `macros/shell/*` | Head (SEO/OG/JSON-LD), footer, scroll nav |
| `macros/sections/*` | Home sections |
| `macros/components/*` | `fauxsh`, `fauxsh-fallback`, `terminal-vfs`, `project-card` |
| `macros/terminal/*` | `vfs-markdown.html`, `fauxsh-static.html` |
| `shortcodes/*` | Markdown-only embeds (optional) |

Head macro path: `macros/shell/head.html` (not `macros/head.html`).

## Styles (`sass/`)

Entry: `main.scss` → `/main.css`. Partials use `@use` and BEM (`.block__element--modifier`).

```
sass/
├── main.scss
├── common/
│   ├── _variables.scss    # spacing, $breakpoint-md (48rem), sidebar width
│   ├── _themes.scss, _dark.scss, _light.scss
│   ├── _fonts.scss, _global.scss, _mixins.scss
├── layout/
│   ├── _header.scss, _sidebar.scss, _footer.scss, _pages.scss
└── components/
    ├── _buttons.scss, _project-card.scss, _skills.scss, _about.scss
    ├── _process.scss, _contact.scss, _fauxsh.scss, _case-study.scss
    ├── _theme-toggle.scss, _not-found.scss
```

Breakpoints: `$breakpoint-md` (48rem / 768px) — sidebar visible at `min-width`; hidden below via `$breakpoint-md-max`.

Design accents: `#434343`, `#5aba86`, `#193654` (see theme CSS variables for full palette).

## Static assets

| Path | Purpose |
|------|---------|
| `static/js/terminal/` | fauxsh — `index.js`, `commands.js`, `vfs.js`, `completion.js`, `format.js`, `prompt.js` |
| `static/js/scroll-nav.js` | Section scroll spy |
| `static/js/theme.js` | Light/dark toggle (pairs with inline script in `head.html`) |
| `static/images/projects/` | Thumbnails (not added yet) |
| `static/images/og/` | Social preview 1200×630 (not added yet) |
| `static/favicon.ico` | Favicon (not added yet) |

## fauxsh (interactive terminal)

Fake shell in the hero — **not** a real shell. Client-side parser over a build-time virtual filesystem.

### Build-time VFS

`terminal-vfs.html` embeds JSON in `#terminal-fs`. Markdown bodies built by `vfs-markdown.html` macros:

| Virtual file | Source |
|--------------|--------|
| `README.md` | `data/terminal/readme.yaml` |
| `about.md` | `_index.md` `[extra]` + `about.yaml` lead |
| `experience.md` | `about.yaml` bio + pillars |
| `skills.md` | `skills.yaml` |
| `projects.md` | `get_section("projects/_index.md")` |
| Dotfiles | `easter-eggs.yaml` (`hidden: true`) |

### Commands (v1)

`help`, `ls`, `ls -a`, `cat`, `clear`, `whoami`, `pwd` — plus ↑/↓ history and Tab completion (step 8 extras, implemented).

### Runtime

```text
zola build → JSON in page
Browser → alpine:init → Alpine.data('fauxsh') → commands.js / vfs.js
```

No JS bundler; ES modules on GitHub Pages. Fallback: `fauxsh-fallback.html` + 3s timeout class if modules fail.

### Out of scope for fauxsh

Real shell, `eval`, network from commands, xterm.js, WASM.

## URLs

| URL | Page |
|-----|------|
| `/` | Scrolling home |
| `/projects/<slug>/` | Case study |
| `/projects/` | Section index (project grid) |

## Deploy and git

- **Remote:** `https://github.com/xingJobo/Portfolio.git`
- **Identity (local):** `xingJobo` / `xingjobo@gmail.com`
- **Workflows:** `deploy.yml` (main → Pages); `ci.yml` (PR lint/check/test) when enabled

## Hugo → Zola mapping

| Hugo | Zola |
|------|------|
| `assets/scss/` | `sass/` |
| `layouts/` | `templates/` |
| `config.toml` | `zola.toml` |
| `assets/images`, `assets/js` | `static/images`, `static/js` |
| `{{ partial }}` | `{% include "macros/…" %}` |

## Out of scope (v1)

- Bifrost / Wheel of Heaven toolchain
- Multi-language (v2)
- Elasticlunr / Fuse search UI
- React, Vue, Tailwind, heavy bundlers

## Related docs

| Document | Location |
|----------|----------|
| Work packages | `../docs/planning/work_packages.md` |
| TODO + code review backlog | `../docs/todo.md` |
| Agent instructions | `../AGENTS.md` |
| Zola conventions (Cursor) | `../.cursor/rules/zola-portfolio.mdc` |
