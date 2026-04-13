import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import ClientesTable from '../components/clientes/ClientesTable';
import ClienteFormModal from '../components/clientes/ClienteFormModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useClientes from '../hooks/useClientes';
import { createCliente, updateCliente } from '../services/clientes.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function ClientesPage({ cuentaId, security }) {
  const { items, loading, error } = useClientes(cuentaId);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.CLIENTES);

  async function handleSubmit(form) {
    if (!canWrite) return;
    setSaving(true);
    try {
      if (selected?.id) await updateCliente(cuentaId, selected.id, form);
      else await createCliente(cuentaId, form);
      setOpen(false);
      setSelected(null);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Clientes" subtitle="ABM base de clientes" actions={canWrite ? <button className="btn btn-primary" onClick={() => { setSelected(null); setOpen(true); }}>Nuevo cliente</button> : null} />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para alta o edición de clientes." /> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : <ClientesTable items={items} canEdit={canWrite} onEdit={canWrite ? (item) => { setSelected(item); setOpen(true); } : undefined} /> }
      <ClienteFormModal open={open} initialData={selected} onClose={() => { setOpen(false); setSelected(null); }} onSubmit={handleSubmit} loading={saving} disabled={!canWrite} />
    </div>
  );
}
