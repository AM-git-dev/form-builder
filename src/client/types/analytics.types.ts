export interface FormOverview {
  totalViews: number;
  totalStarts: number;
  totalSubmissions: number;
  conversionRate: number;
  startRate: number;
  completionRate: number;
}

export interface FunnelStep {
  stepOrder: number;
  stepTitle: string;
  completions: number;
  dropOffRate: number;
}

export interface TimelinePoint {
  date: string;
  submissions: number;
  views: number;
}

export interface DashboardStats {
  totalForms: number;
  totalSubmissions: number;
  totalViews: number;
  averageConversionRate: number;
}
