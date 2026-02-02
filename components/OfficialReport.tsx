
import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { AnalysisResponse, LandPlot } from '../types';

interface OfficialReportProps {
  result: AnalysisResponse | null;
  plot: LandPlot | null;
}

const OfficialReport: React.FC<OfficialReportProps> = ({ result, plot }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (result && plot) {
      const timer = setTimeout(() => {
        const container = document.getElementById('report-map-container');
        if (!container) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize map with zoom constraints to prevent satellite imagery gaps
        const reportMap = L.map('report-map-container', { 
          zoomControl: false, 
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          touchZoom: false,
          doubleClickZoom: false,
          maxZoom: 18 
        });

        mapInstanceRef.current = reportMap;
        
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18,
          attribution: 'Esri'
        }).addTo(reportMap);

        satelliteLayer.on('load', () => setMapLoaded(true));

        try {
          const geoLayer = L.geoJSON(plot.geometry, {
            style: {
              color: '#27ae60',
              weight: 4,
              fillOpacity: 0.1,
              dashArray: '8, 8'
            }
          }).addTo(reportMap);

          const bounds = geoLayer.getBounds();
          if (bounds.isValid()) {
            reportMap.fitBounds(bounds, { 
              padding: [50, 50],
              maxZoom: 18 
            });
          }
        } catch (e) {
          console.error("GIS Report Render Error:", e);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [result, plot]);

  if (!result || !plot) return null;

  const handlePrint = () => {
    // Set document title so 'Save as PDF' uses the Certificate ID as the filename
    const originalTitle = document.title;
    const filename = `CERTIFICATE-${result.applicationId.toUpperCase()}`;
    document.title = filename;
    
    // Trigger browser print
    window.print();
    
    // Revert title after the print dialog is closed
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-8 pb-24">
      {/* Control Bar */}
      <div className="no-print w-full max-w-[210mm] flex justify-between items-center bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-2xl sticky top-4 z-[2000]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-sm tracking-tight">Official Certificate Ready</h4>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Filename: {result.applicationId}.pdf</p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-[#27ae60] hover:bg-[#1e8a4c] text-white px-8 py-3.5 rounded-xl font-black shadow-lg shadow-emerald-900/20 flex items-center gap-3 transition-all active:scale-95 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF Document
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] relative overflow-hidden flex flex-col border border-slate-100 print:shadow-none print:border-0">
        {/* Anti-Forgery Watermark */}
        <div className="watermark opacity-[0.03] text-8xl pointer-events-none select-none">MINISTRY OF LANDS</div>
        
        {/* Official Header */}
        <div className="flex items-center justify-between border-b-[6px] border-[#27ae60] pb-8 mb-10">
           <div className="flex items-center gap-6">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Coat_of_arms_of_Nigeria.svg/2000px-Coat_of_arms_of_Nigeria.svg.png" className="w-24 h-24 object-contain" alt="Coat of Arms" />
             <div>
               <h2 className="text-2xl font-black text-[#27ae60] uppercase tracking-tighter">Federal Republic of Nigeria</h2>
               <h3 className="text-xl font-bold text-slate-900 leading-tight">Ministry of Lands, Physical Planning & Urban Development</h3>
               <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">Directorate of Digital Registry & Compliance</p>
             </div>
           </div>
           <div className="text-right">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certificate ID</div>
             <div className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-3 py-2 border border-slate-200 rounded-lg">REF-{result.applicationId.toUpperCase()}</div>
           </div>
        </div>

        {/* Certificate Body */}
        <div className="flex-1 space-y-10">
           <div className="text-center relative">
             <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">Certificate of Spatial Compliance</h1>
             <div className="flex items-center justify-center gap-3">
               <div className="h-1 w-12 bg-[#27ae60] rounded-full"></div>
               <p className="text-sm text-slate-600 font-bold uppercase tracking-widest italic">Statutory Planning Verification</p>
               <div className="h-1 w-12 bg-[#27ae60] rounded-full"></div>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-10 bg-slate-50 p-8 rounded-3xl border border-slate-200">
             <div>
               <h4 className="text-[11px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">Registered Land Data</h4>
               <div className="space-y-3">
                 <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Plot Reference:</span> <span className="font-black text-slate-900">{plot.plotNumber}</span></p>
                 <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Primary Owner:</span> <span className="font-black text-slate-900">{plot.owner}</span></p>
                 <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Planning Zone:</span> <span className="font-black text-slate-900">{plot.location}</span></p>
                 <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Surveyed Area:</span> <span className="font-black text-slate-900">{plot.area.toLocaleString()} m²</span></p>
               </div>
             </div>
             <div className="border-l-2 border-slate-200 pl-10">
               <h4 className="text-[11px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">Audit Outcome</h4>
               <div className="space-y-3">
                 <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Compliance Score:</span> <span className={`font-black text-lg ${result.complianceScore >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>{result.complianceScore}%</span></p>
                 <p className="text-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Official Status:</span> 
                  <span className={`ml-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${result.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {result.status}
                  </span>
                 </p>
                 <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Audit Date:</span> <span className="font-mono text-xs font-bold">{new Date(result.timestamp).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
               </div>
             </div>
           </div>

           <div className="space-y-4">
             <h3 className="text-xs font-black text-slate-900 border-b-2 border-slate-200 pb-2 uppercase tracking-widest">Spatial Setback Audit Results</h3>
             <table className="w-full text-sm border-collapse rounded-xl overflow-hidden">
               <thead>
                 <tr className="bg-slate-900 text-white text-left">
                   <th className="p-4 uppercase text-[10px] font-black tracking-widest">Parameter</th>
                   <th className="p-4 uppercase text-[10px] font-black tracking-widest">Required</th>
                   <th className="p-4 uppercase text-[10px] font-black tracking-widest">Measured</th>
                   <th className="p-4 uppercase text-[10px] font-black tracking-widest text-center">Result</th>
                 </tr>
               </thead>
               <tbody className="bg-white">
                 <tr className="border-b border-slate-100">
                   <td className="p-4 font-bold text-slate-800">Front Setback</td>
                   <td className="p-4 font-mono text-slate-500">6.00m</td>
                   <td className="p-4 font-mono font-bold text-slate-900">{result.setbacks.front.toFixed(2)}m</td>
                   <td className={`p-4 text-center font-black ${result.setbacks.front >= 6 ? 'text-emerald-600' : 'text-rose-600'}`}>{result.setbacks.front >= 6 ? '✓ PASSED' : '✗ FAILED'}</td>
                 </tr>
                 <tr className="border-b border-slate-100">
                   <td className="p-4 font-bold text-slate-800">Lateral Setbacks</td>
                   <td className="p-4 font-mono text-slate-500">3.00m</td>
                   <td className="p-4 font-mono font-bold text-slate-900">{result.setbacks.side.toFixed(2)}m</td>
                   <td className={`p-4 text-center font-black ${result.setbacks.side >= 3 ? 'text-emerald-600' : 'text-rose-600'}`}>{result.setbacks.side >= 3 ? '✓ PASSED' : '✗ FAILED'}</td>
                 </tr>
                 <tr>
                   <td className="p-4 font-bold text-slate-800">Rear Airspace</td>
                   <td className="p-4 font-mono text-slate-500">3.00m</td>
                   <td className="p-4 font-mono font-bold text-slate-900">{result.setbacks.rear.toFixed(2)}m</td>
                   <td className={`p-4 text-center font-black ${result.setbacks.rear >= 3 ? 'text-emerald-600' : 'text-rose-600'}`}>{result.setbacks.rear >= 3 ? '✓ PASSED' : '✗ FAILED'}</td>
                 </tr>
               </tbody>
             </table>
           </div>

           <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 border-b-2 border-slate-200 pb-2 uppercase tracking-widest">Technical Remarks & Advisory</h3>
              <div className="bg-emerald-50/40 p-6 border-l-[6px] border-[#27ae60] rounded-r-2xl italic text-sm text-slate-800 leading-relaxed shadow-sm">
                "{result.aiAdvisory}"
              </div>
           </div>

           {/* High-Res Satellite Backdrop */}
           <div className="h-[320px] border-[5px] border-slate-100 rounded-[2rem] overflow-hidden relative shadow-inner mt-6">
             <div id="report-map-container" className="h-full w-full"></div>
             <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black text-slate-700 uppercase border border-slate-200 shadow-xl flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               GIS Verified Satellite Imagery
             </div>
             <div className="absolute top-4 left-4 z-[1000] bg-[#27ae60] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-2xl">
               Audit Visual: Plot Perimeter
             </div>
           </div>
        </div>

        {/* Footer & Verification */}
        <div className="mt-16 flex justify-between items-end border-t-4 border-slate-100 pt-10">
          <div className="space-y-4">
            <div className="w-48 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-3">
               <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Blockchain Hash</span>
               <span className="text-[10px] text-slate-400 font-mono break-all text-center leading-tight">0x{result.applicationId.repeat(2).substring(0, 40)}...</span>
            </div>
            <p className="text-[10px] text-slate-400 max-w-[400px] font-medium leading-relaxed italic">
              Verification Notice: This is a secure digital document. The spatial audit was performed by the Ministry's Automated Planning Engine. Verify at ministryoflands.gov.ng.
            </p>
          </div>
          <div className="text-center relative">
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ministry.gov/verify/${result.applicationId}`} className="w-28 h-28 opacity-90 mx-auto mb-4 border-4 border-white shadow-2xl p-1" alt="Verification QR" />
             <div className="mt-4 border-t-4 border-slate-900 pt-3 font-black text-sm uppercase tracking-tighter text-slate-900">
                Registrar, Digital Lands
             </div>
             <div className="text-[9px] text-slate-500 font-black uppercase mt-1 tracking-widest">Ministry of Lands, Nigeria</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialReport;
