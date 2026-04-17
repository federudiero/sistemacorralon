import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import IngresoCamionForm from '../components/ingresos/IngresoCamionForm';
import IngresosTable from '../components/ingresos/IngresosTable';
import IngresoDetalleModal from '../components/ingresos/IngresoDetalleModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useIngresosCamion from '../hooks/useIngresosCamion';
import useProductos from '../hooks/useProductos';
import useProveedores from '../hooks/useProveedores';
import { anularIngresoCamion } from '../services/ingresosCamion.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function IngresosCamionPage({ cuentaId, currentUserEmail, security }) {
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { items, loading, error } = useIngresosCamion(cuentaId, { limit: 100 });
  const { items: productos } = useProductos(cuentaId);
  const { items: proveedores } = useProveedores(cuentaId);
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.INGRESOS);

  async function handleAnular(item) {
    if (!item?.id || !canWrite) return;
    const ok = window.confirm(`Se va a anular la reposición ${item.remitoNumero ? `del remito ${item.remitoNumero}` : 'seleccionada'}. El stock volverá al valor anterior.`);
    if (!ok) return;
    setProcessing(true);
    try {
      await anularIngresoCamion(cuentaId, item.id, 'Anulación manual desde reposición', currentUserEmail);
      if (selected?.id === item.id) setSelected(null);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reposición de stock"
        subtitle="Solo proveedor, producto, cantidad, remito y costo unitario. Si te equivocás, la reposición se puede anular mientras el día siga abierto."
      />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para registrar reposiciones." /> : null}
      <IngresoCamionForm cuentaId={cuentaId} currentUserEmail={currentUserEmail} productos={productos} proveedores={proveedores} disabled={!canWrite} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : <IngresosTable items={items} onView={setSelected} onAnular={canWrite ? handleAnular : undefined} processing={processing} />}
      <IngresoDetalleModal item={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </div>
  );
}
