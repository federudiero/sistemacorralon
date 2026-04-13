import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Topbar />
      <main className="app-container">
        <div className="app-grid">
          <Sidebar />
          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}
