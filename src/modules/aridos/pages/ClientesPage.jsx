import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import PageLoadingState from '../components/shared/PageLoadingState';
import AppIcon from '../components/shared/AppIcon';
import ClientesTable from '../components/clientes/ClientesTable';
import ClienteFormModal from '../components/clientes/ClienteFormModal';
import CuentaCorrientePagoModal from '../components/clientes/CuentaCorrientePagoModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useClientes from '../hooks/useClientes';
import { createCliente, updateCliente } from '../services/clientes.service';
import { registrarPagoCuentaCorriente } from '../services/cuentaCorriente.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function ClientesPage({ cuentaId, currentUserEmail, security }) {
  const { items, loading, error } = useClientes(cuentaId);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [clientePago, setClientePago] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingPago, setSavingPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');
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


  async function handleRegistrarPago(form) {
    if (!canWrite || !clientePago?.id) return;
    setSavingPago(true);
    setErrorPago('');

    try {
      await registrarPagoCuentaCorriente(
        cuentaId,
        {
          ...form,
          clienteId: clientePago.id,
          clienteNombre: clientePago.nombre || '',
        },
        currentUserEmail,
      );
      setClientePago(null);
    } catch (err) {
      setErrorPago(err?.message || 'No se pudo registrar el pago.');
    } finally {
      setSavingPago(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Clientes" actions={canWrite ? <button className="btn btn-primary premium-action-btn" onClick={() => { setSelected(null); setOpen(true); }}><AppIcon name="clients" size={17} />Nuevo cliente</button> : null} />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso para alta o edición de clientes." /> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {errorPago ? <div className="alert alert-error">{errorPago}</div> : null}
      {loading ? (
        <PageLoadingState title="Cargando clientes..." rows={5} />
      ) : (
        <ClientesTable
          items={items}
          canEdit={canWrite}
          onEdit={canWrite ? (item) => { setSelected(item); setOpen(true); } : undefined}
          onRegisterPago={canWrite ? (item) => { setErrorPago(''); setClientePago(item); } : undefined}
        />
      )}
      <ClienteFormModal open={open} initialData={selected} onClose={() => { setOpen(false); setSelected(null); }} onSubmit={handleSubmit} loading={saving} disabled={!canWrite} />
      <CuentaCorrientePagoModal
        open={Boolean(clientePago)}
        cliente={clientePago}
        onClose={() => { setClientePago(null); setErrorPago(''); }}
        onSubmit={handleRegistrarPago}
        loading={savingPago}
        disabled={!canWrite}
      />
    </div>
  );
}
