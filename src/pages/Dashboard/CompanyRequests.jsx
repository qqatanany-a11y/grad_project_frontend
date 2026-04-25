import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const styles = `
  .or-toolbar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .or-input,
  .or-select {
    height: 2.75rem;
    padding: 0 0.85rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font: inherit;
    color: #1c1917;
  }

  .or-input {
    flex: 1;
    min-width: 220px;
  }

  .or-input:focus,
  .or-select:focus {
    outline: none;
    border-color: #1c1917;
  }

  .or-button {
    height: 2.75rem;
    padding: 0 1.2rem;
    border: none;
    background: #1c1917;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }

  .or-button:hover {
    background: #292524;
  }

  .or-status {
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .or-status.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .or-table {
    background: #fff;
    border: 1px solid #e7e5e4;
  }

  .or-row {
    display: grid;
    grid-template-columns: 1.4fr 1.4fr 1fr 1fr 150px 60px;
    gap: 1rem;
    align-items: center;
    padding: 0.95rem 1rem;
    border-bottom: 1px solid #f5f5f4;
  }

  .or-row:last-child {
    border-bottom: none;
  }

  .or-row.header {
    background: #fafaf9;
    padding: 0.6rem 1rem;
  }

  .or-label {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .or-main {
    margin: 0 0 0.2rem;
    font-size: 0.88rem;
    font-weight: 500;
  }

  .or-sub {
    margin: 0;
    font-size: 0.76rem;
    color: #78716c;
  }

  .or-cell {
    font-size: 0.82rem;
    color: #57534e;
  }

  .or-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 88px;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .or-badge.pending {
    background: #fffbeb;
    color: #a16207;
  }

  .or-badge.approved {
    background: #f0fdf4;
    color: #166534;
  }

  .or-badge.rejected {
    background: #fef2f2;
    color: #991b1b;
  }

  .or-actions {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .or-mini {
    padding: 0.35rem 0.7rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .or-mini.approve {
    color: #166534;
    border-color: #bbf7d0;
  }

  .or-mini.reject {
    color: #991b1b;
    border-color: #fecaca;
  }

  .or-expand {
    border: none;
    background: none;
    cursor: pointer;
    color: #78716c;
  }

  .or-detail {
    padding: 1rem;
    background: #fafaf9;
    border-top: 1px solid #f1f5f9;
  }

  .or-detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.9rem;
  }

  .or-detail-item label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .or-empty {
    padding: 2.5rem 1rem;
    text-align: center;
    color: #78716c;
  }

  @media (max-width: 1100px) {
    .or-row {
      grid-template-columns: 1fr;
    }

    .or-row.header {
      display: none;
    }
  }
`

function formatDate(value) {
  if (!value) {
    return '--'
  }

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function normalizeOwnerRequest(request) {
  return {
    id: request?.id ?? null,
    createdAt: request?.createdAt ?? null,
    status: request?.status ?? '',
    companyName: request?.companyName ?? '',
    businessAddress: request?.businessAddress ?? '',
    businessPhone: request?.businessPhone ?? '',
    firstName: request?.firstName ?? '',
    lastName: request?.lastName ?? '',
    email: request?.email ?? '',
    phoneNumber: request?.phoneNumber ?? '',
    venueName: request?.venueName ?? '',
  }
}

function CompanyRequests({ session }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const loadRequests = async () => {
    setLoading(true)

    try {
      const data = await apiRequest('/api/admin/owner-requests', {
        token: session?.token,
      })

      setRequests(Array.isArray(data) ? data.map(normalizeOwnerRequest) : [])
      setFeedback({ tone: 'idle', message: '' })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load company requests.',
      })
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.role === 'Admin') {
      loadRequests()
    }
  }, [session?.role, session?.token])

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.companyName?.toLowerCase().includes(query) ||
        request.venueName?.toLowerCase().includes(query) ||
        request.email?.toLowerCase().includes(query) ||
        `${request.firstName || ''} ${request.lastName || ''}`
          .trim()
          .toLowerCase()
          .includes(query)

      const matchesStatus =
        statusFilter === 'All' ||
        request.status?.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [requests, search, statusFilter])

  const handleDecision = async (requestId, decision) => {
    setBusyId(requestId)

    try {
      await apiRequest(`/api/admin/owner-requests/${requestId}/${decision}`, {
        method: 'POST',
        token: session?.token,
      })

      setFeedback({
        tone: 'idle',
        message: `Request #${requestId} ${decision === 'approve' ? 'approved' : 'rejected'}.`,
      })

      await loadRequests()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Action failed.',
      })
    } finally {
      setBusyId(null)
    }
  }

  if (session?.role !== 'Admin') {
    return <div className="or-status error">This page is available for admins only.</div>
  }

  return (
    <>
      <style>{styles}</style>

      <div className="or-toolbar">
        <input
          className="or-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by company, venue, representative, or email..."
        />
        <select
          className="or-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <button className="or-button" onClick={loadRequests} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {feedback.message ? (
        <div className={`or-status${feedback.tone === 'error' ? ' error' : ''}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="or-table">
        <div className="or-row header">
          <p className="or-label">Company</p>
          <p className="or-label">Representative</p>
          <p className="or-label">Venue</p>
          <p className="or-label">Business Phone</p>
          <p className="or-label">Status</p>
          <p className="or-label"></p>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="or-empty">
            {loading ? 'Loading company requests...' : 'No company requests found.'}
          </div>
        ) : (
          filteredRequests.map((request) => {
            const status = request.status?.toLowerCase() || 'pending'
            const isExpanded = expandedId === request.id

            return (
              <div key={request.id}>
                <div className="or-row">
                  <div>
                    <p className="or-main">{request.companyName || '--'}</p>
                    <p className="or-sub">{request.businessAddress || '--'}</p>
                  </div>

                  <div>
                    <p className="or-main">
                      {[request.firstName, request.lastName].filter(Boolean).join(' ') || '--'}
                    </p>
                    <p className="or-sub">{request.email || '--'}</p>
                  </div>

                  <div className="or-cell">{request.venueName || '--'}</div>
                  <div className="or-cell">{request.businessPhone || '--'}</div>

                  <div>
                    {status === 'pending' ? (
                      <div className="or-actions">
                        <button
                          className="or-mini approve"
                          onClick={() => handleDecision(request.id, 'approve')}
                          disabled={busyId === request.id}
                        >
                          Approve
                        </button>
                        <button
                          className="or-mini reject"
                          onClick={() => handleDecision(request.id, 'reject')}
                          disabled={busyId === request.id}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`or-badge ${status}`}>{request.status}</span>
                    )}
                  </div>

                  <div>
                    <button
                      className="or-expand"
                      onClick={() =>
                        setExpandedId((currentId) =>
                          currentId === request.id ? null : request.id,
                        )
                      }
                    >
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="or-detail">
                    <div className="or-detail-grid">
                      <div className="or-detail-item">
                        <label>Created At</label>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                      <div className="or-detail-item">
                        <label>Representative Phone</label>
                        <span>{request.phoneNumber || '--'}</span>
                      </div>
                      <div className="or-detail-item">
                        <label>Business Address</label>
                        <span>{request.businessAddress || '--'}</span>
                      </div>
                      <div className="or-detail-item">
                        <label>Business Phone</label>
                        <span>{request.businessPhone || '--'}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default CompanyRequests
