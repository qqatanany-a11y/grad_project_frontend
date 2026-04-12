import { useState } from 'react'

const styles = `
  .us-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .us-search {
    flex: 1;
    min-width: 200px;
    height: 2.5rem;
    padding: 0 0.875rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font-size: 0.85rem;
    color: #1c1917;
    font-family: inherit;
    font-weight: 300;
    outline: none;
    border-radius: 2px;
    transition: border-color 0.15s;
  }
  .us-search:focus { border-color: #1c1917; }

  .us-role-select {
    height: 2.5rem;
    padding: 0 0.875rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font-size: 0.82rem;
    color: #78716c;
    font-family: inherit;
    outline: none;
    border-radius: 2px;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .us-role-select:focus { border-color: #1c1917; }

  .us-add-btn {
    height: 2.5rem;
    padding: 0 1.25rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.82rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 2px;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .us-add-btn:hover { background: #292524; }

  .us-add-panel {
    background: #fafaf9;
    border: 1px solid #e7e5e4;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .us-panel-title {
    font-size: 0.82rem;
    font-weight: 500;
    color: #1c1917;
    margin: 0 0 1.25rem;
  }

  .us-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .us-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .us-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #78716c;
  }

  .us-input, .us-select {
    height: 2.75rem;
    padding: 0 0.875rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font-size: 0.85rem;
    color: #1c1917;
    font-family: inherit;
    font-weight: 300;
    outline: none;
    border-radius: 0;
    transition: border-color 0.15s;
    box-sizing: border-box;
    width: 100%;
  }
  .us-input:focus, .us-select:focus { border-color: #1c1917; }

  .us-panel-actions { display: flex; gap: 0.625rem; }

  .us-btn-primary {
    height: 2.5rem;
    padding: 0 1.25rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.82rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 2px;
    transition: background 0.15s;
  }
  .us-btn-primary:hover { background: #292524; }

  .us-btn-secondary {
    height: 2.5rem;
    padding: 0 1.25rem;
    background: #fff;
    color: #78716c;
    border: 1px solid #e7e5e4;
    font-size: 0.82rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 2px;
    transition: border-color 0.15s;
  }
  .us-btn-secondary:hover { border-color: #1c1917; color: #1c1917; }

  .us-count {
    font-size: 0.8rem;
    color: #a8a29e;
    font-weight: 300;
    margin-bottom: 1rem;
  }

  .us-table {
    background: #fff;
    border: 1px solid #e7e5e4;
    overflow: hidden;
  }

  .us-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 1fr 50px;
    align-items: center;
    padding: 0.875rem 1.25rem;
    gap: 1rem;
    border-bottom: 1px solid #e7e5e4;
    transition: background 0.1s;
  }
  .us-row:last-child { border-bottom: none; }
  .us-row:not(.header):hover { background: #fafaf9; }
  .us-row.header { background: #fafaf9; padding: 0.6rem 1.25rem; }

  .us-col-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #a8a29e;
    margin: 0;
  }

  .us-user-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .us-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #e7e5e4;
    color: #78716c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 500;
    flex-shrink: 0;
  }

  .us-name {
    font-size: 0.875rem;
    font-weight: 400;
    color: #1c1917;
    margin: 0;
  }

  .us-cell {
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 300;
  }

  .us-role-badge {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 0.2rem 0.55rem;
    border-radius: 2px;
  }
  .us-role-badge.admin { background: #f0fdf4; color: #16a34a; }
  .us-role-badge.manager { background: #eff6ff; color: #2563eb; }
  .us-role-badge.staff { background: #fafaf9; color: #78716c; }

  .us-del-btn {
    background: none;
    border: none;
    color: #d4ceca;
    cursor: pointer;
    padding: 4px;
    border-radius: 2px;
    transition: color 0.1s;
    display: flex;
    align-items: center;
  }
  .us-del-btn:hover { color: #ef4444; }

  .us-empty {
    padding: 3rem;
    text-align: center;
    color: #a8a29e;
    font-size: 0.85rem;
    font-weight: 300;
  }
`

const STORAGE_KEY = 'dashboard_users'

const seedUsers = [
  { id: 1, name: 'Ahmed Al-Rashid', email: 'ahmed@example.com', role: 'Admin', joined: '2026-01-15' },
  { id: 2, name: 'Sara Mohammed', email: 'sara@example.com', role: 'Manager', joined: '2026-02-01' },
  { id: 3, name: 'Omar Al-Farsi', email: 'omar@example.com', role: 'Staff', joined: '2026-02-20' },
  { id: 4, name: 'Lena Hassan', email: 'lena@example.com', role: 'Staff', joined: '2026-03-05' },
]

function load() {
  try { const v = localStorage.getItem(STORAGE_KEY); if (v) return JSON.parse(v) } catch {}
  return seedUsers
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const ROLES = ['All', 'Admin', 'Manager', 'Staff']

function Users() {
  const [users, setUsers] = useState(load)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'Staff', joined: '' })

  const save = (updated) => { setUsers(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) }

  const addUser = () => {
    if (!form.name.trim() || !form.email.trim()) return
    save([...users, { ...form, id: Date.now(), joined: form.joined || new Date().toISOString().slice(0, 10) }])
    setForm({ name: '', email: '', role: 'Staff', joined: '' })
    setShowAdd(false)
  }

  const deleteUser = (id) => save(users.filter(u => u.id !== id))

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'All' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <>
      <style>{styles}</style>

      <div className="us-toolbar">
        <input
          type="text" className="us-search" placeholder="Search users..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="us-role-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <button className="us-add-btn" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showAdd && (
        <div className="us-add-panel">
          <p className="us-panel-title">New User</p>
          <div className="us-form-grid">
            <div className="us-field">
              <label className="us-label">Full Name</label>
              <input className="us-input" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="User's full name" />
            </div>
            <div className="us-field">
              <label className="us-label">Email</label>
              <input className="us-input" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com" />
            </div>
            <div className="us-field">
              <label className="us-label">Role</label>
              <select className="us-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option>Admin</option>
                <option>Manager</option>
                <option>Staff</option>
              </select>
            </div>
            <div className="us-field">
              <label className="us-label">Join Date</label>
              <input className="us-input" type="date" value={form.joined}
                onChange={e => setForm(p => ({ ...p, joined: e.target.value }))} />
            </div>
          </div>
          <div className="us-panel-actions">
            <button className="us-btn-primary" onClick={addUser}>Add User</button>
            <button className="us-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <p className="us-count">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>

      <div className="us-table">
        <div className="us-row header">
          <p className="us-col-label">Name</p>
          <p className="us-col-label">Email</p>
          <p className="us-col-label">Role</p>
          <p className="us-col-label">Joined</p>
          <p className="us-col-label"></p>
        </div>

        {filtered.length === 0 && <div className="us-empty">No users found.</div>}

        {filtered.map(u => (
          <div key={u.id} className="us-row">
            <div className="us-user-row">
              <div className="us-avatar">{initials(u.name)}</div>
              <p className="us-name">{u.name}</p>
            </div>
            <span className="us-cell">{u.email}</span>
            <span className={`us-role-badge ${u.role.toLowerCase()}`}>{u.role}</span>
            <span className="us-cell">{formatDate(u.joined)}</span>
            <button className="us-del-btn" onClick={() => deleteUser(u.id)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M5 6l.5 5M9 6l-.5 5" strokeLinecap="round" />
                <path d="M3 3.5l.8 8a.5.5 0 0 0 .5.5h5.4a.5.5 0 0 0 .5-.5l.8-8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

export default Users
