import pdfMake from 'pdfmake/build/pdfmake';
import { generarFacturaPDF } from './pdfCarrito';
jest.mock('pdfmake/build/pdfmake', () => ({ createPdf: jest.fn(() => ({ open: jest.fn() })) }));
jest.mock('pdfmake/build/vfs_fonts', () => ({ pdfMake: { vfs: {} } }));
jest.mock('jsbarcode', () => jest.fn());
test('receipt uses persisted total including shipping, order ID and actual pending status', () => {
  pdfMake.createPdf.mockReturnValue({ open: jest.fn() });
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,test');
  generarFacturaPDF([{ nombre: 'Planta', cantidad: 1, precioVenta: '100.00', subtotal: '100.00' }],
    { id: 42, subtotal: '100.00', iva: '16.00', envio: '50.00', total: '166.00', estado: 'pendiente', metodo: 'efectivo', fechaRegistro: '2026-10-29T12:00:00Z' }, { nombre: 'Plantopia' });
  const text = JSON.stringify(pdfMake.createPdf.mock.calls[0][0]);
  expect(text).toContain('$166.00');
  expect(text).toContain('$50.00');
  expect(text).toContain('P-42');
  expect(text).toContain('pendiente');
  expect(text).not.toContain('Pago procesado');
  expect(text).not.toContain('Completado');
});
