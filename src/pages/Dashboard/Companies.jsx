import { useState } from 'react'

const styles = `
  .co-toolbar {
    display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;
  }
  .co-search {
    flex: 1; min-width: 200px; height: 2.5rem; padding: 0 0.875rem;
    border: 1px solid #e7e5e4; background: #fff; font-size: 0.85rem;
    color: #1c1917; font-family: inherit; font-weight: 300; outline: none; border-radius: 2px;
    transition: border-color 0.15s;
  }
  .co-search:focus { border-color: #1c1917; }
  .co-add-btn {
    height: 2.5rem; padding: 0 1.25rem; background: #1c1917; color: #fff; border: none;
    font-size: 0.82rem; font-family: inherit; cursor: pointer; border-radius: 2px;
    transition: background 0.15s; white-space: nowrap;
  }
  .co-add-btn:hover { background: #292524; }
  .co-count { font-size: 0.8rem; color: #a8a29e; font-weight: 300; margin-bottom: 1rem; }

  .co-list { display: flex; flex-direction: column; gap: 1px; background: #e7e5e4; border: 1px solid #e7e5e4; }

  .co-row-header {
    display: flex; align-items: center; justify-content: space-between;
    background: #fff; padding: 1rem 1.25rem; cursor: pointer;
    transition: background 0.1s; gap: 1rem;
  }
  .co-row-header:hover { background: #fafaf9; }

  .co-row-left { display: flex; align-items: center; gap: 0.875rem; min-width: 0; }
  .co-company-icon {
    width: 36px; height: 36px; border-radius: 4px; background: #f5f5f4;
    border: 1px solid #e7e5e4; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: #78716c;
  }
  .co-company-name { font-size: 0.875rem; font-weight: 500; color: #1c1917; margin: 0 0 2px; }
  .co-company-meta { font-size: 0.75rem; color: #a8a29e; font-weight: 300; margin: 0; }

  .co-row-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
  .co-badge-count {
    font-size: 0.7rem; font-weight: 500; background: #f5f5f4; border: 1px solid #e7e5e4;
    color: #78716c; padding: 0.15rem 0.5rem; border-radius: 2px;
  }
  .co-status-badge {
    font-size: 0.67rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em;
    padding: 0.2rem 0.55rem; border-radius: 2px;
  }
  .co-status-badge.active { background: #f0fdf4; color: #16a34a; }
  .co-status-badge.inactive { background: #fef2f2; color: #dc2626; }
  .co-del-btn {
    background: none; border: none; color: #d4ceca; cursor: pointer; padding: 4px;
    border-radius: 2px; transition: color 0.1s; display: flex; align-items: center;
  }
  .co-del-btn:hover { color: #ef4444; }
  .co-chevron { color: #d4ceca; transition: transform 0.2s; }
  .co-chevron.open { transform: rotate(180deg); }

  .co-expanded {
    background: #fafaf9; border-top: 1px solid #e7e5e4; padding: 1.25rem;
    display: flex; flex-direction: column; gap: 1.25rem;
  }

  .co-exp-section-label {
    font-size: 0.67rem; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.1em; color: #a8a29e; margin: 0 0 0.625rem;
  }

  .co-halls-row {
    display: flex; flex-wrap: wrap; gap: 0.625rem;
  }

  .co-hall-chip {
    display: flex; align-items: center; gap: 0.4rem;
    background: #fff; border: 1px solid #e7e5e4; padding: 0.35rem 0.75rem;
    font-size: 0.8rem; color: #78716c; font-weight: 300; border-radius: 2px;
  }
  .co-hall-chip span { font-size: 0.7rem; color: #a8a29e; }

  .co-requests-table { background: #fff; border: 1px solid #e7e5e4; }
  .co-req-row {
    display: grid; grid-template-columns: 1.5fr 1.2fr 90px 100px;
    align-items: center; padding: 0.7rem 1rem; gap: 0.75rem;
    border-bottom: 1px solid #f5f5f4; font-size: 0.82rem;
  }
  .co-req-row:last-child { border-bottom: none; }
  .co-req-row.hdr { background: #fafaf9; padding: 0.45rem 1rem; }
  .co-req-col-label {
    font-size: 0.65rem; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.09em; color: #a8a29e;
  }
  .co-req-main { font-size: 0.82rem; font-weight: 400; color: #1c1917; margin: 0 0 1px; }
  .co-req-sub { font-size: 0.72rem; color: #a8a29e; font-weight: 300; margin: 0; }
  .co-req-cell { font-size: 0.78rem; color: #78716c; font-weight: 300; }
  .co-req-empty { padding: 1rem; text-align: center; font-size: 0.8rem; color: #a8a29e; font-weight: 300; }

  .req-badge {
    display: inline-block; font-size: 0.67rem; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.07em;
    padding: 0.2rem 0.5rem; border-radius: 2px;
  }
  .req-badge.pending { background: #fffbeb; color: #ca8a04; }
  .req-badge.approved { background: #f0fdf4; color: #16a34a; }
  .req-badge.rejected { background: #fef2f2; color: #dc2626; }

  .co-add-panel {
    background: #fff; border: 1px solid #e7e5e4; padding: 1.5rem; margin-bottom: 1.5rem;
  }
  .co-panel-title { font-size: 0.85rem; font-weight: 500; color: #1c1917; margin: 0 0 1.25rem; }
  .co-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .co-field { display: flex; flex-direction: column; gap: 0.35rem; }
  .co-label { font-size: 0.68rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; }
  .co-input {
    height: 2.75rem; padding: 0 0.875rem; border: 1px solid #e7e5e4; background: #fff;
    font-size: 0.85rem; color: #1c1917; font-family: inherit; font-weight: 300; outline: none;
    border-radius: 0; transition: border-color 0.15s; box-sizing: border-box; width: 100%;
  }
  .co-input:focus { border-color: #1c1917; }
  .co-panel-actions { display: flex; gap: 0.625rem; }
  .co-btn-primary {
    height: 2.5rem; padding: 0 1.25rem; background: #1c1917; color: #fff; border: none;
    font-size: 0.82rem; font-family: inherit; cursor: pointer; border-radius: 2px;
  }
  .co-btn-primary:hover { background: #292524; }
  .co-btn-secondary {
    height: 2.5rem; padding: 0 1.25rem; background: #fff; color: #78716c;
    border: 1px solid #e7e5e4; font-size: 0.82rem; font-family: inherit;
    cursor: pointer; border-radius: 2px; transition: border-color 0.15s;
  }
  .co-btn-secondary:hover { border-color: #1c1917; color: #1c1917; }

  .co-empty { padding: 4rem 2rem; text-align: center; }
  .co-empty-title { font-size: 0.9rem; font-weight: 400; color: #78716c; margin: 0 0 0.4rem; }
  .co-empty-sub { font-size: 0.8rem; color: #a8a29e; font-weight: 300; margin: 0; }
`

const COMP_KEY = 'companies'
const HALLS_KEY = 'ar_halls'
const REQ_KEY = 'hall_requests'

const seedCompanies = [
  { id: 1, name: 'Al-Noor Events Co.', email: 'info@alnoor.sa', phone: '0501234567', status: 'active', createdAt: '2026-01-15' },
  { id: 2, name: 'Golden Hall Group', email: 'contact@goldenhall.sa', phone: '0509876543', status: 'active', createdAt: '2026-02-01' },
]

function loadKey(key, fallback = []) {
  try { const v = localStorage.getItem(key); if (v) return JSON.parse(v) } catch {}
  return fallback
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Companies() {
  const [companies, setCompanies] = useState(() => loadKey(COMP_KEY, seedCompanies))
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const halls = loadKey(HALLS_KEY, [])
  const requests = loadKey(REQ_KEY, [])

  const save = (updated) => { setCompanies(updated); localStorage.setItem(COMP_KEY, JSON.stringify(updated)) }

  const addCompany = () => {
    if (!form.name.trim() || !form.email.trim()) return
    save([...companies, { ...form, id: Date.now(), status: 'active', createdAt: new Date().toISOString().slice(0, 10) }])
    setForm({ name: '', email: '', phone: '' })
    setShowAdd(false)
  }

  const deleteCompany = (id) => { save(companies.filter(c => c.id !== id)); if (expanded === id) setExpanded(null) }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const getCompanyHalls = (c) => halls.filter(h => h.companyId === c.id || h.companyEmail === c.email)
  const getCompanyRequests = (c) => requests.filter(r => r.contactEmail === c.email || r.companyId === c.id)

  return (
    <>
      <style>{styles}</style>

      <div className="co-toolbar">
        <input type="text" className="co-search" placeholder="Search companies..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="co-add-btn" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? 'Cancel' : '+ Add Company'}
        </button>
      </div>

      {showAdd && (
        <div className="co-add-panel">
          <p className="co-panel-title">New Company</p>
          <div className="co-form-grid">
            <div className="co-field">
              <label className="co-label">Company Name</label>
              <input className="co-input" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Company name" />
            </div>
            <div className="co-field">
              <label className="co-label">Email</label>
              <input className="co-input" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="company@example.com" />
            </div>
            <div className="co-field">
              <label className="co-label">Phone</label>
              <input className="co-input" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="05xxxxxxxx" />
            </div>
          </div>
          <div className="co-panel-actions">
            <button className="co-btn-primary" onClick={addCompany}>Add Company</button>
            <button className="co-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <p className="co-count">{filtered.length} compan{filtered.length !== 1 ? 'ies' : 'y'}</p>

      <div className="co-list">
        {filtered.length === 0 && (
          <div className="co-empty">
            <p className="co-empty-title">No companies found</p>
            <p className="co-empty-sub">Add a company to get started.</p>
          </div>
        )}

        {filtered.map(c => {
          const cHalls = getCompanyHalls(c)
          const cReqs = getCompanyRequests(c)
          const isOpen = expanded === c.id
          return (
            <div key={c.id}>
              <div className="co-row-header" onClick={() => setExpanded(isOpen ? null : c.id)}>
                <div className="co-row-left">
                  <div className="co-company-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M2 14V6l6-4 6 4v8H2z" strokeLinejoin="round" />
                      <path d="M6 14v-4h4v4" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="co-company-name">{c.name}</p>
                    <p className="co-company-meta">{c.email} · {c.phone || '—'}</p>
                  </div>
                </div>
                <div className="co-row-right">
                  <span className="co-badge-count">{cHalls.length} hall{cHalls.length !== 1 ? 's' : ''}</span>
                  <span className="co-badge-count">{cReqs.length} request{cReqs.length !== 1 ? 's' : ''}</span>
                  <span className={`co-status-badge ${c.status}`}>{c.status}</span>
                  <button className="co-del-btn" onClick={e => { e.stopPropagation(); deleteCompany(c.id) }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M5 6l.5 5M9 6l-.5 5" strokeLinecap="round" />
                      <path d="M3 3.5l.8 8a.5.5 0 0 0 .5.5h5.4a.5.5 0 0 0 .5-.5l.8-8" strokeLinecap="round" />
                    </svg>
                  </button>
                  <svg className={`co-chevron${isOpen ? ' open' : ''}`} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {isOpen && (
                <div className="co-expanded">
                  <div>
                    <p className="co-exp-section-label">Halls ({cHalls.length})</p>
                    {cHalls.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#a8a29e', fontWeight: 300 }}>No halls assigned to this company.</p>
                    ) : (
                      <div className="co-halls-row">
                        {cHalls.map(h => (
                          <div key={h.id} className="co-hall-chip">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                              <rect x="1" y="4" width="10" height="7" rx="0.5" />
                              <path d="M4 11V7h4v4" strokeLinejoin="round" />
                              <path d="M1 4.5L6 1l5 3.5" strokeLinejoin="round" />
                            </svg>
                            {h.name}
                            <span>· {h.capacity} cap</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="co-exp-section-label">Requests ({cReqs.length})</p>
                    {cReqs.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#a8a29e', fontWeight: 300 }}>No requests from this company yet.</p>
                    ) : (
                      <div className="co-requests-table">
                        <div className="co-req-row hdr">
                          <p className="co-req-col-label">Hall</p>
                          <p className="co-req-col-label">Submitted</p>
                          <p className="co-req-col-label">Capacity</p>
                          <p className="co-req-col-label">Status</p>
                        </div>
                        {cReqs.map(r => (
                          <div key={r.id} className="co-req-row">
                            <div>
                              <p className="co-req-main">{r.hallName}</p>
                              <p className="co-req-sub">{r.notes?.slice(0, 40) || '—'}</p>
                            </div>
                            <span className="co-req-cell">{formatDate(r.submittedAt)}</span>
                            <span className="co-req-cell">{r.capacity}</span>
                            <span className={`req-badge ${r.status || 'pending'}`}>{r.status || 'pending'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Companies
