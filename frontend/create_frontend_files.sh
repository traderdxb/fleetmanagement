#!/bin/bash

# API Service
cat > src/services/api.ts << 'EOF'
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
export const login = (email: string, password: string) => api.post('/auth/login', { email, password });
export const getDevices = () => api.get('/inventory/devices');
export const getAssignments = () => api.get('/assignments');
export const getClients = () => api.get('/clients');
export const getDashboardStats = () => api.get('/analytics/dashboard');
EOF

# Auth Context
cat > src/contexts/AuthContext.tsx << 'EOF'
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

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
      api.default.get('/auth/me').then(res => setUser(res.data)).catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
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
cat > src/pages/Login.tsx << 'EOF'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Fleet Management System</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">Default: admin@fleet.com / admin123</p>
      </div>
    </div>
  );
}
EOF

# Layout Component
cat > src/components/Layout.tsx << 'EOF'
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Fleet Management</h1>
          <div className="flex gap-4 items-center">
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/inventory" className="hover:underline">Inventory</Link>
            <Link to="/assignments" className="hover:underline">Assignments</Link>
            <Link to="/clients" className="hover:underline">Clients</Link>
            <Link to="/renewals" className="hover:underline">Renewals</Link>
            <Link to="/tasks" className="hover:underline">Tasks</Link>
            <Link to="/reports" className="hover:underline">Reports</Link>
            <span className="ml-4">{user?.name}</span>
            <button onClick={logout} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
EOF

# Dashboard Page
cat > src/pages/Dashboard.tsx << 'EOF'
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardStats });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Total Devices</h3>
          <p className="text-3xl font-bold">{data?.data.inventory.totalDevices || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Assigned</h3>
          <p className="text-3xl font-bold">{data?.data.inventory.assignedDevices || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Clients</h3>
          <p className="text-3xl font-bold">{data?.data.fleet.totalClients || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Vehicles</h3>
          <p className="text-3xl font-bold">{data?.data.fleet.totalVehicles || 0}</p>
        </div>
      </div>
    </div>
  );
}
EOF

# Create stub pages
for page in Inventory Assignments Clients Renewals Tasks Reports Analytics; do
cat > src/pages/${page}.tsx << EOF
export default function ${page}() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">${page}</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>${page} page - Connect to backend API to display data</p>
      </div>
    </div>
  );
}
EOF
done

# Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
EOF

# .env.example
cat > .env.example << 'EOF'
VITE_API_URL=http://localhost:5000/api
EOF

echo "Frontend files created successfully!"
