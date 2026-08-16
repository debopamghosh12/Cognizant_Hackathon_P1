import { useEffect, useState } from "react";

// Runs fetchFn(signal) on mount (and whenever deps change), returning
// {data, loading, error}. The AbortController is aborted on unmount/re-run
// so navigating away doesn't leave a request this component initiated
// running (and consuming a browser connection slot) after nobody can see
// its result. Shared/cached requests (see api.js) ignore a lone caller's
// abort if other callers still need the result.
//
// Optional `timeoutMs`: if the fetch hasn't settled by then, stop waiting
// and surface a timeout error instead of spinning forever — useful for
// endpoints that can be slow on a cold-started/under-resourced backend.
// The underlying request is deliberately NOT aborted on timeout (only on
// unmount): letting it finish in the background still warms the shared
// response cache in api.js for the next caller, even though this
// component has already given up waiting on it.
export function useApi(fetchFn, deps = [], timeoutMs) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let timedOut = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timeoutId = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          if (!cancelled) {
            setError(new Error("Request timed out"));
            setLoading(false);
          }
        }, timeoutMs)
      : null;

    fetchFn(controller.signal)
      .then((d) => {
        if (!cancelled && !timedOut) setData(d);
      })
      .catch((e) => {
        if (!cancelled && !timedOut) setError(e);
      })
      .finally(() => {
        if (!cancelled && !timedOut) setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
