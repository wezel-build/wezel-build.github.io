---
title: Self-Hosting Overview
description: Run the entire Wezel stack on your own infrastructure.
---

Wezel is fully self-hostable. Every component is MIT-licensed and designed to run on infrastructure you control.

## Components

| Component | Role |
|-----------|------|
| **Burrow** | Backend API and data store. Ingests build events, serves history. |
| **Anthill** | Web dashboard. Visualizes scenarios, trends, and regressions. |
| **Pheromone** | Local agent. Hooks into your shell and captures build invocations. |
| **Forager** | CI scenario runner. Benchmarks defined scenarios on every commit. |

## Prerequisites

- Docker and Docker Compose (v2+)
- A Linux host with at least 1 GB RAM
- Outbound network access from your CI runners to Burrow

## Deployment options

### Docker Compose (recommended)

The quickest way to get started. See the [Docker Compose guide](/docs/self-hosting/docker-compose).

### Custom

Each component is a standalone binary or container image. You can run them behind your own reverse proxy and connect them to an existing Postgres instance.

## Data

Wezel stores build event data in Postgres. There is no telemetry and no call-home behaviour.
