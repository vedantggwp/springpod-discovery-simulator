# Reviewer Guide

This guide is for reviewers who want to understand the project quickly and verify the proof artifact without trusting the README.

## Five-Minute Path

1. Open the live app: <https://springpod-discovery-simulator.vercel.app>
2. Confirm the simulator lobby loads with three bundled client scenarios.
3. On a deployed preview of this branch, open `/workbench`.
4. Click **Load leak example**, then **Run report**.
5. Confirm the report flags a hidden-fact leak and shows limitations.
6. Run the local verification commands below if reviewing the code.

## What To Look For

The project is not just a chatbot UI. It demonstrates a hidden-state simulated-agent loop:

- scenario contracts separate visible and hidden facts,
- deterministic guards check candidate responses for leakage and role breaks,
- prompt-risk checks flag hidden facts or internal guard text in prompts,
- discovery-evidence scoring connects learner questions to expected client evidence,
- public docs state the limits of deterministic checks.

## Verification Commands

```bash
npm run test
npm run lint
npm run build
npm run start
```

Then smoke test:

- `http://localhost:3000/`
- `http://localhost:3000/workbench`

Last verified locally on 2026-06-05:

- `npm run test`: 9 files, 75 tests passed,
- `npm run lint`: 0 errors, 4 existing `<img>` warnings,
- `npm run build`: passed, with `/` and `/workbench` prerendered,
- `/` renders bundled scenario cards without database access,
- `/workbench` can generate a deterministic lint report.

## Current Live-State Caveat

The production URL currently reflects the latest deployed `main` branch. The `/workbench` route appears after this branch is deployed as a Vercel preview or merged/promoted.

## What This Does Not Prove

- It does not certify model safety.
- It does not yet run live model-backed golden conversation evals.
- It does not yet make scenario contracts the single source of truth for `/api/chat`.
- It does not store hosted report history.
- It does not validate learner skill objectively; it tracks discovery coverage with deterministic heuristics.

## Next Strongest Upgrade

Add `npm run evals` with JSONL golden conversations, adversarial probe fixtures, deterministic transcript scoring, and optional budget-capped model-backed runs.
