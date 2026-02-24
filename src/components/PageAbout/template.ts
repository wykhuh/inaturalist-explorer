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
import inat_links from "../../assets/images/inat_links.jpg";
import subspecies_results from "../../assets/images/subspecies_results.jpg";
import subspecies_filters from "../../assets/images/subspecies_filters.jpg";
import annotations from "../../assets/images/annotations.jpg";
import filters from "../../assets/images/filters.jpg";
import searchUsers from "../../assets/images/search_types.jpg";
import map_layers from "../../assets/images/map_layers.jpg";
import observation_fields from "../../assets/images/observation_fields.jpg";
import observation_fields_eating from "../../assets/images/observation_fields_eating.jpg";
import observation_fields_taxon from "../../assets/images/observation_fields_taxon.jpg";
import fields_displayed from "../../assets/images/fields_displayed.jpg";

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
        Search for multiple species, places, projects, and people. Here's a
        search for
        <a
          href="/?taxon_id=48662,56851&place_id=962,829&colors=%234477aa,%2366ccee&verifiable=true&spam=false"
          >monarchs and narrowleaf milkweed</a
        >
        in Los Angeles and San Diego.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>'Search for' should be 'Observed Species'</li>
            <li>Type 'monarch' and select item in the popup menu</li>
            <li>Type 'narrowleaf milkweed' and select item</li>
            <li>Change 'Search for' to 'iNaturalist Places'</li>
            <li>Type 'Los Angeles' and select item</li>
            <li>Type 'San Diego' and select item</li>
            <li>If you want to delete any of the selected item, click the 'X'</li>
          </ol>"
          data-id="multiple-records"
        ></app-accordion>
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
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click 'Identifications' in the top menu</li>
          </ol>"
          data-id="view-identifications"
        ></app-accordion>
        <img
          src="${identifications}"
          alt="Monarch and narrowleaf milkweed identifications in Los Angeles and San Diego."
        />
      </li>

      <li>
        Show iNaturalist maps as grid, points, heatmap and taxon range
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click on layers button in the upper right of the map</li>
            <li>Click on the checkbox to turn on / turn off map layers.</li>
          </ol>"
          data-id="map-layers"
        ></app-accordion>
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
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click on 'Map', 'Grid', 'Media', or 'Table' button.</li>
          </ol>"
          data-id="change-subview"
        ></app-accordion>
      </li>

      <li>
        View annotations and observations fields on grid and media

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
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click 'Identifications' in the top menu</li>
            <li>Click on 'Map', 'Grid', or 'History' button.</li>
          </ol>"
          data-id="identifications-subviews"
        ></app-accordion>
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

      <li>
        Add over 50 options to filter the observations
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click 'Filters' button. A popup modal will appear.</li>
            <li>The filters are grouped by tabs and topics. Click on 'Observations',
            'Species', etc to change tabs.</li>
            <li>Click or select the filters you want. Hover over the circled
            question mark to learn about each filter. </li>
            <li>You can swlect one or more items from  rectanglar menus that
            show multiple items such as 'Quality Grade' and 'License'. To select
            multiple items you command click (Mac) or ctrl click (Windows), and
            select one item at a item. You can also click and drag to select
            multiple items.</li>
            <li>When you select a filter, the counts on at the top of the modal
            will be updated.</li>
            <li>The selected filters will be shown at the top of modal as green
            rounded rectangles. </li>
            <li> Click on 'X' to delete one filter. If you want to delete all
            filters, scroll to bottom of modal and click 'Reset' </li>
          </ol>"
          data-id="map-layers"
        ></app-accordion>
      </li>

      <li>
        Group the filters by categories
        <img src="${filters}" alt="Available filters" />
      </li>

      <li>
        Filter by annotations
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click 'Filters' button.</li>
            <li>Click 'Annotations' tab</li>
            <li>Click one of the checkboxes to enable the corresponding selection menu</li>
            <li>Select one or more items in the selection menu</li>
          </ol>"
          data-id="annotations"
        ></app-accordion>
        <img src="${annotations}" alt="Available annotations filters" />
      </li>

      <li>
        Filter by observation fields
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click 'Filters' button.</li>
            <li>Click 'Observation Fields' tab</li>
            <li>Type in observation field and select the item from the popup menu</li>
            <li>If you want to fill in a value for the observation field, type in the value.</li>
            <li>For some observation fields such as eating, the value is the name of species.
            Type in the species name, and select the corresponding item from the popup menu.</li>
          </ol>"
          data-id="observation-fields"
        ></app-accordion>
        <img
          src="${observation_fields}"
          alt="Available observation fields filters"
        />
        <figure>
          <figcaption>Observation field popup menu for 'eating'</figcaption>
          <img
            src="${observation_fields_eating}"
            alt="pop menu showing a list of observations fields that match the term 'eating'"
          />
        </figure>
        <figure>
          <figcaption>
            Observation field 'eating' has species for the value. Type in
            species name, and a popup menu will show list of matching species.
          </figcaption>
          <img
            src="${observation_fields_taxon}"
            alt="pop menu showing a list of species that match 'ray'"
          />
        </figure>
      </li>

      <li>
        Draw a rectangle to select observations within the rectangle
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click square button on the upper left of the map</li>
            <li>Click on the map to set one corner the rectangle.</li>
            <li>Drag and click to select the second corner of the rectangle</li>
            <li>'Custom Boundary' will be shown in 'Places'. </li>
          </ol>"
          data-id="bounding-box"
        ></app-accordion>
        <img src="${custom_boundaries}" alt="" />
      </li>

      <li>
        Display list of taxa with rank lower than species such as subspecies and
        variety. In this example, we use to 'Rank' filter to select
        <a
          href="/?taxon_id=55412&colors=%234477aa&verifiable=true&spam=false&rank=infrahybrid,subspecies,variety&per_page=24&view=observations_species"
        >
          infrahybrid,subspecies, and variety ranks</a
        >
        for Radishes (Genus Raphanus).
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>set 'Search for' to 'Observed Species'</li>
            <li>Type in 'radishes'</li>
            <li>Click 'Species' in the dark header bar to see list of species.</li>
            <li>Click 'Filters' button</li>
            <li>Click 'Species' in the popup modal</li>
            <li>Go to 'Rank', 'Rank'. Select one or more of the ranks. In this
            example, we selected 'infrahybrid','subspecies','variety'.</li>
          </ol>"
          data-id="subspecies"
        ></app-accordion>
        <img
          src="${subspecies_filters}"
          alt="Select subspecies ranks using the filters"
        />
        <img
          src="${subspecies_results}"
          alt="Supspecies shown in species tab"
        />
      </li>

      <li>Mobile friendly layout</li>

      <li>Pagination for observations, species, identifiers, and observers</li>

      <li>
        Set the order for species common names and Latin scientific names
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click on the gear icon to show the 'Settings' menu</li>
            <li>Use the dropdown for 'Common / Scientific Name Display Order' to set
            the order of the common and scientific taxa names.</li>
          </ol>"
          data-id="name-order"
        ></app-accordion>
        <img
          src="${settings}"
          alt="Settings menu with common names/scientific names order, common names language, and records per page"
        />
      </li>

      <li>
        Set the language for the species common names
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click on the gear icon to show the 'Settings' menu</li>
            <li>Use the dropdown for 'Common Name Language' to set
            the language for the species common names.</li>
          </ol>"
          data-id="name-order"
        ></app-accordion>
      </li>

      <li>
        Set the number of records show per page
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click on the gear icon to show the 'Settings' menu</li>
            <li>Use the dropdown for 'Records per Page' to set
            the number of items to show.</li>
          </ol>"
          data-id="per-page"
        ></app-accordion>
      </li>

      <li>
        Set the fields that are displayed for the observations grid and media.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click on the gear icon to show the 'Settings' menu</li>
            <li>Click the checkboxes for  'Fields Display' to set
            which fields are displayed.</li>
          </ol>"
          data-id="display-fields"
        ></app-accordion>
        <img
          src="${fields_displayed}"
          alt="click checkbox to set  which fields are displayed"
        />
      </li>

      <li>
        Users can use the search queries created on this site for the iNaturlist
        Explore, Identify, and Export pages by clicking on the links in the
        iNaturalist Links menu.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Use search and filters to select the observations you want</li>
            <li>Click on the box with arrow icon to show the 'iNaturalist links' menu</li>
            <li>Click 'Explore page', 'Identify page', or 'Export page' to go to
           corresponding page on the iNaturalist site. Click 'Observations API' to view
           the data retrieved from the iNaturalist observation API.</li>
          </ol>"
          data-id="inat-links"
        ></app-accordion>
        <img src="${inat_links}" alt="Links in the iNaturalist Links menu" />
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
