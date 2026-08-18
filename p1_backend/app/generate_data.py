"""
Generates synthetic historical + current-state data for MedCare Pharma P1.
Schema matches feature_columns.pkl exactly (15 SKUs, 6 regions).
Run once at startup (or offline) to produce data/history.csv, data/current_state.csv,
and data/batches.csv.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

np.random.seed(42)

SKUS = [f"SKU_{i:03d}" for i in range(1, 16)]  # SKU_001 .. SKU_015
REGIONS = ["Region_Metro_1", "Region_Metro_2", "Region_Metro_3",
           "Region_Tier2_1", "Region_Tier2_2", "Region_Tier2_3"]
REGION_TYPE = {r: ("Tier-2" if "Tier2" in r else "Metro") for r in REGIONS}

rng = np.random.default_rng(42)
SKU_PROFILE = {}
for i, sku in enumerate(SKUS):
    SKU_PROFILE[sku] = {
        "criticality": "Critical" if i < 9 else "Non-Critical",
        "base_demand": rng.integers(40, 150),
        "warehouse_capacity": rng.integers(800, 3000),
        "lead_time_days": int(rng.integers(3, 15)),
        "shelf_life_days": int(rng.integers(90, 365)),
    }

DAYS_HISTORY = 150
END_DATE = datetime(2026, 8, 16)
START_DATE = END_DATE - timedelta(days=DAYS_HISTORY - 1)
FLU_SEASON_MONTHS = {11, 12, 1, 2}


def is_flu_season(d):
    return 1 if d.month in FLU_SEASON_MONTHS else 0


def gen_history():
    rows = []
    for sku in SKUS:
        prof = SKU_PROFILE[sku]
        for region in REGIONS:
            is_tier2 = REGION_TYPE[region] == "Tier-2"
            region_mult = rng.uniform(0.6, 1.0) if is_tier2 else rng.uniform(1.0, 1.6)
            promo_days = set(rng.choice(DAYS_HISTORY, size=int(DAYS_HISTORY * 0.08), replace=False))
            stock = prof["warehouse_capacity"] * rng.uniform(0.4, 0.8)
            for d_idx in range(DAYS_HISTORY):
                date = START_DATE + timedelta(days=d_idx)
                flu = is_flu_season(date)
                promo = 1 if d_idx in promo_days else 0
                flu_spike = rng.uniform(1.5, 1.6) if flu else 1.0
                if is_tier2 and flu:
                    flu_spike *= rng.uniform(1.05, 1.15)
                promo_spike = rng.uniform(1.2, 1.4) if promo else 1.0
                noise = rng.normal(1.0, 0.08)
                weekday = date.strftime("%A")
                weekend_mult = 0.85 if weekday in ("Saturday", "Sunday") else 1.0

                demand = max(0, prof["base_demand"] * region_mult * flu_spike
                             * promo_spike * weekend_mult * noise)
                demand = round(demand)

                stockout = 1 if stock < demand else 0
                stock = max(0, stock - demand)
                if d_idx % max(prof["lead_time_days"], 5) == 0:
                    stock += prof["base_demand"] * region_mult * rng.uniform(4, 7)
                    stock = min(stock, prof["warehouse_capacity"])

                sensed_signal = demand * rng.uniform(0.9, 1.1)

                rows.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "sku_id": sku,
                    "region": region,
                    "region_type": REGION_TYPE[region],
                    "sku_criticality": prof["criticality"],
                    "day_of_week": weekday,
                    "month": date.month,
                    "is_flu_season": flu,
                    "promotion_flag": promo,
                    "sensed_demand_signal": round(sensed_signal, 1),
                    "current_stock": round(stock, 1),
                    "warehouse_capacity": prof["warehouse_capacity"],
                    "lead_time_days": prof["lead_time_days"],
                    "stockout_flag": stockout,
                    "demand": demand,
                })
    return pd.DataFrame(rows)


def gen_current_state(history_df):
    latest = (history_df.sort_values("date")
              .groupby(["sku_id", "region"]).tail(1)
              .reset_index(drop=True))
    rows = []
    batch_rows = []
    batch_counter = 1
    for _, r in latest.iterrows():
        prof = SKU_PROFILE[r["sku_id"]]
        total_stock = r["current_stock"]
        n_batches = int(rng.integers(1, 4))
        remaining_expiries = sorted(rng.integers(5, prof["shelf_life_days"], size=n_batches))

        splits = rng.dirichlet(np.ones(n_batches)) * total_stock
        batch_qtys = []
        for i in range(n_batches):
            qty = round(float(splits[i]), 1)
            batch_qtys.append(qty)
            exp_days = int(remaining_expiries[i])
            exp_date = (END_DATE + timedelta(days=exp_days)).strftime("%Y-%m-%d")
            batch_rows.append({
                "batch_id": f"BATCH_{batch_counter:05d}",
                "sku_id": r["sku_id"],
                "region": r["region"],
                "quantity": qty,
                # A zero-quantity batch holds no physical stock, so it can't
                # have a real expiry date/countdown — null both instead of
                # keeping the shelf-life draw that produced this "batch".
                "expiry_days": exp_days if qty > 0 else None,
                "expiry_date": exp_date if qty > 0 else None,
            })
            batch_counter += 1

        positive_expiries = [int(remaining_expiries[i]) for i in range(n_batches) if batch_qtys[i] > 0]
        nearest_expiry = min(positive_expiries) if positive_expiries else None
        row = r.to_dict()
        row["nearest_batch_expiry_days"] = nearest_expiry
        row["num_batches"] = n_batches
        rows.append(row)
    return pd.DataFrame(rows), pd.DataFrame(batch_rows)


if __name__ == "__main__":
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    hist = gen_history()
    current, batches = gen_current_state(hist)
    hist.to_csv(os.path.join(data_dir, "history.csv"), index=False)
    current.to_csv(os.path.join(data_dir, "current_state.csv"), index=False)
    batches.to_csv(os.path.join(data_dir, "batches.csv"), index=False)
    print(f"History: {len(hist)} rows | Current state: {len(current)} rows | Batches: {len(batches)} rows")
