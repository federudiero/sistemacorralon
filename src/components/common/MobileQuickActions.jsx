import { Link, useLocation } from 'react-router-dom';

const ITEMS = [
  { to: '/aridos', label: 'Inicio', icon: '🏠' },
  { to: '/aridos/ventas', label: 'Vender', icon: '💸', primary: true },
  { to: '/aridos/ingresos', label: 'Reposición', icon: '📦' },
  { to: '/aridos/agenda', label: 'Agenda', icon: '🗓️' },
];

export default function MobileQuickActions() {
  const location = useLocation();

  return (
    <nav className="mobile-quickbar xl:hidden" aria-label="Accesos rápidos móviles">
      <div className="mobile-quickbar-inner">
        {ITEMS.map((item) => {
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
