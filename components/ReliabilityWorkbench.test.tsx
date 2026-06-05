import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReliabilityWorkbench } from "./ReliabilityWorkbench";

describe("ReliabilityWorkbench", () => {
  it("renders the workbench shell", () => {
    render(<ReliabilityWorkbench />);

    expect(screen.getByRole("heading", { name: /Reliability Workbench/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /^Scenario$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Run report/i })).toBeInTheDocument();
  });

  it("runs a report and shows hidden leakage findings", () => {
    render(<ReliabilityWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: /Load leak example/i }));
    fireEvent.click(screen.getByRole("button", { name: /Run report/i }));

    expect(screen.getByText(/Hidden fact leaked/i)).toBeInTheDocument();
    expect(screen.getByText(/Deterministic lint score/i)).toBeInTheDocument();
  });

  it("shows validation errors for too-long prompt input", () => {
    render(<ReliabilityWorkbench />);

    const prompt = screen.getByPlaceholderText(/Paste the prompt/i);
    fireEvent.change(prompt, { target: { value: "x".repeat(12_001) } });
    fireEvent.click(screen.getByRole("button", { name: /Run report/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/prompt_too_long/i);
  });
});
