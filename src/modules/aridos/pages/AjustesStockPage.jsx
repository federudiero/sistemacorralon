import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import AjusteStockForm from '../components/ajustes/AjusteStockForm';
import AjustesTable from '../components/ajustes/AjustesTable';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import ReasonActionModal from '../components/shared/ReasonActionModal';
import PageLoadingState from '../components/shared/PageLoadingState';
import useAjustesStock from '../hooks/useAjustesStock';
import useProductos from '../hooks/useProductos';
import { anularAjusteStock } from '../services/ajustesStock.service';
import { ARIDOS_SECTIONS, canAdjustSection, canAnnulSection } from '../utils/permissions';

export default function AjustesStockPage({ cuentaId, currentUserEmail, security }) {
  const [pendingAnnular, setPendingAnnular] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const { items, loading, error } = useAjustesStock(cuentaId, { limit: 100 });
  const { items: productos } = useProductos(cuentaId);
  const canAdjust = canAdjustSection(security?.permissions, ARIDOS_SECTIONS.AJUSTES);
  const canAnnul = canAnnulSection(security?.permissions, ARIDOS_SECTIONS.AJUSTES);

  function handleAnnular(item) {
    if (!canAnnul || item?.revertido || item?.esReversion) return;
    setActionError('');
    setPendingAnnular(item);
  }

  async function confirmAnnular(motivo) {
    if (!pendingAnnular?.id || !motivo) return;
    setProcessing(true);
    setActionError('');
    try {
      await anularAjusteStock(cuentaId, pendingAnnular.id, motivo, currentUserEmail);
      setPendingAnnular(null);
    } catch (err) {
      setActionError(err?.message || 'No se pudo anular el ajuste.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Ajustes de stock" subtitle="Correcciones y mermas auditadas sobre el stock del producto" />
      {!canAdjust ? <ReadOnlyBanner message="No tenés permiso para registrar ajustes de stock." /> : null}
      <AjusteStockForm cuentaId={cuentaId} currentUserEmail={currentUserEmail} productos={productos} disabled={!canAdjust} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {actionError ? <div className="alert alert-error">{actionError}</div> : null}
      {loading ? <PageLoadingState title="Cargando ajustes..." rows={5} /> : <AjustesTable items={items} onAnnular={handleAnnular} canAnnul={canAnnul} />}
      <ReasonActionModal
        open={Boolean(pendingAnnular)}
        title="Revertir ajuste de stock"
        subtitle="Indicá el motivo. La reversión queda auditada y se registra como movimiento nuevo."
        initialReason="Reversión manual de ajuste"
        confirmLabel="Revertir ajuste"
        loading={processing}
        onClose={() => !processing && setPendingAnnular(null)}
        onConfirm={confirmAnnular}
      />
    </div>
  );
}
