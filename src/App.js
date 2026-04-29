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
import LocationsPage from "./app/ubicaciones/page";
import LoginPage from "./app/auth/login/page";
import RegisterPage from "./app/auth/register/page";
import CatalogPage from "./app/catalogo/page";
import ProductDetailPage from "./app/producto/page";
import ProfilePage from "./app/perfil/page";
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
import MyPurchasesPage from "./app/mis-compras/page";
import PurchaseConfirmationPage from "./app/compra-confirmada/page";
import LogisticsPage from "./app/logistica/page";
import RequireAuth from "./components/shared/RequireAuth";

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
          <Route path="/ubicaciones" element={<LocationsPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/registro" element={<Navigate to="/auth/register" replace />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:inventarioId" element={<ProductDetailPage />} />
          <Route path="/perfil" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/cruds" element={<RequireAuth allowedRoles={[1, 3, 4]}><CrudHubPage /></RequireAuth>} />
          <Route path="/usuarios" element={<RequireAuth allowedRoles={[1]}><UsersPage /></RequireAuth>} />
          <Route path="/productos" element={<RequireAuth allowedRoles={[1, 3]}><ProductsPage /></RequireAuth>} />
          <Route path="/sucursales" element={<RequireAuth allowedRoles={[1]}><BranchesPage /></RequireAuth>} />
          <Route path="/proveedores" element={<RequireAuth allowedRoles={[1]}><ProvidersPage /></RequireAuth>} />
          <Route path="/inventarios" element={<RequireAuth allowedRoles={[1, 3]}><InventoryPage /></RequireAuth>} />
          <Route path="/logistica" element={<RequireAuth allowedRoles={[1, 3, 4]}><LogisticsPage /></RequireAuth>} />
          <Route path="/carrito" element={<RequireAuth allowedRoles={[2]}><CartPage /></RequireAuth>} />
          <Route path="/lista" element={<RequireAuth allowedRoles={[2]}><WishlistPage /></RequireAuth>} />
          <Route path="/mis-compras" element={<RequireAuth><MyPurchasesPage /></RequireAuth>} />
          <Route path="/compra-confirmada/:paymentId" element={<RequireAuth><PurchaseConfirmationPage /></RequireAuth>} />
          <Route path="/graficas" element={<RequireAuth allowedRoles={[1]}><MetricsPage /></RequireAuth>} />
          <Route path="/graficas/RentabilidadGraficas" element={<RequireAuth allowedRoles={[1]}><ProfitabilityPage /></RequireAuth>} />
          <Route path="/categorias" element={<RequireAuth allowedRoles={[1]}><CategoriesPage /></RequireAuth>} />
          <Route path="/pagos" element={<RequireAuth allowedRoles={[1]}><PaymentsPage /></RequireAuth>} />
          <Route path="/logs" element={<RequireAuth allowedRoles={[1]}><LogsPage /></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
