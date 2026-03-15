import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/Customers/CustomerDetail';
import SalesFunnel from './pages/SalesFunnel';
import Proposals from './pages/Proposals';
import Service from './pages/Service';
import Payments from './pages/Payments';
import AIAudio from './pages/AIAudio';
import Schedule from './pages/Schedule';
import Map from './pages/Map';
import Team from './pages/Team';
import PreSales from './pages/PreSales';
import Login from './pages/Login';

// 路由守卫组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuthStore();
  const location = useLocation();

  // 未登录则重定向到登录页，并记录来源页面
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页面 */}
        <Route path="/login" element={<Login />} />
        
        {/* 需要认证的页面 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="funnel" element={<SalesFunnel />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="service" element={<Service />} />
          <Route path="payments" element={<Payments />} />
          <Route path="ai-audio" element={<AIAudio />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="map" element={<Map />} />
          <Route path="team" element={<Team />} />
          <Route path="presales" element={<PreSales />} />
        </Route>

        {/* 404 重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;