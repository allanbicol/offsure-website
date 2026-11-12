# Offsure website

Redesign of offsure.com. Static site built with Astro, GSAP (ScrollTrigger, SplitText), Three.js and Lenis.

## Run it

```
npm install
npm run dev       # local development with live reload
npm run build     # production build into dist/
npm run preview   # serve the production build
```

## Where things live

- `src/data/site.js`: all copy, links, phone numbers, services and perks. Edit content here.
- `src/pages/`: one file per page.
- `src/components/`, `src/layouts/Base.astro`: nav, footer, call-to-action band, page shell.
- `src/styles/global.css`: the design system (colours, type scale, every component).
- `src/scripts/app.js`: interactions (smooth scroll, type reveals, clocks, process scene, role picker, form).
- `src/scripts/globe.js`: the hero globe.
- `scripts/build-globe-data.mjs`: regenerates the globe's land dots (`npm run globe-data`).
- `scripts/prepare-logos.mjs`: regenerates the logo variants from the original PNG (`npm run logos`).

## Things to know

- The contact form has no backend. It validates the fields and opens the visitor's email app
  with the message addressed to info@offsure.com. To post to a CRM instead, do it from a server
  endpoint so no API key ships to the browser.
- Open roles link out to the JobAdder board rather than being listed on the site.
- All motion is disabled for visitors who have "reduce motion" switched on.

## Preview deployment

Every push to `main` builds the site and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`). That build is served from a sub-path and marked `noindex`
so the preview stays out of search results. Internal links go through `url()` in
`src/data/site.js`, which is what lets the same code run at the root of offsure.com or
under a sub-path.
