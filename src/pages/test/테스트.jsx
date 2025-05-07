/* BukhansanBaegundaePathMap.jsx
   --------------------------------
   React‑Leaflet map that draws the entire trail network
   and highlights the Dijkstra shortest path from
   vertex 220 (START) to vertex   1 (END).
   The runtime‑error patch ↓ is in the <Marker> loop. */

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import proj4 from "proj4";
import "leaflet/dist/leaflet.css";

/* --------------------------------------------------------------------------
 * 좌표계 정의 — ESRI:102080 (KGD2002 / Unified CS)
 * ------------------------------------------------------------------------*/
proj4.defs(
  "ESRI:102080",
  "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"
);

/* --------------------------------------------------------------------------
 * Leaflet 기본 아이콘(1.9.x) 경로를 CORS 문제 없는 CDN 으로 교체
 * ------------------------------------------------------------------------*/
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* --------------------------------------------------------------------------
 * 좌표 변환 헬퍼 (ESRI:102080  ➜  WGS84) — 캐시 포함
 * ------------------------------------------------------------------------*/
const createTransformer = () => {
  const cache = new Map();
  return function transform(coords) {
    if (Array.isArray(coords) && typeof coords[0] === "number") {
      const key = coords + "";
      if (cache.has(key)) return cache.get(key);
      const [x, y] = coords;
      const [lon, lat] = proj4("ESRI:102080", "EPSG:4326", [x, y]);
      const result = [lat, lon];            // Leaflet = [lat, lon]
      cache.set(key, result);
      return result;
    }
    if (Array.isArray(coords)) return coords.map(transform);
    return coords;
  };
};

/* --------------------------------------------------------------------------
 * 최소 Priority Queue — 다익스트라용
 * ------------------------------------------------------------------------*/
class PriorityQueue {
  constructor() { this._heap = []; }
  push(item, priority) {
    this._heap.push({ item, priority });
    this._siftUp();
  }
  pop() {
    if (!this._heap.length) return null;
    const topItem = this._heap[0].item;
    const bottom  = this._heap.pop();
    if (this._heap.length) {
      this._heap[0] = bottom;
      this._siftDown();
    }
    return topItem;
  }
  isEmpty() { return this._heap.length === 0; }
  _siftUp() {
    let i = this._heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this._heap[i].priority >= this._heap[p].priority) break;
      [this._heap[i], this._heap[p]] = [this._heap[p], this._heap[i]];
      i = p;
    }
  }
  _siftDown() {
    let i = 0, len = this._heap.length;
    while (true) {
      const l = (i << 1) + 1, r = (i << 1) + 2;
      let s = i;
      if (l < len && this._heap[l].priority < this._heap[s].priority) s = l;
      if (r < len && this._heap[r].priority < this._heap[s].priority) s = r;
      if (s === i) break;
      [this._heap[i], this._heap[s]] = [this._heap[s], this._heap[i]];
      i = s;
    }
  }
}

/* --------------------------------------------------------------------------
 * 그래프 빌드 (인접 리스트) — edges / vertices JSON 이용
 * ------------------------------------------------------------------------*/
const buildGraph = (edges, vertices) => {
  const edgeDict       = Object.fromEntries(edges.map(e => [e.id, e]));
  const edgeToVertices = {};

  vertices.forEach(v =>
    (v.connected_edges || []).forEach(eid => {
      (edgeToVertices[eid] ||= []).push(v.id);
    })
  );

  const graph = Object.fromEntries(vertices.map(v => [v.id, []]));

  Object.entries(edgeToVertices).forEach(([eid, vs]) => {
    if (vs.length !== 2) return;
    const [v1, v2] = vs;
    const weight   = edgeDict[eid].length || 1;
    graph[v1].push({ neighbor: v2, edgeId: +eid, weight });
    graph[v2].push({ neighbor: v1, edgeId: +eid, weight });
  });

  return { graph, edgeDict };
};

/* --------------------------------------------------------------------------
 * 다익스트라 최단 경로
 * ------------------------------------------------------------------------*/
const dijkstra = (graph, start, end) => {
  const dist  = {}, prev = {}, taken = {};
  Object.keys(graph).forEach(v => { dist[v] = Infinity; prev[v] = null; taken[v] = null; });
  dist[start] = 0;

  const pq = new PriorityQueue();
  pq.push({ v: start, d: 0 }, 0);

  while (!pq.isEmpty()) {
    const { v, d } = pq.pop();
    if (v === end) break;
    if (d > dist[v]) continue;

    graph[v].forEach(({ neighbor, edgeId, weight }) => {
      const nd = d + weight;
      if (nd < dist[neighbor]) {
        dist[neighbor] = nd;
        prev[neighbor] = v;
        taken[neighbor] = edgeId;
        pq.push({ v: neighbor, d: nd }, nd);
      }
    });
  }

  if (prev[end] == null) return { vertices: [], edges: [] };

  const verts = [], eds = [];
  for (let cur = end; cur !== start; cur = prev[cur]) {
    verts.push(cur);
    eds.push(taken[cur]);
  }
  verts.push(start);
  return { vertices: verts.reverse(), edges: eds.reverse() };
};

/* --------------------------------------------------------------------------
 * 사용자 정의 아이콘 (시작 / 끝)
 * ------------------------------------------------------------------------*/
const startIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x-green.png",
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
});

const endIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x-red.png",
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
});

/* --------------------------------------------------------------------------
 * React 컴포넌트
 * ------------------------------------------------------------------------*/
const START = 220;  // 시작 정점 ID
const END   =   1;  // 도착 정점 ID

const BukhansanBaegundaePathMap = () => {
  const [edges,    setEdges]    = useState(null);
  const [vertices, setVertices] = useState(null);

  /* --- JSON fetch (once) ---------------------------------------------- */
  useEffect(() => {
    const ctl = new AbortController();
    (async () => {
      try {
        const [e, v] = await Promise.all([
          fetch("/processed_data/북한산_백운대_processed.json", { signal: ctl.signal }).then(r => r.json()),
          fetch("/processed_data/북한산_백운대_vertex.json",   { signal: ctl.signal }).then(r => r.json()),
        ]);
        setEdges(e);
        setVertices(v);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    })();
    return () => ctl.abort();
  }, []);

  const transform = useMemo(createTransformer, []);

  /* --- 지도 데이터 계산 -------------------------------------------------- */
  const { allLines, routeLines, markers, center } = useMemo(() => {
    if (!edges || !vertices)
      return { allLines: [], routeLines: [], markers: [], center: [37.65, 126.99] };

    const { graph, edgeDict }   = buildGraph(edges, vertices);
    const { vertices: rv, edges: re } = dijkstra(graph, START, END);

    const allLines  = edges.map(e => transform(e.coordinates));
    const routeLines = re.map(id => transform(edgeDict[id].coordinates));

    const coords = vertices.map(v => transform(v.coordinates));
    const lat = coords.reduce((s, [la]) => s + la, 0) / coords.length;
    const lon = coords.reduce((s, [, lo]) => s + lo, 0) / coords.length;

    const markers = rv.map((vid, i) => {
      const v = vertices.find(x => x.id === vid);
      return {
        id: vid,
        order: i,
        position: transform(v.coordinates),
        label: `#${i + 1} · Vertex ${vid}`,
        isStart: vid === START,
        isEnd:   vid === END,
      };
    });

    return { allLines, routeLines, markers, center: [lat, lon] };
  }, [edges, vertices, transform]);

  /* -------------------------------------------------------------------- */
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
      preferCanvas
    >
      {/* OSM 베이스 맵 */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 전체 등산로 */}
      {allLines.map((line, i) => (
        <Polyline key={i} positions={line} weight={2} opacity={0.5} />
      ))}

      {/* 최단 경로 (Dijkstra) */}
      {routeLines.map((line, i) => (
        <Polyline key={`route-${i}`} positions={line} weight={6} color="red" opacity={0.9} />
      ))}

      {/* 경로상의 정점 표시 */}
      {markers.map(m => (
        <Marker
          key={m.id}
          position={m.position}
          {...(
            m.isStart ? { icon: startIcon }
          : m.isEnd   ? { icon: endIcon   }
                      : {}               // ⬅︎ give NOTHING for intermediates
          )}
        >
          <Popup>{m.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default BukhansanBaegundaePathMap;
