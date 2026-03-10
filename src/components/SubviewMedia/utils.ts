import type { DataComponentType } from "../../types/app";
import type { ObservationsResult } from "../../types/inat_api";

export function createMediaGrid(results: ObservationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "observations-media-grid grid-auto-fill";
  results.forEach((record) => {
    let media = record.photos.concat(record.sounds);
    media.forEach((medium, j) => {
      let cardEl = document.createElement(
        "card-media",
      ) as unknown as DataComponentType;
      cardEl.data = {
        observation: record,
        media: medium,
        mediaIndex: j,
        type: medium.url ? "photo" : "sound",
      };
      containerEl.appendChild(cardEl);
    });
  });

  return containerEl;
}
