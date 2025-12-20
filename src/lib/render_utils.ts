import type { NormalizediNatTaxon, MapStore } from "../types/app";
import { speciesRanks } from "../data/inat_data.ts";
import type {
  Observation,
  ObservationPhoto,
  ObservationSound,
  ObservationsResult,
  ObservationTaxon,
  ObservationUser,
  SpeciesCountTaxon,
  Taxon,
} from "../types/inat_api";
import {
  audio,
  check,
  mapMarker,
  mapMarkerObscured,
  noPhoto,
  person2,
  speech,
  star,
} from "../assets/icons.ts";
import { capitalizeFirstLetter, formatTaxonName } from "./data_utils.ts";
import { logger } from "./logger.ts";
import { pluralize } from "./utils.ts";

export function formatAvatar(user: ObservationUser) {
  let imgUrl = user.icon_url;
  if (imgUrl) {
    return `<img class="avatar" src="${imgUrl}" alt="iNaturalist user ${user.login}">`;
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
  inatUrl: string,
  taxon: Taxon | ObservationTaxon,
  photos: ObservationPhoto[],
  sounds: ObservationSound[],
  appStore: MapStore,
  displayCount = false,
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
      let altText = "observation of ";
      if (taxon) {
        let { title, subtitle, titleAriaLabel, subtitleAriaLabel } =
          formatTaxonName(taxon, appStore);
        if (title) {
          altText += `${titleAriaLabel} ${title}`;
        }
        if (subtitle) {
          altText += `, ${subtitleAriaLabel} ${subtitle}`;
        }
      } else {
        altText += "unknown";
      }
      mediaContent += `<a href="${inatUrl}">`;
      mediaContent += `<img src="${url}" alt="${altText}">`;
      mediaContent += "</a>";
    } else {
      logger(photos);
    }
  } else {
    logger(photos);
  }

  if (sounds.length > 0) {
    mediaContent += `<a href="${inatUrl}">`;
    mediaContent += `${audio}`;
    mediaContent += "</a>";
  }

  if (sounds.length === 0 && photos.length === 0) {
    mediaContent += noPhoto;
  }

  if (displayCount && photos.length > 1) {
    mediaContent += `<span class="photos-count">${photos.length}</span>`;
  }
  mediaContent += "</div>";
  return mediaContent;
}

export function renderMediaCounts(
  photos: ObservationPhoto[],
  sounds: ObservationSound[],
) {
  if (photos.length === 0 && sounds.length === 0) return;

  let text = [];
  if (photos.length > 0) {
    text.push(pluralize(photos.length, "photo"));
  }
  if (sounds.length > 0) {
    text.push(pluralize(sounds.length, "sound"));
  }

  return `<div class="media-counts">${text.join(", ")}</div>`;
}

export function renderObservationMetadataCounts(
  data: ObservationsResult | Observation,
  includeDate = false,
) {
  let detailsContent = `<div class="metadata-counts">`;
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
  detailsContent += `</div>`;

  return detailsContent;
}

export function renderPlace(place: string, obscured: boolean) {
  let placeContent = obscured
    ? `<span class="obscured" aria-label="location is obscured" title="location is obscured">${mapMarkerObscured}</span>`
    : `<span class="obscured" aria-label="location is public" title="location is public">${mapMarker}</span>`;
  placeContent += `<span class="place">${place}</span>`;

  return placeContent;
}

export function renderQualityGrade(quality_grade: string) {
  let content = "";
  if (quality_grade === "research") {
    content += `<div class="quality-grade">
      <span class="research-grade-badge badge">Research Grade</span>
     </div>`;
  } else if (quality_grade === "needs_id") {
    content += `<div class="quality-grade">
      <span class="needs-id-badge badge">Needs ID</span>
    </div>`;
  } else if (quality_grade === "casual") {
    content += `<div class="quality-grade">
      <span class="casual-badge badge">Casual</span>
    </div>`;
  } else {
    content += `<div class="quality-grade">
      <span class="badge"></span>
    </div>`;
  }

  return content;
}
