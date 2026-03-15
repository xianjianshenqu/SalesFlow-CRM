import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import SalesFunnel from './pages/SalesFunnel';
import Proposals from './pages/Proposals';
import Service from './pages/Service';
import Payments from './pages/Payments';
import AIAudio from './pages/AIAudio';
import Schedule from './pages/Schedule';
import Map from './pages/Map';
import Team from './pages/Team';
import PreSales from './pages/PreSales';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;