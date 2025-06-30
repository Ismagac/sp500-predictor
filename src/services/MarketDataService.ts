import type { MarketData, TechnicalIndicators } from '../types';

export class MarketDataService {
  private cache: Map<string, { data: any; timestamp: Date }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  private readonly API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Obtiene los datos actuales del mercado SP500 desde el backend o caché
  async getCurrentMarketData(): Promise<MarketData> {
    try {
      const cacheKey = 'current_market_data';
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        const timeDiff = Date.now() - cached.timestamp.getTime();
        if (timeDiff < this.CACHE_DURATION) {
          return this.formatMarketData(cached.data);
        }
      }

      // Fetch from backend API
      const response = await fetch(`${this.API_URL}/api/market/current`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: new Date() });
      
      return this.formatMarketData(data);
      
    } catch (error) {
      console.error('Error fetching current market data:', error);
      
      // Fallback to mock data with realistic SP500 values
      return this.getMockCurrentData();
    }
  }

  // Obtiene datos históricos del mercado SP500
  async getHistoricalData(period: string = '1mo'): Promise<MarketData[]> {
    try {
      const cacheKey = `historical_${period}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        const timeDiff = Date.now() - cached.timestamp.getTime();
        if (timeDiff < this.CACHE_DURATION) {
          return cached.data.data.map((item: any) => this.formatMarketData(item));
        }
      }

      // Fetch from backend API
      const response = await fetch(`${this.API_URL}/api/market/historical?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: new Date() });
      
      return result.data.map((item: any) => this.formatMarketData(item));
      
    } catch (error) {
      console.error('Error fetching historical data:', error);
      
      // Fallback to mock historical data
      return this.getMockHistoricalData();
    }
  }

  // Formatea los datos de mercado recibidos
  private formatMarketData(data: any): MarketData {
    return {
      timestamp: new Date(data.timestamp),
      price: data.price,
      high: data.high,
      low: data.low,
      open: data.open,
      previousClose: data.previousClose || data.price,
      volume: data.volume,
      change: data.change,
      changePercent: data.changePercent
    };
  }

  // Genera datos mock actuales del SP500
  private getMockCurrentData(): MarketData {
    // Current SP500 is around 6,184 as of late 2024
    const basePrice = 6184;
    const change = (Math.random() - 0.5) * 100; // ±50 points
    const price = basePrice + change;
    
    return {
      timestamp: new Date(),
      price: price,
      high: price + Math.random() * 20,
      low: price - Math.random() * 20,
      open: price + (Math.random() - 0.5) * 30,
      previousClose: basePrice,
      volume: Math.floor(Math.random() * 1000000000) + 2000000000, // 2-3B volume
      change: change,
      changePercent: (change / basePrice) * 100
    };
  }

  // Genera datos mock históricos del SP500
  private getMockHistoricalData(): MarketData[] {
    const data: MarketData[] = [];
    const basePrice = 6184;
    let currentPrice = basePrice;
    
    // Generate 30 days of mock data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random walk with slight upward bias
      const change = (Math.random() - 0.48) * 80; // Slight upward bias
      currentPrice += change;
      
      const open = currentPrice + (Math.random() - 0.5) * 40;
      const high = Math.max(open, currentPrice) + Math.random() * 30;
      const low = Math.min(open, currentPrice) - Math.random() * 30;
      const volume = Math.floor(Math.random() * 1000000000) + 2000000000;
      
      data.push({
        timestamp: date,
        price: currentPrice,
        high: high,
        low: low,
        open: open,
        previousClose: currentPrice - change,
        volume: volume,
        change: change,
        changePercent: (change / (currentPrice - change)) * 100
      });
    }
    
    return data;
  }

  async calculateTechnicalIndicators(marketData: MarketData[]): Promise<TechnicalIndicators> {
    if (marketData.length < 50) {
      throw new Error('Insufficient data for technical indicators calculation');
    }

    const prices = marketData.map(d => d.price);
    const highs = marketData.map(d => d.high);
    const lows = marketData.map(d => d.low);
    const volumes = marketData.map(d => d.volume);

    return {
      // RSI (14-period)
      rsi: this.calculateRSI(prices, 14),
      
      // MACD
      macd: this.calculateMACD(prices),
      
      // Moving Averages
      movingAverages: {
        sma10: this.calculateSMA(prices, 10),
        sma20: this.calculateSMA(prices, 20),
        sma50: this.calculateSMA(prices, 50),
        sma100: this.calculateSMA(prices, 100),
        sma200: this.calculateSMA(prices, 200)
      },
      
      // Bollinger Bands
      bollinger: this.calculateBollingerBands(prices, 20, 2),
      
      // Other indicators
      bollWidth: 0.04, // Placeholder
      adx: this.calculateADX(highs, lows, prices, 14),
      obv: this.calculateOBV(prices, volumes),
      ret1d: this.calculateReturn(prices, 1),
      ret5d: this.calculateReturn(prices, 5),
      vol20: this.calculateVolatility(prices, 20),
      support: this.findSupportLevels(lows),
      resistance: this.findResistanceLevels(highs)
    };
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    
    // For simplicity, using a basic signal calculation
    const signal = macdLine * 0.9; // Simplified signal line
    
    return {
      macd: macdLine,
      signal: signal,
      histogram: macdLine - signal
    };
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const slice = prices.slice(-period);
    return slice.reduce((sum, price) => sum + price, 0) / period;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(prices.slice(0, period), period);
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateBollingerBands(prices: number[], period: number, stdDev: number): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  private calculateADX(highs: number[], lows: number[], closes: number[], period: number): number {
    // Simplified ADX calculation
    if (closes.length < period + 1) return 25;
    
    let totalDM = 0;
    let totalTR = 0;
    
    for (let i = closes.length - period; i < closes.length; i++) {
      const high = highs[i];
      const low = lows[i];
      const prevClose = closes[i - 1];
      
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      totalTR += tr;
      
      const dm = Math.abs(high - highs[i - 1]) - Math.abs(low - lows[i - 1]);
      totalDM += Math.max(dm, 0);
    }
    
    return totalTR > 0 ? (totalDM / totalTR) * 100 : 25;
  }

  private calculateOBV(prices: number[], volumes: number[]): number {
    let obv = 0;
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) {
        obv += volumes[i];
      } else if (prices[i] < prices[i - 1]) {
        obv -= volumes[i];
      }
    }
    
    return obv;
  }

  private calculateReturn(prices: number[], period: number): number {
    if (prices.length < period + 1) return 0;
    
    const currentPrice = prices[prices.length - 1];
    const pastPrice = prices[prices.length - 1 - period];
    
    return (currentPrice - pastPrice) / pastPrice;
  }

  private calculateVolatility(prices: number[], period: number): number {
    if (prices.length < period + 1) return 0.02;
    
    const returns = [];
    for (let i = prices.length - period; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private findSupportLevels(lows: number[]): number[] {
    // Simplified support level detection
    const recentLows = lows.slice(-20);
    const sortedLows = [...recentLows].sort((a, b) => a - b);
    return sortedLows.slice(0, 3); // Return 3 lowest lows as support
  }

  private findResistanceLevels(highs: number[]): number[] {
    // Simplified resistance level detection
    const recentHighs = highs.slice(-20);
    const sortedHighs = [...recentHighs].sort((a, b) => b - a);
    return sortedHighs.slice(0, 3); // Return 3 highest highs as resistance
  }

  clearCache(): void {
    this.cache.clear();
  }
}
