# P1 Backend — Demand Sensing & Replenishment Planning API

FastAPI service for MedCare Pharma's P1 use case: demand forecasting,
expiry-aware allocation, replenishment sizing, and stockout escalation.

## Structure
```
p1_backend/
├── app/
│   ├── main.py              FastAPI app (all endpoints)
│   ├── features.py          Feature engineering (raw data -> model's 46 columns)
│   ├── generate_data.py     Synthetic data generator (15 SKUs x 6 regions, 150 days)
│   ├── demand_forecast_model.pkl
│   ├── feature_columns.pkl
│   └── data/
│       ├── history.csv          150-day synthetic demand history
│       └── current_state.csv    latest snapshot per SKU x region
├── requirements.txt
└── Dockerfile
```

## Endpoints
- `GET /health` — status check
- `GET /reference/skus`, `GET /reference/regions` — dropdown data for frontend
- `POST /predict` — `{sku_id, region, target_date?}` -> forecasted demand
- `GET /forecast/all` — bulk forecast across every SKU x region (dashboard grid)
- `GET /allocate?sku_id=...` — expiry-aware allocation priority across regions
- `GET /replenish?sku_id=...&region=...` — reorder point + suggested order qty
- `GET /alerts` — critical SKUs at/near reorder point, with severity + review cadence

## Run locally
```
pip install -r requirements.txt
python app/generate_data.py     # only needed once, regenerates data/*.csv
uvicorn app.main:app --reload --port 8000
```
Docs at http://localhost:8000/docs

## Known issue to fix before final demo
`demand_forecast_model.pkl` throws a version-mismatch warning on load — it
was trained on an older xgboost than pinned here. It still works, but for
safety, re-export with `booster.get_booster().save_model("model.json")` on
the training machine and load via `xgb.Booster().load_model(...)` instead
of pickle, which isn't version-fragile.

## Deployment (Render)
- New Web Service -> connect this repo -> set root/build to this folder if
  monorepo, or point at a Docker deploy using the included Dockerfile.
- Render auto-detects the Dockerfile; no extra build command needed.
- Set the frontend's API base URL (Vercel env var) to the Render service URL.
