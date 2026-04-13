import PageHeader from '../components/shared/PageHeader';
import RemitosTable from '../components/remitos/RemitosTable';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useRemitos from '../hooks/useRemitos';
import { updateRemitoEstado } from '../services/remitos.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function RemitosPage({ cuentaId, currentUserEmail, security }) {
  const { items, loading, error } = useRemitos(cuentaId, { limit: 100 });
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.REMITOS);

  async function handleChangeEstado(item, estado) {
    if (!canWrite) return;
    await updateRemitoEstado(cuentaId, item.id, estado, currentUserEmail);
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Remitos" subtitle="Seguimiento operativo de entregas" />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para cambiar el estado de remitos." /> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : <RemitosTable items={items} onChangeEstado={handleChangeEstado} canEdit={canWrite} />}
    </div>
  );
}
