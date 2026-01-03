import type {
  ObservationPhoto,
  ObservationSound,
  ObservationsResult,
} from "../../types/inat_api";
import type { DataComponentType, AppStoreType } from "../../types/app";
import {
  formatAvatar,
  renderAnnotations,
  renderDates,
  renderMedia,
  renderObservationMetadataCounts,
  renderQualityGrade,
  renderTaxonNames,
} from "../../lib/render_utils";
import { iNatObservationUrl } from "../../data/inat_data";

type DataProps = {
  observation: ObservationsResult;
  mediaIndex: number;
  type: "photo" | "sound";
  media: ObservationPhoto | ObservationSound;
};

export function renderCard(appStore: AppStoreType, componentCtx: any) {
  let cardEl = componentCtx.querySelector(".card");
  if (!cardEl) return;

  let { observation, media, type, mediaIndex } = (
    componentCtx as unknown as DataComponentType
  ).data as DataProps;

  let obsUrl = `${iNatObservationUrl}/${observation.id}`;

  if (type === "photo") {
    cardEl.innerHTML = renderMedia(
      obsUrl,
      observation.taxon,
      [media],
      [],
      appStore,
    );
  } else {
    cardEl.innerHTML = renderSound(media);
  }

  let detailsEl = document.createElement("div");
  detailsEl.className = "details";

  let detailsContent = ``;

  if (observation.user && mediaIndex === 0) {
    detailsContent += formatAvatar(observation.user);
  }

  if (observation.taxon) {
    detailsContent += renderTaxonNames(observation.taxon, appStore, obsUrl);
  } else {
    // some obsevations do not have taxa info
    detailsContent += `<span class="title">`;
    detailsContent += `<a href="${obsUrl}">Unknown</a>`;
    detailsContent += "</span>";
  }

  detailsContent += renderMediaCount(mediaIndex, observation);

  if (mediaIndex === 0) {
    detailsContent += renderQualityGrade(observation.quality_grade);
    detailsContent += renderObservationMetadataCounts(observation);
    detailsContent += renderDates(observation);

    if (observation.annotations && observation.annotations.length > 0) {
      detailsContent += renderAnnotations(observation.annotations);
    }
  }
  detailsEl.innerHTML = detailsContent;
  cardEl.appendChild(detailsEl);
}

function renderMediaCount(index: number, observation: ObservationsResult) {
  let count = observation.photos.length + observation.sounds.length;
  return count === 1
    ? `<div class="media-count">1 media</div>`
    : `<div class="media-count">${index + 1} of ${count} media</div>`;
}

export function renderSound(sound: ObservationSound) {
  let mediaContent = `<div class="media sound">`;
  let url = sound.file_url;
  if (url) {
    mediaContent += ` <audio controls src="${url}"></audio>`;
  }

  mediaContent += "</div>";
  return mediaContent;
}
