import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import IngresoCamionForm from '../components/ingresos/IngresoCamionForm';
import IngresosTable from '../components/ingresos/IngresosTable';
import IngresoDetalleModal from '../components/ingresos/IngresoDetalleModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import ConfirmActionModal from '../components/shared/ConfirmActionModal';
import PageLoadingState from '../components/shared/PageLoadingState';
import useIngresosCamion from '../hooks/useIngresosCamion';
import useProductos from '../hooks/useProductos';
import useProveedores from '../hooks/useProveedores';
import { anularIngresoCamion } from '../services/ingresosCamion.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function IngresosCamionPage({ cuentaId, currentUserEmail, security }) {
  const [selected, setSelected] = useState(null);
  const [pendingAnular, setPendingAnular] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const { items, loading, error } = useIngresosCamion(cuentaId, { limit: 100 });
  const { items: productos } = useProductos(cuentaId);
  const { items: proveedores } = useProveedores(cuentaId);
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.INGRESOS);

  function handleAnular(item) {
    if (!item?.id || !canWrite) return;
    setActionError('');
    setPendingAnular(item);
  }

  async function confirmAnular() {
    if (!pendingAnular?.id || !canWrite) return;
    setProcessing(true);
    setActionError('');
    try {
      await anularIngresoCamion(cuentaId, pendingAnular.id, 'Anulación manual desde reposición', currentUserEmail);
      if (selected?.id === pendingAnular.id) setSelected(null);
      setPendingAnular(null);
    } catch (err) {
      setActionError(err?.message || 'No se pudo anular la reposición.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Reposición de stock" />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para registrar reposiciones." /> : null}
      <IngresoCamionForm cuentaId={cuentaId} currentUserEmail={currentUserEmail} productos={productos} proveedores={proveedores} disabled={!canWrite} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {actionError ? <div className="alert alert-error">{actionError}</div> : null}
      {loading ? <PageLoadingState title="Cargando reposiciones..." rows={5} /> : <IngresosTable items={items} onView={setSelected} onAnular={canWrite ? handleAnular : undefined} processing={processing} />}
      <IngresoDetalleModal item={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
      <ConfirmActionModal
        open={Boolean(pendingAnular)}
        title="Anular reposición"
        description={`Se va a anular la reposición ${pendingAnular?.remitoNumero ? `del remito ${pendingAnular.remitoNumero}` : 'seleccionada'}. El stock volverá al valor anterior.`}
        confirmLabel="Anular reposición"
        loading={processing}
        onClose={() => !processing && setPendingAnular(null)}
        onConfirm={confirmAnular}
      />
    </div>
  );
}
