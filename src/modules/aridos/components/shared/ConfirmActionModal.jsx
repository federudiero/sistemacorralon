function vibrate(pattern) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

export default function ConfirmActionModal({ open, title = 'Confirmar', description = '¿Querés continuar?', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onClose, loading = false }) {
  if (!open) return null;

  function handleConfirm() {
    vibrate([50, 30, 80]);
    onConfirm();
  }

  function handleClose() {
    vibrate(20);
    onClose();
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-lg">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-3">{description}</p>
        <div className="modal-action">
          <button className="btn" onClick={handleClose} disabled={loading}>{cancelLabel}</button>
          <button className="btn btn-error" onClick={handleConfirm} disabled={loading}>{loading ? 'Procesando...' : confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
