import { Link } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import VentaForm from '../components/ventas/VentaForm';
import VentasTable from '../components/ventas/VentasTable';
import VentaDetalleModal from '../components/ventas/VentaDetalleModal';
import ConfirmActionModal from '../components/shared/ConfirmActionModal';
import RemitoFormModal from '../components/remitos/RemitoFormModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useVentas from '../hooks/useVentas';
import useProductos from '../hooks/useProductos';
import useClientes from '../hooks/useClientes';
import { anularVenta } from '../services/ventas.service';
import { ARIDOS_SECTIONS, canAnnulSection, canWriteSection } from '../utils/permissions';

export default function VentasPage({ cuentaId, currentUserEmail, security }) {
  const [selected, setSelected] = useState(null);
  const [ventaAnular, setVentaAnular] = useState(null);
  const [ventaRemito, setVentaRemito] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { items, loading, error } = useVentas(cuentaId, { limit: 100 });
  const { items: productos } = useProductos(cuentaId);
  const { items: clientes } = useClientes(cuentaId);
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.VENTAS);
  const canAnnul = canAnnulSection(security?.permissions, ARIDOS_SECTIONS.VENTAS);
  const canWriteRemitos = canWriteSection(security?.permissions, ARIDOS_SECTIONS.REMITOS);

  async function handleAnular() {
    if (!ventaAnular || !canAnnul) return;
    setProcessing(true);
    try {
      await anularVenta(cuentaId, ventaAnular.id, 'Anulación manual desde UI', currentUserEmail);
      setVentaAnular(null);
    } finally { setProcessing(false); }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ventas"
        subtitle="Mostrador y entrega. También podés programar ventas para otra fecha operativa."
        actions={<Link to="/aridos/agenda" className="btn h-12">Ver agenda</Link>}
      />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para registrar ventas nuevas." /> : null}
      <VentaForm cuentaId={cuentaId} currentUserEmail={currentUserEmail} productos={productos} clientes={clientes} disabled={!canWrite} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : <VentasTable items={items} onView={setSelected} onAnular={canAnnul ? setVentaAnular : undefined} onGenerarRemito={canWriteRemitos ? setVentaRemito : undefined} canAnnul={canAnnul} canGenerateRemito={canWriteRemitos} />}
      <VentaDetalleModal item={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
      <ConfirmActionModal open={Boolean(ventaAnular)} title="Anular venta" description={`Se revertirá el stock de la venta ${ventaAnular?.clienteNombre || ''}.`} onClose={() => setVentaAnular(null)} onConfirm={handleAnular} loading={processing} />
      <RemitoFormModal open={Boolean(ventaRemito)} venta={ventaRemito} cuentaId={cuentaId} currentUserEmail={currentUserEmail} onClose={() => setVentaRemito(null)} onSaved={() => setVentaRemito(null)} />
    </div>
  );
}
