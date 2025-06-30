import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TechnicalAnalysis } from './components/TechnicalAnalysis';
import { SentimentAnalysis } from './components/SentimentAnalysis';
import { NewsCards } from './components/NewsCards';
import { SentimentAnalysisService } from './services/SentimentAnalysisService';
import { ModelInferenceService } from './services/ModelInferenceService';
import { MarketDataService } from './services/MarketDataService';
import type { SP500Prediction, SentimentData, NewsArticle, MarketData } from './types';
import { RefreshCw } from 'lucide-react';

// Configuration - In a real app, these would come from environment variables
const POLYGON_API_KEY = 'CQYzwNSbF_8jNZd2cXAa6CG_AsUNylwa';

function App() {
  const [prediction, setPrediction] = useState<SP500Prediction | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState({
    prediction: false,
    sentiment: false,
    news: false,
    market: false
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [lastTechnicalUpdate, setLastTechnicalUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize services
  const sentimentService = new SentimentAnalysisService(POLYGON_API_KEY);
  const modelService = new ModelInferenceService();
  const marketService = new MarketDataService();

  // Check if we need to update technical analysis (once per day after market close)
  const shouldUpdateTechnical = () => {
    if (!lastTechnicalUpdate) return true;
    
    const now = new Date();
    const lastUpdate = new Date(lastTechnicalUpdate);
    
    // Check if it's a new day and after 4 PM ET (market close)
    const isNewDay = now.getDate() !== lastUpdate.getDate() || 
                     now.getMonth() !== lastUpdate.getMonth() || 
                     now.getFullYear() !== lastUpdate.getFullYear();
    
    // Convert to ET time (simplified - doesn't account for DST)
    const etHour = now.getUTCHours() - 5; // EST offset
    const isAfterMarketClose = etHour >= 16; // 4 PM ET
    
    return isNewDay && isAfterMarketClose;
  };

  const fetchMarketData = async () => {
    setLoading(prev => ({ ...prev, market: true }));
    try {
      const [current, historical] = await Promise.all([
        marketService.getCurrentMarketData(),
        marketService.getHistoricalData('1y') // Get 1 year of data for technical indicators
      ]);
      setMarketData([...historical, current]);
    } catch (err) {
      console.error('Failed to fetch market data:', err);
      setError('Error al cargar datos de mercado');
    } finally {
      setLoading(prev => ({ ...prev, market: false }));
    }
  };

  const fetchSentimentData = async () => {
    setLoading(prev => ({ ...prev, sentiment: true }));
    try {
      const sentiment = await sentimentService.analyzeSP500Sentiment(7);
      setSentimentData(sentiment);
    } catch (err) {
      console.error('Failed to fetch sentiment data:', err);
      setError('Error al cargar datos de sentimiento');
    } finally {
      setLoading(prev => ({ ...prev, sentiment: false }));
    }
  };

  const fetchNewsArticles = async () => {
    setLoading(prev => ({ ...prev, news: true }));
    try {
      const news = await sentimentService.getInfluentialNews(7, 10);
      setNewsArticles(news);
    } catch (err) {
      console.error('Failed to fetch news articles:', err);
      setError('Error al cargar artículos de noticias');
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  };

  const fetchPrediction = async () => {
    setLoading(prev => ({ ...prev, prediction: true }));
    try {
      // Use backend API for prediction - no local calculation needed
      const prediction = await modelService.predictSP500FromAPI();
      setPrediction(prediction);
    } catch (err) {
      console.error('Failed to generate prediction:', err);
      setError('Error al generar predicción');
    } finally {
      setLoading(prev => ({ ...prev, prediction: false }));
    }
  };

  const refreshAll = async () => {
    setError(null);
    setLastUpdated(new Date());
    
    // Always fetch sentiment and news (can be refreshed anytime)
    await Promise.all([
      fetchSentimentData(),
      fetchNewsArticles()
    ]);

    // Only fetch market data and prediction if technical analysis needs updating
    if (shouldUpdateTechnical()) {
      console.log('Updating technical analysis (once per day after market close)');
      await fetchMarketData();
      setLastTechnicalUpdate(new Date());
    } else {
      console.log('Technical analysis is up to date for today');
    }
  };

  const refreshSentimentOnly = async () => {
    setError(null);
    setLastUpdated(new Date());
    
    await Promise.all([
      fetchSentimentData(),
      fetchNewsArticles()
    ]);
  };

  const forceRefreshAll = async () => {
    setError(null);
    setLastUpdated(new Date());
    
    // Force update of all data including technical analysis
    await fetchMarketData();
    setLastTechnicalUpdate(new Date());
    
    await Promise.all([
      fetchSentimentData(),
      fetchNewsArticles()
    ]);
  };

  // Initial load
  useEffect(() => {
    refreshAll();
  }, []);

  // Fetch prediction when market data changes
  useEffect(() => {
    if (marketData.length > 0) {
      fetchPrediction();
    }
  }, [marketData]);

  // Auto-refresh sentiment every 5 minutes (technical analysis only once per day)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing sentiment data...');
      refreshSentimentOnly();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header lastUpdated={lastUpdated} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">
            <p className="font-medium">Error: {error}</p>
            <button
              onClick={forceRefreshAll}
              className="text-sm underline hover:no-underline mt-1"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark-text">
            Panel de Análisis del Mercado SP500
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={refreshSentimentOnly}
              disabled={loading.sentiment || loading.news}
              className={`btn-secondary flex items-center space-x-2 ${
                (loading.sentiment || loading.news) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${(loading.sentiment || loading.news) ? 'animate-spin' : ''}`} />
              <span>Actualizar Sentimiento</span>
            </button>
            <button
              onClick={forceRefreshAll}
              disabled={isAnyLoading}
              className={`btn-primary flex items-center space-x-2 ${
                isAnyLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar Todo</span>
            </button>
          </div>
        </div>

        {/* Technical Analysis Section */}
        <TechnicalAnalysis
          prediction={prediction}
          marketData={marketData}
          loading={loading.prediction || loading.market}
        />

        {/* Sentiment Analysis Section */}
        <SentimentAnalysis
          sentimentData={sentimentData}
          loading={loading.sentiment}
        />

        {/* News Cards Section */}
        <NewsCards
          articles={newsArticles}
          loading={loading.news}
        />
      </main>

      {/* Footer */}
      <footer className="bg-dark-surface border-t border-dark-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-dark-muted">
            <p className="text-sm">
              Predictor SP500 - Análisis algorítmico avanzado para predicción de mercados
            </p>
            <p className="text-xs mt-1">
              Datos proporcionados por Polygon.io | Las predicciones son solo para fines educativos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
