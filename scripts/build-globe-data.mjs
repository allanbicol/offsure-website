// Builds the dot-matrix land data for the hero globe.
// Samples a latitude/longitude grid and keeps the points that fall on land.
// Run: npm run globe-data
import fs from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'));
const land = feature(topo, topo.objects.land);

const ROW_STEP = 1.5;      // degrees between latitude rows
const DOTS_AT_EQUATOR = 240;
const out = [];
for (let lat = -58; lat <= 84; lat += ROW_STEP) {
  const n = Math.max(1, Math.round(Math.cos((lat * Math.PI) / 180) * DOTS_AT_EQUATOR));
  for (let i = 0; i < n; i++) {
    const lon = -180 + (360 * (i + 0.5)) / n;
    if (geoContains(land, [lon, lat])) out.push(Math.round(lat * 100), Math.round(lon * 100));
  }
}
fs.writeFileSync('src/data/land-dots.json', JSON.stringify(out));
console.log('land dots:', out.length / 2);
