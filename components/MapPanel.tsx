
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { LandPlot, AnalysisResponse } from '../types';

interface MapPanelProps {
  plots: LandPlot[];
  selectedPlot: LandPlot | null;
  buildingFootprint: any | null;
  analysisResult: AnalysisResponse | null;
  onPlotSelect: (plot: LandPlot) => void;
  isOffline?: boolean;
}

const MapPanel: React.FC<MapPanelProps> = ({ 
  plots, 
  selectedPlot, 
  buildingFootprint, 
  analysisResult, 
  onPlotSelect,
  isOffline
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const buildingLayerRef = useRef<L.GeoJSON | null>(null);
  const setbackZoneLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Hard-coded to Enugu/Umuahia data region (5.59N, 7.52E)
      mapRef.current = L.map('map-container').setView([5.594, 7.522], 17);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 20
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && plots.length > 0) {
      if (geojsonLayerRef.current) mapRef.current.removeLayer(geojsonLayerRef.current);

      const layer = L.geoJSON(plots.map(p => ({
        type: 'Feature',
        geometry: p.geometry,
        properties: { id: p.id, plotNumber: p.plotNumber }
      })), {
        style: (feature) => {
          const isSelected = feature?.properties.id === selectedPlot?.id;
          return {
            fillColor: isSelected ? '#fbbf24' : '#1e293b',
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected ? '#10b981' : '#cbd5e1',
            fillOpacity: isSelected ? 0.8 : 0.4
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            const plot = plots.find(p => p.id === feature.properties.id);
            if (plot) onPlotSelect(plot);
          });
        }
      }).addTo(mapRef.current);

      geojsonLayerRef.current = layer;

      // Fit map to plot if selected
      if (selectedPlot && !buildingFootprint) {
        try {
          const tempLayer = L.geoJSON(selectedPlot.geometry);
          const bounds = tempLayer.getBounds();
          const center = bounds.getCenter();
          
          // Safety verification: Ensure center is within Nigerian bounds (approx Lat 4-14, Lng 3-15)
          if (bounds.isValid() && center.lat > 3 && center.lng > 3) {
            mapRef.current.flyToBounds(bounds, { padding: [120, 120], duration: 1 });
          }
        } catch (e) {
          console.error("GIS FlyTo Error", e);
        }
      }
    }
  }, [plots, selectedPlot, buildingFootprint]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (buildingLayerRef.current) mapRef.current.removeLayer(buildingLayerRef.current);
    if (setbackZoneLayerRef.current) mapRef.current.removeLayer(setbackZoneLayerRef.current);

    if (selectedPlot && mapRef.current) {
      const zoneGroup = L.layerGroup().addTo(mapRef.current);
      setbackZoneLayerRef.current = zoneGroup;
      try {
        const plotFeature = turf.feature(selectedPlot.geometry) as any;
        // Statutory visual guides: 3m side, 6m front
        const s3 = turf.buffer(plotFeature, -3, { units: 'meters' });
        if (s3) L.geoJSON(s3 as any, { style: { color: '#fbbf24', weight: 2, dashArray: '5,5', fill: false }}).addTo(zoneGroup);
        const s6 = turf.buffer(plotFeature, -6, { units: 'meters' });
        if (s6) L.geoJSON(s6 as any, { style: { color: '#ffffff', weight: 2, dashArray: '3,6', fill: false }}).addTo(zoneGroup);
      } catch (e) {}
    }

    if (buildingFootprint && mapRef.current) {
      const color = analysisResult?.setbacks.compliant ? '#10b981' : '#f43f5e';
      const layer = L.geoJSON(buildingFootprint, {
        style: { fillColor: color, weight: 3, color: 'white', fillOpacity: 0.9 }
      }).addTo(mapRef.current);
      buildingLayerRef.current = layer;
    }
  }, [buildingFootprint, analysisResult, selectedPlot]);

  return (
    <div id="map-container" className="w-full h-full bg-[#020617] relative">
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded shadow-sm border border-slate-200">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ministry GIS Engine</div>
        <div className="text-xs font-black text-slate-800">Umuahia-Enugu Sector</div>
      </div>
    </div>
  );
};

export default MapPanel;
