import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
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
import AdminSupport from './pages/admin/Support.jsx';
import NurseryDashboard from './pages/nursery/Dashboard.jsx';
import NurseryPlants from './pages/nursery/Plants.jsx';
import NurseryInventory from './pages/nursery/Inventory.jsx';
import NurseryOrders from './pages/nursery/Orders.jsx';
import NurseryProfile from './pages/nursery/Profile.jsx';
import CustomerShopRoot from './layouts/CustomerShopRoot.jsx';
import CustomerPublicLayout from './layouts/CustomerPublicLayout.jsx';
import CustomerAccountLayout from './layouts/CustomerAccountLayout.jsx';
import CustomerSignup from './pages/CustomerSignup.jsx';
import NurserySignup from './pages/NurserySignup.jsx';
import CustomerHome from './pages/customer/Home.jsx';
import CustomerPlants from './pages/customer/Plants.jsx';
import CustomerPlantDetail from './pages/customer/PlantDetail.jsx';
import CustomerOrders from './pages/customer/Orders.jsx';
import CustomerCancelledOrders from './pages/customer/CancelledOrders.jsx';
import CustomerProfile from './pages/customer/Profile.jsx';
import CustomerSupport from './pages/customer/Support.jsx';
import CustomerSupportDetail from './pages/customer/SupportDetail.jsx';
import PlantDiseaseDetector from './pages/customer/PlantDiseaseDetector.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import { isTokenExpired, normalizeRole } from './auth/token.js';

function LoginGate() {
  const { token, role } = useAuth();
  const normalizedRole = normalizeRole(role);
  if (token && !isTokenExpired(token) && normalizedRole === 'Admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  if (token && !isTokenExpired(token) && normalizedRole === 'NurseryOwner') {
    return <Navigate to="/nursery-dashboard" replace />;
  }
  if (token && !isTokenExpired(token) && normalizedRole === 'Customer') {
    return <Navigate to="/customer-dashboard" replace />;
  }
  return <Login />;
}

function CatchAll() {
  const { token, role } = useAuth();
  const normalizedRole = normalizeRole(role);
  if (token && !isTokenExpired(token) && normalizedRole === 'Admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  if (token && !isTokenExpired(token) && normalizedRole === 'NurseryOwner') {
    return <Navigate to="/nursery-dashboard" replace />;
  }
  if (token && !isTokenExpired(token) && normalizedRole === 'Customer') {
    return <Navigate to="/customer-dashboard" replace />;
  }
  return <Navigate to="/customer-dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
      <Route
        path="/admin-dashboard"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/customer-dashboard"
        element={<Navigate to="/customer/home" replace />}
      />
      <Route
        path="/nursery-dashboard"
        element={<Navigate to="/nursery/dashboard" replace />}
      />
      <Route path="/customer/signup" element={<CustomerSignup />} />
      <Route path="/nursery/signup" element={<NurserySignup />} />
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
        <Route path="support/:id" element={<AdminSupport />} />
        <Route path="support" element={<AdminSupport />} />
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
      <Route
        path="/customer/orders"
        element={<Navigate to="/customer/account/orders" replace />}
      />
      <Route
        path="/customer/profile"
        element={<Navigate to="/customer/account/profile" replace />}
      />
      <Route path="/customer" element={<CustomerShopRoot />}>
        <Route element={<CustomerPublicLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<CustomerHome />} />
          <Route path="plants" element={<CustomerPlants />} />
          <Route path="plants/:id" element={<CustomerPlantDetail />} />
        </Route>
        <Route
          path="account"
          element={
            <ProtectedRoute role="Customer">
              <CustomerAccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="plant-disease" element={<PlantDiseaseDetector />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="cancelled" element={<CustomerCancelledOrders />} />
        </Route>
        <Route
          path="support"
          element={
            <ProtectedRoute role="Customer">
              <CustomerAccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerSupport />} />
          <Route path=":id" element={<CustomerSupportDetail />} />
        </Route>
      </Route>
      <Route path="/" element={<CatchAll />} />
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
}
