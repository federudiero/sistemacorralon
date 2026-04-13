export default function ConfirmActionModal({ open, title = 'Confirmar', description = '¿Querés continuar?', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onClose, loading = false }) {
  if (!open) return null;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-3">{description}</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={loading}>{cancelLabel}</button>
          <button className="btn btn-error" onClick={onConfirm} disabled={loading}>{loading ? 'Procesando...' : confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
