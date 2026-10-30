// Gera os dados geográficos da Margem Equatorial usados na cena, todos na mesma grade (60 px por grau):
//  src/three/margin-mask.json     terra firme (Natural Earth 1:50m, via world-atlas, domínio público)
//  src/three/margin-regions.json  estados (IBGE, API de malhas) e bacias marítimas (ANP, GeoMaps)
// Uso: npm run mask
import { readFileSync, writeFileSync } from 'node:fs'
import { feature } from 'topojson-client'

const LON0 = -60, LON1 = -32, LAT0 = -10.5, LAT1 = 7, PPD = 60
const W = (LON1 - LON0) * PPD, H = (LAT1 - LAT0) * PPD
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url)))

/** Anéis de um conjunto de geometrias que tocam a janela. */
function ringsOf(geoms) {
  const rings = []
  for (const g of geoms) {
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []
    for (const poly of polys) for (const ring of poly) {
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
      for (const [lo, la] of ring) { minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la); minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo) }
      if (maxLat < LAT0 || minLat > LAT1 || maxLon < LON0 - 30 || minLon > LON1 + 30) continue
      rings.push(ring)
    }
  }
  return rings
}

/** Rasteriza por varredura de linhas (par/ímpar) e chama fill(y, x0, x1) para cada trecho preenchido. */
function scan(rings, fill) {
  for (let y = 0; y < H; y++) {
    const lat = LAT1 - (y + 0.5) / PPD
    const xs = []
    for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x1, y1] = ring[j], [x2, y2] = ring[i]
      if ((y1 > lat) !== (y2 > lat)) xs.push(x1 + ((lat - y1) * (x2 - x1)) / (y2 - y1))
    }
    xs.sort((a, b) => a - b)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const s = Math.max(0, Math.round((xs[k] - LON0) * PPD)), e = Math.min(W, Math.round((xs[k + 1] - LON0) * PPD))
      if (e > s) fill(y, s, e)
    }
  }
}

/** Codifica uma grade de ids (0 = vazio) em trechos por linha: [início, fim, id, ...]. */
function rle(grid) {
  const rows = []
  for (let y = 0; y < H; y++) {
    const r = []
    let x = 0
    while (x < W) {
      const id = grid[y * W + x]
      let e = x + 1
      while (e < W && grid[y * W + e] === id) e++
      if (id) r.push(x, e, id)
      x = e
    }
    rows.push(r)
  }
  return rows
}

/* terra firme */
const topo = read('../node_modules/world-atlas/land-50m.json')
const landRings = ringsOf(feature(topo, topo.objects.land).features.map(f => f.geometry))
const landRows = Array.from({ length: H }, () => [])
let landPx = 0
scan(landRings, (y, s, e) => { landRows[y].push(s, e); landPx += e - s })
writeFileSync(new URL('../src/three/margin-mask.json', import.meta.url), JSON.stringify({ lon0: LON0, lat1: LAT1, ppd: PPD, w: W, h: H, rows: landRows }))

/* estados (código IBGE) e bacias (índice 1..5, de oeste para leste) */
const states = read('./data/estados-ibge.json')
const stateGrid = new Uint8Array(W * H)
for (const f of states.features) scan(ringsOf([f.geometry]), (y, s, e) => stateGrid.fill(f.properties.uf, y * W + s, y * W + e))

const BASINS = ['Foz do Amazonas', 'Pará-Maranhão', 'Barreirinhas', 'Ceará', 'Potiguar']
const basinsFC = read('./data/bacias-margem-anp.json')
const basinGrid = new Uint8Array(W * H)
const centers = []
for (const f of basinsFC.features) {
  const id = BASINS.indexOf(f.properties.nome) + 1
  let sx = 0, sy = 0, n = 0
  scan(ringsOf([f.geometry]), (y, s, e) => { basinGrid.fill(id, y * W + s, y * W + e); for (let x = s; x < e; x += 4) { sx += x; sy += y; n++ } })
  centers[id - 1] = { nome: f.properties.nome, lon: +(LON0 + sx / n / PPD).toFixed(3), lat: +(LAT1 - sy / n / PPD).toFixed(3) }
}
writeFileSync(new URL('../src/three/margin-regions.json', import.meta.url), JSON.stringify({ states: rle(stateGrid), basins: rle(basinGrid), centers }))
console.log(`terra ${(landPx / (W * H) * 100).toFixed(1)}% · bacias: ${centers.map(c => `${c.nome} (${c.lat}, ${c.lon})`).join('; ')}`)
