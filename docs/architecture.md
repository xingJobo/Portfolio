# xingJobo portfolio — architecture

Zola static site for the xingJobo personal portfolio and project case studies.  
Task breakdown: parent repo `docs/planning/work_packages.md`.

## Stack

| Layer | Technology | Role |
|-------|------------|------|
| SSG | [Zola](https://www.getzola.org/) 0.22.x | Build Markdown + templates → static HTML |
| Templates | [Tera](https://keats.github.io/tera/docs/) | HTML layouts and macros |
| Styles | SCSS in `sass/` | Compiled to CSS at build time (`compile_sass = true`) |
| UI | Alpine.js | Scroll nav, mobile menu, hero terminal |
| Data | YAML in `data/` | Nav sections, skills — loaded via `load_data()` |
| Lint (dev) | Stylelint, markdownlint, Prettier | `npm run lint` — not part of Zola build |
| Deploy | GitHub Actions | `getzola/github-pages` → GitHub Pages |

## Repository layout

Git root is this folder (`portfolio/`). The parent `Portfolio/` directory also holds planning docs and lerndoku outside git.

```
portfolio/                    # Zola site + git repo
├── zola.toml                 # Site config (base_url, title, sass, search)
├── content/                  # Markdown pages + front matter
├── data/                     # Structured YAML (nav, skills, terminal content)
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
| `data/nav.yaml` | `macros/shell/scroll-nav.html` | Six scroll sections; `id` matches DOM `id` on home |
| `data/skills.yaml` | `macros/sections/skills.html` | Skill bars + “also comfortable with” tags |
| `data/experience.yaml` | Hero terminal (planned) | Roles, dates, highlights → `experience.md` in virtual FS |
| `data/terminal/easter-eggs.yaml` | Hero terminal (planned) | Hidden dotfile content (`ls -a`) |

Load in templates:

```tera
{% set nav = load_data(path="data/nav.yaml") %}
```

## Templates

| File | Role |
|------|------|
| `templates/base.html` | HTML shell, skip link, main landmark |
| `templates/index.html` | Home — assembles hero, work, skills, contact |
| `templates/page.html` | Default single page / case study |
| `templates/section.html` | Project list |
| `templates/macros/shell/*.html` | Head, footer, scroll nav |
| `templates/macros/sections/*.html` | Home sections (hero, work, …) |
| `templates/macros/components/*.html` | Project card, hero terminal (planned) |
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
    ├── _contact.scss
    └── _hero-terminal.scss   # Hero terminal chrome (planned)
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
| `static/js/terminal/` | Hero terminal — ES modules, no bundler (see below) |
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
  ├── macros/shell/scroll-nav.html   ← data/nav.yaml
  ├── macros/sections/hero.html
  │     └── macros/components/hero-terminal.html  ← virtual FS (planned)
  ├── macros/sections/work.html      ← projects section
  ├── macros/sections/skills.html    ← data/skills.yaml
  └── macros/sections/contact.html   ← form + links
```

---

## Hero terminal (planned)

Interactive fake shell in the hero visual slot. Visitors explore portfolio content with familiar commands (`ls`, `cat`) instead of scrolling first. **Not a real shell** — a client-side command parser over a virtual filesystem built at compile time.

### Goals

- Deliver bio, experience, skills, and project summaries as `.md` files in a virtual directory.
- Support `ls`, `ls -a`, `cat <file>`, `clear`, `help`, plus flavor commands (`whoami`, `pwd`).
- Single source of truth: terminal text is assembled from existing `data/` and `content/`, not duplicated by hand.
- Scrolling sections below remain the fallback for SEO, mobile, and accessibility.

### Folder structure (new files)

```text
portfolio/
├── data/
│   ├── experience.yaml              # roles, dates, bullet highlights
│   └── terminal/
│       └── easter-eggs.yaml         # dotfile names + body text (.bash_history, …)
├── static/js/terminal/              # copied to /js/terminal/ — ES modules, no bundler
│   ├── index.js                     # Alpine.data('heroTerminal', …), boot message
│   ├── commands.js                  # parse input → dispatch handlers → output lines
│   └── vfs.js                       # list/cat helpers over injected filesystem object
├── templates/macros/components/
│   └── hero-terminal.html           # markup, prompt, output area, JSON bootstrap
└── sass/components/
    └── _hero-terminal.scss          # dark panel, mono font, prompt, cursor
```

Existing files touched:

- `templates/macros/sections/hero.html` — replace placeholder with `{% include "macros/components/hero-terminal.html" %}`
- `templates/index.html` — load terminal module after Alpine CDN
- `sass/main.scss` — `@use "components/hero-terminal"`

### Virtual filesystem

At **build time**, a Tera macro builds one JSON object and embeds it in the page (e.g. `<script type="application/json" id="terminal-fs">`). Alpine reads it once on init.

```json
{
  "cwd": "/home/xingjobo",
  "files": {
    "README.md":       { "hidden": false, "content": "…" },
    "about.md":        { "hidden": false, "content": "…" },
    "experience.md":   { "hidden": false, "content": "…" },
    "skills.md":       { "hidden": false, "content": "…" },
    "projects.md":     { "hidden": false, "content": "…" },
    ".bash_history":   { "hidden": true,  "content": "…" }
  }
}
```

| Virtual file | Built from |
|--------------|------------|
| `README.md` | Static welcome + `help` hint |
| `about.md` | `content/_index.md` `[extra]` (subtitle, lead, about_lead) |
| `experience.md` | `data/experience.yaml` |
| `skills.md` | `data/skills.yaml` (bars + tags, plain-text layout) |
| `projects.md` | `get_section(path="projects/_index.md")` — title, description, tags per page |
| Dotfiles | `data/terminal/easter-eggs.yaml` — only visible with `ls -a` |

Content is **plain text** (markdown source as terminal output), not rendered HTML inside the box.

### JS modules

| File | Responsibility |
|------|----------------|
| `vfs.js` | `listFiles(showHidden)`, `readFile(name)` — fuzzy match OK (`cat about` → `about.md`) |
| `commands.js` | Split input, route to handlers; return `string[]` lines for the output buffer |
| `index.js` | Register `Alpine.data('heroTerminal', () => ({ … }))`; history (↑/↓) optional in v2 |

**v1 commands**

| Command | Behavior |
|---------|----------|
| `help` | List supported commands |
| `ls` | Visible filenames, columnated |
| `ls -a` | Include `hidden: true` entries |
| `cat <file>` | Print file body or `cat: <file>: No such file` |
| `clear` | Empty output buffer |
| `whoami` | `xingJobo` |
| `pwd` | `/home/xingjobo` |

Unknown input → `command not found: …` (or `sh: …: not found` for flavor).

### Runtime flow

```text
zola build
  └── Tera macro serializes virtual FS → JSON in hero-terminal.html

Browser
  └── Alpine.js (CDN, already on index.html)
        └── <script type="module" src="/js/terminal/index.js">
              ├── reads #terminal-fs JSON
              ├── registers heroTerminal component
              └── input @keydown.enter → commands.js → append to output <pre>
```

No npm build step for JS — native ES `import` works on GitHub Pages.

### Template wiring (sketch)

```html
{# hero-terminal.html #}
<div
  class="hero-terminal"
  x-data="heroTerminal"
  role="region"
  aria-label="Portfolio terminal"
>
  <pre class="hero-terminal__output" x-ref="output" …></pre>
  <form class="hero-terminal__input-row" @submit.prevent="runCommand">
    <label for="terminal-input" class="visually-hidden">Terminal command</label>
    <span class="hero-terminal__prompt" aria-hidden="true">$</span>
    <input id="terminal-input" x-ref="input" x-model="line" autocomplete="off" spellcheck="false" />
  </form>
</div>
<script type="application/json" id="terminal-fs">{{ vfs | json_encode | safe }}</script>
```

`index.html` loads the module once in `{% block scripts %}`:

```html
<script defer src="…alpinejs…"></script>
<script type="module" src="{{ get_url(path='js/terminal/index.js') }}"></script>
```

Alpine must be available before the module registers `Alpine.data` — use `alpine:init` listener in `index.js` if load order is ambiguous.

### Accessibility and motion

- Remove `aria-hidden` from the hero visual; use `role="region"` + `aria-label`.
- Keyboard: focus input on click; Enter submits; optional ↑/↓ for history.
- `prefers-reduced-motion`: skip boot typing animation; show static `README.md` excerpt in output on init.

### Implementation phases

| Phase | Scope |
|-------|--------|
| **1** | `experience.yaml`, VFS macro, terminal markup + SCSS |
| **2** | `vfs.js` + `commands.js` — `ls`, `ls -a`, `cat`, `clear`, `help` |
| **3** | `easter-eggs.yaml`, boot message, `whoami` / `pwd` |
| **4** | Command history, tab completion (optional) |

### Out of scope for terminal

- Real shell, `eval`, or network calls from commands
- xterm.js or other terminal emulators
- JS bundler (Vite, esbuild) — keep flat ES modules in `static/`

---

## Out of scope (v1)

- Bifrost theme / Wheel of Heaven toolchain
- Multi-language (v2)
- Heavy JS bundles, PWA, client search UI (index is built; UI optional later)
- Real terminal / WASM shell in the hero (see hero terminal section — fake shell only)

## Related docs

| Document | Location |
|----------|----------|
| Tech stack & folder plan | `../docs/planning/techstack_idea.md` (parent repo) |
| Work packages | `../docs/planning/work_packages.md` |
| Agent instructions | `../AGENTS.md` |
| Zola learning notes | `../lerndoku/lerndoku_zola.md` |
