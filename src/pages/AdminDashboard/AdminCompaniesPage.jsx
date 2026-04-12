import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

function AdminCompaniesPage({ session }) {
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)
  const [companyDetails, setCompanyDetails] = useState(null)
  const [companyVenues, setCompanyVenues] = useState([])
  const [manualCompanyId, setManualCompanyId] = useState('')
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })

  const loadCompanyDetails = async (companyId) => {
    if (!companyId) {
      return
    }

    setIsLoadingDetails(true)

    try {
      const [details, venues] = await Promise.all([
        apiRequest(`/api/admin/companies/${companyId}`, {
          token: session?.token,
        }),
        apiRequest(`/api/admin/companies/${companyId}/venues`, {
          token: session?.token,
        }),
      ])

      setCompanyDetails(details)
      setCompanyVenues(Array.isArray(venues) ? venues : [])
      setSelectedCompanyId(companyId)
      setFeedback({ tone: 'idle', message: '' })
    } catch (requestError) {
      setFeedback({
        tone: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load company details.',
      })
      setCompanyDetails(null)
      setCompanyVenues([])
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const loadCompanies = async (preferredCompanyId) => {
    setIsLoadingCompanies(true)

    try {
      const data = await apiRequest('/api/admin/companies', {
        token: session?.token,
      })
      const nextCompanies = Array.isArray(data) ? data : []

      setCompanies(nextCompanies)
      setFeedback({ tone: 'idle', message: '' })

      const nextCompanyId =
        preferredCompanyId ?? selectedCompanyId ?? nextCompanies[0]?.id ?? null

      if (nextCompanyId) {
        await loadCompanyDetails(nextCompanyId)
      } else {
        setCompanyDetails(null)
        setCompanyVenues([])
        setSelectedCompanyId(null)
      }
    } catch (requestError) {
      setFeedback({
        tone: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load companies.',
      })
      setCompanies([])
      setCompanyDetails(null)
      setCompanyVenues([])
      setSelectedCompanyId(null)
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleManualLookup = async (event) => {
    event.preventDefault()

    const companyId = Number(manualCompanyId)

    if (!Number.isInteger(companyId) || companyId <= 0) {
      setFeedback({
        tone: 'error',
        message: 'Enter a valid company ID before loading details.',
      })
      return
    }

    await loadCompanyDetails(companyId)
  }

  const totalVenues = companies.reduce(
    (sum, company) => sum + (company.venuesCount ?? 0),
    0,
  )

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Companies and venues</h2>
          <p>
            Covers <code>GET /api/admin/companies</code>, company detail lookup,
            and company venues lookup.
          </p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-button ghost"
            onClick={() => loadCompanies(selectedCompanyId)}
            disabled={isLoadingCompanies}
          >
            {isLoadingCompanies ? 'Refreshing...' : 'Refresh companies'}
          </button>
        </div>
      </div>

      {feedback.message ? (
        <div
          className={`admin-status${
            feedback.tone !== 'idle' ? ` is-${feedback.tone}` : ''
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="admin-grid admin-grid-stats">
        <article className="admin-stat-card">
          <div className="admin-stat-label">Companies loaded</div>
          <div className="admin-stat-value">{companies.length}</div>
          <p className="admin-stat-detail">
            Full company index for admin review.
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Total venues</div>
          <div className="admin-stat-value">{totalVenues}</div>
          <p className="admin-stat-detail">
            Combined from company listing response data.
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Selected company</div>
          <div className="admin-stat-value">{selectedCompanyId ?? '--'}</div>
          <p className="admin-stat-detail">
            Loads company details and its venues in parallel.
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Venue records shown</div>
          <div className="admin-stat-value">{companyVenues.length}</div>
          <p className="admin-stat-detail">
            Based on <code>GET /api/admin/companies/&lt;id&gt;/venues</code>
          </p>
        </article>
      </div>

      <div className="admin-layout-grid">
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Company list</h2>
              <p className="admin-card-copy">
                Click any company row to open the detail panel.
              </p>
            </div>
          </div>

          {companies.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Venues</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      className={`admin-clickable-row${
                        selectedCompanyId === company.id
                          ? ' admin-table-row-selected'
                          : ''
                      }`}
                      onClick={() => loadCompanyDetails(company.id)}
                    >
                      <td>{company.id}</td>
                      <td>{company.name}</td>
                      <td>{company.location || '--'}</td>
                      <td>{company.venuesCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              {isLoadingCompanies
                ? 'Loading companies...'
                : 'No companies were returned by the backend.'}
            </div>
          )}
        </article>

        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Company detail panel</h2>
              <p className="admin-card-copy">
                Detail and venue requests are kept separate so both admin
                endpoints are exercised.
              </p>
            </div>
          </div>

          <form className="admin-inline-form" onSubmit={handleManualLookup}>
            <div className="admin-field">
              <label htmlFor="manual-company-id">Load company by ID</label>
              <input
                id="manual-company-id"
                type="number"
                min="1"
                placeholder="3"
                value={manualCompanyId}
                onChange={(event) => setManualCompanyId(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="admin-button ghost"
              disabled={isLoadingDetails}
            >
              Load company
            </button>
          </form>

          {companyDetails ? (
            <>
              <div className="admin-split-metrics">
                <div className="admin-summary-item">
                  <div>
                    <strong>{companyDetails.name}</strong>
                    <span>Company ID #{companyDetails.id}</span>
                  </div>
                  <span className="admin-badge success">
                    {companyVenues.length} venues loaded
                  </span>
                </div>

                <div className="admin-summary-item">
                  <div>
                    <strong>{companyDetails.location || 'No location'}</strong>
                    <span>{companyDetails.phoneNumber || 'No phone number'}</span>
                  </div>
                  <span className="admin-badge">{companyDetails.email}</span>
                </div>
              </div>

              <div className="admin-card-note">
                {isLoadingDetails
                  ? 'Refreshing company details...'
                  : 'Venue cards below are sourced from the dedicated company venues endpoint.'}
              </div>

              {companyVenues.length > 0 ? (
                <div className="admin-venue-grid">
                  {companyVenues.map((venue) => (
                    <article key={venue.id} className="admin-venue-card">
                      <h3>{venue.name}</h3>
                      <p>
                        {venue.city || 'No city'} | {venue.address || 'No address'}
                      </p>
                      <p>
                        Capacity: {venue.capacity ?? 0} | Minimum price:{' '}
                        {venue.minimalPrice ?? 0}
                      </p>
                      <span
                        className={`admin-badge${
                          venue.isActive ? ' success' : ' warning'
                        }`}
                      >
                        {venue.isActive ? 'Active venue' : 'Inactive venue'}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  {isLoadingDetails
                    ? 'Loading venue data...'
                    : 'No venues were returned for this company.'}
                </div>
              )}
            </>
          ) : (
            <div className="admin-empty-state">
              Select a company from the list or load one manually by ID.
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

export default AdminCompaniesPage
