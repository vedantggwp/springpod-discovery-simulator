import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatsNewBanner } from "./WhatsNewBanner";
import { APP_RELEASE } from "@/lib/constants";

describe("WhatsNewBanner", () => {
  it("renders version from APP_RELEASE", () => {
    render(<WhatsNewBanner />);
    const elements = screen.getAllByText(/v\d+\.\d+\.\d+/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(elements[0]).toBeInTheDocument();
  });

  it("renders last updated date", () => {
    render(<WhatsNewBanner />);
    const elements = screen.getAllByText(/Last updated/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(elements[0]).toBeInTheDocument();
  });

  it("renders what's new summary text from APP_RELEASE", () => {
    render(<WhatsNewBanner />);
    const summary = APP_RELEASE.WHATS_NEW_SUMMARY;
    expect(summary.length).toBeGreaterThan(0);
    const elements = screen.getAllByText(summary);
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(elements[0]).toBeInTheDocument();
  });

  it("has role banner", () => {
    render(<WhatsNewBanner />);
    const banners = screen.getAllByRole("banner");
    expect(banners.length).toBeGreaterThanOrEqual(1);
    expect(banners[0]).toBeInTheDocument();
  });

  it("has accessible aria-label describing content", () => {
    render(<WhatsNewBanner />);
    const banners = screen.getAllByRole("banner", { name: /What's new/i });
    expect(banners.length).toBeGreaterThanOrEqual(1);
    expect(banners[0]).toBeInTheDocument();
  });
});
