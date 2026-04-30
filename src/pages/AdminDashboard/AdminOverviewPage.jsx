import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/apiClient'

function AdminOverviewPage({ session }) {
  const [overview, setOverview] = useState({
    users: [],
    companies: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOverview = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [users, companies] = await Promise.all([
        apiRequest('/api/admin', { token: session?.token }),
        apiRequest('/api/admin/companies', { token: session?.token }),
      ])

      setOverview({
        users: Array.isArray(users) ? users : [],
        companies: Array.isArray(companies) ? companies : [],
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load admin metrics.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  }, [])

  const totalUsers = overview.users.length
  const totalCompanies = overview.companies.length
  const totalVenues = overview.companies.reduce(
    (sum, company) => sum + (company.venuesCount ?? 0),
    0,
  )
  const averageVenuesPerCompany = totalCompanies
    ? (totalVenues / totalCompanies).toFixed(1)
    : '0.0'
  const busiestCompanies = [...overview.companies]
    .sort((first, second) => (second.venuesCount ?? 0) - (first.venuesCount ?? 0))
    .slice(0, 4)

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Admin overview</h2>
          <p>
            This page summarizes the live data exposed by the backend and gives
            you quick entry points into user and company management.
          </p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-button ghost"
            onClick={loadOverview}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh metrics'}
          </button>
        </div>
      </div>

      {error ? <div className="admin-status is-error">{error}</div> : null}

      <div className="admin-grid admin-grid-stats">
        <article className="admin-stat-card">
          <div className="admin-stat-label">Total users</div>
          <div className="admin-stat-value">{totalUsers}</div>
          <p className="admin-stat-detail">
            Loaded from <code>GET /api/admin</code>
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Companies</div>
          <div className="admin-stat-value">{totalCompanies}</div>
          <p className="admin-stat-detail">
            Registered venue management companies visible to admins
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Tracked venues</div>
          <div className="admin-stat-value">{totalVenues}</div>
          <p className="admin-stat-detail">
            Summed from <code>venuesCount</code> in company records
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Avg. venues/company</div>
          <div className="admin-stat-value">{averageVenuesPerCompany}</div>
          <p className="admin-stat-detail">
            Useful for spotting under-documented companies
          </p>
        </article>
      </div>

      <div className="admin-layout-grid">
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Quick actions</h2>
              <p className="admin-card-copy">
                Jump directly to the areas that map to the existing admin APIs.
              </p>
            </div>
          </div>

          <div className="admin-summary-list">
            <div className="admin-summary-item">
              <div>
                <strong>Users management</strong>
                <span>
                  Browse users, search by email or ID, then update or apply
                  activation actions.
                </span>
              </div>
              <Link className="admin-button ghost" to="/admin/users">
                Open users
              </Link>
            </div>

            <div className="admin-summary-item">
              <div>
                <strong>Companies and venues</strong>
                <span>
                  Inspect every company, then drill into detailed venue data.
                </span>
              </div>
              <Link className="admin-button ghost" to="/admin/companies">
                Open companies
              </Link>
            </div>

            <div className="admin-summary-item">
              <div>
                <strong>Create another admin</strong>
                <span>
                  Use the protected registration endpoint without replacing your
                  own signed-in session.
                </span>
              </div>
              <Link className="admin-button ghost" to="/admin/register-admin">
                Open form
              </Link>
            </div>
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Top companies by venue count</h2>
              <p className="admin-card-copy">
                Based on the aggregate response from <code>GET /api/admin/companies</code>.
              </p>
            </div>
          </div>

          {busiestCompanies.length > 0 ? (
            <div className="admin-list">
              {busiestCompanies.map((company) => (
                <div key={company.id} className="admin-list-item">
                  <div>
                    <strong>{company.name}</strong>
                    <span>
                      {company.location || 'No location'} | {company.email}
                    </span>
                  </div>
                  <span className="admin-badge">
                    {company.venuesCount ?? 0} venues
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              {isLoading
                ? 'Loading company data...'
                : 'No company records were returned by the backend.'}
            </div>
          )}
        </article>
      </div>

      <article className="admin-note-box">
        The current backend user payloads do not expose role names or active
        status in list/detail responses. The dashboard therefore focuses on the
        admin actions that are actually available: list, lookup, update,
        activate, deactivate, delete, company detail inspection, and admin
        creation.
      </article>
    </section>
  )
}

export default AdminOverviewPage
