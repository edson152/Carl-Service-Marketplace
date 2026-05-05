import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import ProviderRegister from './pages/ProviderRegister';
import Services        from './pages/Services';
import ProviderDetail  from './pages/ProviderDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminPanel      from './pages/AdminPanel';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                   element={<Home />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/register"           element={<Register />} />
        <Route path="/register/provider"  element={<ProviderRegister />} />
        <Route path="/services"           element={<Services />} />
        <Route path="/providers/:id"      element={<ProviderDetail />} />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/provider/dashboard" element={
          <ProtectedRoute roles={['provider']}>
            <ProviderDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
