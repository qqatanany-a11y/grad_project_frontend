const layoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

  .db-root {
    display: flex;
    min-height: 100vh;
    background: #fafaf9;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: #1c1917;
  }

  /* ── Sidebar ── */
  .db-sidebar {
    width: 220px;
    flex-shrink: 0;
    background: #fff;
    border-right: 1px solid #e7e5e4;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 10;
  }

  .db-brand {
    padding: 1.75rem 1.5rem 1.5rem;
    border-bottom: 1px solid #e7e5e4;
  }

  .db-brand-name {
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: #1c1917;
    margin: 0;
  }

  .db-brand-sub {
    font-size: 0.72rem;
    color: #a8a29e;
    font-weight: 300;
    margin: 2px 0 0;
  }

  .db-nav {
    flex: 1;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .db-nav-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 400;
    color: #78716c;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
    transition: background 0.1s, color 0.1s;
  }

  .db-nav-item:hover {
    background: #fafaf9;
    color: #1c1917;
  }

  .db-nav-item.active {
    background: #f5f5f4;
    color: #1c1917;
    font-weight: 500;
  }

  .db-nav-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .db-nav-item.active .db-nav-icon {
    opacity: 1;
  }

  .db-sidebar-footer {
    padding: 1rem 0.75rem;
    border-top: 1px solid #e7e5e4;
  }

  .db-logout-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #a8a29e;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
    transition: color 0.1s, background 0.1s;
  }

  .db-logout-btn:hover {
    color: #1c1917;
    background: #fafaf9;
  }

  /* ── Main ── */
  .db-main {
    margin-left: 220px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .db-topbar {
    background: #fff;
    border-bottom: 1px solid #e7e5e4;
    padding: 0 2.5rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 5;
  }

  .db-topbar-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1c1917;
    margin: 0;
  }

  .db-topbar-user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .db-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1c1917;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .db-username {
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 300;
  }

  .db-content {
    flex: 1;
    padding: 2.5rem;
    max-width: 1100px;
    width: 100%;
  }
`

const navItems = [
  {
    id: 'academy-request',
    label: 'Academy Request',
    icon: (
      <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M8 1.5L14 5v6l-6 3.5L2 11V5L8 1.5z" strokeLinejoin="round" />
        <path d="M8 1.5V15" />
        <path d="M2 5l6 3.5L14 5" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Users',
    icon: (
      <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="6" cy="5" r="2.5" />
        <path d="M1 13.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" strokeLinecap="round" />
        <path d="M11.5 7c1.1 0 2 .9 2 2s-.9 2-2 2" strokeLinecap="round" />
        <path d="M13 13.5c.9-.4 1.5-1.3 1.5-2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'clients-overview',
    label: 'Clients Overview',
    icon: (
      <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
      </svg>
    ),
  },
]

const pageTitles = {
  'academy-request': 'Academy Request',
  'users': 'Users',
  'clients-overview': 'Clients Overview',
}

function DashboardLayout({ children, currentPage, onNavigate, onLogout, user }) {
  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U'
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'User'

  return (
    <>
      <style>{layoutStyles}</style>
      <div className="db-root">

        <aside className="db-sidebar">
          <div className="db-brand">
            <p className="db-brand-name">EventPlan</p>
            <p className="db-brand-sub">Plan Your Perfect Event</p>
          </div>

          <nav className="db-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`db-nav-item${currentPage === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="db-sidebar-footer">
            <button className="db-logout-btn" onClick={onLogout}>
              <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" strokeLinecap="round" />
                <path d="M10.5 11L14 8l-3.5-3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 8H6" strokeLinecap="round" />
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        <div className="db-main">
          <header className="db-topbar">
            <h1 className="db-topbar-title">{pageTitles[currentPage] ?? 'Dashboard'}</h1>
            <div className="db-topbar-user">
              <div className="db-avatar">{initials}</div>
              <span className="db-username">{displayName}</span>
            </div>
          </header>

          <main className="db-content">
            {children}
          </main>
        </div>

      </div>
    </>
  )
}

export default DashboardLayout
