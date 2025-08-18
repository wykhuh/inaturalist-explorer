export type NormalizediNatTaxon = {
  name: string;
  default_photo: string;
  preferred_common_name: string;
  matched_term: string;
  rank: string;
  id: number;
  text: string;
  value: number;
};

type iNatAutocompleteTaxa = {
  total_results: number;
  page: number;
  per_page: number;
  results: iNatAutocompleteResult[];
};

type iNatAutocompleteResult = {
  id: number;
  rank: string;
  name: string;
  default_photo: {
    square_url: string;
  };
  observations_count: number;
  matched_term: string;
  preferred_common_name: string;
};

export function renderAutocompleteTaxon(
  item: NormalizediNatTaxon,
  inputValue: string
): string {
  let commonName = item.preferred_common_name;

  if (!inputValue) {
    return commonName;
  }

  if (
    commonName &&
    inputValue &&
    !commonName.toLowerCase().includes(inputValue.toLowerCase())
  ) {
    commonName += ` (${item.matched_term})`;
  }

  let html = `
  <div class="taxa-ac-option">
    <div class="thumbnail">`;

  if (item.default_photo) {
    html += `
      <img class="thumbnail" src = "${item.default_photo}" >`;
  }

  html += `
    </div>
    <div class="taxon-name">
      <span class="common-name" aria-label="taxon common name">${commonName}</span>
      <span>`;
  if (!["species", "variety", "form", "subspecies"].includes(item.rank)) {
    html += `
        <span class="rank" aria-label="taxon rank">${item.rank}</span>`;
  }
  html += `
        <span class="scientific-name" aria-label="taxon scientific name">${item.name}</span>
      </span>
    </div>
  </div>`;

  return html;
}

export function processAutocompleteTaxa(
  response: iNatAutocompleteTaxa
): NormalizediNatTaxon[] {
  let taxa = response.results.map((result) => {
    return {
      name: result.name,
      default_photo: result.default_photo?.square_url,
      preferred_common_name: result.preferred_common_name,
      matched_term: result.matched_term,
      rank: result.rank,
      id: result.id,
      text: result.matched_term,
      value: result.id,
    };
  });

  return taxa;
}
