import os
from dotenv import load_dotenv

load_dotenv()

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'sp500-models')
S3_MODEL_KEY = os.getenv('S3_MODEL_KEY', 'xgboost_sp500_model.pkl')

# Polygon.io API
POLYGON_API_KEY = os.getenv('POLYGON_API_KEY')

# Server Configuration
PORT = int(os.getenv('PORT', 8000))
HOST = os.getenv('HOST', '0.0.0.0')
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'

# Model Configuration
MODEL_CACHE_DURATION = int(os.getenv('MODEL_CACHE_DURATION', 3600))  # 1 hour
MARKET_DATA_CACHE_DURATION = int(os.getenv('MARKET_DATA_CACHE_DURATION', 300))  # 5 minutes
