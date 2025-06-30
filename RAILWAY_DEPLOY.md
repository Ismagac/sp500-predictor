# Railway Deployment Instructions

## 🚀 Deploy Backend to Railway

### Step 1: Prepare for Railway
1. Go to https://railway.app
2. Sign up with GitHub account
3. Connect your repository

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose "sp500-predictor" repository
4. **Important**: Set root directory to `/backend`

### Step 3: Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```
AWS_ACCESS_KEY_ID=your_real_aws_access_key
AWS_SECRET_ACCESS_KEY=your_real_aws_secret_key
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET_NAME=your-real-s3-bucket
S3_MODEL_KEY=path/to/your/model.pkl
POLYGON_API_KEY=your_real_polygon_key
PORT=8000
DEBUG=false
HOST=0.0.0.0
```

### Step 4: Deploy
1. Railway will auto-detect Python
2. It will use `requirements.txt` to install dependencies
3. It will run `python main.py` automatically

### Step 5: Get Backend URL
1. After deployment, copy the URL (e.g., `https://your-backend.railway.app`)
2. Update frontend with this URL

## 🔧 Alternative: Manual Backend Setup

If you want to test the backend locally first:

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your real credentials
python main.py
```

Backend will be available at http://localhost:8000
