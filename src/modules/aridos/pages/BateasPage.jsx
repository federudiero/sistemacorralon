import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import PageLoadingState from '../components/shared/PageLoadingState';
import AppIcon from '../components/shared/AppIcon';
import BateaTable from '../components/bateas/BateaTable';
import BateaFormModal from '../components/bateas/BateaFormModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useBateas from '../hooks/useBateas';
import { createBatea, updateBatea } from '../services/bateas.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function BateasPage({ cuentaId, currentUserEmail, security }) {
  const { items, loading, error } = useBateas(cuentaId);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.BATEAS);

  async function handleSubmit(form) {
    if (!canWrite) return;
    setSaving(true);
    try {
      if (selected?.id) await updateBatea(cuentaId, selected.id, form, currentUserEmail);
      else await createBatea(cuentaId, form, currentUserEmail);
      setOpen(false);
      setSelected(null);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Bateas" subtitle="Ubicaciones físicas de stock" actions={canWrite ? <button className="btn btn-primary premium-action-btn" onClick={() => { setSelected(null); setOpen(true); }}><AppIcon name="truck" size={17} />Nueva batea</button> : null} />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para crear o editar bateas." /> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <PageLoadingState title="Cargando bateas..." rows={5} /> : <BateaTable items={items} canEdit={canWrite} onEdit={canWrite ? (item) => { setSelected(item); setOpen(true); } : undefined} />}
      <BateaFormModal open={open} initialData={selected} onClose={() => { setOpen(false); setSelected(null); }} onSubmit={handleSubmit} loading={saving} disabled={!canWrite} />
    </div>
  );
}
