
import React, { useRef, useState, useMemo } from 'react';
import { LandPlot } from '../types';

interface AnalysisPanelProps {
  plots: LandPlot[];
  selectedPlot: LandPlot | null;
  onPlotSelect: (plot: LandPlot) => void;
  onAnalyze: (geojson: any) => void;
  isAnalyzing: boolean;
}

type StatusFilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ plots, selectedPlot, onPlotSelect, onAnalyze, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');

  const filteredPlots = useMemo(() => {
    return plots.filter(plot => {
      const matchesSearch = !searchQuery || 
        plot.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.owner.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || plot.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).slice(0, 5);
  }, [plots, searchQuery, statusFilter]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onAnalyze(json);
      } catch (err) {
        alert("Invalid GeoJSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleSelectPlot = (plot: LandPlot) => {
    onPlotSelect(plot);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'APPROVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'REJECTED': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'NOT_SUBMITTED': return 'text-slate-400 bg-slate-50 border-slate-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="p-6 flex flex-col h-full bg-white relative">
      {/* Search & Filter Header */}
      <div className="mb-6 relative z-[2000]">
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Administrative Search</label>
        
        {/* Status Filter Chips */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED'] as StatusFilterType[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border uppercase tracking-tighter ${
                statusFilter === status 
                  ? 'bg-[#27ae60] text-white border-[#27ae60] shadow-md scale-105' 
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder={selectedPlot ? `Selected: ${selectedPlot.plotNumber}` : "Enter Plot ID (e.g. PLOT-002)..."}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#27ae60] focus:bg-white focus:border-transparent transition-all shadow-inner"
          />
          <div className="absolute right-4 top-3.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {isDropdownOpen && filteredPlots.length > 0 && (
          <div className="absolute z-[2001] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 border-b border-slate-50 bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">Registry Matches</div>
            {filteredPlots.map(plot => (
              <button
                key={plot.id}
                onClick={() => handleSelectPlot(plot)}
                className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-slate-50 last:border-0 transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-black text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{plot.plotNumber}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight truncate max-w-[140px]">{plot.owner}</div>
                </div>
                <span className={`text-[8px] font-black px-2 py-1 rounded-md border uppercase tracking-tighter shadow-sm transition-transform group-hover:scale-105 ${getStatusColor(plot.status)}`}>
                  {(plot.status || 'NEW').replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-0.5 tracking-tight">Spatial Scan</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Audit Protocol v4.1</p>
        </div>
        <div className="bg-emerald-50 p-2 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#27ae60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>

      {!selectedPlot ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 group hover:border-emerald-300 transition-colors">
          <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-center mb-5 text-slate-300 shadow-md group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-200 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-slate-900 font-black text-lg mb-2">Registry Focus Required</h3>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            The automated spatial audit engine is currently idle. Select a plot from the interactive map to initialize scan parameters.
          </p>
          {statusFilter !== 'ALL' && (
            <div className="mt-4 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] text-emerald-700 font-black uppercase tracking-widest animate-pulse">
              Active Filter: {statusFilter.replace('_', ' ')}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-in fade-in duration-500">
          <div className="bg-[#27ae60] text-white rounded-2xl p-5 mb-6 relative overflow-hidden shadow-xl shadow-emerald-900/10">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[9px] uppercase font-black tracking-widest text-white border border-white/20">Target Registry Data</div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border-2 shadow-sm ${
                  selectedPlot.status === 'APPROVED' ? 'bg-emerald-400 border-emerald-300' : 
                  selectedPlot.status === 'REJECTED' ? 'bg-rose-500 border-rose-400' :
                  'bg-white/20 border-white/30 text-white'
                }`}>
                  {(selectedPlot.status || 'UNSUBMITTED').replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] text-emerald-100 uppercase font-black tracking-widest mb-1 opacity-70">Unique Plot Reference</span>
                  <span className="text-2xl font-black text-white leading-none tracking-tight">{selectedPlot.plotNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <span className="block text-[9px] text-emerald-100 uppercase font-black tracking-widest mb-1 opacity-70">Registered Owner</span>
                    <span className="font-bold text-sm truncate block">{selectedPlot.owner}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-emerald-100 uppercase font-black tracking-widest mb-1 opacity-70">Surface Area</span>
                    <span className="font-bold text-sm">{selectedPlot.area.toLocaleString()} m²</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Abstract Background Design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-dashed border-emerald-100 rounded-3xl bg-emerald-50/20 group hover:bg-emerald-50/50 transition-all duration-300">
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-[#27ae60] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                   <p className="font-black text-slate-800 text-lg">Performing GIS Audit...</p>
                   <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mt-1 animate-pulse">Spatial Engine & AI Advisor Active</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-[#27ae60] text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 transition-transform group-hover:rotate-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-2">Import Footprint</h3>
                <p className="text-sm text-slate-500 text-center mb-10 px-4 font-medium leading-relaxed">
                  Provide a valid building footprint (GeoJSON) for automated setback verification.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json,.geojson" 
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-4.5 rounded-2xl shadow-2xl transition-all uppercase text-xs tracking-[0.2em] active:scale-95 flex items-center justify-center gap-3"
                >
                  Start Spatial Scan
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p className="text-[10px] text-amber-800 leading-relaxed font-bold uppercase tracking-tight">
                 Warning: This audit is for preliminary review. Final approvals require onsite verification by the Directorate of Physical Planning.
               </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
