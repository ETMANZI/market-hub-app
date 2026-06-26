import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import L, { type LeafletMouseEvent } from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
};

type NominatimResult = {
  lat: string;
  lon: string;
};

function isValidCoord(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}

function LocationMarker({ latitude, longitude, onChange }: Props) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (isValidCoord(latitude) && isValidCoord(longitude)) {
      setPosition([latitude, longitude]);
    } else {
      setPosition(null);
    }
  }, [latitude, longitude]);

  useMapEvents({
    click(e: LeafletMouseEvent) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onChange(lat, lng);
    },
  });

  return position ? <Marker position={position} icon={icon} /> : null;
}

function FlyToLocation({
  latitude,
  longitude,
}: {
  latitude?: number;
  longitude?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (isValidCoord(latitude) && isValidCoord(longitude)) {
      map.flyTo([latitude, longitude], 19); // INCREASED to 19 - shows houses clearly
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function MapPicker({ latitude, longitude, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedLat, setSelectedLat] = useState<number | undefined>(
    isValidCoord(latitude) ? latitude : undefined
  );
  const [selectedLng, setSelectedLng] = useState<number | undefined>(
    isValidCoord(longitude) ? longitude : undefined
  );

  useEffect(() => {
    if (isValidCoord(latitude) && isValidCoord(longitude)) {
      setSelectedLat(latitude);
      setSelectedLng(longitude);
    } else {
      setSelectedLat(undefined);
      setSelectedLng(undefined);
    }
  }, [latitude, longitude]);

  const center: [number, number] = useMemo(() => {
    if (isValidCoord(selectedLat) && isValidCoord(selectedLng)) {
      return [selectedLat, selectedLng];
    }
    return [-1.9441, 30.0619]; // Kigali, Rwanda
  }, [selectedLat, selectedLng]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError("");

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        `${query}, Rwanda`
      )}&limit=1`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      const data: NominatimResult[] = await res.json();

      if (!data.length) {
        setError("Location not found.");
        return;
      }

      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);

      if (!isValidCoord(lat) || !isValidCoord(lng)) {
        setError("Invalid location returned.");
        return;
      }

      setSelectedLat(lat);
      setSelectedLng(lng);
      onChange(lat, lng);
    } catch {
      setError("Failed to search location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search village, area, sector, district..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#4f46e5",
            color: "white",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4338ca")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div style={{ color: "red", fontSize: "14px" }}>{error}</div>}

      <MapContainer 
        center={center} 
        zoom={18} // INCREASED from 13 to 18 - starts zoomed in
        style={{ height: "350px", width: "100%", borderRadius: "12px", zIndex: 1 }}
        zoomControl={true}
      >
        {/* Satellite view - best for seeing actual houses */}
        {/* <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        /> */}
        
      {/* <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      /> */}

        {/* You can also try this hybrid view (satellite + labels): */}
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        />
       
        <FlyToLocation latitude={selectedLat} longitude={selectedLng} />

        <LocationMarker
          latitude={selectedLat}
          longitude={selectedLng}
          onChange={(lat, lng) => {
            setSelectedLat(lat);
            setSelectedLng(lng);
            onChange(lat, lng);
          }}
        />
      </MapContainer>
      
      {/* <div className="mt-2 text-xs text-slate-500">
        <p>📍 <strong>Tips to see houses:</strong></p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>🔍 Use the + button to zoom in closer</li>
          <li>🏠 At zoom level 18-19, you'll see individual houses</li>
          <li>🗺️ Satellite view shows actual buildings from above</li>
          <li>📍 Click anywhere on the map to select a location</li>
        </ul>
      </div> */}
    </div>
  );
}