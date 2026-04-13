export default function EntitySearchSelect({ label, items = [], value = '', onChange, disabled = false }) {
  return (
    <label className="form-control w-full">
      <span className="field-label">{label}</span>
      <select className="select select-bordered h-12" value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled}>
        <option value="">Seleccionar...</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.nombre || item.label || item.id}</option>
        ))}
      </select>
    </label>
  );
}
