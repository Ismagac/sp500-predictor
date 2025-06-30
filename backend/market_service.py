import yfinance as yf
import pandas as pd
import numpy as np
import ta
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class MarketDataService:
    def __init__(self):
        self.sp500_ticker = "^GSPC"
        self.cache = {}
        self.cache_duration = 300  # 5 minutes

    # Obtiene el precio actual y datos básicos del SP500
    async def get_current_sp500_data(self) -> Optional[Dict]:
        """Get current SP500 price and basic info"""
        try:
            cache_key = "current_sp500"
            now = datetime.now()
            
            # Check cache
            if cache_key in self.cache:
                cached_data, cached_time = self.cache[cache_key]
                if (now - cached_time).seconds < self.cache_duration:
                    return cached_data

            # Fetch from Yahoo Finance
            ticker = yf.Ticker(self.sp500_ticker)
            info = ticker.info
            hist = ticker.history(period="2d")
            
            if len(hist) < 2:
                logger.error("Not enough historical data")
                return None

            current = hist.iloc[-1]
            previous = hist.iloc[-2]
            
            data = {
                'price': float(current['Close']),
                'open': float(current['Open']),
                'high': float(current['High']),
                'low': float(current['Low']),
                'volume': int(current['Volume']),
                'previousClose': float(previous['Close']),
                'change': float(current['Close'] - previous['Close']),
                'changePercent': float((current['Close'] - previous['Close']) / previous['Close'] * 100),
                'timestamp': current.name.isoformat()
            }
            
            # Cache the result
            self.cache[cache_key] = (data, now)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching SP500 data: {str(e)}")
            return None

    # Obtiene datos históricos del SP500 con indicadores técnicos
    async def get_historical_data(self, period: str = "1y") -> Optional[pd.DataFrame]:
        """Get historical SP500 data with technical indicators"""
        try:
            cache_key = f"historical_{period}"
            now = datetime.now()
            
            # Check cache
            if cache_key in self.cache:
                cached_data, cached_time = self.cache[cache_key]
                if (now - cached_time).seconds < self.cache_duration:
                    return cached_data

            # Fetch historical data
            ticker = yf.Ticker(self.sp500_ticker)
            hist = ticker.history(period=period)
            
            if len(hist) < 50:  # Need enough data for indicators
                logger.error("Not enough historical data for technical analysis")
                return None

            # Calculate technical indicators
            hist = self.calculate_technical_indicators(hist)
            
            # Cache the result
            self.cache[cache_key] = (hist, now)
            
            return hist
            
        except Exception as e:
            logger.error(f"Error fetching historical data: {str(e)}")
            return None

    # Calcula indicadores técnicos para el dataframe
    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators for the dataframe"""
        try:
            # RSI
            df['rsi'] = ta.momentum.RSIIndicator(df['Close'], window=14).rsi()
            
            # MACD
            macd = ta.trend.MACD(df['Close'])
            df['macd'] = macd.macd()
            df['macd_signal'] = macd.macd_signal()
            df['macd_histogram'] = macd.macd_diff()
            
            # Moving Averages
            df['sma_10'] = ta.trend.SMAIndicator(df['Close'], window=10).sma_indicator()
            df['sma_20'] = ta.trend.SMAIndicator(df['Close'], window=20).sma_indicator()
            df['sma_50'] = ta.trend.SMAIndicator(df['Close'], window=50).sma_indicator()
            df['sma_100'] = ta.trend.SMAIndicator(df['Close'], window=100).sma_indicator()
            df['sma_200'] = ta.trend.SMAIndicator(df['Close'], window=200).sma_indicator()
            
            # Bollinger Bands
            bollinger = ta.volatility.BollingerBands(df['Close'], window=20)
            df['bb_upper'] = bollinger.bollinger_hband()
            df['bb_middle'] = bollinger.bollinger_mavg()
            df['bb_lower'] = bollinger.bollinger_lband()
            df['bb_width'] = bollinger.bollinger_wband()
            
            # ADX
            df['adx'] = ta.trend.ADXIndicator(df['High'], df['Low'], df['Close']).adx()
            
            # OBV
            df['obv'] = ta.volume.OnBalanceVolumeIndicator(df['Close'], df['Volume']).on_balance_volume()
            
            # Returns
            df['ret_1d'] = df['Close'].pct_change(1)
            df['ret_5d'] = df['Close'].pct_change(5)
            
            # Volatility
            df['vol_20'] = df['ret_1d'].rolling(window=20).std()
            
            return df
            
        except Exception as e:
            logger.error(f"Error calculating technical indicators: {str(e)}")
            return df

    async def get_features_for_prediction(self) -> Optional[List[float]]:
        """Get current features for model prediction"""
        try:
            hist = await self.get_historical_data("6mo")
            if hist is None or len(hist) < 50:
                return None

            # Get the latest row with all indicators
            latest = hist.iloc[-1]
            
            # Create feature vector (same order as training data)
            features = [
                latest['Close'],           # current_price
                latest['rsi'],            # rsi
                latest['macd'],           # macd_line
                latest['macd_signal'],    # macd_signal
                latest['sma_10'],         # sma_10
                latest['sma_20'],         # sma_20
                latest['sma_50'],         # sma_50
                latest['sma_100'],        # sma_100
                latest['sma_200'],        # sma_200
                latest['bb_upper'],       # bb_upper
                latest['bb_middle'],      # bb_middle
                latest['bb_lower'],       # bb_lower
                latest['bb_width'],       # bb_width
                latest['adx'],            # adx
                latest['obv'],            # obv
                latest['ret_1d'],         # ret_1d
                latest['ret_5d'],         # ret_5d
                latest['vol_20'],         # vol_20
                latest['Volume'],         # volume
                # Add derived features
                (latest['Close'] - latest['bb_lower']) / (latest['bb_upper'] - latest['bb_lower']),  # bb_position
                latest['Close'] - latest['sma_20'],     # distance_to_sma_20
                latest['Close'] - latest['sma_50'],     # distance_to_sma_50
            ]
            
            # Replace NaN values with 0
            features = [0.0 if pd.isna(x) else float(x) for x in features]
            
            return features
            
        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            return None

    async def get_technical_indicators_summary(self) -> Optional[Dict]:
        """Get current technical indicators summary"""
        try:
            hist = await self.get_historical_data("3mo")
            if hist is None or len(hist) < 50:
                return None

            latest = hist.iloc[-1]
            
            return {
                'rsi': float(latest['rsi']) if not pd.isna(latest['rsi']) else 50.0,
                'macd': {
                    'macd': float(latest['macd']) if not pd.isna(latest['macd']) else 0.0,
                    'signal': float(latest['macd_signal']) if not pd.isna(latest['macd_signal']) else 0.0,
                    'histogram': float(latest['macd_histogram']) if not pd.isna(latest['macd_histogram']) else 0.0
                },
                'movingAverages': {
                    'sma10': float(latest['sma_10']) if not pd.isna(latest['sma_10']) else latest['Close'],
                    'sma20': float(latest['sma_20']) if not pd.isna(latest['sma_20']) else latest['Close'],
                    'sma50': float(latest['sma_50']) if not pd.isna(latest['sma_50']) else latest['Close'],
                    'sma100': float(latest['sma_100']) if not pd.isna(latest['sma_100']) else latest['Close'],
                    'sma200': float(latest['sma_200']) if not pd.isna(latest['sma_200']) else latest['Close']
                },
                'bollinger': {
                    'upper': float(latest['bb_upper']) if not pd.isna(latest['bb_upper']) else latest['Close'] * 1.02,
                    'middle': float(latest['bb_middle']) if not pd.isna(latest['bb_middle']) else latest['Close'],
                    'lower': float(latest['bb_lower']) if not pd.isna(latest['bb_lower']) else latest['Close'] * 0.98
                },
                'bollWidth': float(latest['bb_width']) if not pd.isna(latest['bb_width']) else 0.04,
                'adx': float(latest['adx']) if not pd.isna(latest['adx']) else 25.0,
                'obv': float(latest['obv']) if not pd.isna(latest['obv']) else 0.0,
                'ret1d': float(latest['ret_1d']) if not pd.isna(latest['ret_1d']) else 0.0,
                'ret5d': float(latest['ret_5d']) if not pd.isna(latest['ret_5d']) else 0.0,
                'vol20': float(latest['vol_20']) if not pd.isna(latest['vol_20']) else 0.02,
                'support': [],  # Would need more complex calculation
                'resistance': []  # Would need more complex calculation
            }
            
        except Exception as e:
            logger.error(f"Error getting technical indicators: {str(e)}")
            return None

# Global market data service instance
market_service = MarketDataService()
