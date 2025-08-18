export type NormalizediNatTaxon = {
  name: string;
  default_photo?: string;
  preferred_common_name?: string;
  matched_term: string;
  rank: string;
  id: number;
};

type iNatAutocompleteTaxaAPI = {
  total_results: number;
  page: number;
  per_page: number;
  results: iNatAutocompleteResult[];
};

type iNatAutocompleteResult = {
  id: number;
  rank: string;
  rank_level: number;
  iconic_taxon_id: number;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number;
  ancestry: string;
  extinct: boolean;
  default_photo: DefaultPhoto | null;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  flag_counts: {
    resolved: number;
    unresolved: number;
  };
  current_synonymous_taxon_ids: number | null;
  atlas_id: number | null;
  complete_species_count: number | null;
  wikipedia_url: string | null;
  matched_term: string;
  iconic_taxon_name: string;
  preferred_common_name?: string;
  conservation_status?: {
    id: number;
    place_id: number | null;
    source_id: number | null;
    user_id: number;
    authority: string;
    status: string;
    status_name: string;
    geoprivacy: string;
    iucn: number;
  };
};

type DefaultPhoto = {
  id: number;
  license_code: string | null;
  attribution: string;
  url: string;
  original_dimensions: {
    height: number;
    width: number;
  };
  flags: string[];
  attribution_name: string;
  square_url: string;
  medium_url: string;
};

const speciesRanks = ["species", "hybrid", "subspecies", "variety", "form"];

export function formatTaxonName(
  item: NormalizediNatTaxon,
  inputValue: string,
  includeMatchedTerm = true
) {
  let hasCommonName = true;
  let title = item.preferred_common_name;
  let titleAriaLabel = "taxon common name";
  let subtitle;
  let subtitleAriaLabel;

  if (title) {
    subtitle = item.name;
    subtitleAriaLabel = "taxon scientific name";
    if (
      includeMatchedTerm &&
      !title.toLowerCase().includes(inputValue.toLowerCase()) &&
      !subtitle.toLowerCase().includes(inputValue.toLowerCase())
    ) {
      title += ` (${item.matched_term})`;
    }
  } else {
    hasCommonName = false;
    title = item.name;
    titleAriaLabel = "taxon scientific name";
  }

  return { title, titleAriaLabel, subtitle, subtitleAriaLabel, hasCommonName };
}

export function renderAutocompleteTaxon(
  item: NormalizediNatTaxon,
  inputValue: string
): string {
  let { title, titleAriaLabel, subtitle, subtitleAriaLabel, hasCommonName } =
    formatTaxonName(item, inputValue);

  let html = `
  <div class="taxa-ac-option">
    <div class="thumbnail">`;

  if (item.default_photo) {
    html += `
      <img class="thumbnail" src="${item.default_photo}" alt="">`;
  }

  html += `
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="${titleAriaLabel}">${title}</span>
      <span>`;
  if (!speciesRanks.includes(item.rank) || !hasCommonName) {
    html += `
        <span class="rank" aria-label="taxon rank">${item.rank}</span>`;
  }
  if (hasCommonName) {
    html += `
        <span class="subtitle" aria-label="${subtitleAriaLabel}">${subtitle}</span>`;
  }
  html += `
      </span>
    </div>
  </div>`;

  return html;
}

export function processAutocompleteTaxa(
  response: iNatAutocompleteTaxaAPI
): NormalizediNatTaxon[] {
  let taxa = response.results.map((result) => {
    return {
      name: result.name,
      default_photo: result.default_photo?.square_url,
      preferred_common_name: result.preferred_common_name,
      matched_term: result.matched_term,
      rank: result.rank,
      id: result.id,
    };
  });

  return taxa;
}
