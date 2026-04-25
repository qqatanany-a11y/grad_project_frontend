import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const styles = `
  .vr-toolbar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .vr-input,
  .vr-select {
    height: 2.75rem;
    padding: 0 0.85rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font: inherit;
    color: #1c1917;
  }

  .vr-input {
    flex: 1;
    min-width: 240px;
  }

  .vr-input:focus,
  .vr-select:focus {
    outline: none;
    border-color: #1c1917;
  }

  .vr-button {
    height: 2.75rem;
    padding: 0 1.2rem;
    border: none;
    background: #1c1917;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }

  .vr-status {
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .vr-status.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .vr-table {
    background: #fff;
    border: 1px solid #e7e5e4;
  }

  .vr-row {
    display: grid;
    grid-template-columns: 1.25fr 1fr 1fr 1fr 150px 60px;
    gap: 1rem;
    align-items: center;
    padding: 0.95rem 1rem;
    border-bottom: 1px solid #f5f5f4;
  }

  .vr-row:last-child {
    border-bottom: none;
  }

  .vr-row.header {
    background: #fafaf9;
    padding: 0.6rem 1rem;
  }

  .vr-label {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .vr-main {
    margin: 0 0 0.2rem;
    font-size: 0.88rem;
    font-weight: 500;
  }

  .vr-sub {
    margin: 0;
    font-size: 0.76rem;
    color: #78716c;
  }

  .vr-cell {
    font-size: 0.82rem;
    color: #57534e;
  }

  .vr-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 88px;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .vr-badge.pending {
    background: #fffbeb;
    color: #a16207;
  }

  .vr-badge.approved {
    background: #f0fdf4;
    color: #166534;
  }

  .vr-badge.rejected {
    background: #fef2f2;
    color: #991b1b;
  }

  .vr-actions {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .vr-mini {
    padding: 0.35rem 0.7rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .vr-mini.approve {
    color: #166534;
    border-color: #bbf7d0;
  }

  .vr-mini.reject {
    color: #991b1b;
    border-color: #fecaca;
  }

  .vr-expand {
    border: none;
    background: none;
    cursor: pointer;
    color: #78716c;
  }

  .vr-detail {
    padding: 1rem;
    background: #fafaf9;
    border-top: 1px solid #f1f5f9;
  }

  .vr-detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.9rem;
  }

  .vr-detail-item label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .vr-empty {
    padding: 2.5rem 1rem;
    text-align: center;
    color: #78716c;
  }

  @media (max-width: 1100px) {
    .vr-row {
      grid-template-columns: 1fr;
    }

    .vr-row.header {
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
          className="vr-input"
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
        <button className="vr-button" onClick={loadRequests} disabled={loading}>
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
