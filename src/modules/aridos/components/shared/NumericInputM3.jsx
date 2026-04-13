export default function NumericInputM3({ value, onChange, disabled = false }) {
  return (
    <input
      type="number"
      step="0.01"
      min="0"
      className="input input-bordered h-12 w-full"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      inputMode="decimal"
    />
  );
}
