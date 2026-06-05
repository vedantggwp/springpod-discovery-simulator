# Reliability Workbench And Evals

The Reliability Workbench is a deterministic first step toward agent behavior evaluation for hidden-state simulated-client agents.

It is intentionally local-first:

- no account required,
- no transcript storage by default,
- no arbitrary public model calls,
- no new dependencies,
- no formal safety certification claims.

## What This Proves

| Claim | Current Evidence | Boundary |
|---|---|---|
| Hidden facts can be represented explicitly. | `scenarioContracts` separate visible facts, hidden facts, reveal conditions, forbidden claims, and expected evidence. | Contracts are not yet the live prompt source of truth. |
| Candidate responses can be linted deterministically. | Response guards flag prompt leaks, hidden-fact leaks, forbidden claims, role breaks, and formatting drift. | This is not semantic or adversarially complete. |
| Reports can be generated without storing transcripts. | `/workbench` runs locally in the browser session and does not call a live model for pasted text. | Hosted report history is intentionally absent in the MVP. |
| The project has an eval path. | The workbench exposes probes and limitations. | Probes are listed, not yet executed as golden conversations or live model regressions. |

## What It Checks

The MVP checks pasted prompts and candidate responses for:

- system/developer prompt leakage,
- hidden fact leakage before a fact is eligible,
- contract-forbidden claims,
- stage directions and roleplay narration,
- invalid `[END_MEETING]...[/END_MEETING]` markup,
- markdown-like output where dialogue-only output is expected,
- overlong responses,
- prompt text that embeds hidden facts or internal guard text,
- whether a learner question and client response together provide evidence for a required detail.

## Core Files

| File | Purpose |
|---|---|
| `lib/scenarioContracts.ts` | Eval-facing contracts: visible facts, hidden facts, reveal rules, allowed facts, and required evidence. |
| `lib/responseGuards.ts` | Deterministic response guard checks and finding codes. |
| `lib/evalScorers.ts` | Prompt-risk and discovery-evidence scoring. |
| `lib/reliabilityWorkbench.ts` | Report builder, validation, summary, and limitations. |
| `components/ReliabilityWorkbench.tsx` | Public workbench UI. |
| `app/workbench/page.tsx` | Public workbench route. |

## Verification

Run:

```bash
npm run test
npm run lint
npm run build
```

Browser smoke:

- `/` loads the simulator lobby.
- `/workbench` loads the Reliability Workbench.
- "Load leak example" then "Run report" shows a hidden-fact leak.
- A 12,001-character prompt shows a visible validation error.
- "Copy Markdown" is disabled until a valid report exists.

## Limitations

- This is deterministic linting, not certification.
- It does not call a live model for arbitrary pasted prompts.
- It does not yet replace the simulator's live chat context with scenario contracts.
- It does not yet provide CI/API integration or hosted report history.
- A pass means no known deterministic issue was found in the supplied text; model-backed evals are still required before production claims.

## Next Eval Layer

The next layer should add:

- JSONL golden conversations,
- adversarial probe fixtures,
- a model-backed eval runner with budget caps,
- context-gate integration for `/api/chat`,
- report history only with explicit opt-in.
