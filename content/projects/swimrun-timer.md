+++
title = "Swimrun timing app"
date = 2025-05-01
description = "Solo customer app — Angular and Slim PHP to time races per lane and track member progress."
template = "projects/single.html"

[extra]
thumbnail = "migration"
role = "Solo developer"
tags = ["Angular", "Slim PHP", "JavaScript"]
outcome_headline = "Live race timing"
outcome_detail = "per swimmer and lane · Server-Sent Events"

[[extra.glance]]
label = "Scope"
value = "Solo project"
accent = true

[[extra.glance]]
label = "Front end"
value = "Angular"
accent = true

[[extra.glance]]
label = "Back end"
value = "Slim PHP"

[[extra.glance]]
label = "Live sync"
value = "SSE (EventSource)"
accent_secondary = true
+++

<span id="case-study-writeup"></span>

## Context

A customer needed an app to **time swimrun events** and keep results for their members. I built this **on my own** during my apprenticeship — front to back, from login flows to live timing at a race.

## What the app does

**For members (login required)**

- Sign in as an active member
- View **history** of past runs
- See **statistics** and progress over time

**For organisers**

- **Create races** and add members
- **Time each swimmer and lane** during a live race
- Persist results for history and stats

## Stack

- **Angular** — UI, race management, timing screens, member views
- **Slim PHP** — API and persistence behind the app

## The timing challenge

Accurate **live timing** was the hardest part. I was **not allowed to use WebSockets**, but the race view still had to stay in sync while times were recorded lane by lane.

I used **Server-Sent Events (SSE)** instead: the Slim PHP backend streams updates over a long-lived HTTP connection, and the Angular client listens with the browser’s **`EventSource`** API. The server pushes timing and race state as events arrive — without the full duplex setup of WebSockets, but responsive enough for live use at an event.

## My contribution

Solo ownership end to end: data model, Slim PHP routes, Angular components, auth, race setup, timing flow, and the member history/statistics views. Getting **race → lane → swimmer → time** consistent in the database and on screen took most of the iteration.

## Result

A customer-facing app for live swimrun timing and long-term member records — live sync via **SSE** and **`EventSource`**, without WebSockets.
