import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { getVenuePhotoSet } from '../../lib/venueMedia'
import {
  areVenueTimeSlotsEqual,
  formatVenueTimeSlot,
  getVenueTimeSlots,
} from '../../lib/venueTimeSlots'
import { makeDashStyles } from './dashboardPageStyles'

const styles = makeDashStyles('er') + `
  .er-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1.2fr 160px;
    gap: 1rem; align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .er-row:last-child { border-bottom: none; }
  .er-row:not(.header):hover { background: rgba(79,70,229,0.03); }
  .er-row.header { background: #f8f7ff; padding: 0.7rem 1.25rem; }
  .er-head {
    margin: 0; font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8;
  }
  .er-main { margin: 0 0 0.25rem; font-size: 0.9rem; font-weight: 700; color: #1e1b4b; }
  .er-copy { margin: 0; font-size: 0.82rem; color: #64748b; }
  .er-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 1rem; }
  .er-inline { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .er-detail {
    padding: 1.25rem 1.5rem; background: rgba(79,70,229,0.03);
    border-top: 1px solid #f1f5f9;
  }
  .er-detail-stack { display: flex; flex-direction: column; gap: 1rem; }
  .er-summary-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .er-pill {
    display: inline-flex; align-items: center; padding: 0.35rem 0.8rem;
    border-radius: 999px; background: #f8f7ff;
    border: 1.5px solid #e2e8f0; font-size: 0.76rem; color: #64748b; font-weight: 500;
  }
  .er-pill.strong {
    background: rgba(79,70,229,0.08); border-color: rgba(79,70,229,0.2);
    color: #4f46e5; font-weight: 700;
  }
  .er-readable-grid, .er-simple-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.85rem;
  }
  .er-change-card, .er-simple-card {
    padding: 1rem; border: 1.5px solid #e2e8f0;
    background: #fff; border-radius: 12px;
    transition: border-color 0.2s, background 0.2s;
  }
  .er-change-card.changed {
    border-color: rgba(79,70,229,0.3); background: rgba(79,70,229,0.04);
  }
  .er-change-label, .er-simple-label {
    display: block; margin-bottom: 0.35rem; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8;
  }
  .er-change-row {
    display: grid; grid-template-columns: 76px 1fr;
    gap: 0.6rem; margin-top: 0.5rem; align-items: start;
  }
  .er-change-key {
    font-size: 0.7rem; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .er-change-value, .er-simple-value {
    font-size: 0.875rem; line-height: 1.6; color: #1e1b4b; word-break: break-word;
    font-weight: 500;
  }
  .er-change-status {
    display: inline-flex; align-items: center; justify-content: center;
    margin-top: 0.8rem; padding: 0.28rem 0.65rem; border-radius: 999px;
    font-size: 0.7rem; font-weight: 700;
  }
  .er-change-status.changed {
    background: rgba(79,70,229,0.1); color: #4f46e5;
    border: 1px solid rgba(79,70,229,0.2);
  }
  .er-change-status.same {
    background: #f1f5f9; color: #94a3b8;
    border: 1px solid #e2e8f0;
  }
  .er-section-title {
    margin: 0; font-size: 0.95rem; font-weight: 800;
    color: #1e1b4b; letter-spacing: -0.02em;
  }
  .er-note {
    padding: 0.9rem 1.1rem; border: 1.5px dashed rgba(79,70,229,0.2);
    background: rgba(79,70,229,0.04); color: #64748b;
    font-size: 0.875rem; line-height: 1.6; border-radius: 10px;
  }
  .er-media {
    display: grid;
    gap: 0.9rem;
  }
  .er-media-cover {
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    display: block;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    background: #eef2ff;
  }
  .er-media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }
  .er-media-item {
    width: 100%;
    height: 110px;
    object-fit: cover;
    display: block;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #eef2ff;
  }
  .er-slot-stack {
    display: grid;
    gap: 0.75rem;
  }
  .er-slot-card {
    padding: 1rem;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    border-radius: 12px;
  }
  .er-slot-card.changed {
    border-color: rgba(79,70,229,0.3);
    background: rgba(79,70,229,0.04);
  }
  .er-slot-list {
    display: grid;
    gap: 0.6rem;
  }
  .er-slot-item {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem 0.95rem;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #fafbff;
  }
  .er-slot-time {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1e1b4b;
  }
  .er-slot-meta {
    font-size: 0.8rem;
    color: #64748b;
  }
  .er-slot-price {
    white-space: nowrap;
    font-size: 0.82rem;
    font-weight: 800;
    color: #4f46e5;
  }
  .er-json {
    margin: 0; white-space: pre-wrap; word-break: break-word;
    font-size: 0.8rem; line-height: 1.7; color: #64748b;
  }
  @media (max-width: 1100px) {
    .er-row { grid-template-columns: 1fr; }
    .er-row.header { display: none; }
    .er-change-row { grid-template-columns: 1fr; gap: 0.25rem; }
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
  { key: 'category', label: 'Venue Type' },
  { key: 'pricingType', label: 'Pricing Model' },
  { key: 'pricePerHour', label: 'Price' },
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

function getVenueCategoryValue(source) {
  const rawValue = readValue(source, 'category', 'Category')

  if (rawValue === 2 || rawValue === 'Farm') {
    return 'Farm'
  }

  return 'WeddingHall'
}

function getVenueCategoryLabel(value) {
  return value === 'Farm' || value === 2 ? 'Farm' : 'Wedding Hall'
}

function getPricingTypeValue(source) {
  const rawValue = readValue(source, 'pricingType', 'PricingType')

  if (rawValue === 2 || rawValue === 'FixedSlots') {
    return 'FixedSlots'
  }

  return 'Hourly'
}

function getPricingTypeLabel(value) {
  return value === 'FixedSlots' || value === 2 ? 'Fixed Slots' : 'Hourly'
}

function normalizeVenueData(source) {
  if (!source || typeof source !== 'object') {
    return null
  }

  const pricePerHour = Number(readValue(source, 'pricePerHour', 'PricePerHour'))
  const { coverPhotoUrl, galleryPhotoUrls, photoUrls } = getVenuePhotoSet(source)

  return {
    name: readValue(source, 'name', 'Name') ?? '',
    description: readValue(source, 'description', 'Description') ?? '',
    city: readValue(source, 'city', 'City') ?? '',
    address: readValue(source, 'address', 'Address') ?? '',
    capacity: readValue(source, 'capacity', 'Capacity') ?? null,
    category: getVenueCategoryValue(source),
    pricingType: getPricingTypeValue(source),
    pricePerHour: Number.isFinite(pricePerHour) ? pricePerHour : null,
    isActive: readValue(source, 'isActive', 'IsActive') ?? null,
    companyName: readValue(source, 'companyName', 'CompanyName') ?? '',
    venueId: readValue(source, 'venueId', 'VenueId') ?? null,
    timeSlots: getVenueTimeSlots(source),
    coverPhotoUrl,
    galleryPhotoUrls,
    photoUrls,
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

  if (key === 'category') {
    return getVenueCategoryLabel(value)
  }

  if (key === 'pricingType') {
    return getPricingTypeLabel(value)
  }

  if (key === 'pricePerHour') {
    const amount = Number(value)
    return Number.isFinite(amount) ? `${amount.toFixed(2)} JOD` : '--'
  }

  return String(value)
}

function areFieldValuesEqual(key, currentValue, requestedValue) {
  if (key === 'isActive') {
    return Boolean(currentValue) === Boolean(requestedValue)
  }

  if (key === 'capacity' || key === 'pricePerHour') {
    const currentNumber = Number(currentValue)
    const requestedNumber = Number(requestedValue)

    if (Number.isFinite(currentNumber) && Number.isFinite(requestedNumber)) {
      return currentNumber === requestedNumber
    }
  }

  return String(currentValue ?? '').trim() === String(requestedValue ?? '').trim()
}

function renderVenueMedia(title, venueData, keyPrefix) {
  if (!venueData?.photoUrls?.length) {
    return null
  }

  return (
    <div className="er-detail-stack">
      <p className="er-section-title">{title}</p>
      <div className="er-media">
        {venueData.coverPhotoUrl ? (
          <img
            src={venueData.coverPhotoUrl}
            alt={`${venueData.name || 'Venue'} cover`}
            className="er-media-cover"
          />
        ) : null}

        {venueData.galleryPhotoUrls?.length > 0 ? (
          <div className="er-media-grid">
            {venueData.galleryPhotoUrls.map((photoUrl, index) => (
              <img
                key={`${keyPrefix}-photo-${index}`}
                src={photoUrl}
                alt={`${venueData.name || 'Venue'} photo ${index + 2}`}
                className="er-media-item"
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function renderVenueTimeSlots(title, slots, { comparison = false, changed = false } = {}) {
  if (!Array.isArray(slots) || slots.length === 0) {
    return (
      <div className={`er-slot-card${comparison && changed ? ' changed' : ''}`}>
        <span className="er-change-label">{title}</span>
        <div className="er-note" style={{ marginTop: '0.75rem' }}>
          No time slots defined.
        </div>
      </div>
    )
  }

  return (
    <div className={`er-slot-card${comparison && changed ? ' changed' : ''}`}>
      <span className="er-change-label">{title}</span>
      <div className="er-slot-list" style={{ marginTop: '0.75rem' }}>
        {slots.map((slot, index) => (
          <div key={`${title}-${slot.id ?? index}`} className="er-slot-item">
            <div>
              <div className="er-slot-time">{formatVenueTimeSlot(slot)}</div>
              <div className="er-slot-meta">{slot.isActive ? 'Active slot' : 'Inactive slot'}</div>
            </div>
            <div className="er-slot-price">{formatFieldValue('pricePerHour', slot.price)}</div>
          </div>
        ))}
      </div>
    </div>
  )
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

      setRequests(Array.isArray(data) ? data.filter(isVenueEditRequest) : [])
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
      const slotsChanged = currentVenue
        ? !areVenueTimeSlotsEqual(currentVenue.timeSlots, parsedRequest.requested?.timeSlots)
        : false
      const changeCount = currentVenue
        ? VENUE_FIELDS.filter((field) =>
            !areFieldValuesEqual(
              field.key,
              currentVenue[field.key],
              parsedRequest.requested?.[field.key],
            ),
          ).length + (slotsChanged ? 1 : 0)
        : null

      return (
        <div className="er-detail-stack">
          <div className="er-summary-row">
            <span className="er-pill">Venue ID: {parsedRequest.venueId ?? request.targetId ?? '--'}</span>
            {parsedRequest.companyName ? (
              <span className="er-pill">Business: {parsedRequest.companyName}</span>
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

          <div className="er-slot-stack">
            {currentVenue ? renderVenueTimeSlots('Current Time Slots', currentVenue.timeSlots) : null}
            {renderVenueTimeSlots('Requested Time Slots', parsedRequest.requested?.timeSlots, {
              comparison: Boolean(currentVenue),
              changed: slotsChanged,
            })}
            {currentVenue ? (
              <span className={`er-change-status ${slotsChanged ? 'changed' : 'same'}`}>
                {slotsChanged ? 'Time Slots Edited' : 'Time Slots Unchanged'}
              </span>
            ) : null}
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

          {renderVenueMedia('Requested Photos', parsedRequest.requested, `requested-${request.id}`)}
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
              <span className="er-pill">Business: {parsedRequest.companyName}</span>
            ) : null}
          </div>
          {renderSimpleDetails(
            'Requested Venue Data',
            VENUE_FIELDS.filter((field) => field.key !== 'isActive'),
            parsedRequest.requested,
          )}
          {renderVenueTimeSlots('Requested Time Slots', parsedRequest.requested?.timeSlots)}
          {renderVenueMedia('Requested Photos', parsedRequest.requested, `create-${request.id}`)}
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
          className="er-input er-search"
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
            {loading ? 'Loading edit requests...' : 'No venue edit requests found.'}
          </div>
        ) : (
          filteredRequests.map((request) => {
            const status = request.status?.toLowerCase() || 'pending'
            const isExpanded = expandedId === request.id

            return (
              <div key={request.id}>
                <div
                  className="er-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleExpanded(request)}
                >
                  <div>
                    <p className="er-main">#{request.id}</p>
                    {request.targetId ? <p className="er-copy">Venue #{request.targetId}</p> : null}
                  </div>
                  <div className="er-copy">{request.ownerName || '--'}</div>
                  <div className="er-copy">{formatRequestType(request.type)}</div>
                  <div className="er-copy">{formatDate(request.createdAt)}</div>
                  <div>
                    {isAdmin && status === 'pending' ? (
                      <div className="er-inline">
                        <button
                          className="er-button secondary"
                          style={{ height: '2.25rem', padding: '0 0.85rem', fontSize: '0.8rem' }}
                          onClick={(event) => { event.stopPropagation(); handleDecision(request.id, 'approve') }}
                          disabled={busyId === request.id}
                        >
                          Approve
                        </button>
                        <button
                          className="er-button danger"
                          style={{ height: '2.25rem', padding: '0 0.85rem', fontSize: '0.8rem' }}
                          onClick={(event) => { event.stopPropagation(); handleDecision(request.id, 'reject') }}
                          disabled={busyId === request.id}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`er-badge ${status}`}>{request.status}</span>
                    )}
                  </div>
                </div>

                {isExpanded ? (
                  <div className="er-detail">
                    {renderRequestDetails(request)}
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
