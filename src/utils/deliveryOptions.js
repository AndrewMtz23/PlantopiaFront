export function getDeliveryOptions(payment) {
  const current = payment.estadoEntrega;
  const next = { preparando: ['listo'], listo: ['preparando'] }[current] || [];
  const options = [current, ...next];
  if (next.length && payment.metodo === 'efectivo' && payment.estado === 'pendiente') options.push('cancelado');
  return options;
}
