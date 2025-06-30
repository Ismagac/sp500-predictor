# Railway Deployment Guide

## Backend Deployment on Railway

### 1. Repository Setup
- The backend is located in the `/backend` folder
- Railway is configured to deploy only the backend directory
- All necessary configuration files are in place

### 2. Railway Configuration Files

#### `backend/nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["python312"]

[phases.install]
cmds = ["pip install --upgrade pip", "pip install -r requirements.txt"]

[start]
cmd = "uvicorn main:app --host 0.0.0.0 --port $PORT"
```

#### `backend/Procfile`
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### `backend/runtime.txt`
```
python-3.12.7
```

#### `backend/.railwayignore`
```
__pycache__/
*.pyc
.env
.DS_Store
node_modules/
```

### 3. Dependencies
The `requirements.txt` has been updated for Python 3.12 compatibility:
- Uses compatible version ranges instead of exact versions
- Includes all necessary ML libraries (XGBoost, pandas, numpy, scikit-learn)
- Uses FastAPI and Uvicorn for the web server

### 4. Deployment Steps

1. **Create New Railway Project**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `sp500-predictor` repository

2. **Configure Root Directory**
   - In Railway dashboard, go to your service settings
   - Set "Root Directory" to `backend`
   - This ensures Railway only deploys the backend folder

3. **Set Environment Variables**
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_DEFAULT_REGION=us-east-1
   S3_BUCKET_NAME=sp500-models
   S3_MODEL_KEY=xgboost_sp500_model.pkl
   POLYGON_API_KEY=your_polygon_api_key
   DEBUG=false
   ```

4. **Deploy**
   - Railway will automatically detect the Python app
   - The build process will install dependencies
   - The app will start using uvicorn

### 5. Verify Deployment

After deployment, test these endpoints:
- `https://your-app.railway.app/health` - Health check
- `https://your-app.railway.app/api/market/current` - Current market data
- `https://your-app.railway.app/api/prediction` - ML prediction

### 6. Update Frontend Configuration

Once the backend is deployed, update the frontend:

1. **Update `.env.production`**
   ```
   VITE_API_URL=https://your-app.railway.app
   VITE_POLYGON_API_KEY=your_polygon_key
   ```

2. **Redeploy Frontend**
   ```bash
   npm run deploy
   ```

### 7. Troubleshooting

#### Build Issues
- Check Railway logs for specific error messages
- Ensure all environment variables are set
- Verify the root directory is set to `backend`

#### Runtime Issues
- Check if the model can be loaded from S3
- Verify AWS credentials are correct
- Test individual endpoints using the Railway logs

#### CORS Issues
- The backend is configured with CORS for GitHub Pages
- If using a different frontend domain, update the CORS configuration in `main.py`

## Important Notes

- **Security**: Never commit real API keys to the repository
- **Monitoring**: Use Railway's built-in monitoring to track performance
- **Scaling**: Railway automatically scales based on traffic
- **Logs**: Check Railway logs for debugging and monitoring

## Build Error Solutions

If you encounter the numpy/distutils error:
1. The updated requirements.txt uses compatible versions
2. The nixpacks.toml is configured for Python 3.12
3. The build process upgrades pip before installing dependencies
