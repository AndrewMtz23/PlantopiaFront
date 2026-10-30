import Axios from 'axios';
import { createCartItem, processPurchase } from './cartService';
jest.mock('axios');
beforeAll(() => { Object.defineProperty(globalThis, 'crypto', { value: require('crypto').webcrypto, configurable: true }); });
beforeEach(() => { jest.clearAllMocks(); sessionStorage.clear(); });
test('cart sends quantity and inventory without trusting client subtotal or owner', async () => {
  Axios.post.mockResolvedValue({ data: {} });
  await createCartItem({ inventoryId: 7, userId: 999, quantity: 2, subtotal: 0.01 });
  expect(Axios.post.mock.calls[0][1]).toEqual({ inventario: 7, cantidad: 2 });
});
test('a network timeout preserves the same payload and key for retry', async () => {
  Axios.post.mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce({ data: { pagoId: 3 } });
  const options = { quoteHash: 'quote-1', deliveryAddress: { nombre: 'Alice' } };
  await expect(processPurchase(1, options)).rejects.toThrow('timeout');
  await processPurchase(1, options);
  expect(Axios.post.mock.calls[1][1]).toEqual(Axios.post.mock.calls[0][1]);
  expect(Axios.post.mock.calls[0][2].headers['Idempotency-Key']).toBeTruthy();
  expect(Axios.post.mock.calls[1][2]).toEqual(Axios.post.mock.calls[0][2]);
});
