import { html } from "../../lib/component_utils";
import socal from "../../assets/images/search_socal_monarchs.png";
import identifications from "../../assets/images/identifications.png";
import grid from "../../assets/images/grid_subview.jpg";
import table from "../../assets/images/table_subview.jpg";
import media from "../../assets/images/media_subview.jpg";
import annotations from "../../assets/images/annotations.png";
import filters from "../../assets/images/filters.png";
import searchUsers from "../../assets/images/search_users.jpg";

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
        <a
          href="/?taxon_id=48662,56851&place_id=962,829&colors=%234477aa,%2366ccee&verifiable=true&spam=false"
          >Search for multiple</a
        >
        species, places, projects, and people
      </li>
      <li>
        Show iNaturalist maps as grid, points, heatmap and taxon range
        <img
          src="${socal}"
          alt="Map of monarch and narrowleaf milkweed observations in Los Angeles and San Diego. Map  allows user to select grid, points, heatmap, and taxon range. "
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
        <a
          href="/?taxon_id=48662&place_id=962&colors=%234477aa&verifiable=true&spam=false&year=2025"
          >View observations</a
        >
        by grid, media (all photos and audio are displayed), or table
      </li>
      <li>
        View annotations on grid and media
        <img src="${grid}" alt="Grid view of monarchs in Los Angeles" />
        <img src="${media}" alt="Media view of monarchs in Los Angeles" />
        <img src="${table}" alt="Table view of monarchs in Los Angeles" />
      </li>
      <li>Add more filters</li>
      <li>
        Group the filters by categories
        <img src="${filters}" alt="Available filters" />
      </li>
      <li>
        Filter by annotations
        <img src="${annotations}" alt="Available annotations filters" />
      </li>
      <li>
        Search by Observers (people who add observations), Identifiers(people
        who add identifications), and Annotators (people who add annotations)
        <img
          src="${searchUsers}"
          alt="dropdown search menu has options to search by species, places, projects, observers, identifiers, and annotators"
        />
      </li>
      <li>Mobile friendly layout</li>
      <li>Pagination for observations, species, identifiers, and observers</li>
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

    <h2>Techinical Details</h2>
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
