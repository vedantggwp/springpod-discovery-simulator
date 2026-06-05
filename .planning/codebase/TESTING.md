# Testing

## Framework

- **Vitest** (^4.0.18) – test runner
- **@testing-library/react** – component rendering, queries
- **@testing-library/jest-dom** – matchers (`toBeInTheDocument`, etc.)
- **jsdom** – DOM environment

## Configuration

- `vitest.config.ts` – jsdom, tsconfig paths, React plugin
- `vitest.setup.ts` – imports `@testing-library/jest-dom/vitest`

## Structure

| Location | Purpose |
|----------|---------|
| `lib/__tests__/*.test.ts` | Unit tests for lib modules |
| `components/*.test.tsx` | Component tests (e.g. `WhatsNewBanner.test.tsx`) |

## Test Files

| File | Coverage |
|------|----------|
| `lib/__tests__/detailsTracker.test.ts` | `checkDetailObtained`, `getCompletionStatus`, `getNewlyObtainedDetails` |
| `lib/__tests__/constants.test.ts` | `getDisplayContentIfEndMeeting`, `END_MEETING_REGEX` |
| `lib/__tests__/utils.test.ts` | `cn`, `safeImageUrl`, `safeMarkdownLink` |
| `components/WhatsNewBanner.test.tsx` | Renders version, date, summary, banner role, aria-label |

## Patterns

- **Unit tests:** Pure functions, keyword-based logic, URL safety
- **Component tests:** `render()`, `screen.getAllByText()`, `expect().toBeInTheDocument()`
- **Mocking:** No explicit mocks in current tests; lib tests use in-memory data

## Commands

```bash
npm run test        # Single run
npm run test:watch  # Watch mode
```

## Coverage

No coverage reporting configured. Tests focus on critical paths: details tracker, constants, utils, WhatsNewBanner.
