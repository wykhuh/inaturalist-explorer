# iNaturalist Explorer

## About

iNaturalist Explorer is a website that lets people explore iNaturalist data. This site adds some features that is missing from [iNaturalist Explore](https://www.inaturalist.org/observations) page. This site gets data from the iNaturalist API.

[Live Demo](https://inat-explorer.dataexplorers.info)

To get a list of features and instructions on how to use the features, visit the [about page](https://inat-explorer.dataexplorers.info/about/).

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
