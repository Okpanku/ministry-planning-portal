import React, { useState, useEffect } from 'react';
import { PortalTab, LandPlot, AnalysisResponse } from './types';
import Header from './components/Header';
import MapPanel from './components/MapPanel';
import AnalysisPanel from './components/AnalysisPanel';
import ExecutiveReview from './components/ExecutiveReview';
import OfficialReport from './components/OfficialReport';
import { fetchPlots, submitApplication, isRegistryLive } from './services/api';
import { getAIAdvisory } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PortalTab>(PortalTab.GIS_SCAN);
  const [plots, setPlots] = useState<LandPlot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<LandPlot | null>(null);
  const [buildingFootprint, setBuildingFootprint] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadPlots();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const live = await isRegistryLive();
    setIsOffline(!live);
  };

  const loadPlots = async () => {
    try {
      const data = await fetchPlots();
      setPlots(data);
    } catch (error) {
      console.error("Failed to fetch plots:", error);
    }
  };

  const handlePlotSelect = (plot: LandPlot) => {
    setSelectedPlot(plot);
    setBuildingFootprint(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = async (geojson: any) => {
    if (!selectedPlot) return;
    setIsAnalyzing(true);
    setBuildingFootprint(geojson);
    try {
      const result = await submitApplication(selectedPlot.id, geojson);
      const advisory = await getAIAdvisory(result.setbacks);
      
      const enrichedResult: AnalysisResponse = {
        ...result,
        aiAdvisory: advisory,
        timestamp: new Date().toISOString()
      };

      setAnalysisResult(enrichedResult);
      setActiveTab(PortalTab.EXECUTIVE_REVIEW);
    } catch (error) {
      alert("Spatial analysis failed. Please ensure your GeoJSON is valid.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDecision = (status: 'APPROVED' | 'REJECTED') => {
    if (analysisResult) {
      setAnalysisResult({ ...analysisResult, status });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="no-print flex flex-col h-screen">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} isOffline={isOffline} />
        
        <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {activeTab === PortalTab.GIS_SCAN && (
            <>
              <div className="w-full md:w-2/3 h-1/2 md:h-full relative border-r border-slate-200">
                <MapPanel 
                  plots={plots} 
                  selectedPlot={selectedPlot} 
                  buildingFootprint={buildingFootprint}
                  analysisResult={analysisResult}
                  onPlotSelect={handlePlotSelect} 
                  isOffline={isOffline}
                />
              </div>
              <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-y-auto bg-white shadow-xl z-10">
                <AnalysisPanel 
                  plots={plots}
                  selectedPlot={selectedPlot} 
                  onPlotSelect={handlePlotSelect}
                  onAnalyze={handleAnalyze} 
                  isAnalyzing={isAnalyzing} 
                />
              </div>
            </>
          )}

          {activeTab === PortalTab.EXECUTIVE_REVIEW && (
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <ExecutiveReview 
                result={analysisResult} 
                onDecision={handleDecision}
                onViewReport={() => setActiveTab(PortalTab.REPORT)}
              />
            </div>
          )}

          {activeTab === PortalTab.REPORT && (
            <div className="flex-1 overflow-y-auto p-8 bg-slate-200">
              <OfficialReport result={analysisResult} plot={selectedPlot} />
            </div>
          )}
        </main>
      </div>

      <div className="print-only hidden">
        <OfficialReport result={analysisResult} plot={selectedPlot} />
      </div>
    </div>
  );
};

export default App;