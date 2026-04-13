
import React from 'react';

export default function AccessDeniedState({ title = 'Sin acceso', message = 'No tenés permisos para entrar a esta sección.' }) {
  return (
    <div className="rounded-2xl border border-error/20 bg-error/5 p-6 text-error-content shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm opacity-80">{message}</p>
    </div>
  );
}
