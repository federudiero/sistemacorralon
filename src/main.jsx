import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CuentaProvider } from './contexts/CuentaContext';
import { router } from './app/router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <CuentaProvider>
      <RouterProvider router={router} />
    </CuentaProvider>
  </AuthProvider>,
);
