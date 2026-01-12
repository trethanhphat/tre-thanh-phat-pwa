// app/tools/mapcode/page.tsx
'use client';

import { useEffect, useRef } from 'react';

const leafletCSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const leafletJS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.querySelector(`link[href="${leafletCSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = leafletCSS;
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = leafletJS;
    script.async = true;

    script.onload = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current).setView([16.047, 108.206], 6);

      /* ======================
       * ESRI BASE MAPS (NO KEY)
       * ====================== */

      // 🛰 ESRI Satellite
      const esriSatellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri' }
      );

      // 🌍 ESRI Terrain
      const esriTerrain = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri' }
      );

      // 🏷 ESRI Labels (for Hybrid)
      const esriLabels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri' }
      );

      // 🧩 Hybrid = Satellite + Labels
      const esriHybrid = L.layerGroup([esriSatellite, esriLabels]);

      // 👉 Mặc định bật Satellite (thay OSM)
      esriSatellite.addTo(map);

      // 🧭 Layer control
      L.control
        .layers(
          {
            'ESRI Satellite': esriSatellite,
            'ESRI Hybrid': esriHybrid,
            'ESRI Terrain': esriTerrain,
          },
          undefined,
          { collapsed: false }
        )
        .addTo(map);

      /* ======================
       * GEOJSON VIETNAM
       * ====================== */

      fetch('/vietnam_map.geojson')
        .then(res => res.json())
        .then(data => {
          L.geoJSON(data, {
            onEachFeature(feature: any, layer: any) {
              layer.bindPopup(`${feature.properties.code} - ${feature.properties.name}`);
            },
          }).addTo(map);
        });
    };

    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return <div ref={mapRef} style={{ height: '600px', width: '100%' }} />;
}
