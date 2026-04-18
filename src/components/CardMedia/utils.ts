import type {
  ObservationPhoto,
  ObservationSound,
  ObservationsResult,
} from "../../types/inat_api";
import type { DataComponentType, AppStoreType } from "../../types/app";
import {
  renderAnnotations,
  renderDates,
  renderMedia,
  renderObservationFields,
  renderObservationMetadataCounts,
  renderPlace,
  renderQualityGrade,
  renderTaxonNames,
  renderUser,
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
    componentCtx as DataComponentType
  ).data as DataProps;
  let displayFields =
    appStore.viewMetadata.observations_observations.displayFields || {};

  cardEl.innerHTML = "";
  let obsUrl = `${iNatObservationUrl}/${observation.id}`;
  if (displayFields.media !== false) {
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
  }

  let detailsEl = document.createElement("div");
  detailsEl.className = "details";

  let detailsContent = ``;

  if (displayFields.species_name !== false) {
    if (observation.taxon) {
      detailsContent += renderTaxonNames(observation.taxon, appStore, obsUrl);
    } else {
      // some obsevations do not have taxa info
      detailsContent += `<span class="title">`;
      detailsContent += `<a href="${obsUrl}">Unknown</a>`;
      detailsContent += "</span>";
    }
  }

  if (displayFields.media_counts !== false) {
    detailsContent += renderMediaCount(mediaIndex, observation);
  }

  if (mediaIndex === 0) {
    if (displayFields.quality_grade !== false) {
      detailsContent += renderQualityGrade(observation.quality_grade);
    }

    if (displayFields.counts !== false) {
      detailsContent += renderObservationMetadataCounts(observation);
    }

    if (
      observation.user &&
      displayFields.observer !== false &&
      mediaIndex === 0
    ) {
      detailsContent += renderUser(observation.user);
    }

    detailsContent += renderDates(observation, displayFields);

    if (observation.place_guess && displayFields.place_guess !== false) {
      detailsContent +=
        "<div>Place: " +
        renderPlace(observation.place_guess, observation.obscured) +
        "</div>";
    }

    if (
      observation.annotations &&
      observation.annotations.length > 0 &&
      displayFields.annotations !== false
    ) {
      detailsContent += "<h3>Annotations</h3>";
      detailsContent += renderAnnotations(observation.annotations);
    }

    if (
      observation.ofvs &&
      observation.ofvs.length > 0 &&
      displayFields.ofvs !== false
    ) {
      detailsContent += "<h3>Observation Fields</h3>";
      detailsContent += renderObservationFields(observation.ofvs, appStore);
    }
  }

  if (detailsContent !== "") {
    detailsEl.innerHTML = detailsContent;
    cardEl.appendChild(detailsEl);
  }
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
