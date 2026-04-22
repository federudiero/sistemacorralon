import PageHeader from '../components/shared/PageHeader';
import AjusteStockForm from '../components/ajustes/AjusteStockForm';
import AjustesTable from '../components/ajustes/AjustesTable';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useAjustesStock from '../hooks/useAjustesStock';
import useProductos from '../hooks/useProductos';
import { anularAjusteStock } from '../services/ajustesStock.service';
import { ARIDOS_SECTIONS, canAdjustSection, canAnnulSection } from '../utils/permissions';

export default function AjustesStockPage({ cuentaId, currentUserEmail, security }) {
  const { items, loading, error } = useAjustesStock(cuentaId, { limit: 100 });
  const { items: productos } = useProductos(cuentaId);
  const canAdjust = canAdjustSection(security?.permissions, ARIDOS_SECTIONS.AJUSTES);
  const canAnnul = canAnnulSection(security?.permissions, ARIDOS_SECTIONS.AJUSTES);

  async function handleAnnular(item) {
    if (!canAnnul || item?.revertido || item?.esReversion) return;
    const motivo = window.prompt('Motivo de la reversión del ajuste:', 'Reversión manual de ajuste');
    if (motivo == null) return;
    await anularAjusteStock(cuentaId, item.id, motivo, currentUserEmail);
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Ajustes de stock" subtitle="Correcciones y mermas auditadas sobre el stock del producto" />
      {!canAdjust ? <ReadOnlyBanner message="No tenés permiso para registrar ajustes de stock." /> : null}
      <AjusteStockForm cuentaId={cuentaId} currentUserEmail={currentUserEmail} productos={productos} disabled={!canAdjust} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : <AjustesTable items={items} onAnnular={handleAnnular} canAnnul={canAnnul} />}
    </div>
  );
}
