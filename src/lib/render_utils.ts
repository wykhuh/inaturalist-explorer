import type { NormalizediNatTaxonType, AppStoreType } from "../types/app";
import { iNatTaxaUrl, iNatUserUrl, speciesRanks } from "../data/inat_data.ts";
import type {
  DefaultPhoto,
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
import { html } from "./component_utils.ts";

export function renderUser(user: ObservationUser) {
  return html`<span class="avatar-name">
    ${formatAvatar(user)} ${formatUserName(user)}
  </span>`;
}

export function formatUserName(user: ObservationUser) {
  return html`<a class="user-name" href="${iNatUserUrl}/${user.login}"
    >${user.login}</a
  >`;
}

export function formatAvatar(user: ObservationUser) {
  let imgUrl = user.icon || user.icon_url;
  let image = "";
  if (imgUrl) {
    image = html`<img
      class="avatar-image"
      src="${imgUrl}"
      alt="iNaturalist user ${user.login}"
    />`;
  } else {
    image = person2;
  }

  return html`<a
    class="avatar"
    href="${iNatUserUrl}/${user.login}"
    title="${user.login}"
    >${image}</a
  >`;
}

export function renderTaxonNames(
  taxon: ObservationTaxon | SpeciesCountTaxon | NormalizediNatTaxonType | Taxon,
  appStore: AppStoreType,
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
  appStore: AppStoreType,
  displayCount = false,
  size = "medium",
) {
  let classes = ["media"];
  if (photos.length === 0 && sounds.length > 0) {
    classes.push("sound-only");
  }

  let mediaContent = `<div class="${classes.join(" ")}">`;

  if (photos.length > 0) {
    if (size === "medium") {
      size = "medium.";
    } else {
      size = "square.";
    }

    let url = photos[0].url?.replace("/square.", `/${size}`);
    if (!url) {
      url = photos[0].photo?.url?.replace("/square.", `/${size}`);
    }
    if (url) {
      let altText = formatTaxonPhotoAltText(taxon, appStore);
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

export function renderIdCount(count: number) {
  let message = `${count} identifications`;
  return `
  <span class="identifications" aria-label="${message}" title="${message}">
    ${check}<span class="identifications-count">${count}</span>
  </span>`;
}

function renderCommentCount(count: number) {
  let message = `${count} comments`;
  return `
  <span class="speech" aria-label="${message}" title="${message}">
    ${speech}<span class="comments-count">${count}</span>
  </span>`;
}

function renderFavoritesCount(count: number) {
  let message = `${count} favorites`;
  return `
  <span class="favorites" aria-label="${message}" title="${message}">
    ${star}<span class="favorites-count">${count}</span>
  </span>`;
}

export function renderObservationMetadataCounts(
  data: ObservationsResult | Observation,
  includeDate = false,
) {
  let detailsContent = `<div class="metadata-counts">`;
  if (data.identifications.length > 0) {
    detailsContent += renderIdCount(data.identifications.length);
  }

  if (data.comments_count > 0) {
    detailsContent += renderCommentCount(data.comments_count);
  }

  if (data.faves_count > 0) {
    detailsContent += renderFavoritesCount(data.faves_count);
  }

  if (includeDate && data.observed_on) {
    let date = formatDate(data.observed_on);
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

export function renderTaxonDefaultPhoto(
  taxon: SpeciesCountTaxon | Taxon,
  appStore: AppStoreType,
  size = "default",
) {
  if (!taxon.default_photo) return;

  let url = "";
  if (size === "square") {
    url = taxon.default_photo.square_url;
  } else if (size === "medium") {
    url = taxon.default_photo.medium_url;
  } else {
    url = taxon.default_photo.url;
  }

  let alt = formatTaxonPhotoAltText(taxon, appStore);
  alt += formatTaxonPhotoAttribution(taxon.default_photo);

  return html`<a href="${iNatTaxaUrl}/${taxon.id}"
    ><img src=${url} alt="${alt}"
  /></a>`;
}

export function formatTaxonPhotoAltText(
  taxon: Taxon | ObservationTaxon | SpeciesCountTaxon,
  appStore: AppStoreType,
) {
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

  return altText;
}

export function formatTaxonPhotoAttribution(photo: DefaultPhoto) {
  let text = "";
  if (photo.attribution) {
    text += ` taken by ${photo.attribution}`;
  }
  return text;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatDateLong(date: string | null, timezone?: string) {
  if (!date) return;

  let options = {
    timeZoneName: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  } as any;
  if (timezone) {
    options.timeZone = timezone;
  }

  // TODO: localize date
  return new Date(date).toLocaleString("en-US", options);
}

// https://stackoverflow.com/a/69122877
export function timeAgo(input: Date | string) {
  const date = input instanceof Date ? input : new Date(input);
  const formatter = new Intl.RelativeTimeFormat("en");
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 31,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (let k in ranges) {
    // https://stackoverflow.com/a/66838662
    let key = k as keyof typeof ranges;
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.round(delta), key);
    }
  }
}

export function formatiNatDate(input: string) {
  const date = new Date(input);
  const secondsElapsed = Math.abs((date.getTime() - Date.now()) / 1000);
  if (secondsElapsed < 60 * 60 * 24) {
    return date
      .toLocaleDateString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })
      .split(",")[1];
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }
}
