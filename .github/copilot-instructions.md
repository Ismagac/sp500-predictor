<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SP500 Predictor - Development Instructions

This is a React TypeScript application for SP500 market prediction using algorithmic analysis and sentiment analysis with a Python FastAPI backend.

## Project Overview

The application consists of:
1. **Frontend**: React dashboard with three main sections
   - **Technical Analysis**: Algorithmic predictions based on technical indicators using XGBoost model
   - **Sentiment Analysis**: Market sentiment based on news analysis 
   - **News Cards**: Influential news articles affecting market sentiment
2. **Backend**: Python FastAPI server for model inference and real market data

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Charts**: Recharts for data visualization
- **APIs**: Backend API for predictions and market data
- **Icons**: Lucide React

### Backend
- **API**: FastAPI with CORS middleware
- **ML Model**: XGBoost loaded from AWS S3
- **Market Data**: Yahoo Finance for real SP500 data
- **Technical Analysis**: Custom indicators calculation (RSI, MACD, Bollinger, etc.)

## Architecture

### Frontend Services
- `MarketDataService`: Fetches market data from backend API with fallback to mock data
- `ModelInferenceService`: Calls backend for XGBoost predictions with fallback to rule-based mock
- `SentimentAnalysisService`: Analyzes market sentiment using Polygon.io news API

### Backend Services
- `ModelService`: Loads XGBoost model from S3 and makes predictions
- `MarketService`: Fetches real SP500 data from Yahoo Finance and calculates technical indicators
- `FastAPI main`: API endpoints for predictions, current data, and historical data

### Components
- `Header`: Application header with live status
- `TechnicalAnalysis`: Main prediction dashboard with charts and indicators
- `SentimentAnalysis`: Sentiment scoring and visualization
- `NewsCards`: Influential news articles display

## API Integration

### Backend API (Port 8000)
- `GET /api/prediction`: XGBoost prediction with technical indicators
- `GET /api/market/current`: Current SP500 price and market data
- `GET /api/market/historical?period=1mo`: Historical market data
- `GET /health`: Health check endpoint

### Fallback Strategy
- Frontend attempts backend API calls first
- Falls back to mock data if backend unavailable
- Console logs indicate which data source is being used

## Styling Guidelines

- Use dark theme with custom color palette
- Apply consistent spacing with Tailwind utilities
- Use custom CSS classes defined in `index.css`:
  - `.card` for main content containers
  - `.btn-primary` and `.btn-secondary` for buttons
  - `.metric-positive/negative/neutral` for colored metrics
  - `.loading-spinner` for loading states

## Data Flow

### Technical Analysis
- Updates once per day after market close (4 PM ET)
- Backend fetches real SP500 data from Yahoo Finance
- Calculates 20+ technical indicators
- XGBoost model makes prediction based on features
- Frontend displays prediction with confidence level

### Sentiment & News
- Can be refreshed manually anytime
- Polygon.io API provides news articles
- Sentiment analysis on article titles/descriptions
- Influence score calculated per article

## Configuration

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_POLYGON_API_KEY=your_polygon_key
```

### Backend Environment Variables (.env)
```env
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=sp500-models
S3_MODEL_KEY=xgboost_sp500_model.pkl
POLYGON_API_KEY=your_polygon_key
PORT=8000
DEBUG=true
```

## Model Requirements

### XGBoost Model Features (Expected in S3)
The model should be trained on these features:
- current_price, rsi, macd_line, macd_signal
- sma_10, sma_20, sma_50, sma_100, sma_200
- bb_upper, bb_middle, bb_lower, bb_width
- adx, obv, ret_1d, ret_5d, vol_20
- volume, bb_position, distance_to_sma_20, distance_to_sma_50

### Model Format
- Pickled XGBoost model (.pkl file)
- Should have `predict()` and optionally `predict_proba()` methods
- Expected to return single prediction value

## Development Notes

- All components use TypeScript with proper type definitions
- Error handling implemented for all API calls
- Loading states managed per service
- Auto-refresh functionality respects rate limits
- Responsive design supports mobile and desktop
- Spanish language interface for better UX

## CORS Solution

- Backend implements CORS middleware for frontend origins
- Direct S3 access from frontend blocked by CORS
- Backend serves as proxy for model inference
- Fallback to frontend mock if backend unavailable

## Best Practices

- Use semantic HTML elements
- Implement proper error boundaries
- Handle loading states consistently
- Format numbers and dates using utility functions
- Use proper TypeScript types for all props and state
- Cache API responses to minimize requests
- Graceful degradation when services unavailable

## Realistic Data

- SP500 prices around 6,184 (current market levels)
- Technical indicators based on real market data
- Volatility and volume realistic for market conditions
- Mock data maintains realistic relationships between indicators
