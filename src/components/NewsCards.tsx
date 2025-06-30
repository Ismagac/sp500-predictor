import { ExternalLink, Calendar, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import type { NewsArticle } from '../types';
import { formatRelativeTime, getSentimentColor, getSentimentIcon, formatNumber } from '../utils';

interface NewsCardProps {
  articles: NewsArticle[];
  loading: boolean;
}

export function NewsCards({ articles, loading }: NewsCardProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Noticias Influyentes</h2>
          <p className="card-subtitle">Artículos de noticias recientes que afectan el sentimiento del mercado</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Noticias Influyentes</h2>
          <p className="card-subtitle">Artículos de noticias recientes que afectan el sentimiento del mercado</p>
        </div>
        <div className="flex items-center justify-center h-64 text-dark-muted">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p>No hay noticias influyentes disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  const getInfluenceLevel = (influence: number): 'high' | 'medium' | 'low' => {
    if (influence >= 0.7) return 'high';
    if (influence >= 0.4) return 'medium';
    return 'low';
  };

  const getInfluenceIcon = (influence: number) => {
    const level = getInfluenceLevel(influence);
    switch (level) {
      case 'high':
        return <TrendingUp className="w-4 h-4 text-accent-green" />;
      case 'medium':
        return <Minus className="w-4 h-4 text-accent-purple" />;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-dark-muted" />;
    }
  };

  const getInfluenceColor = (influence: number) => {
    const level = getInfluenceLevel(influence);
    switch (level) {
      case 'high': return 'border-accent-green bg-accent-green/5';
      case 'medium': return 'border-accent-purple bg-accent-purple/5';
      case 'low': return 'border-dark-border bg-dark-surface';
    }
  };

  const getSentimentBadgeColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'bg-accent-green/10 text-accent-green border-accent-green/20';
      case 'negative': return 'bg-accent-red/10 text-accent-red border-accent-red/20';
      case 'neutral': return 'bg-dark-muted/10 text-dark-muted border-dark-muted/20';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title">Noticias Influyentes</h2>
            <p className="card-subtitle">Artículos de noticias recientes que afectan el sentimiento del mercado</p>
          </div>
          <div className="text-sm text-dark-muted">
            {articles.length} artículo{articles.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => {
          const influenceLevel = getInfluenceLevel(article.influence);
          return (
          <div
            key={article.id}
            className={`border rounded-lg p-4 transition-all duration-300 hover:shadow-lg cursor-pointer ${getInfluenceColor(article.influence)}`}
            onClick={() => window.open(article.url, '_blank')}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-dark-surface text-dark-text px-2 py-1 rounded text-xs font-medium">
                  #{index + 1}
                </span>
                <div className="flex items-center space-x-1">
                  {getInfluenceIcon(article.influence)}
                  <span className={`text-xs font-medium capitalize ${
                    influenceLevel === 'high' ? 'text-accent-green' :
                    influenceLevel === 'medium' ? 'text-accent-yellow' :
                    'text-dark-muted'
                  }`}>
                    {influenceLevel} Influence
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentBadgeColor(article.sentiment.label)}`}>
                  {getSentimentIcon(article.sentiment.label)} {article.sentiment.label}
                </span>
                <ExternalLink className="w-4 h-4 text-dark-muted" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-dark-text mb-2 line-clamp-2 leading-tight">
              {article.title}
            </h3>

            <p className="text-dark-muted text-sm mb-3 line-clamp-2 leading-relaxed">
              {article.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-dark-muted">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatRelativeTime(article.publishedAt)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <span>Fuente:</span>
                  <span className="font-medium text-dark-text">{article.source}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span>Puntuación de Sentimiento:</span>
                  <span className={`font-medium ${getSentimentColor(article.sentiment.label)}`}>
                    {formatNumber(article.sentiment.score, 2)}
                  </span>
                </div>
              </div>
            </div>

            {article.keywords && article.keywords.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dark-border/50">
                <div className="flex flex-wrap gap-1">
                  {article.keywords.slice(0, 5).map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-dark-surface text-dark-muted text-xs rounded-md"
                    >
                      {keyword}
                    </span>
                  ))}
                  {article.keywords.length > 5 && (
                    <span className="px-2 py-1 bg-dark-surface text-dark-muted text-xs rounded-md">
                      +{article.keywords.length - 5} más
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
        })}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-8 text-dark-muted">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p>No se encontraron artículos de noticias</p>
          <p className="text-sm">Vuelve más tarde para actualizaciones del mercado</p>
        </div>
      )}
    </div>
  );
}
