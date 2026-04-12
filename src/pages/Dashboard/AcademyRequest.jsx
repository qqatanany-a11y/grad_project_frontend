import { useState } from 'react'

const styles = `
  .ar-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .ar-btn-group {
    display: flex;
    gap: 0.625rem;
  }

  .ar-btn-primary {
    height: 2.5rem;
    padding: 0 1.25rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.82rem;
    font-weight: 400;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    border-radius: 2px;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .ar-btn-primary:hover { background: #292524; }

  .ar-btn-secondary {
    height: 2.5rem;
    padding: 0 1.25rem;
    background: #fff;
    color: #78716c;
    border: 1px solid #e7e5e4;
    font-size: 0.82rem;
    font-weight: 400;
    font-family: inherit;
    cursor: pointer;
    border-radius: 2px;
    transition: border-color 0.15s, color 0.1s;
    white-space: nowrap;
  }
  .ar-btn-secondary:hover { border-color: #1c1917; color: #1c1917; }

  /* ── Halls Section ── */
  .ar-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.875rem;
  }

  .ar-section-title {
    font-size: 0.72rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a8a29e;
    margin: 0;
  }

  .ar-halls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.875rem;
    margin-bottom: 2rem;
  }

  .ar-hall-card {
    background: #fff;
    border: 1px solid #e7e5e4;
    padding: 1.25rem;
    position: relative;
  }

  .ar-hall-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1c1917;
    margin: 0 0 0.3rem;
  }

  .ar-hall-detail {
    font-size: 0.75rem;
    color: #a8a29e;
    font-weight: 300;
    margin: 2px 0;
  }

  .ar-hall-delete {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: #d4ceca;
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;
    transition: color 0.1s;
    display: flex;
    align-items: center;
  }
  .ar-hall-delete:hover { color: #ef4444; }

  /* ── Slide Panel for Add Hall ── */
  .ar-add-hall-panel {
    background: #fafaf9;
    border: 1px solid #e7e5e4;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .ar-panel-title {
    font-size: 0.82rem;
    font-weight: 500;
    color: #1c1917;
    margin: 0 0 1.25rem;
  }

  .ar-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .ar-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .ar-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #78716c;
  }

  .ar-input, .ar-select {
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
  .ar-input:focus, .ar-select:focus { border-color: #1c1917; }

  .ar-panel-actions {
    display: flex;
    gap: 0.625rem;
  }

  /* ── Divider ── */
  .ar-divider {
    border: none;
    border-top: 1px solid #e7e5e4;
    margin: 0.5rem 0 1.75rem;
  }

  /* ── Requests Table ── */
  .ar-table {
    background: #fff;
    border: 1px solid #e7e5e4;
    overflow: hidden;
  }

  .ar-table-row {
    display: grid;
    grid-template-columns: 1fr 150px 140px 120px 90px 50px;
    align-items: center;
    padding: 0.875rem 1.25rem;
    gap: 1rem;
    border-bottom: 1px solid #e7e5e4;
    transition: background 0.1s;
  }
  .ar-table-row:last-child { border-bottom: none; }
  .ar-table-row:not(.header):hover { background: #fafaf9; }
  .ar-table-row.header { background: #fafaf9; padding: 0.6rem 1.25rem; }

  .ar-col-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #a8a29e;
    margin: 0;
  }

  .ar-req-title {
    font-size: 0.875rem;
    font-weight: 400;
    color: #1c1917;
    margin: 0 0 2px;
  }

  .ar-req-sub {
    font-size: 0.73rem;
    color: #a8a29e;
    font-weight: 300;
    margin: 0;
  }

  .ar-cell {
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 300;
  }

  .ar-badge {
    display: inline-block;
    font-size: 0.67rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 0.2rem 0.55rem;
    border-radius: 2px;
  }
  .ar-badge.approved { background: #f0fdf4; color: #16a34a; }
  .ar-badge.pending { background: #fffbeb; color: #ca8a04; }
  .ar-badge.rejected { background: #fef2f2; color: #dc2626; }

  .ar-del-btn {
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
  .ar-del-btn:hover { color: #ef4444; }

  .ar-empty {
    padding: 3rem;
    text-align: center;
    color: #a8a29e;
    font-size: 0.85rem;
    font-weight: 300;
  }

  /* ── Add Request Form ── */
  .ar-add-request-panel {
    background: #fafaf9;
    border: 1px solid #e7e5e4;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
`

const STORAGE_KEY_HALLS = 'ar_halls'
const STORAGE_KEY_REQS = 'ar_requests'

const seedHalls = [
  { id: 1, name: 'Main Hall A', capacity: 500, floor: '1st Floor', features: 'Projector, Sound System' },
  { id: 2, name: 'Conference Room B', capacity: 80, floor: '2nd Floor', features: 'Video Conferencing' },
  { id: 3, name: 'Seminar Hall C', capacity: 200, floor: '3rd Floor', features: 'Stage, Microphone' },
]

const seedRequests = [
  { id: 1, title: 'Annual Awards Ceremony', client: 'Al Noor Academy', hall: 'Main Hall A', date: '2026-05-15', time: '18:00', status: 'approved' },
  { id: 2, title: 'Leadership Workshop', client: 'Bright Future Institute', hall: 'Conference Room B', date: '2026-04-25', time: '09:00', status: 'pending' },
  { id: 3, title: 'Graduation Ceremony', client: 'Pioneer Group', hall: 'Main Hall A', date: '2026-06-10', time: '15:00', status: 'pending' },
]

function load(key, fallback) {
  try { const v = localStorage.getItem(key); if (v) return JSON.parse(v) } catch {}
  return fallback
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function AcademyRequest() {
  const [halls, setHalls] = useState(() => load(STORAGE_KEY_HALLS, seedHalls))
  const [requests, setRequests] = useState(() => load(STORAGE_KEY_REQS, seedRequests))

  const [showAddHall, setShowAddHall] = useState(false)
  const [showAddRequest, setShowAddRequest] = useState(false)

  const [hallForm, setHallForm] = useState({ name: '', capacity: '', floor: '', features: '' })
  const [reqForm, setReqForm] = useState({ title: '', client: '', hall: '', date: '', time: '' })

  const saveHalls = (updated) => { setHalls(updated); localStorage.setItem(STORAGE_KEY_HALLS, JSON.stringify(updated)) }
  const saveReqs = (updated) => { setRequests(updated); localStorage.setItem(STORAGE_KEY_REQS, JSON.stringify(updated)) }

  const addHall = () => {
    if (!hallForm.name.trim()) return
    saveHalls([...halls, { ...hallForm, id: Date.now(), capacity: Number(hallForm.capacity) || 0 }])
    setHallForm({ name: '', capacity: '', floor: '', features: '' })
    setShowAddHall(false)
  }

  const deleteHall = (id) => saveHalls(halls.filter(h => h.id !== id))

  const addRequest = () => {
    if (!reqForm.title.trim() || !reqForm.client.trim()) return
    saveReqs([{ ...reqForm, id: Date.now(), status: 'pending' }, ...requests])
    setReqForm({ title: '', client: '', hall: '', date: '', time: '' })
    setShowAddRequest(false)
  }

  const deleteRequest = (id) => saveReqs(requests.filter(r => r.id !== id))

  const updateStatus = (id, status) => saveReqs(requests.map(r => r.id === id ? { ...r, status } : r))

  return (
    <>
      <style>{styles}</style>

      {/* ── Halls ── */}
      <div className="ar-section-header">
        <p className="ar-section-title">Halls</p>
        <button
          className="ar-btn-secondary"
          onClick={() => { setShowAddHall(v => !v); setShowAddRequest(false) }}
        >
          {showAddHall ? 'Cancel' : '+ Add Hall'}
        </button>
      </div>

      {showAddHall && (
        <div className="ar-add-hall-panel">
          <p className="ar-panel-title">New Hall</p>
          <div className="ar-form-grid">
            <div className="ar-field">
              <label className="ar-label">Hall Name</label>
              <input className="ar-input" value={hallForm.name}
                onChange={e => setHallForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Main Hall A" />
            </div>
            <div className="ar-field">
              <label className="ar-label">Capacity</label>
              <input className="ar-input" type="number" value={hallForm.capacity}
                onChange={e => setHallForm(p => ({ ...p, capacity: e.target.value }))}
                placeholder="Max guests" />
            </div>
            <div className="ar-field">
              <label className="ar-label">Floor</label>
              <input className="ar-input" value={hallForm.floor}
                onChange={e => setHallForm(p => ({ ...p, floor: e.target.value }))}
                placeholder="e.g. 1st Floor" />
            </div>
            <div className="ar-field">
              <label className="ar-label">Features</label>
              <input className="ar-input" value={hallForm.features}
                onChange={e => setHallForm(p => ({ ...p, features: e.target.value }))}
                placeholder="e.g. Projector, Sound" />
            </div>
          </div>
          <div className="ar-panel-actions">
            <button className="ar-btn-primary" onClick={addHall}>Add Hall</button>
            <button className="ar-btn-secondary" onClick={() => setShowAddHall(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="ar-halls-grid">
        {halls.map(h => (
          <div key={h.id} className="ar-hall-card">
            <button className="ar-hall-delete" onClick={() => deleteHall(h.id)} title="Remove hall">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 2l9 9M11 2l-9 9" strokeLinecap="round" />
              </svg>
            </button>
            <p className="ar-hall-name">{h.name}</p>
            <p className="ar-hall-detail">Capacity: {h.capacity}</p>
            <p className="ar-hall-detail">{h.floor}</p>
            {h.features && <p className="ar-hall-detail">{h.features}</p>}
          </div>
        ))}
        {halls.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: '#a8a29e', fontWeight: 300, margin: 0 }}>No halls added yet.</p>
        )}
      </div>

      <hr className="ar-divider" />

      {/* ── Requests ── */}
      <div className="ar-top-row">
        <div className="ar-section-header" style={{ margin: 0, flex: 1 }}>
          <p className="ar-section-title">Requests</p>
        </div>
        <button
          className="ar-btn-primary"
          onClick={() => { setShowAddRequest(v => !v); setShowAddHall(false) }}
        >
          {showAddRequest ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showAddRequest && (
        <div className="ar-add-request-panel">
          <p className="ar-panel-title">New Request</p>
          <div className="ar-form-grid">
            <div className="ar-field">
              <label className="ar-label">Title</label>
              <input className="ar-input" value={reqForm.title}
                onChange={e => setReqForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Event or request title" />
            </div>
            <div className="ar-field">
              <label className="ar-label">Client</label>
              <input className="ar-input" value={reqForm.client}
                onChange={e => setReqForm(p => ({ ...p, client: e.target.value }))}
                placeholder="Client or organization name" />
            </div>
            <div className="ar-field">
              <label className="ar-label">Hall</label>
              <select className="ar-select" value={reqForm.hall}
                onChange={e => setReqForm(p => ({ ...p, hall: e.target.value }))}>
                <option value="">Select a hall</option>
                {halls.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
              </select>
            </div>
            <div className="ar-field">
              <label className="ar-label">Date</label>
              <input className="ar-input" type="date" value={reqForm.date}
                onChange={e => setReqForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="ar-field">
              <label className="ar-label">Time</label>
              <input className="ar-input" type="time" value={reqForm.time}
                onChange={e => setReqForm(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <div className="ar-panel-actions" style={{ marginTop: '0.25rem' }}>
            <button className="ar-btn-primary" onClick={addRequest}>Submit Request</button>
            <button className="ar-btn-secondary" onClick={() => setShowAddRequest(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="ar-table">
        <div className="ar-table-row header">
          <p className="ar-col-label">Request</p>
          <p className="ar-col-label">Hall</p>
          <p className="ar-col-label">Date</p>
          <p className="ar-col-label">Client</p>
          <p className="ar-col-label">Status</p>
          <p className="ar-col-label"></p>
        </div>

        {requests.length === 0 && <div className="ar-empty">No requests yet.</div>}

        {requests.map(r => (
          <div key={r.id} className="ar-table-row">
            <div>
              <p className="ar-req-title">{r.title}</p>
              {r.time && <p className="ar-req-sub">{r.time}</p>}
            </div>
            <span className="ar-cell">{r.hall || '—'}</span>
            <span className="ar-cell">{r.date ? formatDate(r.date) : '—'}</span>
            <span className="ar-cell">{r.client}</span>
            <div>
              {r.status === 'pending' ? (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button style={{ fontSize: '0.7rem', padding: '0.18rem 0.5rem', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', borderRadius: '2px', fontFamily: 'inherit' }}
                    onClick={() => updateStatus(r.id, 'approved')}>Approve</button>
                  <button style={{ fontSize: '0.7rem', padding: '0.18rem 0.5rem', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', borderRadius: '2px', fontFamily: 'inherit' }}
                    onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
                </div>
              ) : (
                <span className={`ar-badge ${r.status}`}>{r.status}</span>
              )}
            </div>
            <button className="ar-del-btn" onClick={() => deleteRequest(r.id)}>
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

export default AcademyRequest
