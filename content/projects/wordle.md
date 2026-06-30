+++
title = "Wordle (Scrum module)"
date = 2025-02-01
description = "A Svelte Wordle game delivered in two sprints — epics, stories, DoD, then build and review."
template = "projects/single.html"

[extra]
thumbnail = "inventory"
role = "Scrum team member"
duration = "2 sprints"
tags = ["Svelte", "Scrum", "JSON"]
nav_next = "infoscreen"

[[extra.glance]]
label = "Sprints"
value = "2 + reviews"
accent = true

[[extra.glance]]
label = "Stack"
value = "Svelte"
accent = true

[[extra.glance]]
label = "Data"
value = "JSON word list"

[[extra.glance]]
label = "Focus"
value = "Agile delivery"
accent_secondary = true
+++

<span id="case-study-writeup"></span>

## Context

During the **Scrum module** at school, our team built a **Wordle-style game** in **Svelte**. The module was as much about process as code: we had to work through agile planning before writing the app, then deliver in two time-boxed sprints with a **sprint review** after each one.

## Before we coded

We did not jump straight into implementation. The sequence was:

- **Epics** — large goals (playable game, word management)
- **User stories** — break epics into backlog items we could estimate and assign
- **Definition of Done (DoD)** — agree what “finished” means for a story
- **Architecture** — how the Svelte app is structured and how data flows

Only after that did we start the two build sprints.

## Sprint breakdown

**Sprint 1 — MVP**

- Playable Wordle: guesses, letter feedback, win/lose
- **Sprint review** with a demo of the working game

**Sprint 2 — Word management**

- **Add, edit, and delete** words in the dictionary
- **Sprint review** with the admin features included

There was **no backend**. Words live in a **JSON file** the app reads and updates for the word list.

## What I learned

- Planning artifacts (epics, stories, DoD) make scope visible before you commit to a sprint
- A clear MVP in sprint 1 leaves room for admin features in sprint 2
- Sprint reviews force you to show something real, not just “almost done”

I contributed to implementation and ceremonies like the rest of the team — stand-ups, planning, and both reviews.

## Result

A Svelte Wordle clone with JSON-backed word management, delivered across **two sprints** with **two sprint reviews**. Strong practice in Scrum delivery, not just syntax.
