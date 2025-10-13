// app/tools/mapcode/page.tsx
"use client";

import { useEffect, useRef } from "react";

// Ensure leaflet CSS is loaded
const leafletCSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const leafletJS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    if (!document.querySelector(`link[href="${leafletCSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = leafletCSS;
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS
    const script = document.createElement("script");
    script.src = leafletJS;
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      const L = window.L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current).setView([16.047, 108.206], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      fetch("/vietnam_map.geojson")
        .then((response) => response.json())
        .then((data) => {
          L.geoJSON(data, {
            onEachFeature: function (feature: any, layer: any) {
              layer.bindPopup(
                `${feature.properties.code} - ${feature.properties.name}`
              );
            },
          }).addTo(map);
        });
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div id="map" ref={mapRef} style={{ height: "600px", width: "100%" }} />
  );
