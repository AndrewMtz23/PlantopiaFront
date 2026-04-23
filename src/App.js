import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./app/home/page";
import CompanyPage from "./app/cia/page";
import AboutPage from "./app/acerca-de/page";
import FaqPage from "./app/preguntas/page";
import CollectionsPage from "./app/colecciones/page";
import CareGuidePage from "./app/cuidados/page";
import ShippingPage from "./app/envios/page";
import GiftingPage from "./app/regalos-botanicos/page";
import LoginPage from "./app/auth/login/page";
import RegisterPage from "./app/auth/register/page";
import CatalogPage from "./app/catalogo/page";
import CartPage from "./app/carrito/page";
import WishlistPage from "./app/lista/page";
import CrudHubPage from "./app/cruds/page";
import UsersPage from "./app/usuarios/page";
import ProductsPage from "./app/productos/page";
import BranchesPage from "./app/sucursales/page";
import ProvidersPage from "./app/proveedores/page";
import InventoryPage from "./app/inventarios/page";
import MetricsPage from "./app/graficas/page";
import ProfitabilityPage from "./app/graficas/rentabilidad/page";
import CategoriesPage from "./app/categorias/page";
import PaymentsPage from "./app/pagos/page";
import LogsPage from "./app/logs/page";

function App() {
  return (
    <Router>
      <div>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cia" element={<CompanyPage />} />
          <Route path="/acerca de" element={<AboutPage />} />
          <Route path="/preguntas" element={<FaqPage />} />
          <Route path="/colecciones" element={<CollectionsPage />} />
          <Route path="/cuidados" element={<CareGuidePage />} />
          <Route path="/envios" element={<ShippingPage />} />
          <Route path="/regalos-botanicos" element={<GiftingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/registro" element={<Navigate to="/auth/register" replace />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/cruds" element={<CrudHubPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/sucursales" element={<BranchesPage />} />
          <Route path="/proveedores" element={<ProvidersPage />} />
          <Route path="/inventarios" element={<InventoryPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/lista" element={<WishlistPage />} />
          <Route path="/graficas" element={<MetricsPage />} />
          <Route path="/graficas/RentabilidadGraficas" element={<ProfitabilityPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/pagos" element={<PaymentsPage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
