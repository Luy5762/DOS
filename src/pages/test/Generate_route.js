#!/usr/bin/env node
/* scripts/generateRoute.js
-------------------------------------------------
사용:  node scripts/generateRoute.js 220 1
- START, END 인자는 옵션. 없으면 기본값 사용.
- public/route/ 폴더가 없으면 자동 생성.
*/




import fs from "fs";
import path from "path";
import proj4 from "proj4";

// ────────────────────────────────────────────────
// 설정 ---------------------------------------------------------------------------
const DATA_DIR   = "./public/processed_data";
const ROUTE_DIR  = "./public/route";
const EDGE_FILE  = "북한산_백운대_processed.json";
const VERT_FILE  = "북한산_백운대_vertex.json";

// 기본 시작/끝 정점
const DEFAULT_START = 220;
const DEFAULT_END   =   1;
// ────────────────────────────────────────────────

// ■ 1. 좌표계 정의
proj4.defs(
    "ESRI:102080",
    "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"
);
const toWGS84 = coords => {
    if (Array.isArray(coords) && typeof coords[0] === "number") {
        const [lon, lat] = proj4("ESRI:102080", "EPSG:4326", coords);
        return [lat, lon];                  // Leaflet 순서
    }
    return coords.map(toWGS84);
};

// ■ 2. 우선순위 큐
class PriorityQueue {
    _h = [];
    push(item, pri) {
        this._h.push({item, pri});
        this._up();
    }
    pop() {
        if (!this._h.length) return null;
        const it = this._h[0].item;
        const b  = this._h.pop();
        if (this._h.length) { this._h[0] = b; this._dn(); }
        return it;
    }
    _up() {
        let i = this._h.length - 1;
        while (i) {
        const p = (i - 1) >> 1;
        if (this._h[i].pri >= this._h[p].pri) break;
        [this._h[i], this._h[p]] = [this._h[p], this._h[i]];
        i = p;
        }
    }
    _dn() {
        let i = 0, n = this._h.length;
        for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let s = i;
        if (l < n && this._h[l].pri < this._h[s].pri) s = l;
        if (r < n && this._h[r].pri < this._h[s].pri) s = r;
        if (s === i) break;
        [this._h[i], this._h[s]] = [this._h[s], this._h[i]];
        i = s;
        }
    }
}

// ■ 3. 그래프 & 다익스트라
const buildGraph = (edges, vertices) => {
    const eDict = Object.fromEntries(edges.map(e => [e.id, e]));
    const e2v   = {};
    vertices.forEach(v => (v.connected_edges || []).forEach(eid =>
        (e2v[eid] ||= []).push(v.id)
    ));
    const g = Object.fromEntries(vertices.map(v => [v.id, []]));
    Object.entries(e2v).forEach(([eid, vs]) => {
        if (vs.length !== 2) return;
        const [v1, v2] = vs;
        const w = eDict[eid].length || 1;
        g[v1].push({n:v2, e:+eid, w});
        g[v2].push({n:v1, e:+eid, w});
    });
    return {g, eDict};
};

const dijkstra = (g, s, t) => {
    const dist={}, prev={}, took={};
    Object.keys(g).forEach(v=>{dist[v]=Infinity; prev[v]=null; took[v]=null;});
    dist[s]=0;
    const pq=new PriorityQueue();
    pq.push(s,0);
    while (!pq._h.length===0) {
        const v = pq.pop();
        if (v===t) break;
        g[v].forEach(({n,e,w})=>{
        const nd = dist[v]+w;
        if (nd<dist[n]){dist[n]=nd; prev[n]=v; took[n]=e; pq.push(n,nd);}
        });
    }
    if (prev[t]==null) return {verts:[], edges:[]};
    const verts=[], edges=[];
    for(let c=t;c!==s;c=prev[c]){verts.push(c); edges.push(took[c]);}
    verts.push(s);
    return {verts:verts.reverse(), edges:edges.reverse()};
};

// ■ 4. 메인 로직
async function main() {
    const [rawStart, rawEnd] = process.argv.slice(2);
    const START = Number(rawStart) || DEFAULT_START;
    const END   = Number(rawEnd)   || DEFAULT_END;

    const edges    = JSON.parse(fs.readFileSync(path.join(DATA_DIR, EDGE_FILE)));
    const vertices = JSON.parse(fs.readFileSync(path.join(DATA_DIR, VERT_FILE)));

    const {g, eDict} = buildGraph(edges, vertices);
    const {verts, edges:routeEdgeIds} = dijkstra(g, START, END);

    if (!verts.length) {
        console.error("경로가 없습니다.");
        process.exit(1);
    }

    // 저장용 객체
    const route = {
        meta: {start: START, end: END, created: new Date().toISOString()},
        vertices: verts,
        lines: routeEdgeIds.map(id => toWGS84(eDict[id].coordinates))
    };

    fs.mkdirSync(ROUTE_DIR, {recursive:true});
    const outFile = path.join(ROUTE_DIR, `path_${START}_${END}.json`);
    fs.writeFileSync(outFile, JSON.stringify(route, null, 2));
    console.log(`✔ 경로 저장 완료 → ${outFile}`);
}

main().catch(err=>{console.error(err); process.exit(1);});
