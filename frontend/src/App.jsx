import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SearchProvider } from './context/SearchContext'
import HomeView from './views/HomeView'
import ProductDetailView from './views/ProductDetailView'
import AdminDashboardView from './views/AdminDashboardView'
import InventoryView from './views/InventoryView'
import ProductFormView from './views/ProductFormView'
import LoginView from './views/LoginView'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        applyDynamicStyles(data);
      })
      .catch(err => console.error('Error loading settings:', err));
  }, []);

  const applyDynamicStyles = (s) => {
    if (!s) return;
    
    // 1. Inyectar Variables CSS
    const root = document.documentElement;
    root.style.setProperty('--primary', s.brand_primary || '#dc2626');
    root.style.setProperty('--secondary', s.brand_secondary || '#18181b');
    root.style.setProperty('--accent', s.brand_accent || '#ef4444');
    root.style.setProperty('--radius-btn', s.button_radius || '16px');
    root.style.setProperty('--font-main', s.font_family || 'Inter');

    // 2. Cargar Google Font Dinámicamente
    if (s.font_family) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${s.font_family.replace(/ /g, '+')}:wght@300;400;700;900&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/product/:slug" element={<ProductDetailView />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboardView /></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute><InventoryView /></ProtectedRoute>} />
              <Route path="/admin/add-product" element={<ProtectedRoute><ProductFormView /></ProtectedRoute>} />
            </Routes>
          </Router>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
