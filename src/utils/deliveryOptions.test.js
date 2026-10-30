import { getDeliveryOptions } from './deliveryOptions';
test('admin can prepare a new order for assignment but cannot skip delivery steps', () => {
  expect(getDeliveryOptions({ estadoEntrega: 'preparando', estado: 'pendiente', metodo: 'efectivo' })).toEqual(['preparando', 'listo', 'cancelado']);
  expect(getDeliveryOptions({ estadoEntrega: 'listo', estado: 'pagado', metodo: 'efectivo' })).toEqual(['listo', 'preparando']);
  expect(getDeliveryOptions({ estadoEntrega: 'enviado', estado: 'pendiente', metodo: 'efectivo' })).toEqual(['enviado']);
});
