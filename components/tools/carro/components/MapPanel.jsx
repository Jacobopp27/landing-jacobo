import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

const MEDELLIN = [6.2442, -75.5812];

const palette = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#fb7185"];

function pin(color, letter) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:26px;height:26px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);border:2px solid #0b1020;box-shadow:0 2px 6px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);font-size:12px;font-weight:700;color:#0b1020;">${letter}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });
}

function ClickCatcher({ onClick }) {
  useMapEvents({ click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function FlyTo({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.flyTo([point.lat, point.lng], 14, { duration: 0.6 });
  }, [point]); // eslint-disable-line
  return null;
}

export default function MapPanel({ routes, draft, onMapClick }) {
  const focus = draft.dest || draft.origin;

  return (
    <MapContainer center={MEDELLIN} zoom={12} className="map">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      <ClickCatcher onClick={onMapClick} />
      <FlyTo point={focus} />

      {routes.map((r, i) => {
        const color = palette[i % palette.length];
        const line = r.coords && r.coords.length > 1
          ? r.coords
          : r.origin && r.dest
          ? [[r.origin.lat, r.origin.lng], [r.dest.lat, r.dest.lng]]
          : null;
        return (
          <span key={r.id}>
            {r.origin && <Marker position={[r.origin.lat, r.origin.lng]} icon={pin(color, "A")} />}
            {r.dest && <Marker position={[r.dest.lat, r.dest.lng]} icon={pin(color, "B")} />}
            {line && (
              <Polyline
                positions={line}
                pathOptions={{ color, weight: 5, opacity: r.active === false ? 0.25 : 0.85 }}
              />
            )}
          </span>
        );
      })}

      {/* ruta en construcción */}
      {draft.origin && <Marker position={[draft.origin.lat, draft.origin.lng]} icon={pin("#ffffff", "A")} />}
      {draft.dest && <Marker position={[draft.dest.lat, draft.dest.lng]} icon={pin("#ffffff", "B")} />}
      {draft.origin && draft.dest && (
        <Polyline
          positions={[
            [draft.origin.lat, draft.origin.lng],
            [draft.dest.lat, draft.dest.lng],
          ]}
          pathOptions={{ color: "#ffffff", weight: 2, dashArray: "4 6", opacity: 0.6 }}
        />
      )}
    </MapContainer>
  );
}
