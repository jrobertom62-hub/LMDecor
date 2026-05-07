import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/public/HomePage';
import { ProductDetails } from './pages/public/ProductDetails';
import { LegalPage } from './pages/public/LegalPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminConfig } from './pages/admin/AdminConfig';
import { AdminItems } from './pages/admin/AdminItems';
import { AdminApiKeys } from './pages/admin/AdminApiKeys';
import { AdminAiConfig } from './pages/admin/AdminAiConfig';
import { AdminAiLogs } from './pages/admin/AdminAiLogs';
import { AdminApiDocs } from './pages/admin/AdminApiDocs';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { PublicLayout } from './pages/public/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produto/:id" element={<ProductDetails />} />
          <Route path="/politica-de-privacidade" element={<LegalPage type="privacy" />} />
          <Route path="/termos-de-uso" element={<LegalPage type="terms" />} />
          <Route path="/politica-de-cookies" element={<LegalPage type="cookies" />} />
        </Route>

        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="config" element={<AdminConfig />} />
            <Route path="items" element={<AdminItems />} />
            <Route path="api-keys" element={<AdminApiKeys />} />
            <Route path="ai-config" element={<AdminAiConfig />} />
            <Route path="ai-logs" element={<AdminAiLogs />} />
            <Route path="api-docs" element={<AdminApiDocs />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

