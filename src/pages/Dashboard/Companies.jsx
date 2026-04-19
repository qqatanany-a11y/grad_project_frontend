import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const styles = `
  .cp-toolbar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .cp-input {
    flex: 1;
    min-width: 240px;
    height: 2.75rem;
    padding: 0 0.85rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    color: #1c1917;
    font: inherit;
  }

  .cp-input:focus {
    outline: none;
    border-color: #1c1917;
  }

  .cp-button {
    height: 2.75rem;
    padding: 0 1.2rem;
    border: none;
    background: #1c1917;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }

  .cp-status {
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .cp-status.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .cp-list {
    display: grid;
    gap: 1rem;
  }

  .cp-card {
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .cp-card-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    cursor: pointer;
  }

  .cp-card-title {
    margin: 0 0 0.3rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .cp-card-copy {
    margin: 0;
    font-size: 0.82rem;
    color: #57534e;
  }

  .cp-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: #f5f5f4;
    color: #57534e;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .cp-expand {
    padding: 0 1rem 1rem;
  }

  .cp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.85rem;
  }

  .cp-detail {
    padding: 0.9rem;
    border: 1px solid #f1f5f9;
    background: #fafaf9;
  }

  .cp-detail label {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .cp-venues {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .cp-empty {
    padding: 2.5rem 1rem;
    text-align: center;
    color: #78716c;
    border: 1px solid #e7e5e4;
    background: #fff;
  }
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
        message: error instanceof Error ? error.message : 'Unable to load companies.',
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
          className="cp-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search companies by name, email, or location..."
        />
        <button className="cp-button" onClick={loadCompanies} disabled={loading}>
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
          {loading ? 'Loading companies...' : 'No companies were returned by the backend.'}
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
                        <label>Company ID</label>
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
