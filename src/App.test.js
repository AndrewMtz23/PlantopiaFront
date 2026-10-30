import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios');
// The map is not mounted on the home route; its ESM-only package is outside CRA's Jest transform.
jest.mock('react-leaflet', () => ({}));
window.matchMedia = query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() });

test('the application can load all routes with the installed PDF font bundle', () => {
  expect(() => require('./App')).not.toThrow();
});
test('the home route renders its heading and navigation with no products', async () => {
  axios.get.mockResolvedValue({ data: [] });
  window.history.replaceState({}, '', '/');
  const App = require('./App').default;
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Plantas que se sienten');
  expect(screen.getByRole('link', { name: /Explorar colecciones/i })).toBeTruthy();
  await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/obtenerProductos'));
});
