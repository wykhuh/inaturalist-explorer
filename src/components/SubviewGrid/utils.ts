import type { DataComponentType } from "../../types/app";
import type { ObservationsResult } from "../../types/inat_api";

export function createGrid(results: ObservationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "observations-grid grid-auto-fill";

  results.forEach((row) => {
    let cardEl = document.createElement(
      "card-observation",
    ) as DataComponentType;
    cardEl.data = row;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}
