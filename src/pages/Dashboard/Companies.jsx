import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { makeDashStyles } from './dashboardPageStyles'

const styles = makeDashStyles('cp') + `
  .cp-card {
    border: 1.5px solid #e2e8f0; background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(79,70,229,0.07);
    transition: box-shadow 0.2s;
    animation: cpFadeUp 0.4s ease both;
    overflow: hidden;
  }
  .cp-card:hover { box-shadow: 0 8px 28px rgba(79,70,229,0.12); }
  .cp-card-head {
    display: flex; justify-content: space-between;
    gap: 1rem; padding: 1.25rem 1.5rem; cursor: pointer;
    transition: background 0.15s;
  }
  .cp-card-head:hover { background: rgba(79,70,229,0.03); }
  .cp-card-title {
    margin: 0 0 0.3rem; font-size: 1rem; font-weight: 800;
    color: #1e1b4b; letter-spacing: -0.02em;
  }
  .cp-card-copy { margin: 0; font-size: 0.875rem; color: #64748b; }
  .cp-chip {
    display: inline-flex; align-items: center;
    padding: 0.3rem 0.8rem; border-radius: 999px;
    background: rgba(79,70,229,0.08); color: #4f46e5;
    font-size: 0.72rem; font-weight: 700; white-space: nowrap;
    border: 1px solid rgba(79,70,229,0.16);
  }
  .cp-expand { padding: 0 1.5rem 1.5rem; }
  .cp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.85rem;
    margin-bottom: 1rem;
  }
  .cp-detail {
    padding: 1rem; border: 1.5px solid #e2e8f0;
    background: #f8f7ff; border-radius: 12px;
  }
  .cp-detail label {
    display: block; margin-bottom: 0.3rem; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8;
  }
  .cp-detail span { font-size: 0.875rem; color: #1e1b4b; font-weight: 500; }
  .cp-venues { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .cp-list { display: grid; gap: 1rem; }
`

function normalizeCompany(company) {
  return {
    id: company?.id ?? null,
    name: company?.name ?? '',
    email: company?.email ?? '',
    location: company?.location ?? '',
    phoneNumber: company?.phoneNumber ?? '',
    venues: Array.isArray(company?.venues)
      ? company.venues.map((venue) => ({
          id: venue?.id ?? null,
          name: venue?.name ?? '',
        }))
      : [],
  }
}

function Companies({ session }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })

  const loadCompanies = async () => {
    setLoading(true)

    try {
      const data = await apiRequest('/api/admin/companies', {
        token: session?.token,
      })

      setCompanies(Array.isArray(data) ? data.map(normalizeCompany) : [])
      setFeedback({ tone: 'idle', message: '' })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load businesses.',
      })
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.role === 'Admin') {
      loadCompanies()
    }
  }, [session?.role, session?.token])

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase()

    return companies.filter((company) => {
      if (!query) return true

      return (
        company.name?.toLowerCase().includes(query) ||
        company.email?.toLowerCase().includes(query) ||
        company.location?.toLowerCase().includes(query)
      )
    })
  }, [companies, search])

  if (session?.role !== 'Admin') {
    return <div className="cp-status error">This page is available for admins only.</div>
  }

  return (
    <>
      <style>{styles}</style>

      <div className="cp-toolbar">
        <input
          className="cp-input cp-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search businesses by name, email, or location..."
        />
        <button className="cp-button secondary" onClick={loadCompanies} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {feedback.message ? (
        <div className={`cp-status${feedback.tone === 'error' ? ' error' : ''}`}>
          {feedback.message}
        </div>
      ) : null}

      {filteredCompanies.length === 0 ? (
        <div className="cp-empty">
          {loading ? 'Loading businesses...' : 'No businesses found.'}
        </div>
      ) : (
        <div className="cp-list">
          {filteredCompanies.map((company) => {
            const isExpanded = expandedId === company.id
            const venues = Array.isArray(company.venues) ? company.venues : []

            return (
              <article key={company.id} className="cp-card">
                <div
                  className="cp-card-head"
                  onClick={() =>
                    setExpandedId((currentId) =>
                      currentId === company.id ? null : company.id,
                    )
                  }
                >
                  <div>
                    <p className="cp-card-title">{company.name || '--'}</p>
                    <p className="cp-card-copy">{company.email || '--'}</p>
                  </div>
                  <span className="cp-chip">{venues.length} venues</span>
                </div>

                {isExpanded ? (
                  <div className="cp-expand">
                    <div className="cp-grid">
                      <div className="cp-detail">
                        <label>Location</label>
                        <span>{company.location || '--'}</span>
                      </div>
                      <div className="cp-detail">
                        <label>Phone Number</label>
                        <span>{company.phoneNumber || '--'}</span>
                      </div>
                      <div className="cp-detail">
                        <label>Email</label>
                        <span>{company.email || '--'}</span>
                      </div>
                      <div className="cp-detail">
                        <label>Business ID</label>
                        <span>{company.id}</span>
                      </div>
                    </div>

                    <div className="cp-venues">
                      {venues.length > 0 ? (
                        venues.map((venue) => (
                          <span key={venue.id} className="cp-chip">
                            {venue.name || `Venue #${venue.id}`}
                          </span>
                        ))
                      ) : (
                        <span className="cp-chip">No venues linked</span>
                      )}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

export default Companies
