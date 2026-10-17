import { Route, Routes } from "react-router-dom";
import ComercioProvider from "./context/ComercioProvider.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import AdminRoute from "./components/auth/AdminRoute.jsx";
import GuestRoute from "./components/auth/GuestRoute.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";

import Home from "./pages/Home.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Categorias from "./pages/Categorias.jsx";
import Acerca from "./pages/Acerca.jsx";
import Contacto from "./pages/Contacto.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import NotFound from "./pages/NotFound.jsx";

import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminProductos from "./pages/admin/AdminProductos.jsx";
import AdminProductoForm from "./pages/admin/AdminProductoForm.jsx";
import AdminCategorias from "./pages/admin/AdminCategorias.jsx";
import AdminConsultas from "./pages/admin/AdminConsultas.jsx";
import AdminComercio from "./pages/admin/AdminComercio.jsx";
import AdminPerfil from "./pages/admin/AdminPerfil.jsx";

// Este árbol de rutas es la base del "diagrama de navegación" del TPO.
export default function App() {
  return (
    <ComercioProvider>
      <AuthProvider>
      <Routes>
        {/* Sitio público */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="catalogo/:id" element={<ProductoDetalle />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="acerca" element={<Acerca />} />
          <Route path="contacto" element={<Contacto />} />
          {/* Si ya hay sesión iniciada, estas tres rutas redirigen al panel */}
          <Route element={<GuestRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
          {/* El mail del back arma el link como /reset-password?token=... */}
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Administración: solo con sesión de admin (AdminRoute) */}
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="productos/nuevo" element={<AdminProductoForm />} />
            <Route path="productos/:id/editar" element={<AdminProductoForm />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="consultas" element={<AdminConsultas />} />
            <Route path="comercio" element={<AdminComercio />} />
            <Route path="perfil" element={<AdminPerfil />} />
          </Route>
        </Route>
      </Routes>
      </AuthProvider>
    </ComercioProvider>
  );
}
