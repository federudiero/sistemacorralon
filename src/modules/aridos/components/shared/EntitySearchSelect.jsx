import AppSelect from './AppSelect';

export default function EntitySearchSelect({ label, items = [], value = '', onChange, disabled = false }) {
  const options = items.map((item) => ({
    value: item.id,
    label: item.nombre || item.label || item.id,
  }));

  return (
    <AppSelect
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder="Seleccionar..."
      includeEmptyOption
      emptyLabel="Seleccionar..."
    />
  );
}
