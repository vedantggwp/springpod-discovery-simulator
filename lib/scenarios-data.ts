import scenariosData from "./scenarios-data.json";
import type { Database } from "./types/database";

export type ScenarioDataRow = Database["public"]["Tables"]["scenarios"]["Insert"];

export const SCENARIOS = scenariosData as ReadonlyArray<ScenarioDataRow>;
