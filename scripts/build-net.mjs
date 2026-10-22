/**
 * Baut src/data/netz.json : Knoten (scripts/data/nodes.json) und Kanten (scripts/data/edges.txt) mit
 * Länge und Fahrzeit je Kante. Quelle der Distanzen: OSRM über OpenStreetMap
 * (© OpenStreetMap-Mitwirkende, Lizenz ODbL 1.0, https://www.openstreetmap.org/copyright).
 * Rejouable : node scripts/build-net.mjs [--osrm=https://router.project-osrm.org]
 * Cache : scripts/data/osrm-cache.json (eine Abfrage je Kante, eine Sekunde Pause, Nutzungsregeln des Demo-Servers).
 */
import fs from 'node:fs';
const base = (process.argv.find((a) => a.startsWith('--osrm=')) ?? '--osrm=https://router.project-osrm.org').slice(7);
const nodes = JSON.parse(fs.readFileSync('scripts/data/nodes.json', 'utf8')).nodes;
const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
const edges = fs.readFileSync('scripts/data/edges.txt', 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/));
const cacheFile = 'scripts/data/osrm-cache.json';
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = [];
for (const [a, b, ...opt] of edges) {
  const force = opt.find((o) => /^[A-Z]{2}$/.test(o));
  const via = opt.find((o) => o.startsWith('via='))?.slice(4);
  const A = byId[a], B = byId[b];
  if (!A || !B) throw new Error(`Knoten unbekannt: ${a} ${b}`);
  const land = force ? [force] : A.c.filter((c) => B.c.includes(c));
  if (land.length !== 1) throw new Error(`Kante ${a}-${b}: kein eindeutiges Land (${land})`);
  const key = `${a}|${b}${via ? '|' + via : ''}`;
  if (!cache[key]) {
    const url = `${base}/route/v1/driving/${A.lon},${A.lat};${via ? via + ';' : ''}${B.lon},${B.lat}?overview=false`;
    const r = await fetch(url); const j = await r.json();
    if (j.code !== 'Ok') throw new Error(`OSRM ${key}: ${j.code}`);
    cache[key] = { m: Math.round(j.routes[0].distance), s: Math.round(j.routes[0].duration) };
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 0));
    await sleep(1000);
  }
  out.push({ a, b, c: land[0], km: Math.round(cache[key].m / 100) / 10, min: Math.round(cache[key].s / 60) });
}
const netz = { quelle: 'OSRM / OpenStreetMap (ODbL 1.0)', erstellt: new Date().toISOString().slice(0, 10), nodes, edges: out };
fs.writeFileSync('src/data/netz.json', JSON.stringify(netz));
console.log(`${nodes.length} Knoten, ${out.length} Kanten → src/data/netz.json`);
