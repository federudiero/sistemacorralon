import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import PageLoadingState from '../components/shared/PageLoadingState';
import AppIcon from '../components/shared/AppIcon';
import ProveedoresTable from '../components/proveedores/ProveedoresTable';
import ProveedorFormModal from '../components/proveedores/ProveedorFormModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useProveedores from '../hooks/useProveedores';
import { createProveedor, updateProveedor } from '../services/proveedores.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function ProveedoresPage({ cuentaId, security }) {
  const { items, loading, error } = useProveedores(cuentaId);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.PROVEEDORES);

  async function handleSubmit(form) {
    if (!canWrite) return;
    setSaving(true);
    try {
      if (selected?.id) await updateProveedor(cuentaId, selected.id, form);
      else await createProveedor(cuentaId, form);
      setOpen(false);
      setSelected(null);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Proveedores" actions={canWrite ? <button className="btn btn-primary premium-action-btn" onClick={() => { setSelected(null); setOpen(true); }}><AppIcon name="suppliers" size={17} />Nuevo proveedor</button> : null} />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para alta o edición de proveedores." /> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <PageLoadingState title="Cargando proveedores..." rows={5} /> : <ProveedoresTable items={items} canEdit={canWrite} onEdit={canWrite ? (item) => { setSelected(item); setOpen(true); } : undefined} /> }
      <ProveedorFormModal open={open} initialData={selected} onClose={() => { setOpen(false); setSelected(null); }} onSubmit={handleSubmit} loading={saving} disabled={!canWrite} />
    </div>
  );
}
