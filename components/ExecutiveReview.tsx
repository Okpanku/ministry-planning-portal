
import React from 'react';
import { AnalysisResponse } from '../types';

interface ExecutiveReviewProps {
  result: AnalysisResponse | null;
  onDecision: (status: 'APPROVED' | 'REJECTED') => void;
  onViewReport: () => void;
}

const ExecutiveReview: React.FC<ExecutiveReviewProps> = ({ result, onDecision, onViewReport }) => {
  if (!result) {
    return (
      <div className="h-full flex items-center justify-center p-12 text-slate-400 flex-col gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-medium">No active analysis found. Please run a GIS Scan first.</p>
      </div>
    );
  }

  const { setbacks, complianceScore, aiAdvisory, status } = result;

  const getComplianceColor = (val: number, threshold: number) => val >= threshold ? 'text-emerald-600' : 'text-rose-600';
  const getBadgeColor = (val: number, threshold: number) => val >= threshold ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Col: Compliance Data */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Technical Verification</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Front Setback (Frontage)</h4>
                  <p className="text-xs text-slate-500">Ministry Requirement: Min 6.0m</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black ${getComplianceColor(setbacks.front, 6.0)}`}>{setbacks.front.toFixed(1)}m</span>
                  <span className={`block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${getBadgeColor(setbacks.front, 6.0)}`}>
                    {setbacks.front >= 6.0 ? 'PASSED' : 'NON-COMPLIANT'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800">Side Setbacks</h4>
                  <p className="text-xs text-slate-500">Ministry Requirement: Min 3.0m</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black ${getComplianceColor(setbacks.side, 3.0)}`}>{setbacks.side.toFixed(1)}m</span>
                  <span className={`block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${getBadgeColor(setbacks.side, 3.0)}`}>
                    {setbacks.side >= 3.0 ? 'PASSED' : 'NON-COMPLIANT'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800">Rear Setback</h4>
                  <p className="text-xs text-slate-500">Ministry Requirement: Min 3.0m</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black ${getComplianceColor(setbacks.rear, 3.0)}`}>{setbacks.rear.toFixed(1)}m</span>
                  <span className={`block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${getBadgeColor(setbacks.rear, 3.0)}`}>
                    {setbacks.rear >= 3.0 ? 'PASSED' : 'NON-COMPLIANT'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">AI Advisory Remarks</h3>
             <div className="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-wrap italic">
               "{aiAdvisory}"
             </div>
             <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                AI Planning Consultant Verified
             </div>
          </div>
        </div>

        {/* Right Col: Decision Panel */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-[#334155] text-white p-8 rounded-2xl shadow-xl text-center relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Compliance Score</h4>
               <div className="text-6xl font-black mb-2">{complianceScore}%</div>
               <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
                 <div 
                   className="bg-[#27ae60] h-2 rounded-full transition-all duration-1000" 
                   style={{ width: `${complianceScore}%` }}
                 ></div>
               </div>
               
               <div className="space-y-3">
                 <button 
                  onClick={() => onDecision('APPROVED')}
                  disabled={status === 'APPROVED'}
                  className={`w-full py-3 rounded-lg font-bold text-sm uppercase transition-all shadow-md ${status === 'APPROVED' ? 'bg-emerald-500 cursor-default' : 'bg-[#27ae60] hover:bg-emerald-400'}`}
                 >
                   {status === 'APPROVED' ? 'Application Approved' : 'Approve Application'}
                 </button>
                 <button 
                  onClick={() => onDecision('REJECTED')}
                  disabled={status === 'REJECTED'}
                  className={`w-full py-3 rounded-lg font-bold text-sm uppercase border transition-all ${status === 'REJECTED' ? 'bg-rose-500 border-rose-500 cursor-default' : 'border-slate-500 hover:bg-rose-500/10 hover:border-rose-500 text-slate-300'}`}
                 >
                   {status === 'REJECTED' ? 'Application Rejected' : 'Reject Application'}
                 </button>
               </div>
             </div>
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </div>

          <button 
            onClick={onViewReport}
            className="w-full bg-white border border-slate-200 text-slate-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Generate Official Certificate
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExecutiveReview;
