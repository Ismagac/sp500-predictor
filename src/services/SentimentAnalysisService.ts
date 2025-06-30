import type { SentimentData, NewsArticle } from '../types';

export interface PolygonNewsInsight {
  ticker: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_reasoning: string;
}

export interface PolygonNewsArticle {
  id: string;
  title: string;
  description: string;
  published_utc: string;
  article_url: string;
  publisher: {
    name: string;
    homepage_url: string;
    logo_url: string;
  };
  insights?: PolygonNewsInsight[];
  keywords?: string[];
}

export class SentimentAnalysisService {
  private apiKey: string;
  private baseUrl = 'https://api.polygon.io';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Analiza el sentimiento del SP500 usando noticias de Polygon.io
  async analyzeSP500Sentiment(daysBack: number = 7): Promise<SentimentData> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - daysBack);
      const sinceIso = since.toISOString();

      const news = await this.getNewsWithRetry('SPY', sinceIso);
      
      let sentimentScore = 0;
      let totalArticles = 0;
      let positive = 0;
      let negative = 0;
      let neutral = 0;

      for (const article of news) {
        if (article.insights) {
          for (const insight of article.insights) {
            if (insight.ticker === 'SPY') {
              totalArticles++;
              
              switch (insight.sentiment) {
                case 'positive':
                  sentimentScore += 1;
                  positive++;
                  break;
                case 'negative':
                  sentimentScore -= 1;
                  negative++;
                  break;
                default:
                  neutral++;
                  break;
              }
            }
          }
        }
      }

      const avgScore = totalArticles > 0 ? sentimentScore / totalArticles : 0;
      const confidence = Math.min(totalArticles / 20, 1); // More articles = higher confidence

      return {
        score: avgScore,
        label: this.getLabel(avgScore),
        confidence,
        articlesAnalyzed: totalArticles,
        lastUpdated: new Date(),
        breakdown: {
          positive,
          negative,
          neutral
        }
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  // Obtiene las noticias más influyentes sobre el SP500
  async getInfluentialNews(daysBack: number = 7, limit: number = 10): Promise<NewsArticle[]> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - daysBack);
      const sinceIso = since.toISOString();

      const news = await this.getNewsWithRetry('SPY', sinceIso, limit);
      
      return news
        .filter(article => article.insights && article.insights.length > 0)
        .map(article => this.transformToNewsArticle(article))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting influential news:', error);
      throw new Error('Failed to get influential news');
    }
  }

  // Realiza una petición a la API de Polygon.io con reintentos
  private async getNewsWithRetry(
    ticker: string, 
    since: string, 
    limit: number = 50, 
    maxAttempts: number = 5
  ): Promise<PolygonNewsArticle[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const url = `${this.baseUrl}/v2/reference/news?ticker=${ticker}&published_utc.gte=${since}&limit=${limit}&apikey=${this.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit hit, implement exponential backoff
            const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.log(`Rate limit hit. Retrying in ${waitTime}ms...`);
            await this.sleep(waitTime);
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results || [];
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          console.error(`Failed after ${maxAttempts} attempts:`, error);
          throw error;
        }
        
        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`Attempt ${attempt + 1} failed. Retrying in ${waitTime}ms...`);
        await this.sleep(waitTime);
      }
    }
    
    return [];
  }

  // Transforma un artículo de Polygon.io a NewsArticle
  private transformToNewsArticle(polygonArticle: PolygonNewsArticle): NewsArticle {
    const insight = polygonArticle.insights?.[0];
    const sentimentScore = this.getSentimentScore(insight?.sentiment || 'neutral');
    
    return {
      id: polygonArticle.id,
      title: polygonArticle.title,
      description: polygonArticle.description,
      url: polygonArticle.article_url,
      publishedAt: new Date(polygonArticle.published_utc),
      source: polygonArticle.publisher.name,
      sentiment: {
        score: sentimentScore,
        label: insight?.sentiment || 'neutral'
      },
      influence: 1,
      keywords: polygonArticle.keywords || []
    };
  }

  // Genera una etiqueta de sentimiento a partir del score
  private getLabel(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  // Devuelve un valor numérico para el sentimiento
  private getSentimentScore(sentiment: string): number {
    if (sentiment === 'positive') return 1;
    if (sentiment === 'negative') return -1;
    return 0;
  }

  // Espera asíncrona
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
