import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Assignments from './pages/Assignments';
import Clients from './pages/Clients';
import Renewals from './pages/Renewals';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/assignments" element={<Assignments />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/renewals" element={<Renewals />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/analytics" element={<Analytics />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
