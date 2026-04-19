const layoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  .db-root {
    display: flex;
    min-height: 100vh;
    background: #fafaf9;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: #1c1917;
  }

  .db-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: #fff;
    border-right: 1px solid #e7e5e4;
    display: flex;
    flex-direction: column;
    position: fixed;
    inset: 0 auto 0 0;
    height: 100vh;
    z-index: 10;
  }

  .db-brand {
    padding: 1.75rem 1.5rem 1.25rem;
    border-bottom: 1px solid #e7e5e4;
  }

  .db-brand-name {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .db-brand-sub {
    margin: 0.25rem 0 0;
    font-size: 0.72rem;
    color: #78716c;
  }

  .db-nav {
    flex: 1;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .db-nav-section {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #a8a29e;
    padding: 0.8rem 0.75rem 0.35rem;
  }

  .db-nav-item {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    padding: 0.65rem 0.8rem;
    border: none;
    background: none;
    border-radius: 6px;
    font: inherit;
    color: #57534e;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, color 0.15s;
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
    opacity: 0.8;
  }

  .db-sidebar-footer {
    padding: 1rem 0.75rem;
    border-top: 1px solid #e7e5e4;
  }

  .db-footer-card {
    padding: 0.85rem;
    background: #fafaf9;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    margin-bottom: 0.75rem;
  }

  .db-footer-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #a8a29e;
    margin: 0 0 0.3rem;
  }

  .db-footer-name {
    margin: 0;
    font-size: 0.86rem;
    font-weight: 500;
  }

  .db-footer-email {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: #78716c;
    word-break: break-word;
  }

  .db-footer-role {
    margin: 0.45rem 0 0;
    font-size: 0.73rem;
    color: #1c1917;
  }

  .db-footer-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.6rem 0.8rem;
    border: none;
    background: none;
    border-radius: 6px;
    font: inherit;
    color: #78716c;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, color 0.15s;
  }

  .db-footer-btn:hover {
    background: #fafaf9;
    color: #1c1917;
  }

  .db-main {
    margin-left: 240px;
    flex: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .db-topbar {
    position: sticky;
    top: 0;
    z-index: 5;
    height: 60px;
    padding: 0 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #e7e5e4;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .db-topbar-left {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .db-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: none;
    background: none;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    font: inherit;
    color: #78716c;
    cursor: pointer;
  }

  .db-back-btn:hover {
    background: #fafaf9;
    color: #1c1917;
  }

  .db-topbar-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .db-topbar-meta {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  .db-pill {
    padding: 0.35rem 0.6rem;
    border: 1px solid #e7e5e4;
    border-radius: 999px;
    font-size: 0.72rem;
    color: #57534e;
    background: #fff;
  }

  .db-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    width: 100%;
  }

  @media (max-width: 1024px) {
    .db-sidebar {
      position: static;
      width: 100%;
      height: auto;
    }

    .db-root {
      flex-direction: column;
    }

    .db-main {
      margin-left: 0;
    }
  }
`

const pageTitles = {
  'owner-requests': 'Company Requests',
  'venue-requests': 'Venue Requests',
  venues: 'Venues',
  companies: 'Companies',
  bookings: 'Bookings',
  users: 'Users',
  'edit-requests': 'Edit Requests',
}

function getNavigation(role) {
  if (role === 'Admin') {
    return [
      {
        section: 'Admin',
        items: [
          { id: 'owner-requests', label: 'Company Requests', icon: 'list' },
          { id: 'venue-requests', label: 'Venue Requests', icon: 'list' },
          { id: 'venues', label: 'Venues', icon: 'venue' },
          { id: 'companies', label: 'Companies', icon: 'company' },
          { id: 'users', label: 'Users', icon: 'users' },
          { id: 'edit-requests', label: 'Edit Requests', icon: 'edit' },
        ],
      },
    ]
  }

  if (role === 'Owner') {
    return [
      {
        section: 'Owner',
        items: [
          { id: 'venues', label: 'My Venues', icon: 'venue' },
          { id: 'bookings', label: 'Booking Requests', icon: 'booking' },
          { id: 'edit-requests', label: 'My Edit Requests', icon: 'edit' },
        ],
      },
    ]
  }

  return [
    {
      section: 'User',
      items: [
        { id: 'bookings', label: 'My Bookings', icon: 'booking' },
      ],
    },
  ]
}

function renderIcon(icon) {
  switch (icon) {
    case 'company':
      return (
        <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M2 14V3.5h8V14M10 6h4v8M5 6h2M5 9h2M5 12h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'users':
      return (
        <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="6" cy="5" r="2.5" />
          <path d="M1.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round" />
          <path d="M11 5.5c1.3 0 2.3 1 2.3 2.3S12.3 10 11 10" strokeLinecap="round" />
        </svg>
      )
    case 'booking':
      return (
        <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="2" y="3" width="12" height="11" rx="1" />
          <path d="M5 1.5V5M11 1.5V5M2 7h12" strokeLinecap="round" />
        </svg>
      )
    case 'edit':
      return (
        <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M11.5 2.5l2 2L6 12H4v-2L11.5 2.5z" strokeLinejoin="round" />
          <path d="M9 3.5l3 3" strokeLinecap="round" />
        </svg>
      )
    case 'venue':
      return (
        <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M2 14V6l6-4 6 4v8H2z" strokeLinejoin="round" />
          <path d="M6 14v-3.5h4V14" strokeLinejoin="round" />
        </svg>
      )
    case 'list':
    default:
      return (
        <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M5 4h8M5 8h8M5 12h8" strokeLinecap="round" />
          <circle cx="2.5" cy="4" r=".8" fill="currentColor" stroke="none" />
          <circle cx="2.5" cy="8" r=".8" fill="currentColor" stroke="none" />
          <circle cx="2.5" cy="12" r=".8" fill="currentColor" stroke="none" />
        </svg>
      )
  }
}

function DashboardLayout({
  children,
  currentPage,
  onNavigate,
  onLogout,
  onGoHome,
  user,
}) {
  const navigation = getNavigation(user?.role)
  const displayName = user?.fullName || user?.email || 'Dashboard User'

  return (
    <>
      <style>{layoutStyles}</style>
      <div className="db-root">
        <aside className="db-sidebar">
          <div className="db-brand">
            <p className="db-brand-name">EventPlan</p>
            <p className="db-brand-sub">{user?.role || 'Guest'} dashboard</p>
          </div>

          <nav className="db-nav">
            {navigation.map((group) => (
              <div key={group.section}>
                <div className="db-nav-section">{group.section}</div>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`db-nav-item${currentPage === item.id ? ' active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    {renderIcon(item.icon)}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="db-sidebar-footer">
            <div className="db-footer-card">
              <p className="db-footer-label">Signed in as</p>
              <p className="db-footer-name">{displayName}</p>
              <p className="db-footer-email">{user?.email || 'No email'}</p>
              <p className="db-footer-role">Role: {user?.role || 'Unknown'}</p>
            </div>

            <button className="db-footer-btn" onClick={onGoHome}>
              {renderIcon('venue')}
              <span>Homepage</span>
            </button>
            <button className="db-footer-btn" onClick={onLogout}>
              {renderIcon('list')}
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <div className="db-main">
          <header className="db-topbar">
            <div className="db-topbar-left">
              <button className="db-back-btn" onClick={onGoHome}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Home
              </button>
              <h1 className="db-topbar-title">
                {pageTitles[currentPage] ?? 'Dashboard'}
              </h1>
            </div>

            <div className="db-topbar-meta">
              <span className="db-pill">{user?.role || 'Guest'}</span>
            </div>
          </header>

          <main className="db-content">{children}</main>
        </div>
      </div>
    </>
  )
}

export default DashboardLayout
