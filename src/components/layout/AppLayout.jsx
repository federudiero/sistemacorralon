import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileQuickActions from '../common/MobileQuickActions';

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="app-shell">
      <Topbar
        onOpenMenu={() => setMobileSidebarOpen(true)}
        onCloseMenu={() => setMobileSidebarOpen(false)}
        mobileSidebarOpen={mobileSidebarOpen}
      />

      <main className="app-container app-mobile-safe">
        <div className="app-grid">
          <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
          <section className="min-w-0 pb-3 lg:pb-0">
            <Outlet />
          </section>
        </div>
      </main>

      <MobileQuickActions />
    </div>
  );
}