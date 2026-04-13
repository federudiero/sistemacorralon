import { useEffect, useState } from 'react';
import { getReportesAridos } from '../services/reportes.service';

export default function useReportesAridos(cuentaId, filters = {}) {
  const [data, setData] = useState({ ventas: [], movimientos: [], resumen: { totalVentas: 0, totalM3Vendidos: 0, cantidadVentas: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!cuentaId) return;
      setLoading(true);
      setError('');
      try {
        const result = await getReportesAridos(cuentaId, filters);
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err?.message || 'Error cargando reportes');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [cuentaId, JSON.stringify(filters)]);

  return { data, loading, error };
}
