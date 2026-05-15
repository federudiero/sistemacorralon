import { useEffect, useState } from 'react';
import PremiumModalShell from './PremiumModalShell';
import AppIcon from './AppIcon';

export default function ReasonActionModal({
  open,
  title = 'Confirmar acción',
  subtitle = 'Esta operación quedará auditada.',
  label = 'Motivo',
  initialReason = '',
  confirmLabel = 'Confirmar',
  tone = 'danger',
  loading = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState(initialReason);

  useEffect(() => {
    if (open) setReason(initialReason);
  }, [open, initialReason]);

  if (!open) return null;

  const canConfirm = reason.trim().length > 0 && !loading;

  return (
    <PremiumModalShell
      open={open}
      icon="warning"
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      maxWidth="max-w-lg"
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="button" className={`btn ${tone === 'danger' ? 'btn-error' : 'btn-primary'} premium-action-btn`} onClick={() => onConfirm?.(reason.trim())} disabled={!canConfirm}>
            <AppIcon name="warning" size={17} />
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </>
      )}
    >
      <label className="form-control w-full">
        <span className="field-label">{label}</span>
        <textarea
          className="textarea textarea-bordered min-h-28"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={loading}
          autoFocus
        />
      </label>
    </PremiumModalShell>
  );
}
