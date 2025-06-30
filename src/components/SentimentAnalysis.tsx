import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp } from 'lucide-react';
import type { SentimentData } from '../types';
import { getSentimentColor, getSentimentIcon, formatNumber } from '../utils';

interface SentimentAnalysisProps {
  sentimentData: SentimentData | null;
  loading: boolean;
}

const COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#9ca3af'
};

export function SentimentAnalysis({ sentimentData, loading }: SentimentAnalysisProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Análisis de Sentimiento</h2>
          <p className="card-subtitle">Sentimiento del mercado basado en análisis de noticias</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Análisis de Sentimiento</h2>
          <p className="card-subtitle">Sentimiento del mercado basado en análisis de noticias</p>
        </div>
        <div className="flex items-center justify-center h-64 text-dark-muted">
          <p>No hay datos de sentimiento disponibles</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Positivo', value: sentimentData.breakdown.positive, color: COLORS.positive },
    { name: 'Negativo', value: sentimentData.breakdown.negative, color: COLORS.negative },
    { name: 'Neutral', value: sentimentData.breakdown.neutral, color: COLORS.neutral }
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Positivo', value: sentimentData.breakdown.positive, fill: COLORS.positive },
    { name: 'Neutral', value: sentimentData.breakdown.neutral, fill: COLORS.neutral },
    { name: 'Negativo', value: sentimentData.breakdown.negative, fill: COLORS.negative }
  ];

  const getSentimentGrade = (score: number): string => {
    if (score >= 0.6) return 'A+';
    if (score >= 0.4) return 'A';
    if (score >= 0.2) return 'B+';
    if (score >= 0.1) return 'B';
    if (score >= -0.1) return 'C';
    if (score >= -0.2) return 'D+';
    if (score >= -0.4) return 'D';
    return 'F';
  };

  const getSentimentDescription = (label: string): string => {
    if (label === 'positive') return 'Alcista';
    if (label === 'negative') return 'Bajista';
    return 'Neutral';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title">Análisis de Sentimiento</h2>
            <p className="card-subtitle">Sentimiento del mercado basado en análisis de noticias</p>
          </div>
          <div className="flex items-center space-x-2 text-dark-muted">
            <Users className="w-4 h-4" />
            <span className="text-sm">{sentimentData.articlesAnalyzed} artículos analizados</span>
          </div>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* General Score */}
        <div className="bg-dark-surface rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${
              sentimentData.score > 0 ? 'border-accent-green bg-accent-green/10 text-accent-green' :
              sentimentData.score < 0 ? 'border-accent-red bg-accent-red/10 text-accent-red' :
              'border-dark-muted bg-dark-muted/10 text-dark-muted'
            }`}>
              {getSentimentGrade(sentimentData.score)}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-dark-text">Puntuación General</h3>
          <p className={`text-sm font-medium ${
            sentimentData.score > 0 ? 'text-accent-green' :
            sentimentData.score < 0 ? 'text-accent-red' :
            'text-dark-muted'
          }`}>
            {getSentimentDescription(sentimentData.label)}
          </p>
        </div>

        {/* Dominant Sentiment */}
        <div className="bg-dark-surface rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            {getSentimentIcon(sentimentData.label)}
          </div>
          <h3 className="text-lg font-semibold text-dark-text">Sentimiento Dominante</h3>
          <p className={`text-sm font-medium capitalize ${getSentimentColor(sentimentData.label)}`}>
            {sentimentData.label === 'positive' ? 'Positivo' : sentimentData.label === 'negative' ? 'Negativo' : 'Neutral'}
          </p>
        </div>

        {/* Sentiment Trend */}
        <div className="bg-dark-surface rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <TrendingUp className="w-16 h-16 text-accent-purple" />
          </div>
          <h3 className="text-lg font-semibold text-dark-text">Tendencia del Sentimiento</h3>
          <p className="text-sm font-medium text-dark-muted">
            {sentimentData.score > 0 ? 'Alcista' : sentimentData.score < 0 ? 'Bajista' : 'Neutral'}
          </p>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-4">Desglose de Sentimiento</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (midAngle == null || percent == null) return null;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                        {(percent * 100).toFixed(0) + '%'}
                      </text>
                    );
                  }}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#f5f5f5'
                  }}
                  formatter={(value: any, name: string) => [formatNumber(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-4">Distribución de Artículos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis type="number" stroke="#a3a3a3" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={12} />
                <Tooltip 
                  cursor={{ fill: 'rgba(159, 122, 234, 0.1)' }}
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#f5f5f5'
                  }}
                  formatter={(value: any) => [formatNumber(value), 'Artículos']}
                />
                <Bar dataKey="value" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
