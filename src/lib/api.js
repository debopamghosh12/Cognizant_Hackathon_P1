const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Cross-component request cache: dedupes concurrent/repeated GETs to the
// same URL so multiple components asking for the same data share one
// network request instead of firing one each. Keyed by full URL, cleared
// on full page reload (module state resets).
//
// Each entry is reference-counted by caller-supplied AbortSignals: a caller
// "subscribes" by passing its signal, and the underlying request is only
// aborted once every subscriber's signal has fired. This has to be done via
// the signal's synchronous 'abort' event (not a promise .catch(), which is
// microtask-deferred) — React StrictMode mounts, aborts, and remounts a
// component synchronously in one tick, and a microtask-deferred eviction
// loses that race: the remount would still see the (about-to-be-aborted)
// cached promise instead of creating a fresh request.
const getCache = new Map(); // url -> { promise, controller, refCount }

function buildUrl(path, params) {
  const url = new URL(API_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

function apiGet(path, params, signal) {
  const url = buildUrl(path, params);
  let entry = getCache.get(url);

  if (!entry) {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal }).then((res) => {
      if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
      return res.json();
    });
    entry = { promise, controller, refCount: 0 };
    getCache.set(url, entry);
    // Genuine failure (not caused by our own abort) — evict so the next
    // caller retries instead of reusing a rejected promise.
    promise.catch(() => {
      if (getCache.get(url) === entry) getCache.delete(url);
    });
  }

  entry.refCount += 1;
  if (signal) {
    signal.addEventListener(
      "abort",
      () => {
        entry.refCount -= 1;
        if (entry.refCount <= 0 && getCache.get(url) === entry) {
          getCache.delete(url);
          entry.controller.abort();
        }
      },
      { once: true }
    );
  }

  return entry.promise;
}

async function apiPost(path, body, signal) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  health: (signal) => apiGet("/health", undefined, signal),
  skus: (signal) => apiGet("/reference/skus", undefined, signal),
  regions: (signal) => apiGet("/reference/regions", undefined, signal),
  predict: (sku_id, region, target_date, signal) =>
    apiPost("/predict", { sku_id, region, target_date }, signal),
  forecastAll: (target_date, signal) =>
    apiGet("/forecast/all", target_date ? { target_date } : undefined, signal),
  allocate: (sku_id, signal) => apiGet("/allocate", { sku_id }, signal),
  allocateAll: (signal) => apiGet("/allocate/all", undefined, signal),
  replenish: (sku_id, region, signal) => apiGet("/replenish", { sku_id, region }, signal),
  replenishAll: (signal) => apiGet("/replenish/all", undefined, signal),
  alerts: (signal) => apiGet("/alerts", undefined, signal),
  batches: (sku_id, region, signal) => apiGet("/inventory/batches", { sku_id, region }, signal),
  expiryExposure: (within_days, signal) =>
    apiGet("/inventory/expiry-exposure", within_days ? { within_days } : undefined, signal),
  demandTrend: (signal) => apiGet("/reports/demand-trend", undefined, signal),
  categoryBreakdown: (signal) => apiGet("/reports/category-breakdown", undefined, signal),
  accuracy: (sample_days, signal) =>
    apiGet("/reports/accuracy", sample_days ? { sample_days } : undefined, signal),
  warehousesSummary: (signal) => apiGet("/warehouses/summary", undefined, signal),
  warehouseDetail: (region_id, signal) => apiGet(`/warehouses/${region_id}`, undefined, signal),
  createPurchaseOrders: (items, signal) => apiPost("/purchase-orders/create", { items }, signal),
  purchaseOrders: (signal) => apiGet("/purchase-orders", undefined, signal),
};
