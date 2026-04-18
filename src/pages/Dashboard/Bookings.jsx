import { useState } from 'react'

const styles = `
  .bk-toolbar {
    display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;
  }
  .bk-search {
    flex: 1; min-width: 200px; height: 2.5rem; padding: 0 0.875rem;
    border: 1px solid #e7e5e4; background: #fff; font-size: 0.85rem;
    color: #1c1917; font-family: inherit; font-weight: 300; outline: none; border-radius: 2px;
    transition: border-color 0.15s;
  }
  .bk-search:focus { border-color: #1c1917; }
  .bk-filter {
    height: 2.5rem; padding: 0 0.875rem; border: 1px solid #e7e5e4; background: #fff;
    font-size: 0.82rem; color: #78716c; font-family: inherit; outline: none; border-radius: 2px; cursor: pointer;
  }
  .bk-filter:focus { border-color: #1c1917; }
  .bk-add-btn {
    height: 2.5rem; padding: 0 1.25rem; background: #1c1917; color: #fff; border: none;
    font-size: 0.82rem; font-family: inherit; cursor: pointer; border-radius: 2px; white-space: nowrap;
  }
  .bk-add-btn:hover { background: #292524; }

  .bk-stats {
    display: flex; gap: 1px; background: #e7e5e4; border: 1px solid #e7e5e4;
    margin-bottom: 1.5rem;
  }
  .bk-stat {
    flex: 1; background: #fff; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 3px;
  }
  .bk-stat-num { font-size: 1.5rem; font-weight: 300; color: #1c1917; letter-spacing: -0.02em; }
  .bk-stat-label { font-size: 0.67rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.09em; color: #a8a29e; }

  .bk-count { font-size: 0.8rem; color: #a8a29e; font-weight: 300; margin-bottom: 1rem; }

  .bk-table { background: #fff; border: 1px solid #e7e5e4; }
  .bk-row {
    display: grid; grid-template-columns: 1.4fr 1.2fr 1fr 90px 100px 120px 50px;
    align-items: center; padding: 0.875rem 1.25rem; gap: 0.875rem;
    border-bottom: 1px solid #e7e5e4; transition: background 0.1s;
  }
  .bk-row:last-child { border-bottom: none; }
  .bk-row:not(.hdr):hover { background: #fafaf9; }
  .bk-row.hdr { background: #fafaf9; padding: 0.55rem 1.25rem; }

  .bk-col-label {
    font-size: 0.67rem; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.09em; color: #a8a29e; margin: 0;
  }
  .bk-main { font-size: 0.875rem; font-weight: 400; color: #1c1917; margin: 0 0 2px; }
  .bk-sub { font-size: 0.72rem; color: #a8a29e; font-weight: 300; margin: 0; }
  .bk-cell { font-size: 0.82rem; color: #78716c; font-weight: 300; }

  .bk-badge {
    display: inline-block; font-size: 0.67rem; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.07em; padding: 0.2rem 0.55rem; border-radius: 2px;
  }
  .bk-badge.pending { background: #fffbeb; color: #ca8a04; }
  .bk-badge.confirmed { background: #f0fdf4; color: #16a34a; }
  .bk-badge.cancelled { background: #fef2f2; color: #dc2626; }

  .bk-status-select {
    font-size: 0.72rem; font-family: inherit; border: 1px solid #e7e5e4;
    background: #fff; color: #1c1917; padding: 0.2rem 0.4rem; outline: none;
    cursor: pointer; border-radius: 2px; transition: border-color 0.15s;
  }
  .bk-status-select:focus { border-color: #1c1917; }

  .bk-del-btn {
    background: none; border: none; color: #d4ceca; cursor: pointer; padding: 4px;
    border-radius: 2px; transition: color 0.1s; display: flex; align-items: center;
  }
  .bk-del-btn:hover { color: #ef4444; }

  .bk-empty { padding: 4rem 2rem; text-align: center; }
  .bk-empty-title { font-size: 0.9rem; font-weight: 400; color: #78716c; margin: 0 0 0.4rem; }
  .bk-empty-sub { font-size: 0.8rem; color: #a8a29e; font-weight: 300; margin: 0; }

  .bk-add-panel {
    background: #fafaf9; border: 1px solid #e7e5e4; padding: 1.5rem; margin-bottom: 1.5rem;
  }
  .bk-panel-title { font-size: 0.85rem; font-weight: 500; color: #1c1917; margin: 0 0 1.25rem; }
  .bk-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .bk-field { display: flex; flex-direction: column; gap: 0.35rem; }
  .bk-label { font-size: 0.68rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; }
  .bk-input, .bk-select-inp {
    height: 2.75rem; padding: 0 0.875rem; border: 1px solid #e7e5e4; background: #fff;
    font-size: 0.85rem; color: #1c1917; font-family: inherit; font-weight: 300; outline: none;
    border-radius: 0; transition: border-color 0.15s; box-sizing: border-box; width: 100%;
  }
  .bk-input:focus, .bk-select-inp:focus { border-color: #1c1917; }
  .bk-panel-actions { display: flex; gap: 0.625rem; }
  .bk-btn-primary {
    height: 2.5rem; padding: 0 1.25rem; background: #1c1917; color: #fff; border: none;
    font-size: 0.82rem; font-family: inherit; cursor: pointer; border-radius: 2px;
  }
  .bk-btn-primary:hover { background: #292524; }
  .bk-btn-secondary {
    height: 2.5rem; padding: 0 1.25rem; background: #fff; color: #78716c;
    border: 1px solid #e7e5e4; font-size: 0.82rem; font-family: inherit;
    cursor: pointer; border-radius: 2px;
  }
  .bk-btn-secondary:hover { border-color: #1c1917; color: #1c1917; }
`

const STORAGE_KEY = 'bookings'
const HALLS_KEY = 'ar_halls'
const COMP_KEY = 'companies'

function loadKey(key, fallback = []) {
  try { const v = localStorage.getItem(key); if (v) return JSON.parse(v) } catch {}
  return fallback
}

const seedBookings = [
  { id: 1, hallId: 1, hallName: 'Main Hall A', companyId: 1, companyName: 'Al-Noor Events Co.', clientName: 'Mohammed Al-Salem', clientEmail: 'msalem@email.com', eventDate: '2026-05-15', guests: 300, eventType: 'Wedding', notes: '', status: 'confirmed', createdAt: '2026-04-01T10:00:00Z' },
  { id: 2, hallId: 3, hallName: 'Seminar Hall C', companyId: 1, companyName: 'Al-Noor Events Co.', clientName: 'Layla Ibrahim', clientEmail: 'layla@email.com', eventDate: '2026-05-22', guests: 150, eventType: 'Seminar', notes: 'Needs projector', status: 'pending', createdAt: '2026-04-08T09:00:00Z' },
  { id: 3, hallId: 2, hallName: 'Conference Room B', companyId: 2, companyName: 'Golden Hall Group', clientName: 'Omar Khalid', clientEmail: 'omar.k@email.com', eventDate: '2026-06-01', guests: 60, eventType: 'Corporate Meeting', notes: '', status: 'pending', createdAt: '2026-04-10T11:00:00Z' },
  { id: 4, hallId: 1, hallName: 'Main Hall A', companyId: 1, companyName: 'Al-Noor Events Co.', clientName: 'Sara Hassan', clientEmail: 'sara.h@email.com', eventDate: '2026-06-15', guests: 400, eventType: 'Gala', notes: 'Catering required', status: 'cancelled', createdAt: '2026-04-12T08:00:00Z' },
]

const emptyForm = { hallName: '', companyName: '', clientName: '', clientEmail: '', eventDate: '', guests: '', eventType: '', notes: '', status: 'pending' }

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Bookings() {
  const [bookings, setBookings] = useState(() => loadKey(STORAGE_KEY, seedBookings))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const save = (updated) => { setBookings(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) }
  const updateStatus = (id, status) => save(bookings.map(b => b.id === id ? { ...b, status } : b))
  const deleteBooking = (id) => save(bookings.filter(b => b.id !== id))

  const addBooking = () => {
    if (!form.clientName.trim() || !form.hallName.trim()) return
    save([{ ...form, id: Date.now(), guests: Number(form.guests) || 0, createdAt: new Date().toISOString() }, ...bookings])
    setForm(emptyForm)
    setShowAdd(false)
  }

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase()
    const matchSearch = b.clientName?.toLowerCase().includes(q) ||
      b.hallName?.toLowerCase().includes(q) || b.companyName?.toLowerCase().includes(q) ||
      b.eventType?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || b.status === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const counts = { all: bookings.length, pending: bookings.filter(b => b.status === 'pending').length, confirmed: bookings.filter(b => b.status === 'confirmed').length, cancelled: bookings.filter(b => b.status === 'cancelled').length }

  return (
    <>
      <style>{styles}</style>

      <div className="bk-stats">
        <div className="bk-stat">
          <span className="bk-stat-num">{counts.all}</span>
          <span className="bk-stat-label">Total</span>
        </div>
        <div className="bk-stat">
          <span className="bk-stat-num" style={{ color: '#ca8a04' }}>{counts.pending}</span>
          <span className="bk-stat-label">Pending</span>
        </div>
        <div className="bk-stat">
          <span className="bk-stat-num" style={{ color: '#16a34a' }}>{counts.confirmed}</span>
          <span className="bk-stat-label">Confirmed</span>
        </div>
        <div className="bk-stat">
          <span className="bk-stat-num" style={{ color: '#dc2626' }}>{counts.cancelled}</span>
          <span className="bk-stat-label">Cancelled</span>
        </div>
      </div>

      <div className="bk-toolbar">
        <input type="text" className="bk-search" placeholder="Search bookings..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="bk-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {['All', 'Pending', 'Confirmed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="bk-add-btn" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? 'Cancel' : '+ Add Booking'}
        </button>
      </div>

      {showAdd && (
        <div className="bk-add-panel">
          <p className="bk-panel-title">New Booking</p>
          <div className="bk-form-grid">
            {[
              ['hallName', 'Hall Name', 'text'],
              ['companyName', 'Company', 'text'],
              ['clientName', 'Client Name', 'text'],
              ['clientEmail', 'Client Email', 'email'],
              ['eventDate', 'Event Date', 'date'],
              ['guests', 'Guests', 'number'],
              ['eventType', 'Event Type', 'text'],
            ].map(([name, label, type]) => (
              <div key={name} className="bk-field">
                <label className="bk-label">{label}</label>
                <input className="bk-input" type={type} value={form[name]}
                  onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} />
              </div>
            ))}
            <div className="bk-field">
              <label className="bk-label">Notes</label>
              <input className="bk-input" value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="bk-panel-actions">
            <button className="bk-btn-primary" onClick={addBooking}>Add Booking</button>
            <button className="bk-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <p className="bk-count">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>

      <div className="bk-table">
        <div className="bk-row hdr">
          <p className="bk-col-label">Client</p>
          <p className="bk-col-label">Hall</p>
          <p className="bk-col-label">Company</p>
          <p className="bk-col-label">Guests</p>
          <p className="bk-col-label">Event Date</p>
          <p className="bk-col-label">Status</p>
          <p className="bk-col-label"></p>
        </div>

        {filtered.length === 0 && (
          <div className="bk-empty">
            <p className="bk-empty-title">{bookings.length === 0 ? 'No bookings yet' : 'No results'}</p>
            <p className="bk-empty-sub">Booking reservations will appear here.</p>
          </div>
        )}

        {filtered.map(b => (
          <div key={b.id} className="bk-row">
            <div>
              <p className="bk-main">{b.clientName}</p>
              <p className="bk-sub">{b.eventType} · {b.clientEmail}</p>
            </div>
            <span className="bk-cell">{b.hallName}</span>
            <span className="bk-cell">{b.companyName || '—'}</span>
            <span className="bk-cell">{b.guests}</span>
            <span className="bk-cell">{formatDate(b.eventDate)}</span>
            <select className="bk-status-select" value={b.status}
              onChange={e => updateStatus(b.id, e.target.value)}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="bk-del-btn" onClick={() => deleteBooking(b.id)}>
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

export default Bookings
