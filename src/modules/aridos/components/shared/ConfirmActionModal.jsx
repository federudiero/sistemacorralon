import PremiumModalShell from './PremiumModalShell';
import AppIcon from './AppIcon';

function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
}

export default function ConfirmActionModal({
  open,
  title = 'Confirmar',
  description = '¿Querés continuar?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onClose,
  loading = false,
  tone = 'danger',
}) {
  if (!open) return null;

  function handleConfirm() {
    vibrate([50, 30, 80]);
    onConfirm?.();
  }

  function handleClose() {
    vibrate(20);
    onClose?.();
  }

  return (
    <PremiumModalShell
      open={open}
      icon="warning"
      title={title}
      subtitle={description}
      onClose={handleClose}
      maxWidth="max-w-lg"
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={loading}>{cancelLabel}</button>
          <button type="button" className={`btn ${tone === 'danger' ? 'btn-error' : 'btn-primary'} premium-action-btn`} onClick={handleConfirm} disabled={loading}>
            <AppIcon name="warning" size={17} />
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </>
      )}
    >
      <div className="premium-warning-panel">
        <AppIcon name="warning" size={20} />
        <p>{description}</p>
      </div>
    </PremiumModalShell>
  );
}
