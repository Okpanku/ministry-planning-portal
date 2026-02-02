import React from 'react';
import { PortalTab } from '../types';

interface HeaderProps {
  activeTab: PortalTab;
  setActiveTab: (tab: PortalTab) => void;
  isOffline?: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isOffline }) => {
  return (
    <header className="bg-[#27ae60] text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-full w-10 h-10 flex items-center justify-center shadow-inner">
             <img src="https://picsum.photos/seed/nigeria-logo/100/100" className="w-8 h-8 rounded-full" alt="Ministry Logo" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-wide">Ministry of Lands</h1>
            <p className="text-[10px] opacity-90 uppercase font-medium tracking-tighter">Physical Planning & Urban Development Portal</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => setActiveTab(PortalTab.GIS_SCAN)}
            className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${activeTab === PortalTab.GIS_SCAN ? 'bg-white text-[#27ae60] shadow-md' : 'hover:bg-white/10'}`}
          >
            GIS Scan
          </button>
          <button 
            onClick={() => setActiveTab(PortalTab.EXECUTIVE_REVIEW)}
            className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${activeTab === PortalTab.EXECUTIVE_REVIEW ? 'bg-white text-[#27ae60] shadow-md' : 'hover:bg-white/10'}`}
          >
            Executive Review
          </button>
          <button 
            onClick={() => setActiveTab(PortalTab.REPORT)}
            className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${activeTab === PortalTab.REPORT ? 'bg-white text-[#27ae60] shadow-md' : 'hover:bg-white/10'}`}
          >
            Official Report
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-colors ${
            isOffline 
              ? 'bg-amber-500/20 border-amber-400 text-amber-100' 
              : 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
          }`}>
            {isOffline ? 'Secure Cache Active' : 'Registry Online'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;