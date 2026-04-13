export function getBateaOccupancyPercent(stockActualM3 = 0, capacidadM3 = 0) {
  const cap = Number(capacidadM3 || 0);
  if (!cap) return 0;
  return Math.min(100, Math.max(0, (Number(stockActualM3 || 0) / cap) * 100));
}

export function sumBy(items = [], selector = (item) => item) {
  return items.reduce((acc, item) => acc + Number(selector(item) || 0), 0);
}
