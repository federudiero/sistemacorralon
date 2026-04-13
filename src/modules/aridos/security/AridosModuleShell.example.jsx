import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAridosSecurity } from '../hooks/useAridosSecurity';
import { buildAridosNavItems } from '../utils/navigation';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import AccessDeniedState from '../components/shared/AccessDeniedState';

export default function AridosModuleShellExample({ cuentaId, currentUserEmail }) {
  const security = useAridosSecurity(cuentaId, currentUserEmail);

  if (security.loading) {
    return <div className="min-h-[280px] grid place-items-center"><span className="loading loading-spinner loading-lg" /></div>;
  }

  if (!security.hasAccess) {
    return <AccessDeniedState title="Sin acceso al módulo de áridos" message="Agregá este usuario en config/usuarios de la cuenta para habilitar el módulo." />;
  }

  const navItems = buildAridosNavItems(security.permissions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
      <aside className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm h-fit">
        <div className="mb-4">
          <div className="font-semibold">Módulo Áridos</div>
          <div className="text-sm opacity-70">Rol: {security.role}</div>
          <div className="text-xs opacity-60 break-all">{security.email}</div>
        </div>
        <nav className="menu bg-base-100 rounded-box p-0">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => isActive ? 'active' : ''}>{item.label}</NavLink>
            </li>
          ))}
        </nav>
      </aside>

      <section className="space-y-4">
        {security.isReadOnly ? <ReadOnlyBanner message="Entraste en modo solo lectura. Las acciones de alta, edición y anulación quedan bloqueadas desde UI y también deberían quedar bloqueadas por rules." /> : null}
        <Outlet context={{ security, cuentaId, currentUserEmail }} />
      </section>
    </div>
  );
}
