import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import PageLoadingState from '../components/shared/PageLoadingState';
import AppIcon from '../components/shared/AppIcon';
import ProductosTable from '../components/productos/ProductosTable';
import ProductoFormModal from '../components/productos/ProductoFormModal';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useProductos from '../hooks/useProductos';
import { createProducto, updateProducto } from '../services/productos.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';

export default function ProductosPage({ cuentaId, currentUserEmail, security }) {
  const { items, loading, error } = useProductos(cuentaId);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.PRODUCTOS);

  async function handleSubmit(form) {
    if (!canWrite) return;
    setSaving(true);
    try {
      if (selected?.id) await updateProducto(cuentaId, selected.id, form, currentUserEmail);
      else await createProducto(cuentaId, form, currentUserEmail);
      setOpen(false);
      setSelected(null);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Productos" actions={canWrite ? <button className="btn btn-primary premium-action-btn" onClick={() => { setSelected(null); setOpen(true); }}><AppIcon name="product" size={17} />Nuevo producto</button> : null} />
      {!canWrite ? <ReadOnlyBanner message="No tenés permiso de escritura sobre productos. Podés consultar el catálogo pero no modificarlo." /> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <PageLoadingState title="Cargando productos..." rows={5} /> : <ProductosTable items={items} canEdit={canWrite} onEdit={canWrite ? (item) => { setSelected(item); setOpen(true); } : undefined} />}
      <ProductoFormModal open={open} initialData={selected} onClose={() => { setOpen(false); setSelected(null); }} onSubmit={handleSubmit} loading={saving} disabled={!canWrite} />
    </div>
  );
}
