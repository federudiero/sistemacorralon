import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCuenta } from '../../contexts/CuentaContext';
import { useAridosSecurity } from '../../modules/aridos/hooks/useAridosSecurity';
import { ARIDOS_SECTIONS, canReadSection } from '../../modules/aridos/utils/permissions';

const ITEMS = [
  { to: '/aridos', label: 'Inicio', icon: '🏠', section: ARIDOS_SECTIONS.DASHBOARD },
  { to: '/aridos/ventas', label: 'Vender', icon: '💸', primary: true, section: ARIDOS_SECTIONS.VENTAS },
  { to: '/aridos/ingresos', label: 'Reposición', icon: '📦', section: ARIDOS_SECTIONS.INGRESOS },
  { to: '/aridos/agenda', label: 'Agenda', icon: '🗓️', section: ARIDOS_SECTIONS.VENTAS },
];

export default function MobileQuickActions() {
  const location = useLocation();
  const { user } = useAuth();
  const { cuentaId } = useCuenta();
  const security = useAridosSecurity(cuentaId, user?.email);

  const visibleItems = ITEMS.filter((item) => canReadSection(security.permissions, item.section));

  if (!visibleItems.length) return null;

  return (
    <nav className="mobile-quickbar xl:hidden" aria-label="Accesos rápidos móviles">
      <div className="mobile-quickbar-inner">
        {visibleItems.map((item) => {
          const active =
            location.pathname === item.to ||
            (item.to !== '/aridos' && location.pathname.startsWith(item.to));

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-quickbar-link ${active ? 'active' : ''} ${
                item.primary ? 'is-primary' : ''
              }`}
            >
              <span className="mobile-quickbar-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="mobile-quickbar-text">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
