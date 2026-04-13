import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAridosAppBindings } from './useAridosAppBindings.example';
import { useAridosSecurity } from '../hooks/useAridosSecurity';
import { buildAridosNavItems } from '../utils/navigation';

export default function AdminNavbarAridosSectionExample() {
  const { loading, ready, cuentaId, currentUserEmail } = useAridosAppBindings();

  const security = useAridosSecurity(
    ready ? cuentaId : '',
    ready ? currentUserEmail : ''
  );

  if (loading || security.loading || !ready || !security.hasAccess) return null;

  const items = buildAridosNavItems(security.permissions);
  if (!items.length) return null;

  return (
    <div className="dropdown dropdown-bottom">
      <label tabIndex={0} className="btn btn-sm btn-outline">Áridos</label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 border border-base-200">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to}>{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
