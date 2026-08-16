const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiGet(path, params) {
  const url = new URL(API_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  health: () => apiGet("/health"),
  skus: () => apiGet("/reference/skus"),
  regions: () => apiGet("/reference/regions"),
  predict: (sku_id, region, target_date) => apiPost("/predict", { sku_id, region, target_date }),
  forecastAll: (target_date) => apiGet("/forecast/all", target_date ? { target_date } : undefined),
  allocate: (sku_id) => apiGet("/allocate", { sku_id }),
  allocateAll: () => apiGet("/allocate/all"),
  replenish: (sku_id, region) => apiGet("/replenish", { sku_id, region }),
  replenishAll: () => apiGet("/replenish/all"),
  alerts: () => apiGet("/alerts"),
  batches: (sku_id, region) => apiGet("/inventory/batches", { sku_id, region }),
  expiryExposure: (within_days) =>
    apiGet("/inventory/expiry-exposure", within_days ? { within_days } : undefined),
  demandTrend: () => apiGet("/reports/demand-trend"),
  categoryBreakdown: () => apiGet("/reports/category-breakdown"),
  accuracy: (sample_days) => apiGet("/reports/accuracy", sample_days ? { sample_days } : undefined),
};
