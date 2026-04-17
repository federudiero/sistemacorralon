import { useEffect, useId, useMemo, useRef, useState } from 'react';

function normalizeOption(option) {
  if (option == null) return null;
  if (typeof option === 'string' || typeof option === 'number') {
    return { value: String(option), label: String(option), disabled: false };
  }

  const rawValue = option.value ?? option.id ?? '';
  return {
    value: String(rawValue),
    label: option.label ?? option.nombre ?? option.name ?? String(rawValue),
    disabled: Boolean(option.disabled),
  };
}

export default function AppSelect({
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Seleccionar...',
  emptyLabel,
  includeEmptyOption = false,
  disabled = false,
  size = 'md',
  wrapperClassName = '',
  triggerClassName = '',
  menuClassName = '',
  align = 'left',
}) {
  const id = useId();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption).filter(Boolean),
    [options],
  );

  const currentValue = String(value ?? '');
  const selectedOption = normalizedOptions.find((item) => String(item.value) === currentValue) || null;
  const visibleOptions = includeEmptyOption
    ? [{ value: '', label: emptyLabel ?? placeholder, disabled: false }, ...normalizedOptions]
    : normalizedOptions;

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function handleSelect(nextValue) {
    onChange?.(nextValue);
    setOpen(false);
  }

  const content = (
    <div
      ref={containerRef}
      className={[
        'app-select',
        `app-select--${size}`,
        open ? 'is-open' : '',
        disabled ? 'is-disabled' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={['app-select__trigger', triggerClassName].filter(Boolean).join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${id}-label` : undefined}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={['app-select__value', selectedOption ? '' : 'is-placeholder'].filter(Boolean).join(' ')}>
          {selectedOption?.label || placeholder}
        </span>
        <span className="app-select__chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          className={[
            'app-select__menu',
            align === 'right' ? 'app-select__menu--right' : '',
            menuClassName,
          ].filter(Boolean).join(' ')}
          role="listbox"
          aria-labelledby={label ? `${id}-label` : undefined}
        >
          {visibleOptions.length ? visibleOptions.map((option, index) => {
            const isSelected = String(option.value) === currentValue;
            return (
              <button
                key={`${option.value || '__empty__'}-${index}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={['app-select__option', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ')}
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
              >
                <span className="app-select__option-label">{option.label}</span>
              </button>
            );
          }) : (
            <div className="app-select__empty">Sin opciones</div>
          )}
        </div>
      ) : null}
    </div>
  );

  if (!label) return content;

  return (
    <label className={['form-control w-full', wrapperClassName].filter(Boolean).join(' ')}>
      <span className="field-label" id={`${id}-label`}>{label}</span>
      {content}
    </label>
  );
}
