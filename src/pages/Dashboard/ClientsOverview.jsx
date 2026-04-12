import { useState } from 'react'

const styles = `
  .co-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .co-stat-card {
    background: #fff;
    border: 1px solid #e7e5e4;
    padding: 1.5rem;
  }

  .co-stat-label {
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a8a29e;
    margin: 0 0 0.5rem;
  }

  .co-stat-value {
    font-size: 2rem;
    font-weight: 300;
    color: #1c1917;
    letter-spacing: -0.03em;
    margin: 0;
    line-height: 1;
  }

  .co-stat-sub {
    font-size: 0.73rem;
    color: #a8a29e;
    margin: 0.3rem 0 0;
    font-weight: 300;
  }

  .co-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.875rem;
  }

  .co-section-title {
    font-size: 0.72rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a8a29e;
    margin: 0;
  }

  .co-toolbar {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .co-search {
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
  .co-search:focus { border-color: #1c1917; }

  .co-status-select {
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
  }
  .co-status-select:focus { border-color: #1c1917; }

  .co-add-btn {
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
  .co-add-btn:hover { background: #292524; }

  .co-add-panel {
    background: #fafaf9;
    border: 1px solid #e7e5e4;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .co-panel-title {
    font-size: 0.82rem;
    font-weight: 500;
    color: #1c1917;
    margin: 0 0 1.25rem;
  }

  .co-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .co-field { display: flex; flex-direction: column; gap: 0.35rem; }

  .co-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #78716c;
  }

  .co-input, .co-select-field {
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
  .co-input:focus, .co-select-field:focus { border-color: #1c1917; }

  .co-panel-actions { display: flex; gap: 0.625rem; }

  .co-btn-primary {
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
  .co-btn-primary:hover { background: #292524; }

  .co-btn-secondary {
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
  .co-btn-secondary:hover { border-color: #1c1917; color: #1c1917; }

  .co-count {
    font-size: 0.8rem;
    color: #a8a29e;
    font-weight: 300;
    margin-bottom: 1rem;
  }

  .co-table {
    background: #fff;
    border: 1px solid #e7e5e4;
    overflow: hidden;
  }

  .co-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 80px 80px;
    align-items: center;
    padding: 0.875rem 1.25rem;
    gap: 1rem;
    border-bottom: 1px solid #e7e5e4;
    transition: background 0.1s;
  }
  .co-row:last-child { border-bottom: none; }
  .co-row:not(.header):hover { background: #fafaf9; }
  .co-row.header { background: #fafaf9; padding: 0.6rem 1.25rem; }

  .co-col-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #a8a29e;
    margin: 0;
  }

  .co-client-name {
    font-size: 0.875rem;
    font-weight: 400;
    color: #1c1917;
    margin: 0 0 2px;
  }

  .co-client-sub {
    font-size: 0.73rem;
    color: #a8a29e;
    font-weight: 300;
    margin: 0;
  }

  .co-cell {
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 300;
  }

  .co-events-count {
    font-size: 0.82rem;
    font-weight: 400;
    color: #1c1917;
    text-align: center;
  }

  .co-badge {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 0.2rem 0.55rem;
    border-radius: 2px;
  }
  .co-badge.active { background: #f0fdf4; color: #16a34a; }
  .co-badge.inactive { background: #fafaf9; color: #a8a29e; }

  .co-del-btn {
    background: none;
    border: none;
    color: #d4ceca;
    cursor: pointer;
    padding: 4px;
    border-radius: 2px;
    transition: color 0.1s;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
  }
  .co-del-btn:hover { color: #ef4444; }

  .co-empty {
    padding: 3rem;
    text-align: center;
    color: #a8a29e;
    font-size: 0.85rem;
    font-weight: 300;
  }
`

const STORAGE_KEY = 'dashboard_clients'

const seedClients = [
  { id: 1, name: 'Al Noor Academy', contact: 'info@alnoor.edu', industry: 'Education', events: 12, status: 'Active', joined: '2025-09-01' },
  { id: 2, name: 'Bright Future Institute', contact: 'bf@institute.edu', industry: 'Education', events: 7, status: 'Active', joined: '2025-11-15' },
  { id: 3, name: 'Royal Events Co.', contact: 'royal@events.com', industry: 'Events', events: 24, status: 'Active', joined: '2025-06-10' },
  { id: 4, name: 'Pioneer Group', contact: 'info@pioneer.co', industry: 'Corporate', events: 3, status: 'Inactive', joined: '2026-01-20' },
  { id: 5, name: 'Horizon Media', contact: 'hello@horizon.sa', industry: 'Media', events: 9, status: 'Active', joined: '2025-12-01' },
]

function load() {
  try { const v = localStorage.getItem(STORAGE_KEY); if (v) return JSON.parse(v) } catch {}
  return seedClients
}

function ClientsOverview() {
  const [clients, setClients] = useState(load)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', industry: '', status: 'Active' })

  const save = (updated) => { setClients(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) }

  const addClient = () => {
    if (!form.name.trim()) return
    save([...clients, { ...form, id: Date.now(), events: 0, joined: new Date().toISOString().slice(0, 10) }])
    setForm({ name: '', contact: '', industry: '', status: 'Active' })
    setShowAdd(false)
  }

  const deleteClient = (id) => save(clients.filter(c => c.id !== id))

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeCount = clients.filter(c => c.status === 'Active').length
  const totalEvents = clients.reduce((acc, c) => acc + (c.events || 0), 0)

  return (
    <>
      <style>{styles}</style>

      <div className="co-stats">
        <div className="co-stat-card">
          <p className="co-stat-label">Total Clients</p>
          <p className="co-stat-value">{clients.length}</p>
        </div>
        <div className="co-stat-card">
          <p className="co-stat-label">Active</p>
          <p className="co-stat-value">{activeCount}</p>
          <p className="co-stat-sub">Currently engaged</p>
        </div>
        <div className="co-stat-card">
          <p className="co-stat-label">Inactive</p>
          <p className="co-stat-value">{clients.length - activeCount}</p>
        </div>
        <div className="co-stat-card">
          <p className="co-stat-label">Total Events</p>
          <p className="co-stat-value">{totalEvents}</p>
          <p className="co-stat-sub">Across all clients</p>
        </div>
      </div>

      <div className="co-toolbar">
        <input
          type="text" className="co-search" placeholder="Search clients..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="co-status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button className="co-add-btn" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? 'Cancel' : '+ Add Client'}
        </button>
      </div>

      {showAdd && (
        <div className="co-add-panel">
          <p className="co-panel-title">New Client</p>
          <div className="co-form-grid">
            <div className="co-field">
              <label className="co-label">Client Name</label>
              <input className="co-input" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Organization or company name" />
            </div>
            <div className="co-field">
              <label className="co-label">Contact Email</label>
              <input className="co-input" type="email" value={form.contact}
                onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                placeholder="contact@example.com" />
            </div>
            <div className="co-field">
              <label className="co-label">Industry</label>
              <input className="co-input" value={form.industry}
                onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
                placeholder="e.g. Education, Corporate" />
            </div>
            <div className="co-field">
              <label className="co-label">Status</label>
              <select className="co-select-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="co-panel-actions">
            <button className="co-btn-primary" onClick={addClient}>Add Client</button>
            <button className="co-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <p className="co-count">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</p>

      <div className="co-table">
        <div className="co-row header">
          <p className="co-col-label">Client</p>
          <p className="co-col-label">Contact</p>
          <p className="co-col-label">Industry</p>
          <p className="co-col-label" style={{ textAlign: 'center' }}>Events</p>
          <p className="co-col-label">Status</p>
        </div>

        {filtered.length === 0 && <div className="co-empty">No clients found.</div>}

        {filtered.map(c => (
          <div key={c.id} className="co-row">
            <div>
              <p className="co-client-name">{c.name}</p>
              <p className="co-client-sub">Since {new Date(c.joined).getFullYear()}</p>
            </div>
            <span className="co-cell">{c.contact}</span>
            <span className="co-cell">{c.industry || '—'}</span>
            <span className="co-events-count">{c.events}</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`co-badge ${c.status.toLowerCase()}`}>{c.status}</span>
              <button className="co-del-btn" onClick={() => deleteClient(c.id)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M5 6l.5 5M9 6l-.5 5" strokeLinecap="round" />
                  <path d="M3 3.5l.8 8a.5.5 0 0 0 .5.5h5.4a.5.5 0 0 0 .5-.5l.8-8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default ClientsOverview
