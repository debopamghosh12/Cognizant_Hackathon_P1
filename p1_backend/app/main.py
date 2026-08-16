"""
P1 — Demand Sensing & Replenishment Planning for MedCare Pharma
FastAPI backend serving forecast, expiry-aware allocation, replenishment
sizing, stockout escalation, warehouse summary, and reporting endpoints.
"""
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from app.features import predict_demand
from app.metadata import SKU_META, REGION_META

BASE_DIR = os.path.dirname(__file__)
HISTORY = pd.read_csv(os.path.join(BASE_DIR, "data", "history.csv"), parse_dates=["date"])
CURRENT = pd.read_csv(os.path.join(BASE_DIR, "data", "current_state.csv"))
BATCHES = pd.read_csv(os.path.join(BASE_DIR, "data", "batches.csv"))

app = FastAPI(title="MedCare Pharma - P1 Demand Sensing & Replenishment API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SAFETY_STOCK_Z = 1.65

# Simple in-memory cache for the expensive bulk endpoints. The underlying
# CSVs are loaded once at startup and never change during the process's
# lifetime, so these results are safe to compute once and reuse. Cleared
# via POST /admin/clear-cache (e.g. after regenerating data).
_CACHE = {}

# In-memory purchase order store — fine for a hackathon demo, no DB needed.
# Resets whenever the process restarts.
_PURCHASE_ORDERS = []
_PO_COUNTER = 0


class PredictRequest(BaseModel):
    sku_id: str
    region: str
    target_date: Optional[str] = None


class PurchaseOrderItem(BaseModel):
    sku_id: str
    region: str


class CreatePurchaseOrdersRequest(BaseModel):
    items: List[PurchaseOrderItem]


def _row_for(sku_id, region):
    match = CURRENT[(CURRENT.sku_id == sku_id) & (CURRENT.region == region)]
    if match.empty:
        raise HTTPException(404, f"No current-state record for {sku_id} / {region}")
    return match.iloc[0].to_dict()


def _forecast_one(sku_id, region, target_date=None):
    row = _row_for(sku_id, region)
    tdate = pd.Timestamp(target_date) if target_date else pd.Timestamp(datetime.utcnow().date())
    pred = predict_demand(HISTORY, sku_id, region, tdate, row)
    return {"sku_id": sku_id, "region": region, "date": tdate.strftime("%Y-%m-%d"),
            "forecast_demand": round(pred, 1), "current_row": row}


def _replenish_one(sku_id, region):
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
        "sku_id": sku_id, "sku_name": SKU_META.get(sku_id, {}).get("name", sku_id),
        "region": region, "region_name": REGION_META.get(region, {}).get("name", region),
        "current_stock": current_stock,
        "forecast_daily_demand": fc["forecast_demand"],
        "lead_time_days": lead_time,
        "safety_stock": round(safety_stock, 1),
        "reorder_point": round(reorder_point, 1),
        "needs_reorder": needs_reorder,
        "suggested_order_qty": order_qty,
    }


@app.get("/health")
def health():
    return {"status": "ok", "skus": CURRENT.sku_id.nunique(), "regions": CURRENT.region.nunique()}


@app.get("/reference/skus")
def list_skus():
    return [{"sku_id": s, **SKU_META.get(s, {})} for s in sorted(CURRENT.sku_id.unique())]


@app.get("/reference/regions")
def list_regions():
    return [{"region_id": r, **REGION_META.get(r, {}),
             "region_type": CURRENT[CURRENT.region == r].iloc[0]["region_type"]}
            for r in sorted(CURRENT.region.unique())]


@app.post("/predict")
def predict(req: PredictRequest):
    return _forecast_one(req.sku_id, req.region, req.target_date)


@app.get("/forecast/all")
def forecast_all(target_date: Optional[str] = None):
    cache_key = f"forecast_all:{target_date}"
    if cache_key in _CACHE:
        return _CACHE[cache_key]

    results = []
    for _, r in CURRENT.iterrows():
        fc = _forecast_one(r["sku_id"], r["region"], target_date)
        fc["sku_name"] = SKU_META.get(r["sku_id"], {}).get("name", r["sku_id"])
        fc["region_name"] = REGION_META.get(r["region"], {}).get("name", r["region"])
        results.append(fc)

    _CACHE[cache_key] = results
    return results


@app.get("/allocate")
def allocate(sku_id: str):
    rows = CURRENT[CURRENT.sku_id == sku_id]
    if rows.empty:
        raise HTTPException(404, f"Unknown sku_id {sku_id}")
    unit_price = SKU_META.get(sku_id, {}).get("unit_price", 0)

    plan = []
    for _, r in rows.iterrows():
        fc = _forecast_one(sku_id, r["region"])
        plan.append({
            "region": r["region"], "region_name": REGION_META.get(r["region"], {}).get("name", r["region"]),
            "current_stock": r["current_stock"],
            "stock_value": round(r["current_stock"] * unit_price, 1),
            "nearest_batch_expiry_days": r["nearest_batch_expiry_days"],
            "forecast_demand": fc["forecast_demand"],
            "days_of_cover": round(r["current_stock"] / max(fc["forecast_demand"], 1), 1),
            "is_stockout": bool(r["current_stock"] <= 0),
        })

    total_stock = sum(p["current_stock"] for p in plan)
    for p in plan:
        expiry_urgency = 1 / max(p["nearest_batch_expiry_days"], 1)
        demand_pull = p["forecast_demand"] / max(sum(x["forecast_demand"] for x in plan), 1)
        score = expiry_urgency * 0.4 + demand_pull * 0.6
        if p["is_stockout"]:
            score += 1.0
        p["allocation_priority_score"] = round(score, 4)

    plan.sort(key=lambda x: x["allocation_priority_score"], reverse=True)
    for i, p in enumerate(plan):
        p["rank"] = i + 1

    return {"sku_id": sku_id, "sku_name": SKU_META.get(sku_id, {}).get("name", sku_id),
            "total_network_stock": round(total_stock, 1),
            "total_network_value": round(total_stock * unit_price, 1),
            "allocation_plan": plan}


@app.get("/allocate/all")
def allocate_all():
    if "allocate_all" in _CACHE:
        return _CACHE["allocate_all"]

    result = [allocate(sku) for sku in sorted(CURRENT.sku_id.unique())]
    _CACHE["allocate_all"] = result
    return result


@app.get("/replenish")
def replenish(sku_id: str, region: str):
    return _replenish_one(sku_id, region)


@app.get("/replenish/all")
def replenish_all():
    if "replenish_all" in _CACHE:
        return _CACHE["replenish_all"]

    out = []
    for _, r in CURRENT.iterrows():
        out.append(_replenish_one(r["sku_id"], r["region"]))

    _CACHE["replenish_all"] = out
    return out


@app.get("/alerts")
def alerts():
    if "alerts" in _CACHE:
        return _CACHE["alerts"]

    out = []
    for _, r in CURRENT.iterrows():
        if r["sku_criticality"] != "Critical":
            continue
        rep = _replenish_one(r["sku_id"], r["region"])
        if rep["needs_reorder"]:
            days_cover = rep["current_stock"] / max(rep["forecast_daily_demand"], 1)
            severity = "HIGH" if days_cover < rep["lead_time_days"] else "MEDIUM"
            cadence = "Daily review" if severity == "HIGH" else "Every 3 days"
            out.append({**rep, "days_of_cover": round(days_cover, 1),
                        "severity": severity, "recommended_review_cadence": cadence})
    out.sort(key=lambda x: x["days_of_cover"])

    _CACHE["alerts"] = out
    return out


@app.get("/inventory/batches")
def batches(sku_id: Optional[str] = None, region: Optional[str] = None):
    df = BATCHES.copy()
    if sku_id:
        df = df[df.sku_id == sku_id]
    if region:
        df = df[df.region == region]
    df = df.sort_values("expiry_days")
    recs = df.to_dict(orient="records")
    for rec in recs:
        rec["sku_name"] = SKU_META.get(rec["sku_id"], {}).get("name", rec["sku_id"])
        rec["region_name"] = REGION_META.get(rec["region"], {}).get("name", rec["region"])
        rec["unit_price"] = SKU_META.get(rec["sku_id"], {}).get("unit_price", 0)
        rec["value"] = round(rec["quantity"] * rec["unit_price"], 1)
    return recs


@app.get("/inventory/expiry-exposure")
def expiry_exposure(within_days: int = 30):
    df = BATCHES[BATCHES.expiry_days <= within_days].copy()
    df["unit_price"] = df.sku_id.map(lambda s: SKU_META.get(s, {}).get("unit_price", 0))
    df["value"] = df.quantity * df.unit_price
    by_sku = (df.groupby("sku_id")
              .agg(quantity=("quantity", "sum"), value=("value", "sum"))
              .reset_index())
    by_sku["sku_name"] = by_sku.sku_id.map(lambda s: SKU_META.get(s, {}).get("name", s))
    return {
        "within_days": within_days,
        "total_batches_at_risk": len(df),
        "total_quantity_at_risk": round(float(df.quantity.sum()), 1),
        "total_value_at_risk": round(float(df.value.sum()), 1),
        "by_sku": by_sku.to_dict(orient="records"),
    }


@app.get("/reports/demand-trend")
def demand_trend():
    df = HISTORY.copy()
    df["month"] = df["date"].dt.to_period("M").astype(str)
    trend = df.groupby("month")["demand"].sum().reset_index()
    return trend.to_dict(orient="records")


@app.get("/reports/category-breakdown")
def category_breakdown():
    df = HISTORY.copy()
    df["category"] = df.sku_id.map(lambda s: SKU_META.get(s, {}).get("category", "Other"))
    out = df.groupby("category")["demand"].sum().reset_index().sort_values("demand", ascending=False)
    return out.to_dict(orient="records")


@app.get("/reports/accuracy")
def accuracy(sample_days: int = 7):
    cache_key = f"accuracy:{sample_days}"
    if cache_key in _CACHE:
        return _CACHE[cache_key]

    all_dates = sorted(HISTORY.date.unique())[-sample_days:]
    errors = []
    for _, cur in CURRENT.iterrows():
        sku_id, region = cur["sku_id"], cur["region"]
        for d in all_dates:
            actual_row = HISTORY[(HISTORY.sku_id == sku_id) & (HISTORY.region == region) & (HISTORY.date == d)]
            if actual_row.empty:
                continue
            actual = float(actual_row.iloc[0]["demand"])
            hist_before = HISTORY[(HISTORY.sku_id == sku_id) & (HISTORY.region == region) & (HISTORY.date < d)]
            if len(hist_before) < 30:
                continue
            row_ctx = cur.to_dict()
            row_ctx["promotion_flag"] = int(actual_row.iloc[0]["promotion_flag"])
            row_ctx["sensed_demand_signal"] = float(actual_row.iloc[0]["sensed_demand_signal"])
            pred = predict_demand(hist_before, sku_id, region, pd.Timestamp(d), row_ctx)
            ape = abs(actual - pred) / max(actual, 1) * 100
            errors.append({"sku_id": sku_id, "ape": ape})

    if not errors:
        result = {"mape": None, "sample_size": 0, "by_sku": []}
        _CACHE[cache_key] = result
        return result

    err_df = pd.DataFrame(errors)
    overall_mape = round(float(err_df["ape"].mean()), 2)
    by_sku = (err_df.groupby("sku_id")["ape"].mean().round(2)
              .reset_index().rename(columns={"ape": "mape"}))
    by_sku["sku_name"] = by_sku.sku_id.map(lambda s: SKU_META.get(s, {}).get("name", s))
    result = {"mape": overall_mape, "sample_size": len(err_df), "by_sku": by_sku.to_dict(orient="records")}
    _CACHE[cache_key] = result
    return result


@app.get("/warehouses/summary")
def warehouses_summary():
    out = []
    for region in sorted(CURRENT.region.unique()):
        rows = CURRENT[CURRENT.region == region]
        total_stock = float(rows["current_stock"].sum())
        total_capacity = float(rows["warehouse_capacity"].sum())
        stockout_count = int((rows["current_stock"] <= 0).sum())
        critical_stockouts = int(((rows["current_stock"] <= 0) & (rows["sku_criticality"] == "Critical")).sum())

        region_batches = BATCHES[BATCHES.region == region].copy()
        region_batches["unit_price"] = region_batches.sku_id.map(lambda s: SKU_META.get(s, {}).get("unit_price", 0))
        region_batches["value"] = region_batches.quantity * region_batches.unit_price
        expiring_30d_value = float(region_batches[region_batches.expiry_days <= 30]["value"].sum())

        meta = REGION_META.get(region, {})
        out.append({
            "region_id": region,
            "name": meta.get("name", region),
            "city": meta.get("city", region),
            "region_type": rows.iloc[0]["region_type"],
            "total_stock": round(total_stock, 1),
            "total_capacity": round(total_capacity, 1),
            "utilization_pct": round(total_stock / max(total_capacity, 1) * 100, 1),
            "stockout_sku_count": stockout_count,
            "critical_stockout_sku_count": critical_stockouts,
            "expiring_30d_value": round(expiring_30d_value, 1),
        })
    return out


@app.post("/admin/clear-cache")
def clear_cache():
    n = len(_CACHE)
    _CACHE.clear()
    return {"status": "ok", "entries_cleared": n}


@app.post("/purchase-orders/create")
def create_purchase_orders(req: CreatePurchaseOrdersRequest):
    global _PO_COUNTER
    today = datetime.utcnow().date()
    created = []
    skipped = []

    for item in req.items:
        try:
            rep = _replenish_one(item.sku_id, item.region)
        except HTTPException:
            skipped.append({"sku_id": item.sku_id, "region": item.region, "reason": "unknown sku_id/region"})
            continue

        if not rep["needs_reorder"]:
            skipped.append({"sku_id": item.sku_id, "region": item.region, "reason": "does not need reorder"})
            continue

        _PO_COUNTER += 1
        po = {
            "po_id": f"PO-{_PO_COUNTER:05d}",
            "sku_id": rep["sku_id"],
            "sku_name": rep["sku_name"],
            "region": rep["region"],
            "region_name": rep["region_name"],
            "quantity": rep["suggested_order_qty"],
            "status": "Pending Approval",
            "created_at": today.isoformat(),
            "expected_delivery_date": (today + timedelta(days=int(rep["lead_time_days"]))).isoformat(),
        }
        _PURCHASE_ORDERS.append(po)
        created.append(po)

    return {"created": created, "skipped": skipped}


@app.get("/purchase-orders")
def list_purchase_orders():
    return list(reversed(_PURCHASE_ORDERS))


@app.get("/warehouses/{region_id}")
def warehouse_detail(region_id: str):
    rows = CURRENT[CURRENT.region == region_id]
    if rows.empty:
        raise HTTPException(404, f"Unknown region {region_id}")
    skus = []
    for _, r in rows.iterrows():
        skus.append({
            "sku_id": r["sku_id"], "sku_name": SKU_META.get(r["sku_id"], {}).get("name", r["sku_id"]),
            "current_stock": r["current_stock"], "warehouse_capacity": r["warehouse_capacity"],
            "nearest_batch_expiry_days": r["nearest_batch_expiry_days"],
            "criticality": r["sku_criticality"],
        })
    meta = REGION_META.get(region_id, {})
    return {"region_id": region_id, **meta, "skus": skus}
