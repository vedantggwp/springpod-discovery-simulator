# Public Readiness Notes

This project now has a public Reliability Workbench route, but public claims must stay modest.

## Safe Claims

Use:

- "deterministic reliability checks",
- "hidden-state simulated-agent deterministic lint report",
- "prompt and response checks for leakage, role breaks, and rubric evidence",
- "free local-first workbench",
- "not a certification."

Avoid:

- "proves the agent is safe",
- "certified prompt-injection protection",
- "validated learner competence",
- "production-grade benchmark" without repeated model-backed evals,
- "real Springpod deployment" unless freshly verified and approved.

## Privacy Defaults

- The lobby uses bundled scenarios by default; remote scenario refresh is opt-in via `NEXT_PUBLIC_ENABLE_REMOTE_SCENARIOS=true`.
- Do not store pasted prompts or responses by default.
- Do not ask for an email before value is delivered.
- Do not log pasted prompts or responses in public report codepaths.
- Do not sell raw learner transcripts.
- If future hosted reports are added, require explicit opt-in and redact secrets.

## Abuse And Cost Controls

The MVP avoids arbitrary public model calls. If model-backed checks are added:

- keep per-IP and per-session limits,
- add daily/monthly budget caps,
- set model timeouts,
- redact reports,
- show a clear budget-exhausted message,
- never print environment variables or provider secrets.

## Launch Checklist

- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `/` and `/workbench` pass browser smoke tests.
- `/` renders bundled scenario cards even without database access.
- Privacy copy is visible on `/workbench`.
- Limitations are visible in every generated report.
- README links to the workbench and docs.
- No lockfile or dependency changes.
- Live URL is documented after deployment.
- `/workbench` is verified on the deployed preview or production URL.
- README public claims have been checked against `docs/EVALS.md`.
