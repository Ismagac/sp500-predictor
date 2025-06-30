export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma10: number;
    sma20: number;
    sma50: number;
    sma100: number;
    sma200: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  bollWidth: number;
  adx: number;
  obv: number;
  ret1d: number;
  ret5d: number;
  vol20: number;
  support: number[];
  resistance: number[];
}

export interface ModelPrediction {
  value: number;
  confidence: number;
  timestamp: Date;
  trend: 'bullish' | 'bearish' | 'neutral';
  technicalIndicators: TechnicalIndicators;
}

export interface SP500Prediction {
  prediction: number;
  value: number; // Added for backward compatibility
  confidence: number;
  direction: 'up' | 'down' | 'neutral';
  trend: 'bullish' | 'bearish' | 'neutral'; // Added for component compatibility
  probability: number;
  targetPrice: number;
  timeframe: string;
  factors: {
    technical: number;
    sentiment: number;
    momentum: number;
  };
  technicalIndicators: TechnicalIndicators; // Added for component compatibility
  lastUpdated: Date;
}

export interface SentimentData {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
  articlesAnalyzed: number;
  lastUpdated: Date;
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  source: string;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  influence: number; // 0-1 scale
  keywords: string[];
}

export interface MarketData {
  timestamp: Date;
  price: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  change: number;
  changePercent: number;
}