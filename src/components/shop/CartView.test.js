import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Axios from 'axios';
import CartView from './CartView';
import { getCart, getQuote, getPendingPurchase } from '../../services/cartService';
jest.mock('axios');
jest.mock('../../services/cartService');
jest.mock('../../utils/session', () => ({ getSessionData: () => ({ idUsuario: 2, correo: 'a@example.test', token: 'test' }), isAuthenticated: () => true }));
jest.mock('../admin/BranchMap', () => () => null);
jest.mock('../shared/PublicHeader', () => () => null);
jest.mock('../decoraciones/footer', () => () => null);
beforeEach(() => {
  getPendingPurchase.mockReturnValue(null);
  Axios.get.mockResolvedValue({ data: { usuario: {} } });
  getCart.mockResolvedValue([{ id: 1, nombre: 'Planta', cantidad: 1, precioVenta: '100.00', subtotal: '100.00', inventario_cant: 5 }]);
  getQuote.mockResolvedValue({ quoteHash: 'quote', subtotal: '100.00', iva: '16.00', envio: '50.00', total: '166.00' });
});
test('renders the server quote and cash-only checkout with decimal strings', async () => {
  await act(async () => { render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CartView /></MemoryRouter>); });
  expect(await screen.findByText('$166.00')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Confirmar pedido en efectivo/i })).toBeEnabled();
  expect(screen.queryByText(/Pagar con PayPal/i)).not.toBeInTheDocument();
});
test('a pending request remains recoverable even when the cart is empty', async () => {
  getPendingPurchase.mockReturnValue({ key: 'original-request' });
  getCart.mockResolvedValue([]);
  await act(async () => { render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CartView /></MemoryRouter>); });
  expect(await screen.findByRole('button', { name: 'Reintentar mismo pedido' })).toBeInTheDocument();
});
