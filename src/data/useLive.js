import { useCallback, useEffect, useRef, useState } from 'react';
import { onDataChange } from './events';

/**
 * Tải dữ liệu và TỰ TẢI LẠI khi có thay đổi (kể cả thay đổi từ máy người kia qua realtime).
 * const { data, loading, error, reload } = useLive(() => data.list('subjects'), [])
 */
export function useLive(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const seq = useRef(0);

  const run = useCallback(async () => {
    const my = ++seq.current;
    try {
      const d = await loaderRef.current();
      if (my === seq.current) setState({ data: d, loading: false, error: null });
    } catch (e) {
      console.error(e);
      if (my === seq.current) setState((s) => ({ ...s, loading: false, error: e.message || String(e) }));
    }
  }, []);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    run();
    return onDataChange(run);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: run };
}
