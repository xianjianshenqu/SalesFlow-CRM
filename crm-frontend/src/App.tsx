import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/Customers/CustomerDetail';
import SalesFunnel from './pages/SalesFunnel';
import Proposals from './pages/Proposals';
import CreateProposal from './pages/Proposals/CreateProposal';
import ProposalDetail from './pages/Proposals/ProposalDetail';
import Service from './pages/Service';
import Payments from './pages/Payments';
import AIAudio from './pages/AIAudio';
import Schedule from './pages/Schedule';
import Map from './pages/Map';
import Team from './pages/Team';
import PreSales from './pages/PreSales';
import ActivitiesList from './pages/PreSales/Activities';
import ActivityForm from './pages/PreSales/Activities/ActivityForm';
import SignInPage from './pages/PreSales/SignIn/SignInPage';
import Login from './pages/Login';
import AIAssistant from './pages/AIAssistant';

// 路由守卫组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, _hasHydrated } = useAuthStore();
  const location = useLocation();

  // 等待 hydration 完成，避免因状态未恢复而误判
  // 在 hydration 完成前显示加载状态
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm text-slate-500">正在恢复登录状态...</span>
        </div>
      </div>
    );
  }

  // hydration 完成后，检查认证状态
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
          <Route path="proposals/create" element={<CreateProposal />} />
          <Route path="proposals/:id" element={<ProposalDetail />} />
          <Route path="service" element={<Service />} />
          <Route path="payments" element={<Payments />} />
          <Route path="ai-audio" element={<AIAudio />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="map" element={<Map />} />
          <Route path="team" element={<Team />} />
          <Route path="presales" element={<PreSales />} />
          <Route path="presales/activities" element={<ActivitiesList />} />
          <Route path="presales/activities/create" element={<ActivityForm />} />
          <Route path="presales/activities/:id" element={<ActivityForm />} />
          <Route path="presales/activities/:id/qrcodes" element={<ActivityForm />} />
          <Route path="presales/sign-in" element={<SignInPage />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
        </Route>

        {/* 404 重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;