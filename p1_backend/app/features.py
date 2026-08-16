"""
Turns raw history + a target date/sku/region into the exact feature vector
the model expects, in feature_columns.pkl order.
"""
import pickle
import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(__file__)

with open(os.path.join(BASE_DIR, "feature_columns.pkl"), "rb") as f:
    FEATURE_COLUMNS = pickle.load(f)

with open(os.path.join(BASE_DIR, "demand_forecast_model.pkl"), "rb") as f:
    MODEL = pickle.load(f)


def _lag_and_roll(series: pd.Series):
    s = series.reset_index(drop=True)
    n = len(s)

    def lag(k):
        return float(s.iloc[-k]) if n >= k else float(s.mean())

    def roll(window):
        w = s.iloc[-window:] if n >= window else s
        return float(w.mean()), float(w.std() if len(w) > 1 else 0.0)

    r7m, r7s = roll(7)
    r14m, r14s = roll(14)
    r28m, r28s = roll(28)

    return {
        "lag_1": lag(1), "lag_7": lag(7), "lag_14": lag(14), "lag_30": lag(30),
        "roll_mean_7": r7m, "roll_std_7": r7s,
        "roll_mean_14": r14m, "roll_std_14": r14s,
        "roll_mean_28": r28m, "roll_std_28": r28s,
    }


def build_feature_vector(history_df, sku_id, region, target_date, current_row):
    sub = history_df[(history_df.sku_id == sku_id) & (history_df.region == region)].sort_values("date")
    lag_roll = _lag_and_roll(sub["demand"])

    weekday = target_date.strftime("%A")
    flu_months = {11, 12, 1, 2}

    feat = {
        "month": target_date.month,
        "is_flu_season": 1 if target_date.month in flu_months else 0,
        "promotion_flag": int(current_row.get("promotion_flag", 0)),
        "sensed_demand_signal": float(current_row.get("sensed_demand_signal", lag_roll["roll_mean_7"])),
        "current_stock": float(current_row["current_stock"]),
        "warehouse_capacity": float(current_row["warehouse_capacity"]),
        "lead_time_days": float(current_row["lead_time_days"]),
        "nearest_batch_expiry_days": float(current_row["nearest_batch_expiry_days"]),
        "stockout_flag": int(current_row.get("stockout_flag", 0)),
        **lag_roll,
    }

    for col in FEATURE_COLUMNS:
        if col.startswith("sku_id_"):
            feat[col] = 1 if col == f"sku_id_{sku_id}" else 0
        elif col.startswith("region_") and not col.startswith("region_type_"):
            feat[col] = 1 if col == f"region_{region}" else 0
        elif col == "sku_criticality_Non-Critical":
            feat[col] = 1 if current_row.get("sku_criticality") == "Non-Critical" else 0
        elif col == "region_type_Tier-2":
            feat[col] = 1 if current_row.get("region_type") == "Tier-2" else 0
        elif col.startswith("day_of_week_"):
            feat[col] = 1 if col == f"day_of_week_{weekday}" else 0

    vec = pd.DataFrame([{c: feat.get(c, 0) for c in FEATURE_COLUMNS}])
    return vec[FEATURE_COLUMNS]


def predict_demand(history_df, sku_id, region, target_date, current_row):
    X = build_feature_vector(history_df, sku_id, region, target_date, current_row)
    pred = MODEL.predict(X)[0]
    return max(0.0, float(pred))
