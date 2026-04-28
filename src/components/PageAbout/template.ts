import { html } from "../../lib/component_utils";
import observations from "../../assets/images/observations.jpg";
import observations_map from "../../assets/images/observations_map.jpg";
import observations_animated_map from "../../assets/images/observations_animated_map.jpg";
import observations_annotations_observation_fields from "../../assets/images/observations_annotations_observation_fields.jpg";
import observations_grid from "../../assets/images/observations_grid.jpg";
import observations_table from "../../assets/images/observations_table.jpg";
import observations_media from "../../assets/images/observations_media.jpg";
import observations_graphs from "../../assets/images/observations_graphs.jpg";
import graphs_year from "../../assets/images/graphs_years.jpg";
import graphs_categories_annotations from "../../assets/images/graphs_categories_annotations.jpg";
import graphs_categories from "../../assets/images/graphs_categories.jpg";
import graphs_deselect_option from "../../assets/images/graphs_deselect_option.jpg";
import graphs_fruits_or_flowers from "../../assets/images/graphs_fruits_or_flowers.jpg";
import graphs_group_by_places from "../../assets/images/graphs_group_by_places.jpg";
import graphs_group_by_species from "../../assets/images/graphs_group_by_species.jpg";
import graphs_life_stage from "../../assets/images/graphs_life_stage.jpg";
import graphs_month_year from "../../assets/images/graphs_month_year.jpg";
import graphs_months from "../../assets/images/graphs_months.jpg";
import graphs_percents from "../../assets/images/graphs_percents.jpg";
import graphs_annotations_group_places_all from "../../assets/images/graphs_annotations_group_places_all.jpg";
import graphs_annotations_group_places_one from "../../assets/images/graphs_annotations_group_places_one.jpg";
import graphs_annotations_group_species_all from "../../assets/images/graphs_annotations_group_species_all.jpg";
import graphs_annotations_group_species_one from "../../assets/images/graphs_annotations_group_species_one.jpg";
import identifications from "../../assets/images/identifications.jpg";
import identifications_grid from "../../assets/images/identifications_grid.jpg";
import identifications_history from "../../assets/images/identifications_history.jpg";
import settings from "../../assets/images/settings.jpg";
import custom_boundaries from "../../assets/images/custom_boundaries.jpg";
import inat_links_observations from "../../assets/images/inat_links_observations.jpg";
import inat_links_identifications from "../../assets/images/inat_links_identifications.jpg";
import subspecies_results from "../../assets/images/subspecies_results.jpg";
import subspecies_filters from "../../assets/images/subspecies_filters.jpg";
import filters_annotations from "../../assets/images/filters_annotations.jpg";
import filters from "../../assets/images/filters.jpg";
import filters_beta from "../../assets/images/filters-beta.jpg";
import searchTypes from "../../assets/images/search_types.jpg";
import map_layers from "../../assets/images/map_layers.jpg";
import observation_fields from "../../assets/images/observation_fields.jpg";
import observation_fields_eating from "../../assets/images/observation_fields_eating.jpg";
import observation_fields_taxon from "../../assets/images/observation_fields_taxon.jpg";
import fields_displayed from "../../assets/images/fields_displayed.jpg";
import download_identifications from "../../assets/images/download-identifications.jpg";
import download_annotations from "../../assets/images/download-annotations.jpg";

export const template = html`
  <site-header></site-header>
  <main id="wrapper" class="flow page-about">
    <appstore-viewer></appstore-viewer>

    <h1>About</h1>
    <p>
      iNaturalist Explorer is a open-source website that lets people explore
      iNaturalist data. This site gets iNaturalist data from the iNaturalist
      API.
    </p>
    <ol class="list-compact">
    <li><a href="#features">Features</a></li>
    <li><a href="#instructions">Instructions</a>
        <ol>
          <li><a href="#observations">Observations</a>
            <ol>
              <li><a href="#observations-maps-options">Maps Options</a></li>
              <li><a href="#observations-graphs-options">Graphs Options</a></li>
              <li><a href="#observations-filters">Observations Filters</a></li>
            </ol>
          </li>
          <li><a href="#identifications">Identifications</a></li>
          <li><a href="#inaturalist-links">iNaturalist Links</a></li>
          <li><a href="#downloads">Downloads</a></li>
          <li><a href="#settings">Settings</a></li>
        </ol>
      </li>
      <li><a href="#technical-details">Technical Details</a></li>
    </ol>

    <h2 id="features">Features</h2>
    <p>Thirteen minute demo of the major features of this site.</p>
    <iframe width="560" height="315"
      src="https://www.youtube-nocookie.com/embed/cSqhd4jIDJU?si=UTXTzNKdnOd8-JWl"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen></iframe>

    <ol>
      <li id="multi-search">
        Search for multiple species, places, projects, and people. Here's a
        search for
        <a
          href="/?taxon_id=48662,56851&place_id=962,829&verifiable=true&spam=false"
          >monarchs and narrowleaf milkweed</a
        >
        in Los Angeles and San Diego.
        <img
          width="1000"
          height="700"
          loading="lazy"
          src="${observations}"
          alt="Monarch and narrowleaf milkweed observations in Los Angeles and San Diego."
        />
      </li>

      <li>View changes over space and time using animated maps and interactive charts</li>

      <li>Over 50 ways to filter observations</li>

      <li id="search-options">
        Search observations by Species, iNaturalist places, Projects, Observers
        (people who add observations), Identifiers (people who add
        identifications), and Annotators (people who add annotations). Also
        exclude items from search.
        <img
          width="500"
          height="830"
          loading="lazy"
          src="${searchTypes}"
          alt="dropdown search menu has options to search by species, places, projects, observers, identifiers, and annotators"
        />
      </li>

      <li>
        View dates, place, annotations and observations fields for each observation
        <img
          width="750"
          height="770"
          loading="lazy"
          src="${observations_annotations_observation_fields}"
          alt="Monarch observations"
        />
      </li>

      <li>Mobile friendly layout</li>

      <li>Pagination for observations, species, identifiers, and observers</li>
    </ol>


    <h2 id="instructions">Instructions</h2>


    <h3 id="observations">Observations</h3>
    <p>
      View observations as Map, Graphs, Grid, Media, or Table. Here are <a
        href="/?year=2025&taxon_id=48662&place_id=962&verifiable=true&spam=false"
        >monarch observations in Los Angeles in 2025.</a>
    </p>

    <app-accordion
      data-title="Instructions"
      data-content="<ol>
        <li>'Search for' should be 'Observed Species'</li>
        <li>Type 'monarch' and select item in the popup menu</li>
        <li>Change 'Search for' to 'iNaturalist Places'</li>
        <li>Type 'Los Angeles' and select item</li>
        <li>To delete any of the selected item, click the 'X'</li>
      </ol>"
      data-id="multiple-records"
    ></app-accordion>

    <figure>
      <figcaption><h4 id="observations-map">
        <h4 id="observations-maps">Map</h4></</figcaption>
      <img
        width="1000"
        height="560"
        loading="lazy"
        src="${observations_map}"
        alt="Map view of monarchs observations in Los Angeles"
      />
    </figure>

    <figure>
      <figcaption><h4 id="observations-graphs">Graphs</h4></figcaption>
      <img
        width="1000"
        height="700"
        loading="lazy"
        src="${observations_graphs}"
        alt="Graphs view of monarchs observations in Los Angeles"
      />
    </figure>

    <figure>
      <figcaption>
        <h4 id="observations-grid">Grid</h4>
        <p>One photo or sound is displayed for each observation</p>
      </figcaption>
      <img
        width="1000"
        height="790"
        loading="lazy"
        src="${observations_grid}"
        alt="Grid view of monarchs observations in Los Angeles"
      />
    </figure>

    <figure>
      <figcaption>
        <h4 id="observations-media">Media</h4>
        <p>All photos and sounds are displayed for each observation</p>
      </figcaption>
      <img
        width="1000"
        height="780"
        loading="lazy"
        src="${observations_media}"
        alt="Media view of monarchs observations in Los Angeles"
      />
    </figure>

    <figure>
      <figcaption>
        <h4 id="observations-table">Table</h4>
      </figcaption>
      <img
        width="1000"
        height="580"
        loading="lazy"
        src="${observations_table}"
        alt="Table view of monarchs observations in Los Angeles"
      />
    </figure>

    <h4 id="observations-maps-options">Maps Options</h4>
    <ol>
      <li id="map-layers">
        When users search for multiple species, each species are shown in a
        different color. The observations can be shown as grid, points, heatmap, and
        taxon range. The map can show zero, one, or multiple layers for each species.
        Here's a map for
        <a
          href="/?taxon_id=48662,56851&place_id=962,829&verifiable=true&spam=false"
          >monarchs and narrowleaf milkweed observations</a
        >
        in Los Angeles and San Diego.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click on layers button in the upper right of the map</li>
            <li>Click on the checkbox to turn on / turn off grid, points, heatmap,
            and taxon range layers.</li>
          </ol>"
          data-id="map-layers"
        ></app-accordion>
        <img
          width="1000"
          height="910"
          loading="lazy"
          src="${map_layers}"
          alt="Map of monarch and narrowleaf milkweed observations in Los Angeles and San Diego. Map  allows user to select grid, points, heatmap, and taxon range. "
        />
      </li>

      <li id="animated-maps">
        <figure>
          <figcaption>Users can choose to view a normal map or animated maps.
            Animated maps shows a series of maps over time. The animate map options
            are 'Month', 'Year', and 'Month and Year'.</figcaption>
          <app-accordion
            data-title="Instructions"
            data-content="<ol>
              <li>Select 'Month', 'Year', or 'Month and Year'</li>
              <li>Select the number of seconds to show each map. Default value is 5 seconds.</li>
              <li>Click the 'Play' button to start the animation.</li>
              <li>Click the 'Pause' button to pause the animation.</li>
            </ol>"
            data-id="bounding-box"
          ></app-accordion>
          <img
            width="1000"
            height="910"
            loading="lazy"
            src="${observations_animated_map}"
            alt="Animated map shows a series of maps of monarchs observations in Los Angeles, one map for each month."
          />
        </figure>
      </li>

      <li id="custom-bounding-box">
        Draw a rectangle to select observations within the rectangle
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click square button on the left side of the map</li>
            <li>Click on the map to set one corner the rectangle.</li>
            <li>Drag and click to select the second corner of the rectangle</li>
            <li>'Custom Boundary' will be shown in 'Places'. </li>
          </ol>"
          data-id="bounding-box"
        ></app-accordion>
        <img
          width="1000"
          height="550"
          loading="lazy"
          src="${custom_boundaries}"
          alt="Map of monarch and narrowleaf milkweed observations in a rectangular area in Los Angeles."
        />
      </li>
    </ol>

    <h4 id="observations-graphs-options">Graphs Options</h4>
    <ol>
      <li id="graphs-details">
        Graphs have many options.
        Here are <a href="/?place_id=962,829&verifiable=true&spam=false&per_page=24&view=observations_observations&subview=graph">
        all observations</a> in Los Angeles and San Diego.
        <figure>
          <figcaption>Graphs have different categories - 'Month', 'Year', and
            'Month and Year'. The values can be shown as observations counts
            or percents.</figcaption>
          <img
            width="1000"
            height="489"
            loading="lazy"
            src="${graphs_categories}"
            alt="Graph view showing the graphs categories menu options."
          />
        </figure>

        <figure>
          <figcaption> Default category option is Month. This graphs shows the
            number of observations for the 12 months. </figcaption>
          <img
            width="1000"
            height="490"
            loading="lazy"
            src="${graphs_month_year}"
            alt="Graph of monarchs and narrowleaf milkweed in Los Angeles and San Diego grouped by the 12 months, with observation counts along the y axis. "
          />
        </figure>

        <figure>
          <figcaption>This graphs shows observations for the 12 months as
            percents. Percent is number of observations per time period divided
            by total number of observations.</figcaption>
          <img
            width="1000"
            height="490"
            loading="lazy"
            src="${graphs_percents}"
            alt="Graph of monarchs and narrowleaf milkweed in Los Angeles and San Diego grouped by the 12 months, with percents as the y axis. "
          />
        </figure>

        <figure>
          <figcaption>This graphs shows the number of
            observations by year. By default, the graph shows the last
            ten years. Use the "Filters" > "Date Observed" > "Start Date" and "End Date"
             to adjust the dates. </figcaption>
          <img
            width="1000"
            height="490"
            loading="lazy"
            src="${graphs_year}"
            alt="Graph of monarchs and narrowleaf milkweed in Los Angeles and San Diego grouped by the last ten years. "
          />
        </figure>

        <figure>
          <figcaption>This graphs shows the
            number of observations by month and year.  By default, the graph
            shows every month for the last ten years. Use "Filters" >
            "Date Observed" > "Start Date" and "End Date" to adjust the dates. </figcaption>
          <img
            width="1000"
            height="480"
            loading="lazy"
            src="${graphs_months}"
            alt="Graph of monarchs and narrowleaf milkweed in Los Angeles and San Diego grouped by every month for the last ten years. "
          />
        </figure>
      </li>
      <li>
        <figure>
          <figcaption>If users search for two or more species, they have the
            option to group the graphs by species. This graph shows the <a
          href="/?taxon_id=48662,56851&place_id=962,829&verifiable=true&spam=false"
          >Monarchs and narrowleaf milkweed observations</a
        >
        in Los Angeles and San Diego. </figcaption>
          <img
            width="1000"
            height="540"
            loading="lazy"
            src="${graphs_group_by_species}"
            alt="Graph of monarchs and narrowleaf milkweed in Los Angeles and San Diego grouped by species. One line represents monarchs, one line represents milkweed."
          />
        </figure>
      </li>
      <li>
        <figure>
          <figcaption>If users search for two or more places, they have the
            option to group the graphs by places. This graph shows the
            observations in Los Angeles and San Diego.</figcaption>
          <img
            width="1000"
            height="520"
            loading="lazy"
            src="${graphs_group_by_places}"
            alt="Graph of monarchs and narrowleaf milkweed in Los Angeles and San Diego grouped by places. One line represents Los Angeles, one line represents San Diego."
          />
        </figure>

        <figure>
          <figcaption>If users click on the labels in the legend, the line
             will be hidden or shown. This graph only shows the observations in San Diego.</figcaption>
          <img
            width="1000"
            height="510"
            loading="lazy"
            src="${graphs_deselect_option}"
            alt="Graph of monarchs and narrowleaf milkweed in Los Angeles and San Diego grouped by places.  One line represents San Diego. Line for Los Angeles is hidden."
          />
        </figure>
      </li>

      <li>
        <figure>
          <figcaption>When users search for species, selected annotations will appear
            in graph category menu. Animals have 'Life Stage',
            'Evidence of Presence', 'Alive or Dead', and 'Sex'. Plants
            have 'Sex', 'Leaves', and 'Flowers and Fruits'. </figcaption>
          <img
            width="1000"
            height="520"
            loading="lazy"
            src="${graphs_categories_annotations}"
            alt="Graph of monarchs and narrowleaf milkweed in Los Angeles and San Diego  showing the annotations categories."
          />
        </figure>

        <figure>
          <figcaption>Here's a graph of monarch observations with Life Stage
            annotations.</figcaption>
          <img
            width="1000"
            height="530"
            loading="lazy"
            src="${graphs_life_stage}"
            alt="Graph of life stages annotations for monarchs in Los Angeles and San Diego. There are separate lines for adult, larva, pupa, egg, and not annotated "
          />
        </figure>

        <figure>
          <figcaption>Here's a graph of narrowleaf milkweed observations with
            Flowers and Fruits annotations.</figcaption>
          <img
            width="1000"
            height="530"
            loading="lazy"
            src="${graphs_fruits_or_flowers}"
            alt="Graph of Fruits and Flowers annotations for narrowleaf milkweed in Los Angeles and San Diego. There are separate lines for flowers, flower buds, fruits or seeds, no fruits or flowers, and unannotated "
          />
        </figure>
      </li>
      <li>Users can compare annotations for multiple species and multiple places.
        Here are <a href="/?taxon_id=75602,56851&place_id=829,962&verifiable=true&spam=false&per_page=24">
          observations of Narrowleaf Milkweed and Tropical Milkweed</a> in Los Angeles and San Diego.
        <figure>
          <figcaption>Here's a graph of all Fruits and Flowers annotations,
            grouped by Species. The color represent species, the different line
            types represent annotation values.</figcaption>
          <img
            width="1000"
            height="560"
            loading="lazy"
            src="${graphs_annotations_group_species_all}"
            alt="Graph of all Fruits and Flowers annotations for narrowleaf milkweed and tropical milkweed in Los Angeles and San Diego. There are separate lines for flowers, flower buds, fruits or seeds, no fruits or flowers, and not annotated for both Narrowleaf Milkweed and Tropical Milkweed. "
          />
        </figure>
        <figure>
          <figcaption>Users can hide lines by clicking on the values in the legend.
            Here's a graph of only Flowers annotations for narrowleaf milkweed
            and tropical milkweed .</figcaption>
          <img
            width="1000"
            height="550"
            loading="lazy"
            src="${graphs_annotations_group_species_one}"
            alt="Graph of only Flowers annotations for narrowleaf milkweed and tropical milkweed in Los Angeles and San Diego. There are separate lines for flowers  for both Narrowleaf Milkweed and Tropical Milkweed. "
          />
        </figure>

        <figure>
          <figcaption>Here are graphs of all Fruits and Flowers annotations for
            narrowleaf milkweed and tropical milkweed, grouped by Places.
            There are separate graphs for each species. The colors represent places,
            the different line types represent annotation values.</figcaption>
          <img
            width="1000"
            height="1030"
            loading="lazy"
            src="${graphs_annotations_group_places_all}"
            alt="Graph of all Fruits and Flowers annotations for narrowleaf milkweed and tropical milkweed in Los Angeles and San Diego. There are separate graphs for each species. Each graph has separate lines for flowers, flower buds, fruits or seeds, no fruits or flowers, and not annotated for both Los Angeles and San Diego. "
          />
        </figure>
        <figure>
          <figcaption> Here are graphs of only Flowers annotations, grouped by
            places for narrowleaf milkweed and tropical milkweed.</figcaption>
          <img
            width="1000"
            height="1030"
            loading="lazy"
            src="${graphs_annotations_group_places_one}"
            alt="Graphs of only Flowers annotations for narrowleaf milkweed and tropical milkweed in Los Angeles and San Diego. There are separate graphs for each species. There are separate lines for flowers  for both Los Angeles and San Diego. "
          />
        </figure>
      </li>
    </ol>

    <h4 id="observations-filters">Observations Filters</h4>
    <ol>
      <li id="filters">
        There are over 50 options to filter the observations. The filters are
        grouped by categories.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click 'Filters' button. A popup modal will appear.</li>
            <li>The filters are grouped by tabs and topics. Click on 'Observations',
            'Species', etc to change tabs.</li>
            <li>Click or select the filters you want. Hover over the circled
            question mark to learn about each filter. </li>
            <li>Select one or more items from  rectangular menus that
            show multiple items such as 'Quality Grade' and 'License'. To select
            multiple items, command click (Mac) or ctrl click (Windows), and
            select one item at a item. Another option is
            to click and drag the cursor over multiple items.</li>
            <li>The counts on at the top of the modal will be updated as filters
            are added or removed.</li>
            <li>The selected filters will be shown at the top of modal as green
            rounded rectangles. </li>
            <li> Click on 'X' to delete one filter. To delete all
            filters, scroll to bottom of modal and click 'Reset' </li>
          </ol>"
          data-id="map-layers"
        ></app-accordion>

        <img
          width="1000"
          height="500"
          loading="lazy"
          src="${filters}"
          alt="Available filters"
        />
      </li>

      <li id="annotations-filters">
        Filter by annotations
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click 'Filters' button.</li>
            <li>Click 'Annotations' tab</li>
            <li>iNaturalist has seven types of annotations: Sex, Alive or Dead,
            Established, Flowers and Fruits, Leaves, Life Stage, Evidence of
            Presence. For each type, there are three ways to filter the annotation.
            <ol>
            <li>The first option lets search for observations that match the
            annotation types and values (term_id + term_value_id, term_id + without_term_value_id).
            Click on the first checkbox, and the 'include values'
            and 'exclude values' menus become active. You can look for observations
            that are adult. Click 'Life Stage', and
            that will return all observations  that have 'Life State' annotation.
            Select 'Adult' from 'include values' to return all adult observations.
            You can also look for observations that are not adult.
            Click 'Life Stage', and select 'Adult' from  'exclude values'. </li>

            <li>The second option return observations match the annotation types
            and values and observations that do not have the annotation types
            filled out (term_id_or_unknown + term_value_id, term_id_or_unknown + without_term_value_id).
            Click on the 'Observations with...' checkbox, and the 'include values'
            and 'exclude values' menus become active. You can look
            for observations that are not adult and observations don't have 'Life Stage'
            filled out. Click 'Observations with Life Stage annotations, and
            observations missing this annotation', and select 'Adult' from
            'exclude values'. <p>Note: <a href='https://forum.inaturalist.org/t/term-id-or-unknown-query-parameter-not-working-with-term-value-id/52510/7'>There is a bug</a>
            with 'Observations with...' and 'includes values'
            (term_id_or_unknown & term_value_id)</p></li>

            <li>The third option lets you search for observations that do not have
            annotation types (without_term_id). Click the 'Exclude all...' checkbox.
            You can look for observations that do not have
            'Life Stage' annotation by clicking on 'Exclude all
            Life Stage annotations'</li>

            </ol>
            </li>
          </ol>"
          data-id="annotations"
        ></app-accordion>
        <img
          width="1000"
          height="600"
          loading="lazy"
          src="${filters_annotations}"
          alt="Available annotations filters"
        />
      </li>

      <li id="observation-fields-filters">
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
          width="1000"
          height="310"
          loading="lazy"
          src="${observation_fields}"
          alt="Available observation fields filters"
        />
        <figure>
          <figcaption>Observation field popup menu for 'eating'</figcaption>
          <img
            width="500"
            height="220"
            loading="lazy"
            src="${observation_fields_eating}"
            alt="pop menu showing a list of observations fields that match the term 'eating'"
          />
        </figure>
        <figure>
          <figcaption>
            Observation field value for 'eating' are species. Type in
            species name, and a popup menu will show list of matching species.
          </figcaption>
          <img
            width="500"
            height="220"
            loading="lazy"
            src="${observation_fields_taxon}"
            alt="pop menu showing a list of species that match 'ray'"
          />
        </figure>
      </li>

      <li id="subspecies-list">
        Use rank filters to display list of taxa with rank lower than species
        such as subspecies and variety. In this example, we use to 'Rank'
        filter to select
        <a
          href="/?taxon_id=55412&colors=%234477aa&verifiable=true&spam=false&rank=infrahybrid,subspecies,variety&per_page=24&view=observations_species"
        >
          infrahybrid, subspecies, and variety ranks</a
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
          width="1000"
          height="440"
          loading="lazy"
          src="${subspecies_filters}"
          alt="Select subspecies ranks using the filters"
        />
        <img
          width="1000"
          height="420"
          loading="lazy"
          src="${subspecies_results}"
          alt="Subspecies shown in species tab"
        />
      </li>

      <li id="beta-filters">
        <p>Beta Features for features not supported by the iNaturalist API.</p>
        <p>Hide observations with annotations or observation fields</p>
          <app-accordion
            data-title="Instructions"
            data-content="<ol>
            <li>Click on 'Hide observations with annotations' to hide observations with annotations</li>
            <li>Click on 'Hide observations with observation fields' to hide observations with observation fields.</li>
            <li>Click both to hide observations with annotations or observation fields</li>
          </ol>"
            data-id="bounding-box"
          ></app-accordion>
          <img
            width="1000"
            height="480"
            loading="lazy"
            src="${filters_beta}"
            alt=""
          />
        </p>
      </li>
    </ol>

    <h3 id="identifications">Identifications</h3>
    <ol>
      <li id="identifications-subviews">
        View identifications as map, grid, or history. Here are the identifications for <a
          href="/identifications/?taxon_id=75602,56851&place_id=829,962"
          >monarchs and narrowleaf milkweed</a> in Los Angeles and San Diego.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Click 'Identifications' in the top menu</li>
            <li>Select 'Identified Species', and enter 'Monarch'.</li>
            <li>Select 'Identified Species', and enter 'Narrowleaf Milkweed'.</li>
            <li>Select 'iNaturalist Places', and enter 'Los Angeles'.</li>
            <li>Select 'iNaturalist Places', and enter 'San Diego'.</li>
          </ol>"
          data-id="identifications-subviews"
        ></app-accordion>

        <figure>
          <figcaption><h4>Map</h4></figcaption>
          <img
            width="1000"
            height="550"
            loading="lazy"
            src="${identifications}"
            alt="Monarch and narrowleaf milkweed identifications in Los Angeles and San Diego."
          />
        </figure>

        <figure>
          <figcaption>
            <h4>Grid</h4>
            <p>Show one identification per observation</p>
          </figcaption>
          <img
            width="1000"
            height="400"
            loading="lazy"
            src="${identifications_grid}"
            alt="Grid view of monarchs identifications in Los Angeles"
          />
        </figure>
        <figure>
          <figcaption>
            <h4>History</h4>
            <p>Show all identifications per observation</p>
          </figcaption>
          <img
            width="1000"
            height="600"
            loading="lazy"
            src="${identifications_history}"
            alt="History view of monarchs identifications in Los Angeles"
          />
        </figure>
      </li>
    </ol>

    <h3 id="inaturalist-links">iNaturalist Links</h3>
    <ol>
      <li id="inat-links-observations">
        Users can use the search queries created on this site for the iNaturalist
        Explore, Identify, and Export pages by clicking on the links in the
        iNaturalist Links menu. Users can also get the link for the iNaturalist Observations API.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Use search and filters to select the observations you want</li>
            <li>Click on the box with arrow icon to show the 'iNaturalist links' menu</li>
            <li>Click 'Explore page', 'Identify page', or 'Export page' to go to
           corresponding page on the iNaturalist site.</li>
           <li>Click  copy icon for 'iNaturalist Observations API' to copy the link for  the
            iNaturalist observation API.</li>
          </ol>"
          data-id="inat-links"
        ></app-accordion>
        <img
          width="500"
          height="660"
          loading="lazy"
          src="${inat_links_observations}"
          alt="Links in the observations iNaturalist Links menu"
        />
      </li>
      <li id="inat-links-identifications">
        Users can get the link for the iNaturalist Identifications API.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Use search and filters to select the observations you want</li>
            <li>Click on the box with arrow icon to show the 'iNaturalist links' menu</li>
            <li>Click copy icon for 'iNaturalist Identifications API' to copy the link for  the
             iNaturalist identifications API.</li>
          </ol>"
          data-id="inat-links"
        ></app-accordion>
        <img
          width="500"
          height="380"
          loading="lazy"
          src="${inat_links_identifications}"
          alt="Links in the identifications iNaturalist Links menu"
        />
      </li>
    </ol>
    <h3 id="downloads">Downloads</h3>
    <ol>
      <li id="download-annotations">
        Users can download annotations. This is a work in progress.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Use search and filters to select the observations annotations you want</li>
            <li>Click on the down arrow icon to show the 'Download' menu</li>
            <li>Enter filename.</li>
            <li>Click on 'Download annotations' button
          </ol>"
          data-id="inat-links"
        ></app-accordion>
        <img
          width="500"
          height="880"
          loading="lazy"
          src="${download_annotations}"
          alt="Download  annotations menu"
        />
      </li>
      <li id="download-identifications">
        Users can download identifications. This is a work in progress.
        <app-accordion
          data-title="Instructions"
          data-content="<ol>
            <li>Use search and filters to select the identifications you want</li>
            <li>Click on the down arrow icon to show the 'Download' menu</li>
            <li>Enter filename.</li>
            <li>Click on 'Download identifications' button
          </ol>"
          data-id="inat-links"
        ></app-accordion>
        <img
          width="500"
          height="850"
          loading="lazy"
          src="${download_identifications}"
          alt="Download identifications menu"
        />
      </li>
    </ol>
    <h3 id="settings">Settings</h3>
    <ol>
      <li>Users can customize the appearance of the website.
        <img
        width="500"
        height="820"
        loading="lazy"
        src="${settings}"
        alt="Settings menu with common names/scientific names order, common names language, and records per page"
      />
      </li>
      <li id="name-order">
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
      </li>

      <li id="name-language">
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

      <li id="per-page">
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

      <li id="display-fields">
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
          width="1000"
          height="500"
          loading="lazy"
          src="${fields_displayed}"
          alt="click checkbox to set  which fields are displayed"
        />
      </li>
    </ol>

    <h2 id="technical-details">Technical Details</h2>
    <p>
      This site grabs data from the iNaturalist API. I used a combination of
      <a href="https://api.inaturalist.org/v1/docs/">v1</a>
      and <a href="https://api.inaturalist.org/v2/docs/">v2</a> API endpoints.
    </p>
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
