---
name: Bug report
about: Something is broken or behaving wrong
title: "bug: "
labels: bug
assignees: ''
---

## What's broken

<!-- One sentence. Be concrete. -->

## To reproduce

1.
2.
3.

## What you expected

<!-- What should have happened. -->

## What actually happened

<!-- Include the actual error, HTTP code, browser console, or terminal output if relevant. -->

## Environment

- App version (lobby banner shows it, e.g. `v1.5.0`):
- Browser + OS (e.g. Chrome 128 on macOS Sonoma):
- Was this on https://springpod-discovery-simulator.vercel.app or a local dev build?

## API response (if relevant)

<!--
If this is a /api/chat error, run:

curl -X POST https://springpod-discovery-simulator.vercel.app/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"…"}],"scenarioId":"…"}' -i

…and paste the `code`, status, and any body here. (Since v1.5.0 errors are structured JSON with stable `code` enums.)
-->

```json

```

## Anything else
