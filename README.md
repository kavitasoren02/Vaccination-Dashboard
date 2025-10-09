# India Vaccination Dashboard

An interactive dashboard built with React, TypeScript, and Tailwind CSS that visualizes state-wise vaccination data for India using:
- SVG India map (from `@svg-maps/india`) with gradient legend
- Linked horizontal bar chart
- Interactive donut (pie) chart
- Responsive multi-series comparison line chart with a multi-select state picker

No UI libraries are used—only Tailwind utility classes.

## Features
- Choropleth SVG map with hover tooltip and synchronized bar highlight
- Bar chart highlighting on hover (linked to map hovering)
- Donut chart with hoverable slices and tooltip
- Comparison line chart with multi-select dropdown (choose states to compare)
- Fully responsive charts and layout (flex/grid + SVG)
- Data sourced from a local JSON file

## Where to View
- In this workspace: open the Next.js route at `/dashboard` to see the full layout (top nav, side nav, tiles, and cards).
- Data: `vaccination-dashboard/src/data/india-vaccination.json`

## Customize Data
Edit the JSON at:
- `vaccination-dashboard/src/data/india-vaccination.json`
  - Update totals per state and optionally daily series for the comparison chart.
  - Keep state codes stable so charts and the map remain in sync.

## Key Files
- Visualizations
  - `vaccination-dashboard/src/components/india-map.tsx`
  - `vaccination-dashboard/src/components/vaccination-bar-chart.tsx`
  - `vaccination-dashboard/src/components/vaccination-pie-chart.tsx`
  - `vaccination-dashboard/src/components/comparison-line-chart.tsx`
- Data and Types
  - `vaccination-dashboard/src/data/india-vaccination.json`
  - `types/svg-maps__india.d.ts` — TypeScript declarations for `@svg-maps/india`

## TypeScript Note
If you build locally and see a TS error for `@svg-maps/india`, this project includes an ambient module declaration:
- `types/svg-maps__india.d.ts`
This resolves the “no declaration file” build error without installing additional packages.
