# iNaturalist Explorer

## About

iNaturalist Explorer is a website that lets people explore iNaturalist data. This site adds some features that is missing from [iNaturalist Explore Observations](https://www.inaturalist.org/observations) page. This site gets data from the iNaturalist API.

[Live Demo](https://wykhuh.github.io/inaturalist-explorer/)

## Features

- Search for multiple species, places, projects, and people
- Add more filters
- Group the filters by categories
- Mobile friendly layout
- Pagination for observations, species, identifiers, and observers
- Show iNaturalist maps as grid, points, heatmap and taxon range
- The urls are compatible with iNaturalist API. You can copy and
  paste the query params (stuff after the ?) from the site, and use
  them for the iNaturalist API.

## Tech Stack

This static site is built using TypeScript, CSS, and HTML. I tried to use the built-in features of JavaScript, CSS, HTML, and keep third party libraries to a minimum. I used [Leaflet](https://leafletjs.com/) for maps, [Autocomplete.js](https://tarekraafat.github.io/autoComplete.js/) for search autocomplete, and [pagination-sequence](https://github.com/bramus/js-pagination-sequence) to figure help with pagination.

For development, this app uses [Vite.js](https://vite.dev/) for the build tool, [Vitest](https://vitest.dev/) and [Playwright](https://playwright.dev) for testing, and [Prettier](https://prettier.io) for formatting.

## Install

Download the repo.

Install libraries.

```bash
npm install
```

Start Vite.js server

```bash
npm run dev
```
