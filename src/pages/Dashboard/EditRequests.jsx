import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const styles = `
  .er-toolbar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .er-input,
  .er-textarea {
    width: 100%;
    border: 1px solid #e7e5e4;
    background: #fff;
    color: #1c1917;
    font: inherit;
    box-sizing: border-box;
  }

  .er-input {
    flex: 1;
    min-width: 220px;
    height: 2.75rem;
    padding: 0 0.85rem;
  }

  .er-textarea {
    min-height: 5rem;
    padding: 0.8rem 0.85rem;
    resize: vertical;
  }

  .er-input:focus,
  .er-textarea:focus {
    outline: none;
    border-color: #1c1917;
  }

  .er-button {
    height: 2.75rem;
    padding: 0 1.15rem;
    border: none;
    background: #1c1917;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }

  .er-button.secondary {
    background: #fff;
    border: 1px solid #e7e5e4;
    color: #1c1917;
  }

  .er-status {
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .er-status.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .er-panel {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .er-panel-title {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .er-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .er-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .er-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #78716c;
  }

  .er-table {
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .er-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1.2fr 160px;
    gap: 1rem;
    align-items: center;
    padding: 0.95rem 1rem;
    border-bottom: 1px solid #f5f5f4;
  }

  .er-row:last-child {
    border-bottom: none;
  }

  .er-row.header {
    background: #fafaf9;
    padding: 0.6rem 1rem;
  }

  .er-head {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .er-main {
    margin: 0 0 0.25rem;
    font-size: 0.88rem;
    font-weight: 600;
  }

  .er-copy {
    margin: 0;
    font-size: 0.8rem;
    color: #57534e;
  }

  .er-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 92px;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .er-badge.pending {
    background: #fffbeb;
    color: #a16207;
  }

  .er-badge.approved {
    background: #f0fdf4;
    color: #166534;
  }

  .er-badge.rejected {
    background: #fef2f2;
    color: #991b1b;
  }

  .er-actions {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .er-inline {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .er-detail {
    padding: 1rem;
    background: #fafaf9;
    border-top: 1px solid #f1f5f9;
  }

  .er-detail-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .er-summary-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .er-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #e7e5e4;
    font-size: 0.76rem;
    color: #57534e;
  }

  .er-pill.strong {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
    font-weight: 600;
  }

  .er-readable-grid,
  .er-simple-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.85rem;
  }

  .er-change-card,
  .er-simple-card {
    padding: 0.95rem 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .er-change-card.changed {
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  .er-change-label,
  .er-simple-label {
    display: block;
    margin-bottom: 0.35rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .er-change-row {
    display: grid;
    grid-template-columns: 76px 1fr;
    gap: 0.6rem;
    margin-top: 0.5rem;
    align-items: start;
  }

  .er-change-key {
    font-size: 0.72rem;
    font-weight: 600;
    color: #78716c;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .er-change-value,
  .er-simple-value {
    font-size: 0.84rem;
    line-height: 1.6;
    color: #1c1917;
    word-break: break-word;
  }

  .er-change-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.8rem;
    padding: 0.28rem 0.65rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .er-change-status.changed {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .er-change-status.same {
    background: #f5f5f4;
    color: #57534e;
  }

  .er-section-title {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 600;
    color: #1c1917;
  }

  .er-note {
    padding: 0.85rem 1rem;
    border: 1px dashed #d6d3d1;
    background: #fff;
    color: #78716c;
    font-size: 0.82rem;
    line-height: 1.6;
  }

  .er-json {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.8rem;
    line-height: 1.7;
  }

  .er-empty {
    padding: 2.5rem 1rem;
    text-align: center;
    color: #78716c;
  }

  @media (max-width: 1100px) {
    .er-grid,
    .er-row {
      grid-template-columns: 1fr;
    }

    .er-change-row {
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }

    .er-row.header {
      display: none;
    }
  }
`

function formatDate(value) {
  if (!value) return '--'

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isVenueEditRequest(request) {
  return request?.type === 'Venue'
}

const REQUEST_TYPE_LABELS = {
  Profile: 'Profile Edit',
  Venue: 'Venue Edit',
  VenueCreate: 'New Venue Request',
}

const VENUE_FIELDS = [
  { key: 'name', label: 'Venue Name' },
  { key: 'description', label: 'Description' },
  { key: 'city', label: 'City' },
  { key: 'address', label: 'Address' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'minimalPrice', label: 'Minimal Price' },
  { key: 'isActive', label: 'Status' },
]

const PROFILE_FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone Number' },
]

function parseJsonSafe(value) {
  try {
    return JSON.parse(value ?? '{}')
  } catch {
    return null
  }
}

function readValue(source, ...keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null) {
      return value
    }
  }

  return undefined
}

function normalizeVenueData(source) {
  if (!source || typeof source !== 'object') {
    return null
  }

  return {
    name: readValue(source, 'name', 'Name') ?? '',
    description: readValue(source, 'description', 'Description') ?? '',
    city: readValue(source, 'city', 'City') ?? '',
    address: readValue(source, 'address', 'Address') ?? '',
    capacity: readValue(source, 'capacity', 'Capacity') ?? null,
    minimalPrice: readValue(source, 'minimalPrice', 'MinimalPrice') ?? null,
    isActive: readValue(source, 'isActive', 'IsActive') ?? null,
    companyName: readValue(source, 'companyName', 'CompanyName') ?? '',
    venueId: readValue(source, 'venueId', 'VenueId') ?? null,
  }
}

function normalizeProfileData(source) {
  if (!source || typeof source !== 'object') {
    return null
  }

  return {
    firstName: readValue(source, 'firstName', 'FirstName') ?? '',
    lastName: readValue(source, 'lastName', 'LastName') ?? '',
    email: readValue(source, 'email', 'Email') ?? '',
    phoneNumber: readValue(source, 'phoneNumber', 'PhoneNumber') ?? '',
  }
}

function parseRequestData(request) {
  const parsed = parseJsonSafe(request?.requestedDataJson)

  if (!parsed || typeof parsed !== 'object') {
    return { kind: 'raw', raw: null }
  }

  if (request?.type === 'Venue') {
    return {
      kind: 'venue',
      current: normalizeVenueData(readValue(parsed, 'current', 'Current')),
      requested: normalizeVenueData(readValue(parsed, 'requested', 'Requested') ?? parsed),
      companyName: readValue(parsed, 'companyName', 'CompanyName') ?? '',
      venueId: readValue(parsed, 'venueId', 'VenueId') ?? request?.targetId ?? null,
      raw: parsed,
    }
  }

  if (request?.type === 'VenueCreate') {
    return {
      kind: 'venue-create',
      requested: normalizeVenueData(parsed),
      companyName: readValue(parsed, 'companyName', 'CompanyName') ?? '',
      raw: parsed,
    }
  }

  if (request?.type === 'Profile') {
    return {
      kind: 'profile',
      requested: normalizeProfileData(parsed),
      raw: parsed,
    }
  }

  return { kind: 'raw', raw: parsed }
}

function formatRequestType(type) {
  return REQUEST_TYPE_LABELS[type] ?? type ?? '--'
}

function formatFieldValue(key, value) {
  if (value === null || value === undefined || value === '') {
    return '--'
  }

  if (key === 'isActive') {
    return value ? 'Active' : 'Inactive'
  }

  if (key === 'capacity') {
    const amount = Number(value)
    return Number.isFinite(amount) ? `${amount}` : '--'
  }

  if (key === 'minimalPrice') {
    const amount = Number(value)
    return Number.isFinite(amount) ? `${amount} JOD` : '--'
  }

  return String(value)
}

function areFieldValuesEqual(key, currentValue, requestedValue) {
  if (key === 'isActive') {
    return Boolean(currentValue) === Boolean(requestedValue)
  }

  if (key === 'capacity' || key === 'minimalPrice') {
    const currentNumber = Number(currentValue)
    const requestedNumber = Number(requestedValue)

    if (Number.isFinite(currentNumber) && Number.isFinite(requestedNumber)) {
      return currentNumber === requestedNumber
    }
  }

  return String(currentValue ?? '').trim() === String(requestedValue ?? '').trim()
}

function EditRequests({ session }) {
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [venueSnapshots, setVenueSnapshots] = useState({})
  const [loadingSnapshotIds, setLoadingSnapshotIds] = useState({})
  const [snapshotErrors, setSnapshotErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })

  const isAdmin = session?.role === 'Admin'
  const isOwner = session?.role === 'Owner'

  const loadRequests = async () => {
    setLoading(true)

    try {
      const data = await apiRequest(
        isAdmin ? '/api/admin/edit-requests' : '/api/owner/edit-requests/my',
        {
          token: session?.token,
        },
      )

      setRequests(
        Array.isArray(data)
          ? data.filter(isVenueEditRequest)
          : [],
      )
      setFeedback({ tone: 'idle', message: '' })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load edit requests.',
      })
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin || isOwner) {
      loadRequests()
    }
  }, [session?.role, session?.token])

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()

    return requests.filter((request) => {
      if (!query) return true

      return (
        request.ownerName?.toLowerCase().includes(query) ||
        request.type?.toLowerCase().includes(query) ||
        request.status?.toLowerCase().includes(query) ||
        String(request.id).includes(query)
      )
    })
  }, [requests, search])

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
        message: `Edit request #${requestId} ${decision === 'approve' ? 'approved' : 'rejected'}.`,
      })
      await loadRequests()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to update edit request.',
      })
    } finally {
      setBusyId(null)
    }
  }

  const loadVenueSnapshot = async (request) => {
    if (
      request?.type !== 'Venue' ||
      !request?.targetId ||
      venueSnapshots[request.id] ||
      loadingSnapshotIds[request.id]
    ) {
      return
    }

    setLoadingSnapshotIds((currentState) => ({
      ...currentState,
      [request.id]: true,
    }))

    setSnapshotErrors((currentState) => {
      const nextState = { ...currentState }
      delete nextState[request.id]
      return nextState
    })

    try {
      const data = await apiRequest(`/api/Venues/venues/${request.targetId}`, {
        token: session?.token,
      })

      const normalizedVenue = normalizeVenueData(data)
      if (normalizedVenue) {
        setVenueSnapshots((currentState) => ({
          ...currentState,
          [request.id]: normalizedVenue,
        }))
      }
    } catch (error) {
      setSnapshotErrors((currentState) => ({
        ...currentState,
        [request.id]:
          error instanceof Error
            ? error.message
            : 'Unable to load current venue details for comparison.',
      }))
    } finally {
      setLoadingSnapshotIds((currentState) => {
        const nextState = { ...currentState }
        delete nextState[request.id]
        return nextState
      })
    }
  }

  const toggleExpanded = (request) => {
    const willExpand = expandedId !== request.id
    setExpandedId(willExpand ? request.id : null)

    if (!willExpand) {
      return
    }

    const parsedRequest = parseRequestData(request)
    if (request?.type === 'Venue' && !parsedRequest.current) {
      void loadVenueSnapshot(request)
    }
  }

  const renderSimpleDetails = (title, fields, values) => {
    if (!values) {
      return <div className="er-note">No readable request data was found.</div>
    }

    return (
      <div className="er-detail-stack">
        <p className="er-section-title">{title}</p>
        <div className="er-simple-grid">
          {fields.map((field) => (
            <div key={field.key} className="er-simple-card">
              <span className="er-simple-label">{field.label}</span>
              <span className="er-simple-value">
                {formatFieldValue(field.key, values[field.key])}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderRequestDetails = (request) => {
    const parsedRequest = parseRequestData(request)

    if (parsedRequest.kind === 'venue') {
      const currentVenue = parsedRequest.current ?? venueSnapshots[request.id] ?? null
      const snapshotError = snapshotErrors[request.id]
      const snapshotLoading = Boolean(loadingSnapshotIds[request.id])
      const changeCount = currentVenue
        ? VENUE_FIELDS.filter((field) =>
            !areFieldValuesEqual(
              field.key,
              currentVenue[field.key],
              parsedRequest.requested?.[field.key],
            ),
          ).length
        : null

      return (
        <div className="er-detail-stack">
          <div className="er-summary-row">
            <span className="er-pill">Venue ID: {parsedRequest.venueId ?? request.targetId ?? '--'}</span>
            {parsedRequest.companyName ? (
              <span className="er-pill">{parsedRequest.companyName}</span>
            ) : null}
            {changeCount !== null ? (
              <span className="er-pill strong">{changeCount} edited fields</span>
            ) : null}
          </div>

          <p className="er-section-title">Venue Changes</p>

          <div className="er-readable-grid">
            {VENUE_FIELDS.map((field) => {
              const requestedValue = parsedRequest.requested?.[field.key]
              const currentValue = currentVenue?.[field.key]
              const isChanged = currentVenue
                ? !areFieldValuesEqual(field.key, currentValue, requestedValue)
                : true

              return (
                <div
                  key={field.key}
                  className={`er-change-card${isChanged && currentVenue ? ' changed' : ''}`}
                >
                  <span className="er-change-label">{field.label}</span>

                  {currentVenue ? (
                    <div className="er-change-row">
                      <span className="er-change-key">Current</span>
                      <span className="er-change-value">
                        {formatFieldValue(field.key, currentValue)}
                      </span>
                    </div>
                  ) : null}

                  <div className="er-change-row">
                    <span className="er-change-key">
                      {currentVenue ? 'Requested' : 'Value'}
                    </span>
                    <span className="er-change-value">
                      {formatFieldValue(field.key, requestedValue)}
                    </span>
                  </div>

                  {currentVenue ? (
                    <span className={`er-change-status ${isChanged ? 'changed' : 'same'}`}>
                      {isChanged ? 'Edited' : 'No Change'}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>

          {snapshotLoading ? (
            <div className="er-note">
              Loading the current venue data so the edited fields can be highlighted.
            </div>
          ) : null}

          {!parsedRequest.current && !currentVenue && !snapshotLoading ? (
            <div className="er-note">
              This older request does not include a saved before-state. Showing the requested values only.
            </div>
          ) : null}

          {snapshotError ? <div className="er-note">{snapshotError}</div> : null}
        </div>
      )
    }

    if (parsedRequest.kind === 'profile') {
      return renderSimpleDetails('Requested Profile Changes', PROFILE_FIELDS, parsedRequest.requested)
    }

    if (parsedRequest.kind === 'venue-create') {
      return (
        <div className="er-detail-stack">
          <div className="er-summary-row">
            {parsedRequest.companyName ? (
              <span className="er-pill">{parsedRequest.companyName}</span>
            ) : null}
          </div>
          {renderSimpleDetails(
            'Requested Venue Data',
            VENUE_FIELDS.filter((field) => field.key !== 'isActive'),
            parsedRequest.requested,
          )}
        </div>
      )
    }

    return <pre className="er-json">{request.requestedDataJson || '--'}</pre>
  }

  if (!isAdmin && !isOwner) {
    return <div className="er-status error">This page is available for admins and owners only.</div>
  }

  return (
    <>
      <style>{styles}</style>

      <div className="er-toolbar">
        <input
          className="er-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search venue edit requests by owner, status, or ID..."
        />
        <button className="er-button secondary" onClick={loadRequests} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {feedback.message ? (
        <div className={`er-status${feedback.tone === 'error' ? ' error' : ''}`}>{feedback.message}</div>
      ) : null}

      <div className="er-table">
        <div className="er-row header">
          <p className="er-head">Request</p>
          <p className="er-head">Owner</p>
          <p className="er-head">Type</p>
          <p className="er-head">Created At</p>
          <p className="er-head">Status</p>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="er-empty">
            {loading ? 'Loading venue edit requests...' : 'No venue edit requests were returned by the backend.'}
          </div>
        ) : (
          filteredRequests.map((request) => {
            const status = request.status?.toLowerCase() || 'pending'
            const isExpanded = expandedId === request.id

            return (
              <div key={request.id}>
                <div className="er-row">
                  <div>
                    <p className="er-main">Request #{request.id}</p>
                    <p className="er-copy">Target ID: {request.targetId ?? '--'}</p>
                  </div>

                  <div className="er-copy">{request.ownerName || '--'}</div>
                  <div className="er-copy">{formatRequestType(request.type)}</div>
                  <div className="er-copy">{formatDate(request.createdAt)}</div>

                  <div>
                    {isAdmin && status === 'pending' ? (
                      <div className="er-inline">
                        <button
                          className="er-button secondary"
                          onClick={() => handleDecision(request.id, 'approve')}
                          disabled={busyId === request.id}
                        >
                          Approve
                        </button>
                        <button
                          className="er-button secondary"
                          onClick={() => handleDecision(request.id, 'reject')}
                          disabled={busyId === request.id}
                        >
                          Reject
                        </button>
                        <button
                          className="er-button secondary"
                          onClick={() => toggleExpanded(request)}
                        >
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                      </div>
                    ) : (
                      <div className="er-inline">
                        <span className={`er-badge ${status}`}>{request.status}</span>
                        <button
                          className="er-button secondary"
                          onClick={() => toggleExpanded(request)}
                        >
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded ? (
                  <div className="er-detail">
                    {renderRequestDetails(request)}
                    {request.rejectionReason ? (
                      <>
                        <p className="er-main" style={{ marginTop: '1rem' }}>
                          Rejection Reason
                        </p>
                        <p className="er-copy">{request.rejectionReason}</p>
                      </>
                    ) : null}
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

export default EditRequests
