+++
title = "Infoscreen"
date = 2024-11-01
description = "Team-built office dashboard on a Raspberry Pi — presence, weather, Outlook events, and chores."
template = "projects/single.html"

[extra]
thumbnail = "checklist"
role = "Team member"
tags = ["Smarty", "HTML", "JavaScript", "Microsoft Graph"]
+++

<span id="case-study-writeup"></span>

## Context

At work we needed a page that runs all day on a **large screen in the office** — a dashboard, not a site you browse. We built it as a **team project** during my apprenticeship and ran it on a **Raspberry Pi** connected to the display.

## What it shows

- **Presence** — who is in the office and who is away
- **Weather** — current conditions and forecast
- **Calendar** — upcoming events from Outlook via **Microsoft Graph**
- **Chores** — who has which tasks that day

## Stack

**Smarty** templates, plain **HTML** and **JavaScript**, and server-side integration with external APIs (weather, Graph for calendar/events).

Teams split by area: presence, weather, events, chores. We merged everything into one full-screen page for the Pi.

## My contribution

**Primary:** the **chores** section — layout, data, and keeping it readable on a wall-mounted screen.

**Also:** helped the **events** and **weather** teams when they were blocked or needed an extra pair of hands.

**Infrastructure:** **set up the Raspberry Pi** so it boots into the infoscreen and keeps the page running reliably on the physical display.

## Result

One URL on a Pi behind the office monitor: presence, weather, Outlook events, and chores in a single glanceable view — with real hardware setup, not only browser testing on a laptop.
