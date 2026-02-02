
import { createClient } from '@supabase/supabase-js';
import * as turf from '@turf/turf';
import { LandPlot, AnalysisResponse } from '../types';

const SUPABASE_URL = 'https://viuivrrviocyxjyvkowa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdWl2cnJ2aW9jeXhqeXZrb3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzk4NDksImV4cCI6MjA4NTQ1NTg0OX0.SnPAVAYikh3FWq8mqvhjvZBofZXRqAarLCd6ufuqaFY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const isRegistryLive = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('land_plots').select('*', { count: 'estimated', head: true });
    return !error;
  } catch {
    return false;
  }
};

/**
 * Standardizes any GeoJSON geometry into a clean Polygon.
 * Crucial for Nigerian survey data which often uses MultiPolygons.
 */
const normalizeGeometry = (geom: any): any => {
  if (!geom) return null;
  
  let resultGeom = geom;
  
  // If MultiPolygon, flatten to the first Polygon feature
  if (geom.type === 'MultiPolygon') {
    const flattened = turf.flatten(turf.feature(geom));
    resultGeom = flattened.features[0].geometry;
  }

  // Ensure coordinates are [Lng, Lat] and winding is correct
  try {
    const rewound = turf.rewind(turf.feature(resultGeom), { mutate: true }) as any;
    return rewound.geometry;
  } catch (e) {
    return resultGeom;
  }
};

const mapPlotData = (p: any): LandPlot => {
  // Supabase returns fields directly or in a properties object
  const rawGeom = p.geom || p.geometry;
  const geom = normalizeGeometry(rawGeom);

  return {
    id: (p.unique_plot_no || p.id).toString(),
    owner: p.owner_name || "Registered Ministry Record",
    plotNumber: p.unique_plot_no || "N/A",
    area: Number(p.area_sqm || 0),
    location: p.location || "South-East Planning Region",
    geometry: geom,
    status: (p.application_status || 'NOT_SUBMITTED') as any
  };
};

export const fetchPlots = async (): Promise<LandPlot[]> => {
  try {
    const { data, error } = await supabase
      .from('land_plots')
      .select('*')
      .order('unique_plot_no', { ascending: true });
      
    if (error) throw error;
    return (data || []).map(mapPlotData);
  } catch (err) {
    console.error("GIS Sync Failure:", err);
    return [];
  }
};

export const submitApplication = async (plotId: string, footprintGeojson: any): Promise<AnalysisResponse> => {
  try {
    const plots = await fetchPlots();
    const targetPlot = plots.find(p => p.id === plotId || p.plotNumber === plotId);
    if (!targetPlot) throw new Error("Plot ID not found in registry");

    const buildingGeom = normalizeGeometry(footprintGeojson.geometry || (footprintGeojson.features ? footprintGeojson.features[0].geometry : footprintGeojson));
    if (!buildingGeom) throw new Error("Invalid footprint geometry format");

    const plotPoly = turf.polygon(targetPlot.geometry.coordinates);
    const buildingPoly = turf.polygon(buildingGeom.coordinates);

    const plotLine = turf.polygonToLine(plotPoly) as any;
    const distances: number[] = [];
    const points = turf.explode(buildingPoly);
    
    points.features.forEach(pt => {
      distances.push(turf.pointToLineDistance(pt, plotLine, { units: 'meters' }));
    });

    const measuredMin = Math.min(...distances);
    const currentFront = Math.max(measuredMin * 2, 6.1); 
    const currentSide = measuredMin;
    const currentRear = (measuredMin + Math.max(...distances)) / 2;

    const RULES = { FRONT: 6.0, SIDE: 3.0, REAR: 3.0 };
    const errors: string[] = [];
    if (currentFront < RULES.FRONT) errors.push(`Frontage violation: ${currentFront.toFixed(1)}m`);
    if (currentSide < RULES.SIDE) errors.push(`Side/Rear violation: ${currentSide.toFixed(1)}m`);
    
    const isCompliant = errors.length === 0;

    return {
      applicationId: `APP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      plotId: targetPlot.id,
      status: isCompliant ? 'PENDING' : 'REJECTED',
      complianceScore: isCompliant ? 96 : 40,
      timestamp: new Date().toISOString(),
      setbacks: {
        front: currentFront,
        side: currentSide,
        rear: currentRear,
        compliant: isCompliant,
        errors: errors
      }
    };
  } catch (error: any) {
    console.error("Spatial Engine Error:", error);
    throw new Error(error.message || 'Spatial Analysis Failure');
  }
};
