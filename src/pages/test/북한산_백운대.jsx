import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import proj4 from 'proj4';
import 'leaflet/dist/leaflet.css';

// Define ESRI:102080 projection (adjust the proj4 definition to match your source)
proj4.defs("ESRI:102080", "+proj=tmerc +lat_0=38 +lon_0=127 +k=0.9996 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs");

const transformCoords = (coords) => {
    if (Array.isArray(coords) && typeof coords[0] === 'number') {
        const [x, y] = coords;
        const [lon, lat] = proj4("ESRI:102080", "EPSG:4326", [x, y]);
        return [lat, lon];
    } else if (Array.isArray(coords)) {
        return coords.map(transformCoords);
    }
    return coords;
};

class PriorityQueue {
    constructor() { this._heap = []; }
    push(item, priority) { this._heap.push({ item, priority }); this._siftUp(); }
    pop() {
        if (!this._heap.length) return null;
        const top = this._heap[0];
        const bottom = this._heap.pop();
        if (this._heap.length) {
        this._heap[0] = bottom;
        this._siftDown();
        }
        return top.item;
    }
    _siftUp() {
        let idx = this._heap.length - 1;
        while (idx > 0) {
        const parent = (idx - 1) >> 1;
        if (this._heap[idx].priority >= this._heap[parent].priority) break;
        [this._heap[idx], this._heap[parent]] = [this._heap[parent], this._heap[idx]];
        idx = parent;
        }
    }
    _siftDown() {
        let idx = 0;
        const length = this._heap.length;
        while (true) {
        let left = (idx << 1) + 1;
        let right = (idx << 1) + 2;
        let smallest = idx;
        if (left < length && this._heap[left].priority < this._heap[smallest].priority) {
            smallest = left;
        }
        if (right < length && this._heap[right].priority < this._heap[smallest].priority) {
            smallest = right;
        }
        if (smallest === idx) break;
        [this._heap[idx], this._heap[smallest]] = [this._heap[smallest], this._heap[idx]];
        idx = smallest;
        }
    }
    isEmpty() { return this._heap.length === 0; }
}

const dijkstra = (graph, start, end) => {
    const distances = {}, previous = {}, edgeTaken = {};
    Object.keys(graph).forEach(v => { distances[v] = Infinity; previous[v] = null; edgeTaken[v] = null; });
    distances[start] = 0;
    const pq = new PriorityQueue();
    pq.push({ vertex: start, distance: 0 }, 0);

    while (!pq.isEmpty()) {
        const { vertex, distance } = pq.pop();
        if (vertex === end) break;
        if (distance > distances[vertex]) continue;
        graph[vertex].forEach(({ neighbor, edgeId, weight }) => {
        const d = distance + weight;
        if (d < distances[neighbor]) {
            distances[neighbor] = d;
            previous[neighbor] = vertex;
            edgeTaken[neighbor] = edgeId;
            pq.push({ vertex: neighbor, distance: d }, d);
        }
        });
    }

    if (previous[end] === null) return { path: [], route: [] };
    const path = [], route = [];
    let cur = end;
    while (cur !== start) {
        path.push(cur);
        route.push(edgeTaken[cur]);
        cur = previous[cur];
    }
    path.push(start);

    return { path: path.reverse(), route: route.reverse() };
};

const 북한산_백운대 = () => {
const [allEdges, setAllEdges] = useState([]);
const [routeEdges, setRouteEdges] = useState([]);
const [markers, setMarkers] = useState([]);
const [center, setCenter] = useState([0, 0]);

useEffect(() => {
    const fetchData = async () => {
    const data = await fetch('/processed_data/북한산_백운대_processed.json').then(res => res.json());
    const vertices = await fetch('/processed_data/북한산_백운대_vertex.json').then(res => res.json());

    // Edge dictionary
    const edgeDict = {};
    data.forEach(item => { edgeDict[item.id] = item; });

    // Edge to vertices map
    const edgeToVertices = {};
    vertices.forEach(v => {
        (v.connected_edges || []).forEach(eid => {
        if (!edgeToVertices[eid]) edgeToVertices[eid] = [];
        edgeToVertices[eid].push(v.id);
        });
    });

    // Graph
    const graph = {};
    vertices.forEach(v => { graph[v.id] = []; });
    Object.entries(edgeToVertices).forEach(([eid, verts]) => {
        if (verts.length === 2 && edgeDict[eid]) {
        const [v1, v2] = verts;
        const weight = edgeDict[eid].length || 1;
        graph[v1].push({ neighbor: v2, edgeId: eid, weight });
        graph[v2].push({ neighbor: v1, edgeId: eid, weight });
        }
    });

    // Dijkstra
    const start = 220, end = 1;
    const { path, route } = dijkstra(graph, start, end);

    // Center
    const allCoords = vertices.map(v => transformCoords(v.coordinates));
    const lats = allCoords.map(([lat]) => lat);
    const lons = allCoords.map(([, lon]) => lon);
    setCenter([lats.reduce((a, b) => a + b, 0) / lats.length, lons.reduce((a, b) => a + b, 0) / lons.length]);

    // All edges
    setAllEdges(data.map(item => transformCoords(item.coordinates)));

    // Route edges
    setRouteEdges(route.map(eid => transformCoords(edgeDict[eid].coordinates)));

    // Markers
    setMarkers(path.map(vid => {
        const v = vertices.find(x => x.id === vid);
        const [lat, lon] = transformCoords(v.coordinates);
        return { position: [lat, lon], label: `Vertex ${vid}` };
    }));
    };
    fetchData();
}, []);

return (
    <MapContainer center={center} zoom={13} style={{ height: '100vh', width: '100%' }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {allEdges.map((line, i) => <Polyline key={i} positions={line} color="lightgray" weight={3} />)}
    {routeEdges.map((line, i) => <Polyline key={`route-${i}`} positions={line} color="red" weight={5} />)}
    {markers.map((m, i) => (
        <Marker key={i} position={m.position}>
        <Popup>{m.label}</Popup>
        </Marker>
    ))}
    </MapContainer>
);
};

export default 북한산_백운대;
