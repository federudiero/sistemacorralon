import { useEffect, useState } from 'react';
import { getDashboardAridos } from '../services/dashboard.service';

export default function useDashboardAridos(cuentaId, filters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!cuentaId) return;
      setLoading(true);
      setError('');
      try {
        const result = await getDashboardAridos(cuentaId, filters);
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err?.message || 'Error cargando dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [cuentaId, JSON.stringify(filters)]);

  return { data, loading, error };
}
