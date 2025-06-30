import asyncio
import logging
from market_service import market_service
from model_service import model_service

# Configure logging to see what's happening
logging.basicConfig(level=logging.DEBUG)

async def main():
    print("=== Testing Market Service ===")
    
    # Test current market data
    print("1. Testing current market data...")
    try:
        data = await market_service.get_current_sp500_data()
        if data:
            print(f"✓ Market data retrieved: {data}")
        else:
            print("✗ No market data")
    except Exception as e:
        print(f"✗ Error getting market data: {e}")
    
    # Test historical data
    print("\n2. Testing historical data...")
    try:
        hist = await market_service.get_historical_data("5d")
        if hist is not None:
            print(f"✓ Historical data shape: {hist.shape}")
            print(f"✓ Columns: {list(hist.columns)}")
            print(f"✓ Last 3 rows:")
            print(hist.tail(3))
        else:
            print("✗ No historical data")
    except Exception as e:
        print(f"✗ Error getting historical data: {e}")
    
    # Test features
    print("\n3. Testing features for prediction...")
    try:
        features = await market_service.get_features_for_prediction()
        if features:
            print(f"✓ Features generated: {len(features)} features")
            print(f"✓ First 5 features: {features[:5]}")
            print(f"✓ Last 5 features: {features[-5:]}")
        else:
            print("✗ No features generated")
    except Exception as e:
        print(f"✗ Error generating features: {e}")
    
    # Test model loading
    print("\n4. Testing model loading...")
    try:
        success = await model_service.load_model()
        if success:
            print("✓ Model loaded successfully")
            
            # Test prediction if we have features
            if 'features' in locals() and features:
                print("\n5. Testing prediction...")
                result = await model_service.predict(features)
                if result:
                    print(f"✓ Prediction successful: {result}")
                else:
                    print("✗ Prediction failed")
        else:
            print("✗ Model loading failed")
    except Exception as e:
        print(f"✗ Error with model: {e}")

if __name__ == "__main__":
    asyncio.run(main())
