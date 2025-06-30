import boto3
import joblib
import pickle
import io
import logging
from typing import Optional
from config import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, S3_BUCKET_NAME, S3_MODEL_KEY

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_DEFAULT_REGION
        )
        self.model = None
        self.model_loaded = False

    # Carga el modelo XGBoost desde S3
    async def load_model(self) -> bool:
        """Load XGBoost model from S3"""
        try:
            if self.model_loaded:
                return True

            logger.info(f"Loading model from S3: {S3_BUCKET_NAME}/{S3_MODEL_KEY}")
            
            # Download model from S3
            response = self.s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=S3_MODEL_KEY)
            model_data = response['Body'].read()
            
            # Try to load with joblib first (common for scikit-learn/XGBoost)
            try:
                model_io = io.BytesIO(model_data)
                self.model = joblib.load(model_io)
                logger.info("Model loaded successfully with joblib")
            except Exception as joblib_error:
                logger.info(f"Joblib loading failed: {joblib_error}, trying pickle...")
                # Fallback to pickle
                self.model = pickle.loads(model_data)
                logger.info("Model loaded successfully with pickle")
            
            self.model_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Error loading model from S3: {str(e)}")
            return False

    # Realiza una predicción usando el modelo cargado
    async def predict(self, features: list) -> Optional[dict]:
        """Make prediction using the loaded model"""
        try:
            if not self.model_loaded:
                success = await self.load_model()
                if not success:
                    return None

            # Make prediction
            import numpy as np
            import xgboost as xgb
            import pandas as pd
            
            logger.info(f"Received {len(features)} features for prediction.")
            logger.debug(f"Feature values (first 20): {features[:20]}")
            
            # Reorder features according to the expected training order
            expected_order = [12, 10, 2, 14, 19, 17, 1, 5, 9, 11, 18, 16, 8, 3, 15, 4, 7, 13, 6]
            
            logger.info(f"Expected feature order (1-based): {expected_order}")

            # Convert from 1-based to 0-based indexing and reorder
            reordered_features = []
            # Pad features with a default value if it's shorter than the max index required
            padded_features = features + [0.0] * (max(expected_order) - len(features))

            for idx in expected_order:
                reordered_features.append(padded_features[idx-1]) # Convert to 0-based index
            
            logger.info(f"Reordered {len(reordered_features)} features.")
            logger.debug(f"Reordered feature values: {reordered_features}")

            # Create column names as strings as expected by the model
            column_names = [str(i) for i in range(1, len(reordered_features) + 1)]
            
            # Convert to DataFrame with correct column names
            features_array = np.array(reordered_features).reshape(1, -1)
            dframe = pd.DataFrame(features_array, columns=column_names)
            
            logger.info("Feature DataFrame created successfully. Columns:")
            logger.debug(dframe.columns.tolist())
            logger.debug("DataFrame content:")
            logger.debug(dframe.to_string())

            dmatrix = xgb.DMatrix(dframe)
            
            prediction = self.model.predict(dmatrix)[0]
            logger.info(f"Raw prediction from model: {prediction}")
            
            # Get prediction probability if available
            try:
                probabilities = self.model.predict_proba(dmatrix)[0]
                confidence = max(probabilities)
            except:
                # For regression models, estimate confidence based on prediction value
                confidence = min(0.95, max(0.1, abs(prediction) / 10))

            return {
                'prediction': float(prediction),
                'confidence': float(confidence)
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            return None

# Global model service instance
model_service = ModelService()
