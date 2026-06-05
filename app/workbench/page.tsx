import type { Metadata } from "next";
import { ReliabilityWorkbench } from "@/components/ReliabilityWorkbench";

export const metadata: Metadata = {
  title: "Reliability Workbench | Springpod Discovery Simulator",
  description: "Run deterministic reliability checks for hidden-state simulated-client agents.",
};

export default function WorkbenchPage() {
  return <ReliabilityWorkbench />;
}
