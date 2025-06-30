import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import type { SP500Prediction, MarketData } from '../types';
import { formatPrice, formatPercentage, getChangeColor, getChangeIcon, getTrendIcon, getConfidenceColor, getConfidenceLevel } from '../utils';

interface TechnicalAnalysisProps {
  prediction: SP500Prediction | null;
  marketData: MarketData[];
  loading: boolean;
}

export function TechnicalAnalysis({ prediction, marketData, loading }: TechnicalAnalysisProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Análisis Técnico</h2>
          <p className="card-subtitle">Predicción algorítmica basada en indicadores técnicos</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!prediction || !marketData.length) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Análisis Técnico</h2>
          <p className="card-subtitle">Predicción algorítmica basada en indicadores técnicos</p>
        </div>
        <div className="flex items-center justify-center h-64 text-dark-muted">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const currentPrice = marketData[marketData.length - 1]?.price || prediction.value;
  const priceChange = prediction.value - currentPrice;
  const priceChangePercent = (priceChange / currentPrice) * 100;

  const chartData = [
    ...marketData.slice(-30).map((data, index) => ({
      name: index.toString(),
      price: data.price,
      volume: data.volume,
      date: data.timestamp.toLocaleDateString(),
      isPrediction: false
    })),
    {
      name: marketData.length.toString(),
      price: prediction.value,
      volume: 0,
      date: 'Prediction',
      isPrediction: true
    }
  ];

  const prices = chartData.map(d => d.price).filter(p => p !== null && p !== undefined) as number[];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceBuffer = (maxPrice - minPrice) * 0.1; // 10% buffer

  const technicalIndicators = [
    {
      name: 'RSI',
      value: prediction.technicalIndicators.rsi,
      status: prediction.technicalIndicators.rsi > 70 ? 'Sobrecompra' : 
              prediction.technicalIndicators.rsi < 30 ? 'Sobreventa' : 'Neutral',
      color: prediction.technicalIndicators.rsi > 70 ? 'text-accent-red' : 
             prediction.technicalIndicators.rsi < 30 ? 'text-accent-green' : 'text-dark-muted'
    },
    {
      name: 'MACD',
      value: prediction.technicalIndicators.macd.macd,
      status: prediction.technicalIndicators.macd.macd > prediction.technicalIndicators.macd.signal ? 'Alcista' : 'Bajista',
      color: prediction.technicalIndicators.macd.macd > prediction.technicalIndicators.macd.signal ? 'text-accent-green' : 'text-accent-red'
    },
    {
      name: 'SMA 20',
      value: prediction.technicalIndicators.movingAverages.sma20,
      status: currentPrice > prediction.technicalIndicators.movingAverages.sma20 ? 'Por encima' : 'Por debajo',
      color: currentPrice > prediction.technicalIndicators.movingAverages.sma20 ? 'text-accent-green' : 'text-accent-red'
    },
    {
      name: 'Bollinger',
      value: prediction.technicalIndicators.bollinger.middle,
      status: currentPrice > prediction.technicalIndicators.bollinger.upper ? 'Sobre Banda Sup.' :
              currentPrice < prediction.technicalIndicators.bollinger.lower ? 'Bajo Banda Inf.' : 'Entre Bandas',
      color: currentPrice > prediction.technicalIndicators.bollinger.upper ? 'text-accent-red' :
             currentPrice < prediction.technicalIndicators.bollinger.lower ? 'text-accent-green' : 'text-dark-muted'
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title">Análisis Técnico</h2>
            <p className="card-subtitle">Predicción algorítmica basada en indicadores técnicos</p>
          </div>
          <div className={`flex items-center space-x-2 ${getConfidenceColor(prediction.confidence)}`}>
            <Target className="w-5 h-5" />
            <span className="font-medium">Confianza {getConfidenceLevel(prediction.confidence)}</span>
          </div>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-dark-surface rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-muted">Precio Actual</span>
            <Activity className="w-4 h-4 text-dark-muted" />
          </div>
          <div className="text-2xl font-bold text-dark-text">
            {formatPrice(currentPrice)}
          </div>
        </div>

        <div className="bg-dark-surface rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-muted">Precio Predicho</span>
            <span className="text-lg">{getTrendIcon(prediction.trend)}</span>
          </div>
          <div className="text-2xl font-bold text-dark-text">
            {formatPrice(prediction.value)}
          </div>
          <div className={`text-sm font-medium ${getChangeColor(priceChange)}`}>
            {getChangeIcon(priceChange)} {formatPrice(Math.abs(priceChange))} ({formatPercentage(Math.abs(priceChangePercent))})
          </div>
        </div>

        <div className="bg-dark-surface rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-muted">Tendencia</span>
            {prediction.trend === 'bullish' ? (
              <TrendingUp className="w-4 h-4 text-accent-green" />
            ) : prediction.trend === 'bearish' ? (
              <TrendingDown className="w-4 h-4 text-accent-red" />
            ) : (
              <Activity className="w-4 h-4 text-dark-muted" />
            )}
          </div>
          <div className={`text-2xl font-bold capitalize ${
            prediction.trend === 'bullish' ? 'text-accent-green' :
            prediction.trend === 'bearish' ? 'text-accent-red' :
            'text-dark-muted'
          }`}>
            {prediction.trend}
          </div>
          <div className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
            {formatPercentage(prediction.confidence)} confianza
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Movimiento de Precios y Predicción</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9f7aea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9f7aea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis 
                dataKey="name" 
                stroke="#a3a3a3"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#a3a3a3"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                domain={[minPrice - priceBuffer, maxPrice + priceBuffer]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#f5f5f5'
                }}
                formatter={(value: any, name: string) => [
                  name === 'price' ? formatPrice(value) : value,
                  name === 'price' ? 'Precio' : name
                ]}
                labelFormatter={(label) => {
                  const item = chartData[parseInt(label)];
                  return item?.isPrediction ? 'Predicción' : `Día ${parseInt(label) + 1}`;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#9f7aea"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
                />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technical Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-dark-text mb-4">Indicadores Técnicos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {technicalIndicators.map((indicator) => (
            <div key={indicator.name} className="bg-dark-surface rounded-lg p-4">
              <div className="text-sm text-dark-muted mb-1">{indicator.name}</div>
              <div className="text-lg font-semibold text-dark-text">
                {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
              </div>
              <div className={`text-sm font-medium ${indicator.color}`}>
                {indicator.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
