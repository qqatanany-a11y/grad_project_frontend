const layoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

  .db-root {
    display: flex;
    min-height: 100vh;
    background: #fafaf9;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: #1c1917;
  }

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

  .db-nav-section {
    font-size: 0.62rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #d4ceca;
    padding: 0.75rem 0.75rem 0.4rem;
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

  .db-nav-item:hover { background: #fafaf9; color: #1c1917; }

  .db-nav-item.active {
    background: #f5f5f4;
    color: #1c1917;
    font-weight: 500;
  }

  .db-nav-icon { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.7; }
  .db-nav-item.active .db-nav-icon { opacity: 1; }

  .db-sidebar-footer {
    padding: 1rem 0.75rem;
    border-top: 1px solid #e7e5e4;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .db-footer-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem;
    border-radius: 4px;
    font-size: 0.82rem;
    color: #a8a29e;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
    transition: color 0.1s, background 0.1s;
  }
  .db-footer-btn:hover { color: #1c1917; background: #fafaf9; }

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

  .db-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: #a8a29e;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
    transition: color 0.15s, background 0.1s;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }
  .db-back-btn:hover { color: #1c1917; background: #fafaf9; }

  .db-topbar-left { display: flex; align-items: center; }

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

const pageTitles = {
  'hall-requests': 'Hall Requests',
  'edit-halls': 'Edit Halls',
  'users': 'Users',
  'clients-overview': 'Clients Overview',
}

function DashboardLayout({ children, currentPage, onNavigate, onLogout, onGoHome, user }) {
  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'AD'
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : 'Admin'

  return (
    <>
      <style>{layoutStyles}</style>
      <div className="db-root">

        <aside className="db-sidebar">
          <div className="db-brand">
            <p className="db-brand-name">EventPlan</p>
            <p className="db-brand-sub">Admin Dashboard</p>
          </div>

          <nav className="db-nav">
            <span className="db-nav-section">Halls</span>

            <button
              className={`db-nav-item${currentPage === 'hall-requests' ? ' active' : ''}`}
              onClick={() => onNavigate('hall-requests')}
            >
              <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 12.5h12M2 9h12M2 5.5h12" strokeLinecap="round" />
                <circle cx="5" cy="5.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="5" cy="9" r="1" fill="currentColor" stroke="none" />
                <circle cx="5" cy="12.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Hall Requests
            </button>

            <button
              className={`db-nav-item${currentPage === 'edit-halls' ? ' active' : ''}`}
              onClick={() => onNavigate('edit-halls')}
            >
              <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="2" y="5" width="12" height="9" rx="1" />
                <path d="M5 5V3.5a3 3 0 0 1 6 0V5" strokeLinecap="round" />
                <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" strokeLinejoin="round" />
              </svg>
              Edit Halls
            </button>

            <span className="db-nav-section">Management</span>

            <button
              className={`db-nav-item${currentPage === 'users' ? ' active' : ''}`}
              onClick={() => onNavigate('users')}
            >
              <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="6" cy="5" r="2.5" />
                <path d="M1 13.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" strokeLinecap="round" />
                <path d="M11.5 7c1.1 0 2 .9 2 2s-.9 2-2 2" strokeLinecap="round" />
                <path d="M13 13.5c.9-.4 1.5-1.3 1.5-2.5" strokeLinecap="round" />
              </svg>
              Users
            </button>

            <button
              className={`db-nav-item${currentPage === 'clients-overview' ? ' active' : ''}`}
              onClick={() => onNavigate('clients-overview')}
            >
              <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
                <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
                <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
                <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
              </svg>
              Clients Overview
            </button>
          </nav>

          <div className="db-sidebar-footer">
            <button className="db-footer-btn" onClick={onGoHome}>
              <svg className="db-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 6.5L8 2l6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5z" strokeLinejoin="round" />
                <path d="M6 15V9h4v6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Homepage
            </button>
            <button className="db-footer-btn" onClick={onLogout}>
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
            <div className="db-topbar-left">
              <button className="db-back-btn" onClick={onGoHome}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
              <h1 className="db-topbar-title">{pageTitles[currentPage] ?? 'Dashboard'}</h1>
            </div>
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
