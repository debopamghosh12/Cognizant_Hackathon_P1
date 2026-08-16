import { useEffect, useState } from "react";

// Runs fetchFn(signal) on mount (and whenever deps change), returning
// {data, loading, error}. The AbortController is aborted on unmount/re-run
// so navigating away doesn't leave a request this component initiated
// running (and consuming a browser connection slot) after nobody can see
// its result. Shared/cached requests (see api.js) ignore a lone caller's
// abort if other callers still need the result.
export function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchFn(controller.signal)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
