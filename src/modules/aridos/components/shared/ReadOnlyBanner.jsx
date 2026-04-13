
import React from 'react';

export default function ReadOnlyBanner({ message = 'Modo solo lectura activo para este usuario o sección.' }) {
  return (
    <div className="mb-4 rounded-xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning-content">
      <strong className="font-semibold">Solo lectura.</strong> {message}
    </div>
  );
}
