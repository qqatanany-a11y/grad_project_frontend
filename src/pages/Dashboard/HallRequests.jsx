import { useState } from 'react'

const styles = `
  .hr-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .hr-search {
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
  .hr-search:focus { border-color: #1c1917; }

  .hr-filter {
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
  .hr-filter:focus { border-color: #1c1917; }

  .hr-count {
    font-size: 0.8rem;
    color: #a8a29e;
    font-weight: 300;
    margin-bottom: 1rem;
  }

  .hr-table {
    background: #fff;
    border: 1px solid #e7e5e4;
    overflow: hidden;
  }

  .hr-row {
    display: grid;
    grid-template-columns: 1.5fr 1.4fr 1fr 90px 110px 50px;
    align-items: center;
    padding: 0.9rem 1.25rem;
    gap: 1rem;
    border-bottom: 1px solid #e7e5e4;
    transition: background 0.1s;
  }
  .hr-row:last-child { border-bottom: none; }
  .hr-row:not(.header):hover { background: #fafaf9; }
  .hr-row.header { background: #fafaf9; padding: 0.55rem 1.25rem; }

  .hr-col-label {
    font-size: 0.67rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #a8a29e;
    margin: 0;
  }

  .hr-main {
    font-size: 0.875rem;
    font-weight: 400;
    color: #1c1917;
    margin: 0 0 2px;
  }

  .hr-sub {
    font-size: 0.73rem;
    color: #a8a29e;
    font-weight: 300;
    margin: 0;
  }

  .hr-cell {
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 300;
  }

  .hr-badge {
    display: inline-block;
    font-size: 0.67rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 0.22rem 0.55rem;
    border-radius: 2px;
  }
  .hr-badge.pending { background: #fffbeb; color: #ca8a04; }
  .hr-badge.approved { background: #f0fdf4; color: #16a34a; }
  .hr-badge.rejected { background: #fef2f2; color: #dc2626; }

  .hr-actions { display: flex; gap: 0.35rem; }

  .hr-approve-btn, .hr-reject-btn {
    font-size: 0.68rem;
    padding: 0.22rem 0.55rem;
    border-radius: 2px;
    font-family: inherit;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.1s;
  }
  .hr-approve-btn { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .hr-approve-btn:hover { opacity: 0.75; }
  .hr-reject-btn { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .hr-reject-btn:hover { opacity: 0.75; }

  .hr-del-btn {
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
  .hr-del-btn:hover { color: #ef4444; }

  .hr-empty {
    padding: 4rem 2rem;
    text-align: center;
  }

  .hr-empty-title {
    font-size: 0.9rem;
    font-weight: 400;
    color: #78716c;
    margin: 0 0 0.4rem;
  }

  .hr-empty-sub {
    font-size: 0.8rem;
    color: #a8a29e;
    font-weight: 300;
    margin: 0;
  }

  .hr-detail-panel {
    background: #fafaf9;
    border: 1px solid #e7e5e4;
    border-top: none;
    padding: 1rem 1.25rem;
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 300;
    line-height: 1.7;
  }

  .hr-detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .hr-detail-item label {
    font-size: 0.67rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a8a29e;
    display: block;
    margin-bottom: 2px;
  }

  .hr-detail-item span {
    font-size: 0.82rem;
    color: #1c1917;
  }

  .hr-expand-btn {
    background: none;
    border: none;
    color: #a8a29e;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    transition: color 0.1s;
    border-radius: 2px;
  }
  .hr-expand-btn:hover { color: #1c1917; }
`

const STORAGE_KEY = 'hall_requests'

function load() {
  try { const v = localStorage.getItem(STORAGE_KEY); if (v) return JSON.parse(v) } catch {}
  return []
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function HallRequests() {
  const [requests, setRequests] = useState(load)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)

  const save = (updated) => { setRequests(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) }
  const updateStatus = (id, status) => save(requests.map(r => r.id === id ? { ...r, status } : r))
  const deleteReq = (id) => { save(requests.filter(r => r.id !== id)); if (expanded === id) setExpanded(null) }

  const filtered = requests.filter(r => {
    const matchSearch = r.orgName?.toLowerCase().includes(search.toLowerCase()) ||
      r.hallName?.toLowerCase().includes(search.toLowerCase()) ||
      r.contactEmail?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || r.status === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  return (
    <>
      <style>{styles}</style>

      <div className="hr-toolbar">
        <input type="text" className="hr-search" placeholder="Search requests..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="hr-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      <p className="hr-count">{filtered.length} request{filtered.length !== 1 ? 's' : ''}</p>

      <div className="hr-table">
        <div className="hr-row header">
          <p className="hr-col-label">Organization</p>
          <p className="hr-col-label">Contact</p>
          <p className="hr-col-label">Hall</p>
          <p className="hr-col-label">Capacity</p>
          <p className="hr-col-label">Status</p>
          <p className="hr-col-label"></p>
        </div>

        {filtered.length === 0 && (
          <div className="hr-empty">
            <p className="hr-empty-title">
              {requests.length === 0 ? 'No requests yet' : 'No results found'}
            </p>
            <p className="hr-empty-sub">
              {requests.length === 0
                ? 'Hall requests submitted from the public form will appear here.'
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        )}

        {filtered.map(r => (
          <div key={r.id}>
            <div className="hr-row">
              <div>
                <p className="hr-main">{r.orgName}</p>
                <p className="hr-sub">{formatDate(r.submittedAt)}</p>
              </div>
              <div>
                <p className="hr-main" style={{ fontSize: '0.82rem' }}>{r.contactName || '—'}</p>
                <p className="hr-sub">{r.contactEmail}</p>
              </div>
              <span className="hr-cell">{r.hallName}</span>
              <span className="hr-cell">{r.capacity}</span>
              <div>
                {r.status === 'pending' ? (
                  <div className="hr-actions">
                    <button className="hr-approve-btn" onClick={() => updateStatus(r.id, 'approved')}>Approve</button>
                    <button className="hr-reject-btn" onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
                  </div>
                ) : (
                  <span className={`hr-badge ${r.status}`}>{r.status}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button className="hr-expand-btn" title="View details"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                    {expanded === r.id
                      ? <path d="M2 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                      : <path d="M2 5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />}
                  </svg>
                </button>
                <button className="hr-del-btn" onClick={() => deleteReq(r.id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M5 6l.5 5M9 6l-.5 5" strokeLinecap="round" />
                    <path d="M3 3.5l.8 8a.5.5 0 0 0 .5.5h5.4a.5.5 0 0 0 .5-.5l.8-8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {expanded === r.id && (
              <div className="hr-detail-panel">
                <div className="hr-detail-grid">
                  <div className="hr-detail-item"><label>Phone</label><span>{r.contactPhone || '—'}</span></div>
                  <div className="hr-detail-item"><label>Floor</label><span>{r.floor || '—'}</span></div>
                  <div className="hr-detail-item"><label>Features</label><span>{r.features || '—'}</span></div>
                  {r.notes && <div className="hr-detail-item" style={{ gridColumn: '1 / -1' }}><label>Notes</label><span>{r.notes}</span></div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default HallRequests
