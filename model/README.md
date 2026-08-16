# Model Artifacts

Pretrained artifacts for demand sensing in the P1 replenishment planning pipeline.

- **`demand_forecast_model.pkl`** — a trained `XGBRegressor` (XGBoost) model for demand forecasting.
- **`feature_columns.pkl`** — an ordered list of the 46 feature names the model expects as input. Includes lag features, rolling statistics, and one-hot encoded SKU, region, and day-of-week indicators.

## Status

These are model artifacts only. A serving API and the feature engineering pipeline (to compute lags, rolling stats, and encodings from raw data at inference time, in the exact column order defined by `feature_columns.pkl`) still need to be built around them.
