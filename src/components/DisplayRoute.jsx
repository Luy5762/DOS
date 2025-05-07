import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import proj4 from "proj4";
import "leaflet/dist/leaflet.css";

// ─────────── 좌표계 정의 ───────────
proj4.defs(
  "ESRI:102080",
  "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"
);

// ─────────── Leaflet 기본 아이콘 경로 수정 ───────────
L.Icon.Default.mergeOptions({
  // 기본 마커에 gray 아이콘만 사용 (그림자 제거)
  iconRetinaUrl: "/icons/grey-icon.png",
  iconUrl:       "/icons/grey-icon.png",
});

// ─────────── 시작·끝·웨이포인트 아이콘 (그림자 제거, 크기 35×35로 조정) ───────────
const ICON_SIZE = [35, 35];
const ICON_ANCHOR = [17,30]
const POPUP_ANCHOR = [1,-29]

const startIcon = new L.Icon({
  iconUrl:     "/icons/green-icon.png",
  iconSize:    ICON_SIZE,
  iconAnchor:  ICON_ANCHOR,
  popupAnchor: POPUP_ANCHOR,
});

const endIcon = new L.Icon({
  iconUrl:     "/icons/red-icon.png",
  iconSize:    ICON_SIZE,
  iconAnchor:  ICON_ANCHOR,
  popupAnchor: POPUP_ANCHOR,
});

const waypointIcon = new L.Icon({
  iconUrl:     "/icons/blue-icon.png",
  iconSize:    ICON_SIZE,
  iconAnchor:  ICON_ANCHOR,
  popupAnchor: POPUP_ANCHOR,
});

// ─────────── 난이도별 색상 매핑 ───────────
const DIFFICULTY_COLORS = {
  0: "green",
  1: "yellow",
  2: "red",
  3: "black",
};

// ─────────── 등산로 전체를 그리려면 원본 edges 로드 ───────────
const EDGE_JSON = "/processed_data/북한산_백운대_processed.json";

// ─────────── 맵 재중앙 컴포넌트 ───────────
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center);
  }, [center, map]);
  return null;
};

// ─────────── 메인 컴포넌트 ───────────
const BukhansanBaegundaeRouteMap = ({ start = 100, end = 200 }) => {
  const [edges, setEdges] = useState(null);
  const [route, setRoute] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);

  // 데이터 fetch
  useEffect(() => {
    const ctl = new AbortController();
    (async () => {
      try {
        const allEdges = await fetch(EDGE_JSON, { signal: ctl.signal }).then(r => r.json());
        setEdges(allEdges);

        const routeJson = `/route/path_${start}_${end}.json`;
        const data = await fetch(routeJson, { signal: ctl.signal }).then(r => r.json());
        setRoute(data);

        if (data.lines && data.lines.length > 0) {
          const startCoord = data.lines[0][0];
          const lastLine = data.lines[data.lines.length - 1];
          const endCoord = lastLine[lastLine.length - 1];
          setMapCenter([
            (startCoord[0] + endCoord[0]) / 2,
            (startCoord[1] + endCoord[1]) / 2,
          ]);
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    })();
    return () => ctl.abort();
  }, [start, end]);

  // 좌표 변환 캐싱
  const transform = useMemo(() => {
    const cache = new Map();
    return coords => {
      if (Array.isArray(coords) && typeof coords[0] === "number") {
        const key = coords.join(",");
        if (cache.has(key)) return cache.get(key);
        const [lon, lat] = proj4("ESRI:102080", "EPSG:4326", coords);
        const result = [lat, lon];
        cache.set(key, result);
        return result;
      }
      return coords.map(transform);
    };
  }, []);

  // 지도에 쓸 자료 준비
  const { routeLines, markers } = useMemo(() => {
    if (!edges || !route) return { routeLines: [], markers: [] };

    const routeLines = route.lines;
    const markers = route.vertices.map((vid, i) => ({
      id: vid,
      order: i + 1,
      position: routeLines[i ? i - 1 : 0][i ? 0 : 0],
      isStart: i === 0,
      isEnd:   i === route.vertices.length - 1,
    }));
    return { routeLines, markers };
  }, [edges, route]);

  // 렌더링
  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: "40vh", width: "100%" }}
      preferCanvas
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <RecenterMap center={mapCenter} />

      {/* 전체 등산로 (난이도별 색상) */}
      {edges && edges.map(e => (
        <Polyline
          key={`edge-${e.id}`}
          positions={transform(e.coordinates)}
          weight={2}
          opacity={0.5}
          color={DIFFICULTY_COLORS[e.difficulty] || "gray"}
        />
      ))}

      {/* 최단 경로 (테두리 + 실제 경로) */}
      {routeLines.map((line, i) => (
        <React.Fragment key={`route-${i}`}>
          <Polyline
            positions={line}
            weight={10}
            color="black"
            opacity={1}
            lineCap="round"
            lineJoin="round"
          />
          <Polyline
            positions={line}
            weight={6}
            color={DIFFICULTY_COLORS[edges[i].difficulty] || "red"}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />
        </React.Fragment>
      ))}

      {/* 마커 */}
      {markers.map(m => {
        const icon = m.isStart
          ? startIcon
          : m.isEnd
            ? endIcon
            : waypointIcon;

        return (
          <Marker
            key={m.id}
            position={m.position}
            icon={icon}
          >
            <Popup>{`#${m.order} · Vertex ${m.id}`}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default BukhansanBaegundaeRouteMap;
