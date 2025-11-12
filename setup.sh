#!/bin/bash

echo "🚀 Fleet Management App - Post-Extraction Setup"
echo "================================================"

cd "$(dirname "$0")"

# Create remaining frontend files
echo "📝 Creating frontend components..."

# Auth Context
cat > frontend/src/contexts/AuthContext.tsx << 'EOF'
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me').then(res => setUser(res.data)).catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
EOF

# Login Page
cat > frontend/src/pages/Login.tsx << 'EOF'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@fleet.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Fleet Management</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 font-medium mb-2">Demo Credentials:</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Admin: admin@fleet.com / admin123</p>
            <p>• Manager: manager@fleet.com / manager123</p>
            <p>• Support: support@fleet.com / support123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# Layout Component
cat > frontend/src/components/Layout.tsx << 'EOF'
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/assignments', label: 'Assignments' },
    { path: '/clients', label: 'Clients' },
    { path: '/renewals', label: 'Renewals' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/reports', label: 'Reports' },
    { path: '/analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Fleet Management</h1>
              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      location.pathname === item.path
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-500'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-blue-200">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
EOF

# Dashboard Page  
cat > frontend/src/pages/Dashboard.tsx << 'EOF'
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Devices',
      value: data?.inventory?.totalDevices || 0,
      color: 'bg-blue-500',
      icon: '📱',
    },
    {
      title: 'Assigned Devices',
      value: data?.inventory?.assignedDevices || 0,
      color: 'bg-green-500',
      icon: '✅',
    },
    {
      title: 'Available Devices',
      value: data?.inventory?.availableDevices || 0,
      color: 'bg-yellow-500',
      icon: '📦',
    },
    {
      title: 'Total Clients',
      value: data?.fleet?.totalClients || 0,
      color: 'bg-purple-500',
      icon: '👥',
    },
    {
      title: 'Total Vehicles',
      value: data?.fleet?.totalVehicles || 0,
      color: 'bg-indigo-500',
      icon: '🚗',
    },
    {
      title: 'Installations (This Month)',
      value: data?.thisMonth?.installations || 0,
      color: 'bg-teal-500',
      icon: '🔧',
    },
    {
      title: 'Removals (This Month)',
      value: data?.thisMonth?.removals || 0,
      color: 'bg-orange-500',
      icon: '🔄',
    },
    {
      title: 'Pending Tasks',
      value: data?.alerts?.pendingTasks || 0,
      color: 'bg-red-500',
      icon: '⚠️',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of fleet management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      {data?.alerts?.upcomingRenewals > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Alerts</h3>
          <p className="text-yellow-700">
            You have {data.alerts.upcomingRenewals} subscription renewals due in the next 30 days.
          </p>
        </div>
      )}
    </div>
  );
}
EOF

# Create stub pages
for page in Inventory Assignments Clients Renewals Tasks Reports Analytics; do
cat > frontend/src/pages/${page}.tsx << PAGEEOF
export default function ${page}() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">${page}</h2>
        <p className="text-gray-600 mt-1">${page} management module</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            ${page} Module
          </h3>
          <p className="text-gray-600 mb-6">
            This module is ready for implementation. Connect to backend API endpoints to display and manage ${page,,} data.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-blue-800 font-medium mb-2">Available API Endpoints:</p>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• GET /api/${page,,} - List all ${page,,}</li>
              <li>• POST /api/${page,,} - Create new ${page,,}</li>
              <li>• PUT /api/${page,,}/:id - Update ${page,,}</li>
              <li>• DELETE /api/${page,,}/:id - Delete ${page,,}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
PAGEEOF
done

# Create .env files
cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:5000/api
EOF

cat > backend/.env << 'EOF'
DATABASE_URL="postgresql://fleet_user:fleet_password@db:5432/fleet_management"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the application: docker-compose up -d"
echo "2. Wait 10 seconds for services to start"
echo "3. Initialize database: docker-compose exec backend npm run db:migrate"
echo "4. Seed data: docker-compose exec backend npm run db:seed"
echo "5. Access: http://localhost:3000"
echo "6. Login: admin@fleet.com / admin123"
