"""
P1 — Demand Sensing & Replenishment Planning for MedCare Pharma
FastAPI backend serving forecast, expiry-aware allocation, replenishment
sizing, and stockout escalation endpoints.
"""
import os
import pandas as pd
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from app.features import predict_demand

BASE_DIR = os.path.dirname(__file__)
HISTORY = pd.read_csv(os.path.join(BASE_DIR, "data", "history.csv"), parse_dates=["date"])
CURRENT = pd.read_csv(os.path.join(BASE_DIR, "data", "current_state.csv"))

app = FastAPI(title="MedCare Pharma - P1 Demand Sensing & Replenishment API")

# Allow the Vercel frontend to call this API. Tighten to your exact domain before final submission.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SAFETY_STOCK_Z = 1.65  # ~95% service level


# ---------- schemas ----------
class PredictRequest(BaseModel):
    sku_id: str
    region: str
    target_date: Optional[str] = None  # YYYY-MM-DD, defaults to today


# ---------- helpers ----------
def _row_for(sku_id: str, region: str) -> dict:
    match = CURRENT[(CURRENT.sku_id == sku_id) & (CURRENT.region == region)]
    if match.empty:
        raise HTTPException(404, f"No current-state record for {sku_id} / {region}")
    return match.iloc[0].to_dict()


def _forecast_one(sku_id: str, region: str, target_date: str = None) -> dict:
    row = _row_for(sku_id, region)
    tdate = pd.Timestamp(target_date) if target_date else pd.Timestamp(datetime.utcnow().date())
    pred = predict_demand(HISTORY, sku_id, region, tdate, row)
    return {"sku_id": sku_id, "region": region, "date": tdate.strftime("%Y-%m-%d"),
            "forecast_demand": round(pred, 1), "current_row": row}


# ---------- endpoints ----------
@app.get("/health")
def health():
    return {"status": "ok", "skus": CURRENT.sku_id.nunique(), "regions": CURRENT.region.nunique()}


@app.get("/reference/skus")
def list_skus():
    return sorted(CURRENT.sku_id.unique().tolist())


@app.get("/reference/regions")
def list_regions():
    return sorted(CURRENT.region.unique().tolist())


@app.post("/predict")
def predict(req: PredictRequest):
    return _forecast_one(req.sku_id, req.region, req.target_date)


@app.get("/forecast/all")
def forecast_all(target_date: Optional[str] = None):
    """Bulk forecast across every SKU x region combo — powers the dashboard grid."""
    results = []
    for _, r in CURRENT.iterrows():
        results.append(_forecast_one(r["sku_id"], r["region"], target_date))
    return results


@app.get("/allocate")
def allocate(sku_id: str):
    """
    Expiry-aware allocation across regions for a given SKU.
    FEFO-biased: batches nearer expiry get prioritized toward higher-forecast-demand
    regions first, so stock doesn't sit and expire in a low-demand region while a
    high-demand region stocks out.
    """
    rows = CURRENT[CURRENT.sku_id == sku_id]
    if rows.empty:
        raise HTTPException(404, f"Unknown sku_id {sku_id}")

    plan = []
    for _, r in rows.iterrows():
        fc = _forecast_one(sku_id, r["region"])
        plan.append({
            "region": r["region"],
            "current_stock": r["current_stock"],
            "nearest_batch_expiry_days": r["nearest_batch_expiry_days"],
            "forecast_demand": fc["forecast_demand"],
            "days_of_cover": round(r["current_stock"] / max(fc["forecast_demand"], 1), 1),
        })

    # urgency score: low expiry + low days_of_cover elsewhere = ship here first
    total_stock = sum(p["current_stock"] for p in plan)
    for p in plan:
        expiry_urgency = 1 / max(p["nearest_batch_expiry_days"], 1)
        demand_pull = p["forecast_demand"] / max(sum(x["forecast_demand"] for x in plan), 1)
        p["allocation_priority_score"] = round(expiry_urgency * 0.4 + demand_pull * 0.6, 4)

    plan.sort(key=lambda x: x["allocation_priority_score"], reverse=True)
    for i, p in enumerate(plan):
        p["rank"] = i + 1

    return {"sku_id": sku_id, "total_network_stock": round(total_stock, 1), "allocation_plan": plan}


@app.get("/replenish")
def replenish(sku_id: str, region: str):
    """
    Reorder point + suggested order quantity using forecast demand,
    lead time, and a safety-stock buffer sized off recent demand volatility.
    """
    row = _row_for(sku_id, region)
    fc = _forecast_one(sku_id, region)
    sub = HISTORY[(HISTORY.sku_id == sku_id) & (HISTORY.region == region)].sort_values("date").tail(28)
    demand_std = float(sub["demand"].std())
    lead_time = row["lead_time_days"]

    lead_time_demand = fc["forecast_demand"] * lead_time
    safety_stock = SAFETY_STOCK_Z * demand_std * (lead_time ** 0.5)
    reorder_point = lead_time_demand + safety_stock
    current_stock = row["current_stock"]

    needs_reorder = current_stock <= reorder_point
    order_qty = max(0, round(reorder_point + lead_time_demand - current_stock)) if needs_reorder else 0

    return {
        "sku_id": sku_id, "region": region,
        "current_stock": current_stock,
        "forecast_daily_demand": fc["forecast_demand"],
        "lead_time_days": lead_time,
        "safety_stock": round(safety_stock, 1),
        "reorder_point": round(reorder_point, 1),
        "needs_reorder": needs_reorder,
        "suggested_order_qty": order_qty,
    }


@app.get("/alerts")
def alerts():
    """
    Stockout-risk escalation list: critical SKUs at/near reorder point,
    with a recommended review cadence.
    """
    out = []
    for _, r in CURRENT.iterrows():
        if r["sku_criticality"] != "Critical":
            continue
        rep = replenish(r["sku_id"], r["region"])
        if rep["needs_reorder"]:
            days_cover = rep["current_stock"] / max(rep["forecast_daily_demand"], 1)
            severity = "HIGH" if days_cover < rep["lead_time_days"] else "MEDIUM"
            cadence = "Daily review" if severity == "HIGH" else "Every 3 days"
            out.append({**rep, "days_of_cover": round(days_cover, 1),
                        "severity": severity, "recommended_review_cadence": cadence})
    out.sort(key=lambda x: x["days_of_cover"])
    return out
