import { NavLink, Outlet, useLocation } from 'react-router-dom'
import './adminDashboard.css'

const navigationItems = [
  { to: '/admin', label: 'Overview', icon: '01' },
  { to: '/admin/users', label: 'Users', icon: '02' },
  { to: '/admin/companies', label: 'Companies', icon: '03' },
  { to: '/admin/register-admin', label: 'Create Admin', icon: '04' },
]

const pageTitles = {
  '/admin': 'Operations snapshot',
  '/admin/users': 'Users management',
  '/admin/companies': 'Companies & venues',
  '/admin/register-admin': 'Admin creation',
}

function resolvePageTitle(pathname) {
  return pageTitles[pathname] ?? 'Admin dashboard'
}

function AdminDashboardLayout({ session, onLogout }) {
  const location = useLocation()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">AD</div>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Event control room</p>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' active' : ''}`
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-session-label">Signed in as</div>
          <p className="admin-session-name">
            {session?.fullName ?? 'Administrator'}
          </p>
          <p className="admin-session-email">{session?.email ?? 'No email'}</p>
          <button type="button" className="admin-button ghost" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-topbar-kicker">Live management workspace</p>
            <h1 className="admin-topbar-title">
              {resolvePageTitle(location.pathname)}
            </h1>
          </div>
          <div className="admin-topbar-meta">
            <span className="admin-pill">Role: {session?.role ?? 'Admin'}</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}

export default AdminDashboardLayout
