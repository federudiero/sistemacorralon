import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import IngresoCamionForm from '../components/ingresos/IngresoCamionForm';
import IngresosTable from '../components/ingresos/IngresosTable';
import IngresoDetalleModal from '../components/ingresos/IngresoDetalleModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useIngresosCamion from '../hooks/useIngresosCamion';
import useProductos from '../hooks/useProductos';
import useProveedores from '../hooks/useProveedores';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function IngresosCamionPage({ cuentaId, currentUserEmail, security }) {
  const [selected, setSelected] = useState(null);
  const { items, loading, error } = useIngresosCamion(cuentaId, { limit: 100 });
  const { items: productos } = useProductos(cuentaId);
  const { items: proveedores } = useProveedores(cuentaId);
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.INGRESOS);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reposición de stock"
        subtitle="Solo proveedor, producto, cantidad, remito y costo unitario. El stock suma directo al producto y actualiza el costo actual."
      />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para registrar reposiciones." /> : null}
      <IngresoCamionForm cuentaId={cuentaId} currentUserEmail={currentUserEmail} productos={productos} proveedores={proveedores} disabled={!canWrite} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : <IngresosTable items={items} onView={setSelected} />}
      <IngresoDetalleModal item={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </div>
  );
}
