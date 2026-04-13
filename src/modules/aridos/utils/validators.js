export function requireString(value, fieldName) {
  if (!String(value || '').trim()) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }
}

export function requirePositiveNumber(value, fieldName) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`El campo ${fieldName} debe ser mayor a 0.`);
  }
}

export function requireNonNegativeNumber(value, fieldName) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`El campo ${fieldName} no puede ser negativo.`);
  }
}

export function requireBolsaKg(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 25) {
    throw new Error('El peso de la bolsa debe estar entre 1 y 25 kg.');
  }
}

export function assertStockAvailable(stockActual, cantidad) {
  if (Number(cantidad) > Number(stockActual)) {
    throw new Error('Stock insuficiente para completar la operación.');
  }
}
