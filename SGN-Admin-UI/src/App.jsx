import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Users from './pages/admin/Users.jsx';
import Nurseries from './pages/admin/Nurseries.jsx';
import Plants from './pages/admin/Plants.jsx';
import Orders from './pages/admin/Orders.jsx';
import Categories from './pages/admin/Categories.jsx';
import Reports from './pages/Reports.jsx';
import NurseryDashboard from './pages/nursery/Dashboard.jsx';
import NurseryPlants from './pages/nursery/Plants.jsx';
import NurseryInventory from './pages/nursery/Inventory.jsx';
import NurseryOrders from './pages/nursery/Orders.jsx';
import NurseryProfile from './pages/nursery/Profile.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import { isTokenExpired, normalizeRole } from './auth/token.js';

function LoginGate() {
  const { token, role } = useAuth();
  const normalizedRole = normalizeRole(role);
  if (token && !isTokenExpired(token) && normalizedRole === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (token && !isTokenExpired(token) && normalizedRole === 'NurseryOwner') {
    return <Navigate to="/nursery/dashboard" replace />;
  }
  return <Login />;
}

function CatchAll() {
  const { token, role } = useAuth();
  const normalizedRole = normalizeRole(role);
  if (token && !isTokenExpired(token) && normalizedRole === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (token && !isTokenExpired(token) && normalizedRole === 'NurseryOwner') {
    return <Navigate to="/nursery/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout role="Admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="nurseries" element={<Nurseries />} />
        <Route path="plants" element={<Plants />} />
        <Route path="orders" element={<Orders />} />
        <Route path="categories" element={<Categories />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route
        path="/nursery"
        element={
          <ProtectedRoute allowedRoles={['NurseryOwner']}>
            <AdminLayout role="NurseryOwner" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<NurseryDashboard />} />
        <Route path="plants" element={<NurseryPlants />} />
        <Route path="inventory" element={<NurseryInventory />} />
        <Route path="orders" element={<NurseryOrders />} />
        <Route path="profile" element={<NurseryProfile />} />
      </Route>
      <Route path="/" element={<CatchAll />} />
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
}
