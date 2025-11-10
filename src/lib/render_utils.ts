import type { NormalizediNatTaxon, MapStore } from "../types/app";
import { iNatObservationUrl, speciesRanks } from "../data/inat_data.ts";
import type {
  ObservationPhoto,
  ObservationSound,
  ObservationsResult,
  ObservationTaxon,
  SpeciesCountTaxon,
  Taxon,
} from "../types/inat_api";
import { audio, check, person2, speech, star } from "../assets/icons.ts";
import { capitalizeFirstLetter, formatTaxonName } from "./data_utils.ts";

export function formatAvatar(imgUrl?: string | null) {
  if (imgUrl) {
    return `<img class="avatar" src="${imgUrl}">`;
  } else {
    return person2;
  }
}

export function renderTaxonNames(
  taxon: ObservationTaxon | SpeciesCountTaxon | NormalizediNatTaxon | Taxon,
  appStore: MapStore,
  url?: string,
  searchTerm = "",
  includeParathesis = true,
) {
  let { title, titleAriaLabel, subtitle, subtitleAriaLabel, rank } =
    formatTaxonName(taxon, appStore, searchTerm);

  let content = "";
  if (title && titleAriaLabel) {
    content += renderTaxonName(
      title,
      titleAriaLabel,
      "title",
      false,
      rank,
      url,
    );
  }
  if (subtitle && subtitleAriaLabel) {
    content += renderTaxonName(
      subtitle,
      subtitleAriaLabel,
      "subtitle",
      includeParathesis,
      rank,
      url,
    );
  }

  return content;
}

function renderTaxonName(
  name: string,
  ariaLabel: string,
  nameType: string,
  includeParathesis = true,
  rank?: string,
  url?: string,
) {
  let type =
    ariaLabel === "taxon common name" ? "common-name" : "scientific-name";

  let content = "";
  if (url) {
    content += `<a href="${url}" class="${nameType}">\n`;
  } else {
    content += `<span class="${nameType}">\n`;
  }
  if (includeParathesis) {
    content += `(`;
  }
  if (type === "scientific-name") {
    if (rank && !speciesRanks.includes(rank)) {
      content += `<span class="rank" aria-label="taxon rank">${capitalizeFirstLetter(rank)}</span> `;
    }
  }

  content += `<span class="${type}" aria-label="${ariaLabel}">`;

  content += name;

  if (includeParathesis) {
    content += `</span>)\n`;
  } else {
    content += `</span>\n`;
  }

  if (url) {
    content += `</a>\n`;
  } else {
    content += `</span>\n`;
  }

  return content;
}

export function renderMedia(
  id: number,
  photos: ObservationPhoto[],
  sounds: ObservationSound[],
) {
  let classes = ["media"];
  if (photos.length === 0 && sounds.length > 0) {
    classes.push("sound-only");
  }

  let mediaContent = `<div class="${classes.join(" ")}">`;

  if (photos.length > 0) {
    let url = photos[0].url?.replace("/square.", "/medium.");
    if (!url) {
      url = photos[0].photo?.url;
    }
    if (url) {
      mediaContent += `<a href="${iNatObservationUrl}/${id}">`;
      mediaContent += `<img src="${url}">`;
      mediaContent += "</a>";
    }
  }
  if (sounds.length > 0) {
    mediaContent += `<a href="${iNatObservationUrl}/${id}">`;
    mediaContent += `${audio}`;
    mediaContent += "</a>";
  }
  if (photos.length > 1) {
    mediaContent += `<span class="photos-count">${photos.length}</span>`;
  }
  mediaContent += "</div>";
  return mediaContent;
}

export function renderObservationMetadataCounts(
  data: ObservationsResult,
  includeDate = false,
) {
  let detailsContent = `<span class="metadata-counts">`;
  if (data.identifications.length > 0) {
    let message = `${data.identifications.length} identifications`;
    detailsContent += `
        <span class="identifications" aria-label="${message}" title="${message}">
          ${check}<span class="identifications-count">${data.identifications.length}</span>
        </span>`;
  }

  if (data.comments_count > 0) {
    let message = `${data.comments_count} comments`;
    detailsContent += `
        <span class="speech" aria-label="${message}" title="${message}">
          ${speech}<span class="comments-count">${data.comments_count}</span>
        </span>`;
  }

  if (data.faves_count > 0) {
    let message = `${data.faves_count} favorites`;
    detailsContent += `
        <span class="favorites" aria-label="${message}" title="${message}">
          ${star}<span class="favorites-count">${data.faves_count}</span>
        </span>`;
  }

  if (includeDate && data.observed_on) {
    let date = new Date(data.observed_on).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    detailsContent += `<span class="observed">${date}</span>`;
  }
  detailsContent += `</span>`;

  return detailsContent;
}
