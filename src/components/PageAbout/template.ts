import { html } from "../../lib/component_utils";
import observations from "../../assets/images/observations.jpg";
import identifications from "../../assets/images/identifications.jpg";
import grid from "../../assets/images/observations_grid.jpg";
import table from "../../assets/images/observations_table.jpg";
import media from "../../assets/images/observations_media.jpg";
import grid_ident from "../../assets/images/identifications_grid.jpg";
import history_ident from "../../assets/images/identifications_history.jpg";
import settings from "../../assets/images/settings.jpg";
import custom_boundaries from "../../assets/images/custom_boundaries.jpg";
import download from "../../assets/images/download.jpg";

import annotations from "../../assets/images/annotations.jpg";
import filters from "../../assets/images/filters.jpg";
import searchUsers from "../../assets/images/search_types.jpg";
import map_layers from "../../assets/images/map_layers.jpg";

export const template = html`
  <site-header></site-header>
  <main id="wrapper" class="flow page-about">
    <appstore-viewer></appstore-viewer>

    <h1>About</h1>
    <p>
      iNaturalist Explorer is a opensource website that lets people explore
      iNaturalist data. This site adds some features that
      <a href="https://www.inaturalist.org/observations"
        >iNaturalist Explore Observations</a
      >
      page does not have.
    </p>
    <h2>Features</h2>
    <ol>
      <li>
        Search for multiple species, places, projects, and people. Here's a
        search for
        <a
          href="/?taxon_id=48662,56851&place_id=962,829&colors=%234477aa,%2366ccee&verifiable=true&spam=false"
          >monarchs and narrowleaf milkweed</a
        >
        in Los Angeles and San Diego.
        <img
          src="${observations}"
          alt="Monarch and narrowleaf milkweed observations in Los Angeles and San Diego."
        />
      </li>
      <li>
        View both observations and
        <a
          href="/identifications/?observation_taxon_id=48662,56851&place_id=962,829&colors=%234477aa,%2366ccee&verifiable=true&spam=false"
          >identifications</a
        >
        <img
          src="${identifications}"
          alt="Monarch and narrowleaf milkweed identifications in Los Angeles and San Diego."
        />
      </li>
      <li>
        Show iNaturalist maps as grid, points, heatmap and taxon range
        <img
          src="${map_layers}"
          alt="Map of monarch and narrowleaf milkweed observations in Los Angeles and San Diego. Map  allows user to select grid, points, heatmap, and taxon range. "
        />
      </li>

      <li>
        <a
          href="/?taxon_id=48662&place_id=962&colors=%234477aa&verifiable=true&spam=false&year=2025"
          >View observations</a
        >
        as map, grid (one photo is displayed), media (all photos and audio are
        displayed), or table
      </li>
      <li>
        View annotations on grid and media
        <figure>
          <figcaption>Grid view</figcaption>
          <img
            src="${grid}"
            alt="Grid view of monarchs observations in Los Angeles"
          />
        </figure>
        <figure>
          <figcaption>Media view</figcaption>
          <img
            src="${media}"
            alt="Media view of monarchs observations in Los Angeles"
          />
        </figure>
        <figure>
          <figcaption>Table view</figcaption>
          <img
            src="${table}"
            alt="Table view of monarchs observations in Los Angeles"
          />
        </figure>
      </li>
      <li>
        <a
          href="/identifications/?taxon_id=48662&place_id=962&colors=%234477aa&verifiable=true&spam=false&year=2025"
          >View identifications</a
        >
        as map, grid (one identification per observation), or history (all
        identifications per observation)
        <figure>
          <figcaption>Grid view</figcaption>
          <img
            src="${grid_ident}"
            alt="Grid view of monarchs identifications in Los Angeles"
          />
        </figure>
        <figure>
          <figcaption>History view</figcaption>
          <img
            src="${history_ident}"
            alt="History view of monarchs identifications in Los Angeles"
          />
        </figure>
      </li>
      <li>Add more filters options</li>
      <li>
        Group the filters by categories
        <img src="${filters}" alt="Available filters" />
      </li>
      <li>
        Filter by annotations
        <img src="${annotations}" alt="Available annotations filters" />
      </li>
      <li>
        Search observations by Species, iNaturalist places, Projects, Observers
        (people who add observations), Identifiers(people who add
        identifications), and Annotators (people who add annotations). Also
        exclude items from search.
        <img
          src="${searchUsers}"
          alt="dropdown search menu has options to search by species, places, projects, observers, identifiers, and annotators"
        />
      </li>
      <li>
        Draw a rectangle to select observations within the rectangle
        <img src="${custom_boundaries}" alt="" />
      </li>

      <li>Mobile friendly layout</li>
      <li>Pagination for observations, species, identifiers, and observers</li>
      <li>Set the order for species common names and Latin scientific names</li>
      <li>Set the language for the species common names</li>
      <li>
        Set the number of records show per page
        <img
          src="${settings}"
          alt="Settings menu with common names/scientific names order, common names language, and records per page"
        />
      </li>
      <li>
        Download the observations as a CSV by clicking a link to the iNaturalist
        "Export Observations" page.
        <img
          src="${download}"
          alt="Download menu to download the observations"
        />
      </li>
      <li>
        <p>
          This site gets data from the iNaturalist API. As a result, the urls
          for the site are compatible with iNaturalist API. You can copy and
          paste the query params (stuff after the ?) from the site, and use them
          for the iNaturalist API. The only properties not compatible are
          colors, view, and subview.
        </p>

        <p>
          For instance, this is the URL query params for all monarchs and narrow
          leaf milkweed in Los Angeles and San Diego.
        </p>
        <p>
          <code
            >taxon_id=48662,56851&place_id=962,829&colors=%234477aa,%2366ccee&verifiable=true&spam=false</code
          >
        </p>
        <p>
          You can copy the query params and use them for the
          <a
            href="https://api.inaturalist.org/v1/observations?taxon_id=48662,56851&place_id=962,829&colors=%234477aa,%2366ccee&verifiable=true&spam=false"
            >iNaturalist "observations" API</a
          >
        </p>
      </li>
    </ol>

    <h2>Technical Details</h2>
    <p>
      This static site is built using JavaScript/TypeScript, custom web
      components, CSS, and HTML. I wanted to use the built-in features of
      JavaScript, CSS, HTML, and keep third party libraries to a minimum. This
      site uses Vite, TypeScript and three libraries (<a
        href="https://leafletjs.com/"
        >Leaflet</a
      >,
      <a href="https://tarekraafat.github.io/autoComplete.js/"
        >Autocomplete.js</a
      >, and
      <a href="https://github.com/bramus/js-pagination-sequence"
        >Pagination Sequence</a
      >) to create site. This is the most complex project I've built without a
      website framework or CSS framework. I also wanted to keep costs low as
      possible so this is a static site that is hosted for free on Cloudflare
      Pages.
    </p>
    <p>
      I did not use AI prompts or vibe coding to build this site. I wanted to
      learn some new skills, such as custom web components, so I did some
      research, learned a lot, and applied what I learned.
    </p>
    <ul>
      <li>
        <a href="https://github.com/wykhuh/inaturalist-explorer">Github Repo</a>
      </li>
    </ul>
  </main>
`;
