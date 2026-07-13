# LSH Catchment Map

Interactive UK and Ireland catchment map for LSH regional contacts.

## Run locally

```bash
pnpm install --lockfile=false
pnpm dev
```

## Build

```bash
pnpm build
```

## GitHub Pages

This repo includes a static GitHub Pages build that is published by GitHub
Actions whenever `main` is updated.

```bash
pnpm build:pages
```

Expected Pages URL:

```text
https://charliecoughlin1.github.io/LSH_Catchment_Map/
```

Recommended iframe embed:

```html
<iframe
  src="https://charliecoughlin1.github.io/LSH_Catchment_Map/"
  title="LSH regional catchment map"
  style="width: 100%; height: 900px; border: 0;"
  loading="lazy"
></iframe>
```

## Content

Contacts and regional groupings are held in `app/map-data.ts`.

The map uses ONS International Territorial Level 1 January 2025 BGC boundaries for the UK regions. East and West Midlands map to the single LSH Midlands catchment. East of England and South East map to the LSH South East catchment because the supplied contact list places Cambridge under South East. Only Northern Ireland is selectable for the Ireland contact group.

## Brand

DIN Pro is loaded from the same web font CDN pattern used by the Central London Submarkets repo. The colour palette follows the supplied LSH online/office guide, with `#cc2030` as the primary red.

## Website Embed

The app is intentionally map-only: no navigation, footer, explanatory hero, or marketing copy. It can be embedded as a standalone page or iframe wherever the company site needs the regional contact map.

## Data Sources

- Office for National Statistics: International Territorial Level 1 (January 2025) Boundaries UK BGC.
- Natural Earth: 1:50m Admin 0 Countries, used for the Republic of Ireland outline.
