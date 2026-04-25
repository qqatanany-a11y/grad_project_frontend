import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { makeDashStyles } from './dashboardPageStyles'

const styles = makeDashStyles('vr') + `
  .vr-row {
    display: grid;
    grid-template-columns: 1.25fr 1fr 1fr 1fr 150px 60px;
    gap: 1rem;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .vr-row:last-child { border-bottom: none; }
  .vr-row:not(.header):hover { background: rgba(79,70,229,0.03); }
  .vr-row.header { background: #f8f7ff; padding: 0.7rem 1.25rem; }
  .vr-label {
    margin: 0; font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8;
  }
  .vr-main { margin: 0 0 0.2rem; font-size: 0.9rem; font-weight: 700; color: #1e1b4b; }
  .vr-sub { margin: 0; font-size: 0.8rem; color: #64748b; }
  .vr-cell { font-size: 0.82rem; color: #64748b; }
  .vr-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .vr-mini {
    padding: 0.35rem 0.75rem; border-radius: 8px; border: 1.5px solid;
    font: inherit; font-size: 0.75rem; font-weight: 700; cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .vr-mini:hover { transform: translateY(-1px); }
  .vr-mini.approve {
    color: #15803d; border-color: rgba(22,163,74,0.3);
    background: rgba(22,163,74,0.08);
  }
  .vr-mini.approve:hover { background: rgba(22,163,74,0.15); }
  .vr-mini.reject {
    color: #be123c; border-color: rgba(244,63,94,0.3);
    background: rgba(244,63,94,0.07);
  }
  .vr-mini.reject:hover { background: rgba(244,63,94,0.14); }
  .vr-expand {
    border: 1.5px solid #e2e8f0; background: none; border-radius: 8px;
    cursor: pointer; color: #64748b; font: inherit; font-size: 0.75rem;
    font-weight: 600; padding: 0.35rem 0.6rem;
    transition: background 0.15s, color 0.15s;
  }
  .vr-expand:hover { background: rgba(79,70,229,0.07); color: #4f46e5; }
  .vr-detail {
    padding: 1.25rem; background: rgba(79,70,229,0.03);
    border-top: 1px solid #f1f5f9;
  }
  .vr-detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.9rem;
  }
  .vr-detail-item label {
    display: block; margin-bottom: 0.25rem; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8;
  }
  .vr-detail-item span { font-size: 0.875rem; color: #1e1b4b; font-weight: 500; }
  @media (max-width: 1100px) {
    .vr-row { grid-template-columns: 1fr; }
    .vr-row.header { display: none; }
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

function parseRequestedData(requestedDataJson) {
  try {
    const data = JSON.parse(requestedDataJson ?? '{}')

    return {
      name: data?.name ?? data?.Name ?? '',
      description: data?.description ?? data?.Description ?? '',
      city: data?.city ?? data?.City ?? '',
      address: data?.address ?? data?.Address ?? '',
      capacity: data?.capacity ?? data?.Capacity ?? null,
      minimalPrice: data?.minimalPrice ?? data?.MinimalPrice ?? null,
      companyName: data?.companyName ?? data?.CompanyName ?? '',
    }
  } catch {
    return {
      name: '',
      description: '',
      city: '',
      address: '',
      capacity: null,
      minimalPrice: null,
      companyName: '',
    }
  }
}

function normalizeVenueRequest(request) {
  const details = parseRequestedData(request?.requestedDataJson)

  return {
    id: request?.id ?? null,
    ownerName: request?.ownerName ?? '',
    status: request?.status ?? '',
    type: request?.type ?? '',
    createdAt: request?.createdAt ?? null,
    rejectionReason: request?.rejectionReason ?? '',
    details,
  }
}

function VenueRequests({ session }) {
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
      const data = await apiRequest('/api/admin/edit-requests', {
        token: session?.token,
      })

      const venueCreateRequests = Array.isArray(data)
        ? data
            .filter((request) => request?.type === 'VenueCreate')
            .map(normalizeVenueRequest)
        : []

      setRequests(venueCreateRequests)
      setFeedback({ tone: 'idle', message: '' })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load venue requests.',
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
        request.details.name?.toLowerCase().includes(query) ||
        request.details.companyName?.toLowerCase().includes(query) ||
        request.ownerName?.toLowerCase().includes(query) ||
        request.details.city?.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'All' ||
        request.status?.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [requests, search, statusFilter])

  const handleDecision = async (requestId, decision) => {
    setBusyId(requestId)

    try {
      const path =
        decision === 'approve'
          ? `/api/admin/edit-requests/${requestId}/approve`
          : `/api/admin/edit-requests/${requestId}/reject`

      const body =
        decision === 'reject'
          ? {
              reason: window.prompt('Enter rejection reason (optional):') || '',
            }
          : undefined

      await apiRequest(path, {
        method: 'POST',
        token: session?.token,
        ...(body ? { body } : {}),
      })

      setFeedback({
        tone: 'idle',
        message: `Venue request #${requestId} ${decision === 'approve' ? 'approved' : 'rejected'}.`,
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
    return <div className="vr-status error">This page is available for admins only.</div>
  }

  return (
    <>
      <style>{styles}</style>

      <div className="vr-toolbar">
        <input
          className="vr-input vr-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by venue, company, owner, or city..."
        />
        <select
          className="vr-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <button className="vr-button secondary" onClick={loadRequests} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {feedback.message ? (
        <div className={`vr-status${feedback.tone === 'error' ? ' error' : ''}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="vr-table">
        <div className="vr-row header">
          <p className="vr-label">Venue</p>
          <p className="vr-label">Company</p>
          <p className="vr-label">Owner</p>
          <p className="vr-label">City</p>
          <p className="vr-label">Status</p>
          <p className="vr-label"></p>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="vr-empty">
            {loading ? 'Loading venue requests...' : 'No venue requests found.'}
          </div>
        ) : (
          filteredRequests.map((request) => {
            const status = request.status?.toLowerCase() || 'pending'
            const isExpanded = expandedId === request.id

            return (
              <div key={request.id}>
                <div className="vr-row">
                  <div>
                    <p className="vr-main">{request.details.name || '--'}</p>
                    <p className="vr-sub">{request.details.address || '--'}</p>
                  </div>

                  <div className="vr-cell">{request.details.companyName || '--'}</div>
                  <div className="vr-cell">{request.ownerName || '--'}</div>
                  <div className="vr-cell">{request.details.city || '--'}</div>

                  <div>
                    {status === 'pending' ? (
                      <div className="vr-actions">
                        <button
                          className="vr-mini approve"
                          onClick={() => handleDecision(request.id, 'approve')}
                          disabled={busyId === request.id}
                        >
                          Approve
                        </button>
                        <button
                          className="vr-mini reject"
                          onClick={() => handleDecision(request.id, 'reject')}
                          disabled={busyId === request.id}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`vr-badge ${status}`}>{request.status}</span>
                    )}
                  </div>

                  <div>
                    <button
                      className="vr-expand"
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
                  <div className="vr-detail">
                    <div className="vr-detail-grid">
                      <div className="vr-detail-item">
                        <label>Created At</label>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                      <div className="vr-detail-item">
                        <label>Capacity</label>
                        <span>{request.details.capacity ?? '--'}</span>
                      </div>
                      <div className="vr-detail-item">
                        <label>Minimal Price</label>
                        <span>{request.details.minimalPrice ?? '--'}</span>
                      </div>
                      <div className="vr-detail-item">
                        <label>Description</label>
                        <span>{request.details.description || '--'}</span>
                      </div>
                      {request.rejectionReason ? (
                        <div className="vr-detail-item">
                          <label>Rejection Reason</label>
                          <span>{request.rejectionReason}</span>
                        </div>
                      ) : null}
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

export default VenueRequests
