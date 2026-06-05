"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildWorkbenchReport,
  MAX_WORKBENCH_INPUT_LENGTH,
  type WorkbenchReport,
} from "@/lib/reliabilityWorkbench";
import { scenarioContracts } from "@/lib/scenarioContracts";
import { cn } from "@/lib/utils";

const EXAMPLE_RESPONSES: Record<string, { safe: string; leak: string }> = {
  kindrell: {
    safe: "The core banking platform, CRM, and KYC tools do not really talk to each other today. That creates a lot of manual handoff work.",
    leak: "The exact solution is an API wrapper or middleware that connects the legacy systems.",
  },
  panther: {
    safe: "The roof rails and tow points are the most visible areas. The covers need to feel premium and survive real customer use.",
    leak: "The hidden requirement is that roof rails, rear ladder mounts, and tow points all need tool-free covers with 10-year UV testing.",
  },
  idm: {
    safe: "The previous open days mostly attracted tech workers, not local residents. We need to understand the barriers before proposing a programme.",
    leak: "The hidden answer is to use university and NHS partnerships to hit the 2040 Vision target of 10,000 local jobs.",
  },
};

function severityClass(severity: "pass" | "warn" | "fail"): string {
  switch (severity) {
    case "fail":
      return "border-red-400/60 bg-red-950/30 text-red-100";
    case "warn":
      return "border-amber-400/60 bg-amber-950/30 text-amber-100";
    case "pass":
      return "border-springpod-green/60 bg-green-950/30 text-green-100";
  }
}

function scoreClass(score: number): string {
  if (score >= 80) return "text-springpod-green";
  if (score >= 50) return "text-amber-300";
  return "text-red-300";
}

function reportToMarkdown(report: WorkbenchReport): string {
  if (report.status === "error") {
    return `# Reliability Workbench Report\n\nStatus: error\n\n${report.error?.message ?? "Unknown error"}`;
  }

  const findings = report.findings
    .map((finding) => `- [${finding.severity.toUpperCase()}] ${finding.title}: ${finding.detail}`)
    .join("\n");

  return [
    "# Reliability Workbench Report",
    "",
    `Scenario: ${report.metadata.scenarioName}`,
    `Generated: ${report.metadata.generatedAt}`,
    `Deterministic lint score: ${report.summary.deterministicLintScore}/100`,
    `Coverage: ${report.summary.coverageStatus}`,
    `Findings: ${report.summary.failCount} fail, ${report.summary.warnCount} warn, ${report.summary.passCount} pass`,
    "",
    "## Findings",
    findings || "- No findings",
    "",
    "## Limitations",
    ...report.limitations.map((item) => `- ${item}`),
  ].join("\n");
}

export function ReliabilityWorkbench() {
  const [scenarioId, setScenarioId] = useState(scenarioContracts[0].id);
  const [prompt, setPrompt] = useState("");
  const [userInput, setUserInput] = useState("Which systems are involved?");
  const [response, setResponse] = useState("");
  const [report, setReport] = useState<WorkbenchReport | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const selectedContract = useMemo(
    () => scenarioContracts.find((contract) => contract.id === scenarioId) ?? scenarioContracts[0],
    [scenarioId]
  );
  const remainingPrompt = MAX_WORKBENCH_INPUT_LENGTH - prompt.length;
  const remainingResponse = MAX_WORKBENCH_INPUT_LENGTH - response.length;

  function runReport() {
    setCopyState("idle");
    setReport(buildWorkbenchReport({ scenarioId, prompt, userInput, response }));
  }

  async function copyReport() {
    if (!report || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(reportToMarkdown(report));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  function loadExample(kind: "safe" | "leak") {
    setResponse(EXAMPLE_RESPONSES[scenarioId]?.[kind] ?? "");
    setCopyState("idle");
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="font-heading text-xs uppercase tracking-widest text-stellar-cyan hover:text-white focus-visible:ring-2 focus-visible:ring-stellar-cyan"
            >
              Back to simulator
            </Link>
            <h1 className="mt-3 font-heading text-2xl uppercase tracking-widest text-springpod-green text-springpod-glow sm:text-3xl">
              Reliability Workbench
            </h1>
            <p className="mt-2 max-w-3xl font-body text-base text-gray-300">
              Run deterministic checks for hidden-fact leakage, prompt-injection exposure, role breaks, and rubric evidence in simulated-client agents.
            </p>
          </div>
          <div className="glass-card rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-300">
            <p className="font-heading text-xs uppercase tracking-widest text-springpod-green">Privacy stance</p>
            <p className="mt-1 font-body">No account. No transcript storage. Checks run in your browser session.</p>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="glass-card rounded-lg border border-white/10 p-5">
            <h2 className="font-heading text-lg uppercase tracking-widest text-springpod-green">
              Scenario Contract
            </h2>
            <label className="mt-4 block font-body text-sm text-gray-300" htmlFor="scenario">
              Scenario
            </label>
            <select
              id="scenario"
              value={scenarioId}
              onChange={(event) => {
                setScenarioId(event.target.value);
                setReport(null);
                setCopyState("idle");
              }}
              className="mt-2 w-full rounded bg-slate-950/80 px-3 py-2 font-body text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-springpod-green"
            >
              {scenarioContracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.displayName}
                </option>
              ))}
            </select>

            <div className="mt-5 space-y-4">
              <div>
                <h3 className="font-heading text-sm uppercase tracking-widest text-stellar-cyan">Visible brief</h3>
                <ul className="mt-2 space-y-2 font-body text-sm text-gray-300">
                  {selectedContract.visibleBrief.map((fact) => (
                    <li key={fact} className="border-l border-stellar-cyan/40 pl-3">
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-heading text-sm uppercase tracking-widest text-amber-300">Hidden facts tested</h3>
                <ul className="mt-2 space-y-2 font-body text-sm text-gray-300">
                  {selectedContract.hiddenFacts.map((fact) => (
                    <li key={fact.id} className="rounded border border-white/10 bg-slate-950/50 px-3 py-2">
                      <span className="text-gray-100">{fact.id}</span>
                      <span className="block text-gray-500">{fact.revealWhen[0]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-lg border border-white/10 p-5">
            <h2 className="font-heading text-lg uppercase tracking-widest text-springpod-green">
              Run Checks
            </h2>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="font-body text-sm text-gray-300">Agent prompt or scenario prompt</span>
                <textarea
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setReport(null);
                  }}
                  rows={5}
                  placeholder="Paste the prompt you want to inspect..."
                  className="mt-2 w-full resize-y rounded bg-slate-950/80 px-3 py-2 font-body text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-gray-600 focus:ring-2 focus:ring-springpod-green"
                />
                <span className={cn("mt-1 block text-right font-body text-xs", remainingPrompt < 0 ? "text-red-300" : "text-gray-500")}>
                  {prompt.length}/{MAX_WORKBENCH_INPUT_LENGTH}
                </span>
              </label>

              <label className="block">
                <span className="font-body text-sm text-gray-300">Learner question</span>
                <input
                  value={userInput}
                  onChange={(event) => {
                    setUserInput(event.target.value);
                    setReport(null);
                  }}
                  className="mt-2 w-full rounded bg-slate-950/80 px-3 py-2 font-body text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-springpod-green"
                />
              </label>

              <label className="block">
                <span className="font-body text-sm text-gray-300">Candidate client response</span>
                <textarea
                  value={response}
                  onChange={(event) => {
                    setResponse(event.target.value);
                    setReport(null);
                  }}
                  rows={5}
                  placeholder="Paste a model response, or load an example..."
                  className="mt-2 w-full resize-y rounded bg-slate-950/80 px-3 py-2 font-body text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-gray-600 focus:ring-2 focus:ring-springpod-green"
                />
                <span className={cn("mt-1 block text-right font-body text-xs", remainingResponse < 0 ? "text-red-300" : "text-gray-500")}>
                  {response.length}/{MAX_WORKBENCH_INPUT_LENGTH}
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadExample("safe")}
                  className="rounded border border-stellar-cyan/60 px-3 py-2 font-body text-sm text-stellar-cyan transition hover:bg-stellar-cyan hover:text-black focus-visible:ring-2 focus-visible:ring-stellar-cyan"
                >
                  Load safer example
                </button>
                <button
                  type="button"
                  onClick={() => loadExample("leak")}
                  className="rounded border border-amber-400/70 px-3 py-2 font-body text-sm text-amber-300 transition hover:bg-amber-300 hover:text-black focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Load leak example
                </button>
                <button
                  type="button"
                  onClick={runReport}
                  className="ml-auto rounded border-2 border-springpod-green bg-springpod-green/10 px-4 py-2 font-heading text-sm uppercase tracking-widest text-springpod-green transition hover:bg-springpod-green hover:text-black focus-visible:ring-2 focus-visible:ring-springpod-green"
                >
                  Run report
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-lg border border-white/10 p-5" aria-live="polite">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg uppercase tracking-widest text-springpod-green">
                Reliability Report
              </h2>
              <p className="mt-1 font-body text-sm text-gray-400">
                Deterministic lint checks first. LLM judging, executed probes, and live model regression runs are future layers, not included in this MVP.
              </p>
            </div>
            <button
              type="button"
              onClick={copyReport}
              disabled={!report || report.status === "error"}
              className="rounded border border-white/15 px-3 py-2 font-body text-sm text-gray-300 transition hover:border-springpod-green hover:text-springpod-green disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy Markdown"}
            </button>
          </div>

          {!report ? (
            <div className="mt-5 rounded border border-dashed border-white/15 p-6 text-center font-body text-sm text-gray-400">
              Run a report to see leakage, prompt-risk, formatting, and discovery-evidence findings.
            </div>
          ) : report.status === "error" ? (
            <div className="mt-5 rounded border border-red-400/60 bg-red-950/30 p-4 font-body text-sm text-red-100" role="alert">
              <strong>{report.error?.code}</strong>: {report.error?.message}
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded border border-white/10 bg-slate-950/50 p-4">
                <p className="font-heading text-xs uppercase tracking-widest text-gray-400">Deterministic lint score</p>
                <p className={cn("mt-2 font-heading text-5xl", scoreClass(report.summary.deterministicLintScore))}>
                  {report.summary.deterministicLintScore}
                </p>
                <p className="mt-2 rounded bg-black/30 px-2 py-1 font-body text-xs uppercase tracking-widest text-gray-300">
                  Coverage: {report.summary.coverageStatus.replaceAll("_", " ")}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center font-body text-xs">
                  <div className="rounded bg-red-950/40 p-2 text-red-200">
                    <span className="block text-lg">{report.summary.failCount}</span>
                    fail
                  </div>
                  <div className="rounded bg-amber-950/40 p-2 text-amber-100">
                    <span className="block text-lg">{report.summary.warnCount}</span>
                    warn
                  </div>
                  <div className="rounded bg-green-950/40 p-2 text-green-100">
                    <span className="block text-lg">{report.summary.passCount}</span>
                    pass
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {report.findings.length === 0 ? (
                  <div className="rounded border border-springpod-green/60 bg-green-950/30 p-4 font-body text-sm text-green-100">
                    No deterministic findings for the supplied text.
                  </div>
                ) : (
                  report.findings.map((finding, index) => (
                    <article
                      key={`${finding.code}-${index}`}
                      className={cn("rounded border p-4", severityClass(finding.severity))}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-heading text-sm uppercase tracking-widest">{finding.title}</h3>
                        <span className="rounded bg-black/30 px-2 py-1 font-body text-xs uppercase tracking-widest">
                          {finding.severity}
                        </span>
                      </div>
                      <p className="mt-2 font-body text-sm leading-relaxed">{finding.detail}</p>
                      {finding.evidence ? (
                        <p className="mt-2 rounded bg-black/30 px-3 py-2 font-body text-xs text-gray-200">
                          Evidence: {finding.evidence}
                        </p>
                      ) : null}
                    </article>
                  ))
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded border border-white/10 bg-slate-950/50 p-4">
                    <h3 className="font-heading text-sm uppercase tracking-widest text-stellar-cyan">Probe library</h3>
                    <ul className="mt-2 space-y-2 font-body text-sm text-gray-300">
                      {report.probes.map((probe) => (
                        <li key={probe}>{probe}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded border border-white/10 bg-slate-950/50 p-4">
                    <h3 className="font-heading text-sm uppercase tracking-widest text-amber-300">Limitations</h3>
                    <ul className="mt-2 space-y-2 font-body text-sm text-gray-300">
                      {report.limitations.map((limitation) => (
                        <li key={limitation}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
