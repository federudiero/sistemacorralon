export function getUnidadStock(producto = {}) {
  return String(producto?.unidadStock || producto?.unidad || 'm3').trim() || 'm3';
}

export function getStockActual(producto = {}) {
  if (producto?.stockActual != null) return Number(producto.stockActual || 0);
  if (getUnidadStock(producto) === 'm3' && producto?.stockTotalM3 != null) {
    return Number(producto.stockTotalM3 || 0);
  }
  return 0;
}

export function getStockMinimo(producto = {}) {
  if (producto?.stockMinimo != null) return Number(producto.stockMinimo || 0);
  if (getUnidadStock(producto) === 'm3' && producto?.stockMinimoM3 != null) {
    return Number(producto.stockMinimoM3 || 0);
  }
  return 0;
}

export function buildStockFields(unidadStock = 'm3', stockActual = 0) {
  const unidad = String(unidadStock || 'm3').trim() || 'm3';
  const value = Number(stockActual || 0);
  return {
    stockActual: value,
    stockTotalM3: unidad === 'm3' ? value : null,
  };
}

export function buildStockMinFields(unidadStock = 'm3', stockMinimo = 0) {
  const unidad = String(unidadStock || 'm3').trim() || 'm3';
  const value = Number(stockMinimo || 0);
  return {
    stockMinimo: value,
    stockMinimoM3: unidad === 'm3' ? value : null,
  };
}

export function calculateWeightedAverageCost({
  stockAnterior = 0,
  costoPromedioAnterior = 0,
  cantidadIngresada = 0,
  costoUnitarioIngresado = 0,
} = {}) {
  const currentStock = Number(stockAnterior || 0);
  const currentAverage = Number(costoPromedioAnterior || 0);
  const incomingQty = Number(cantidadIngresada || 0);
  const incomingCost = Number(costoUnitarioIngresado || 0);
  const totalQty = currentStock + incomingQty;

  if (totalQty <= 0) return incomingCost;
  if (currentStock <= 0) return incomingCost;

  return ((currentStock * currentAverage) + (incomingQty * incomingCost)) / totalQty;
}

export function getAjusteDelta(tipo, cantidad = 0) {
  const qty = Number(cantidad || 0);
  return tipo === 'ajuste_negativo' || tipo === 'merma' ? -qty : qty;
}

export function getAjusteReversionTipo(tipo = '') {
  if (tipo === 'ajuste_positivo') return 'ajuste_negativo';
  return 'ajuste_positivo';
}
