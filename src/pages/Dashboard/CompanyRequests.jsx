import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { makeDashStyles } from './dashboardPageStyles'

const styles = makeDashStyles('or') + `
  .or-row {
    display: grid;
    grid-template-columns: 1.4fr 1.4fr 1fr 1fr 150px 60px;
    gap: 1rem;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .or-row:last-child { border-bottom: none; }
  .or-row:not(.header):hover { background: rgba(79,70,229,0.03); }
  .or-row.header { background: #f8f7ff; padding: 0.7rem 1.25rem; }
  .or-label {
    margin: 0; font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8;
  }
  .or-main { margin: 0 0 0.2rem; font-size: 0.9rem; font-weight: 700; color: #1e1b4b; }
  .or-sub { margin: 0; font-size: 0.8rem; color: #64748b; }
  .or-cell { font-size: 0.82rem; color: #64748b; }
  .or-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .or-mini {
    padding: 0.35rem 0.75rem; border-radius: 8px; border: 1.5px solid;
    font: inherit; font-size: 0.75rem; font-weight: 700; cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .or-mini:hover { transform: translateY(-1px); }
  .or-mini.approve {
    color: #15803d; border-color: rgba(22,163,74,0.3);
    background: rgba(22,163,74,0.08);
  }
  .or-mini.approve:hover { background: rgba(22,163,74,0.15); }
  .or-mini.reject {
    color: #be123c; border-color: rgba(244,63,94,0.3);
    background: rgba(244,63,94,0.07);
  }
  .or-mini.reject:hover { background: rgba(244,63,94,0.14); }
  .or-expand {
    border: 1.5px solid #e2e8f0; background: none; border-radius: 8px;
    cursor: pointer; color: #64748b; font: inherit; font-size: 0.75rem;
    font-weight: 600; padding: 0.35rem 0.6rem;
    transition: background 0.15s, color 0.15s;
  }
  .or-expand:hover { background: rgba(79,70,229,0.07); color: #4f46e5; }
  .or-detail {
    padding: 1.25rem; background: rgba(79,70,229,0.03);
    border-top: 1px solid #f1f5f9;
  }
  .or-detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.9rem;
  }
  .or-detail-item label {
    display: block; margin-bottom: 0.25rem; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8;
  }
  .or-detail-item span { font-size: 0.875rem; color: #1e1b4b; font-weight: 500; }
  @media (max-width: 1100px) {
    .or-row { grid-template-columns: 1fr; }
    .or-row.header { display: none; }
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
        message: error instanceof Error ? error.message : 'Unable to load business requests.',
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
          className="or-input or-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by business, venue, representative, or email..."
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
        <button className="or-button secondary" onClick={loadRequests} disabled={loading}>
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
          <p className="or-label">Business</p>
          <p className="or-label">Representative</p>
          <p className="or-label">Venue</p>
          <p className="or-label">Business Phone</p>
          <p className="or-label">Status</p>
          <p className="or-label"></p>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="or-empty">
            {loading ? 'Loading business requests...' : 'No business requests found.'}
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
