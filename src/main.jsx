import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CuentaProvider } from './contexts/CuentaContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { router } from './app/router';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <CuentaProvider>
        <RouterProvider router={router} />
      </CuentaProvider>
    </AuthProvider>
  </ThemeProvider>,
);
