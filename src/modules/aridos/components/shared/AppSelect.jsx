import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

const MENU_GAP_PX = 8;
const VIEWPORT_GUTTER_PX = 12;
const MIN_MENU_HEIGHT_PX = 144;
const MAX_MENU_HEIGHT_PX = 288;

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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function canUsePortal() {
  return typeof window !== 'undefined' && typeof document !== 'undefined' && Boolean(document.body);
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
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption).filter(Boolean),
    [options],
  );

  const currentValue = String(value ?? '');
  const selectedOption = normalizedOptions.find((item) => String(item.value) === currentValue) || null;
  const visibleOptions = includeEmptyOption
    ? [{ value: '', label: emptyLabel ?? placeholder, disabled: false }, ...normalizedOptions]
    : normalizedOptions;

  const updateMenuPosition = useCallback(() => {
    if (!open || !triggerRef.current || !canUsePortal()) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const width = rect.width;
    const maxLeft = Math.max(VIEWPORT_GUTTER_PX, viewportWidth - width - VIEWPORT_GUTTER_PX);
    const requestedLeft = align === 'right' ? rect.right - width : rect.left;
    const left = clamp(requestedLeft, VIEWPORT_GUTTER_PX, maxLeft);

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_GUTTER_PX - MENU_GAP_PX;
    const spaceAbove = rect.top - VIEWPORT_GUTTER_PX - MENU_GAP_PX;
    const shouldOpenUp = spaceBelow < MIN_MENU_HEIGHT_PX && spaceAbove > spaceBelow;
    const availableHeight = shouldOpenUp ? spaceAbove : spaceBelow;
    const maxHeight = clamp(availableHeight, MIN_MENU_HEIGHT_PX, MAX_MENU_HEIGHT_PX);

    setMenuStyle({
      position: 'fixed',
      top: shouldOpenUp ? `${Math.max(VIEWPORT_GUTTER_PX, rect.top - MENU_GAP_PX)}px` : `${rect.bottom + MENU_GAP_PX}px`,
      left: `${left}px`,
      width: `${width}px`,
      minWidth: `${width}px`,
      maxHeight: `${maxHeight}px`,
      transform: shouldOpenUp ? 'translateY(-100%)' : 'none',
      transformOrigin: shouldOpenUp ? 'bottom center' : 'top center',
    });
  }, [align, open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useLayoutEffect(() => {
    updateMenuPosition();
  }, [updateMenuPosition, visibleOptions.length]);

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();

    function handleViewportChange() {
      updateMenuPosition();
    }

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    function handlePointerDown(event) {
      const target = event.target;
      const clickedInsideTrigger = containerRef.current?.contains(target);
      const clickedInsideMenu = menuRef.current?.contains(target);

      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function handleSelect(nextValue) {
    onChange?.(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  const menu = open ? (
    <div
      ref={menuRef}
      className={[
        'app-select__menu',
        canUsePortal() ? 'app-select__menu--floating' : '',
        align === 'right' ? 'app-select__menu--right' : '',
        menuClassName,
      ].filter(Boolean).join(' ')}
      style={canUsePortal() ? menuStyle : undefined}
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
  ) : null;

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
        ref={triggerRef}
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

      {canUsePortal() ? createPortal(menu, document.body) : menu}
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
