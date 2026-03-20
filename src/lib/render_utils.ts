import type { NormalizediNatTaxonType, AppStoreType } from "../types/app";
import {
  annotationsTerms,
  annotationsValues,
  iNatTaxaUrl,
  iNatUsersUrl,
} from "../data/inat_data.ts";
import type {
  Annotation,
  DefaultPhoto,
  IdentificationObservation,
  ObservationField,
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
  x2,
} from "../assets/icons.ts";
import { capitalizeFirstLetter, formatTaxonName } from "./data_utils.ts";
import { logger } from "./logger.ts";
import { pluralize, truncateText } from "./utils.ts";
import { html } from "./component_utils.ts";
import { formatTooltip } from "../components/Tooltip/component.ts";

export function renderUser(user: ObservationUser) {
  return html`<span class="avatar-name">
    ${formatAvatar(user)} ${formatUserName(user)}
  </span>`;
}

export function formatUserName(user: ObservationUser) {
  return html`<a class="user-name" href="${iNatUsersUrl}/${user.login}"
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

  let link = `<a class="avatar" href="${iNatUsersUrl}/${user.login}">${image}</a>`;
  let tooltip = formatTooltip("tp-avatar", link, user.login);
  return tooltip;
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
    if (rank && rank !== "species") {
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

export function renderAnnotationsCounts(annotations: Annotation[]) {
  return `<div class="annotations-counts">${pluralize(annotations.length, "annotation")}</div>`;
}

export function renderAnnotations(annotations: Annotation[]) {
  let content = '<dl class="annotations-list">';
  annotations.forEach((annotation) => {
    content += `<div>`;
    content += `<dt>${annotationsTerms[annotation.controlled_attribute_id as keyof typeof annotationsTerms]}</dt>`;
    content += `<dd>${annotationsValues[annotation.controlled_value_id as keyof typeof annotationsValues]}</dd>`;
    content += `</div>`;
  });
  content += `</dl>`;
  return content;
}

export function renderObservationFields(
  observationFields: ObservationField[],
  appStore: AppStoreType,
) {
  let maxTextLength = 18;

  let content = '<dl class="observation-fields-list">';
  observationFields.forEach((field) => {
    content += `<div>`;
    content += `<dt>${field.name}</dt>`;
    if (field.datatype === "taxon" && field.taxon) {
      let url = `${iNatTaxaUrl}/${field.taxon.id}`;
      content += `<dd>${renderTaxonNames(field.taxon, appStore, url)}</dd>`;
    } else if (field.datatype === "dna") {
      let value = truncateText(field.value, maxTextLength);
      content += `<dd>${value}</dd>`;
    } else if (field.value.startsWith("https://")) {
      let url = new URL(field.value);
      let text = "";
      if (url.host.endsWith("inaturalist.org")) {
        text = url.pathname;
      } else {
        text = url.host.replace("wwww.", "");
      }
      content += `<dd><a href="${url.href}">${text}</a></dd>`;
    } else {
      let value = field.value;
      if (value.split(" ")[0].length >= maxTextLength) {
        value = truncateText(value, maxTextLength);
      }
      content += `<dd>${value}</dd>`;
    }
    content += `</div>`;
  });
  content += `</dl>`;
  return content;
}

export function renderIdCount(count: number) {
  return formatTooltip(
    "tp-identifications",
    `${check}${count}`,
    `${count} identifications`,
  );
}

function renderCommentCount(count: number) {
  return formatTooltip("tp-comments", `${speech}${count}`, `${count} comments`);
}

function renderFavoritesCount(count: number) {
  return formatTooltip("tp-favorites", `${star}${count}`, `${count} favorites`);
}

function renderDisagreementsCount(count: number) {
  return formatTooltip(
    "tp-disagreements",
    `${x2}${count}`,
    `${count} disagreements`,
  );
}

export function renderObservationMetadataCounts(
  data: ObservationsResult | IdentificationObservation,
) {
  let detailsContent = `<div class="metadata-counts">`;
  if (data.identifications.length > 0) {
    detailsContent += renderIdCount(
      data.identifications.filter((i) => i.current).length,
    );
  }
  if (
    data.num_identification_disagreements &&
    data.num_identification_disagreements > 0
  ) {
    detailsContent += renderDisagreementsCount(
      data.num_identification_disagreements,
    );
  }
  if (data.comments_count > 0) {
    detailsContent += renderCommentCount(data.comments_count);
  }
  if (data.faves_count > 0) {
    detailsContent += renderFavoritesCount(data.faves_count);
  }

  detailsContent += `</div>`;

  return detailsContent;
}

export function renderDates(
  data: ObservationsResult | IdentificationObservation,
  displayFields: { [k: string]: boolean },
) {
  let detailsContent = `<div class="dates">`;

  if (data.time_observed_at && displayFields.time_observed_at !== false) {
    let date = formatDate(data.time_observed_at);
    detailsContent += `<div class="observed">Observed: ${date}</div>`;
  } else if (data.observed_on && displayFields.time_observed_at !== false) {
    let date = formatDate(data.observed_on, data.observed_time_zone);
    detailsContent += `<div class="observed">Observed: ${date}</div>`;
  }
  if (data.created_at && displayFields.created_at !== false) {
    let date = formatDate(data.created_at);
    detailsContent += `<div class="created">Added: ${date}</div>`;
  }
  if (data.updated_at && displayFields.updated_at !== false) {
    let date = formatDate(data.updated_at);
    detailsContent += `<div class="updated">Updated: ${date}</div>`;
  }

  detailsContent += `</div>`;

  return detailsContent;
}

export function renderPlace(place: string, obscured: boolean) {
  let options = {} as any;
  if (obscured) {
    options = {
      id: "tp-obscured",
      content: mapMarkerObscured,
      tooltip: "location is obscured",
    };
  } else {
    options = {
      id: "tp-obscured",
      content: mapMarker,
      tooltip: "location is public",
    };
  }
  let placeContent = formatTooltip(
    options.id,
    options.content,
    options.tooltip,
  );
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
  if (!taxon.default_photo) return noPhoto;

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

export function formatDate(date: string, timezone?: string) {
  let options = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  } as any;
  if (timezone) {
    options.timeZone = timezone;
  }
  return new Date(date).toLocaleDateString("en-US", options);
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

export function formatDateLong2(date: string | null, timezone?: string) {
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
  return new Date(date).toLocaleDateString("en-US", options);
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
