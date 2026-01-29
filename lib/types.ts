import type { ScenarioId } from "@/lib/scenarios";
import type { ModelType } from "@/lib/constants";

export type { ModelType } from "@/lib/constants";

export interface ChatRoomProps {
  scenarioId: ScenarioId;
  model: ModelType;
  onBack: () => void;
}

export interface LobbyProps {
  onSelect: (scenarioId: ScenarioId) => void;
}
