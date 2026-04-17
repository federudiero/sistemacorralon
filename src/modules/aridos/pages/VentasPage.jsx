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
import { anularVenta, updateVentaEntregaEstado } from '../services/ventas.service';
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
      await anularVenta(cuentaId, ventaAnular.id, 'Anulación manual desde ventas', currentUserEmail);
      setVentaAnular(null);
      if (selected?.id === ventaAnular.id) setSelected(null);
    } finally {
      setProcessing(false);
    }
  }

  async function handleEntrega(item, entregaEstado) {
    if (!item?.id || !canWrite) return;
    setProcessing(true);
    try {
      await updateVentaEntregaEstado(cuentaId, item.id, entregaEstado, currentUserEmail);
      if (selected?.id === item.id) {
        setSelected((prev) => (prev ? { ...prev, entregaEstado } : prev));
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ventas"
        subtitle="Registrá ventas, controlá si se entregaron y generá remitos cuando haga falta."
        actions={canWriteRemitos ? <Link className="btn h-12" to="/aridos/remitos">Ir a remitos</Link> : null}
      />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para cargar ventas nuevas." /> : null}
      <VentaForm cuentaId={cuentaId} currentUserEmail={currentUserEmail} productos={productos} clientes={clientes} disabled={!canWrite} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? (
        <div className="loading loading-spinner loading-lg" />
      ) : (
        <VentasTable
          items={items}
          onView={setSelected}
          onAnular={canAnnul ? setVentaAnular : undefined}
          onGenerarRemito={canWriteRemitos ? setVentaRemito : undefined}
          onSetEntrega={canWrite ? handleEntrega : undefined}
          canAnnul={canAnnul}
          canGenerateRemito={canWriteRemitos}
          canUpdateEntrega={canWrite}
          processing={processing}
        />
      )}
      <VentaDetalleModal
        item={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onSetEntrega={canWrite ? handleEntrega : undefined}
        processing={processing}
      />
      <ConfirmActionModal
        open={Boolean(ventaAnular)}
        onClose={() => setVentaAnular(null)}
        onConfirm={handleAnular}
        title="Anular venta"
        description={ventaAnular ? `Se va a anular la venta de ${ventaAnular.clienteNombre || 'cliente'} por ${ventaAnular.productoNombre || 'producto'}. El stock se reintegrará automáticamente.` : ''}
        confirmText={processing ? 'Anulando...' : 'Anular venta'}
        loading={processing}
      />
      <RemitoFormModal open={Boolean(ventaRemito)} initialVenta={ventaRemito} onClose={() => setVentaRemito(null)} cuentaId={cuentaId} currentUserEmail={currentUserEmail} />
    </div>
  );
}
