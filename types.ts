
export interface LandPlot {
  id: string;
  owner: string;
  plotNumber: string;
  area: number;
  geometry: any; // GeoJSON Polygon
  location: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface SetbackResult {
  side: number;
  rear: number;
  front: number;
  compliant: boolean;
  errors: string[];
}

export interface AnalysisResponse {
  applicationId: string;
  plotId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  setbacks: SetbackResult;
  aiAdvisory?: string;
  complianceScore: number;
  timestamp: string;
}

export enum PortalTab {
  GIS_SCAN = 'GIS_SCAN',
  EXECUTIVE_REVIEW = 'EXECUTIVE_REVIEW',
  REPORT = 'REPORT'
}