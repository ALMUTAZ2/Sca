
export interface ScrapedData {
  success: boolean;
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
  };
}

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export enum AppStatus {
  IDLE = 'IDLE',
  CRAWLING = 'CRAWLING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
