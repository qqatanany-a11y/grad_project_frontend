import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const styles = `
  .bk-toolbar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .bk-input,
  .bk-select {
    height: 2.75rem;
    padding: 0 0.85rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    color: #1c1917;
    font: inherit;
  }

  .bk-input {
    flex: 1;
    min-width: 220px;
  }

  .bk-input:focus,
  .bk-select:focus {
    outline: none;
    border-color: #1c1917;
  }

  .bk-button {
    height: 2.75rem;
    padding: 0 1.15rem;
    border: none;
    background: #1c1917;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }

  .bk-button.secondary {
    background: #fff;
    border: 1px solid #e7e5e4;
    color: #1c1917;
  }

  .bk-status {
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .bk-status.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .bk-panel {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .bk-panel-title {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .bk-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .bk-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .bk-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #78716c;
  }

  .bk-actions {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .bk-table {
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .bk-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr 160px;
    gap: 1rem;
    align-items: center;
    padding: 0.95rem 1rem;
    border-bottom: 1px solid #f5f5f4;
  }

  .bk-row:last-child {
    border-bottom: none;
  }

  .bk-row.header {
    background: #fafaf9;
    padding: 0.6rem 1rem;
  }

  .bk-label-row {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .bk-main {
    margin: 0 0 0.25rem;
    font-size: 0.88rem;
    font-weight: 600;
  }

  .bk-copy {
    margin: 0;
    font-size: 0.8rem;
    color: #57534e;
  }

  .bk-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 92px;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .bk-badge.pending {
    background: #fffbeb;
    color: #a16207;
  }

  .bk-badge.confirmed {
    background: #f0fdf4;
    color: #166534;
  }

  .bk-badge.rejected {
    background: #fef2f2;
    color: #991b1b;
  }

  .bk-inline-actions {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .bk-empty {
    padding: 2.5rem 1rem;
    text-align: center;
    color: #78716c;
  }

  @media (max-width: 1100px) {
    .bk-grid,
    .bk-row {
      grid-template-columns: 1fr;
    }

    .bk-row.header {
      display: none;
    }
  }
`

const emptyForm = {
  venueId: '',
  date: '',
  startTime: '',
  endTime: '',
  guestsCount: '',
}

function formatDate(value) {
  if (!value) return '--'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Bookings({ session }) {
  const [bookings, setBookings] = useState([])
  const [venues, setVenues] = useState([])
  const [formValues, setFormValues] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })

  const isOwner = session?.role === 'Owner'
  const isUser = session?.role === 'User'

  const loadBookings = async () => {
    setLoading(true)

    try {
      const [bookingData, venueData] = await Promise.all([
        apiRequest(isOwner ? '/api/owner/bookings' : '/api/bookings/my', {
          token: session?.token,
        }),
        isUser ? apiRequest('/api/Venues/all') : Promise.resolve([]),
      ])

      setBookings(Array.isArray(bookingData) ? bookingData : [])
      setVenues(Array.isArray(venueData) ? venueData : [])
      setFeedback({ tone: 'idle', message: '' })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load bookings.',
      })
      setBookings([])
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOwner || isUser) {
      loadBookings()
    }
  }, [session?.role, session?.token])

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        booking.venueName?.toLowerCase().includes(query) ||
        booking.status?.toLowerCase().includes(query) ||
        booking.time?.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'All' ||
        booking.status?.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [bookings, search, statusFilter])

  const handleChange = ({ target: { name, value } }) => {
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  const createBooking = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      await apiRequest('/api/bookings', {
        method: 'POST',
        token: session?.token,
        body: {
          venueId: Number(formValues.venueId),
          date: `${formValues.date}T00:00:00Z`,
          startTime: formValues.startTime,
          endTime: formValues.endTime,
          guestsCount: Number(formValues.guestsCount),
        },
      })

      setFeedback({ tone: 'idle', message: 'Booking created successfully.' })
      setFormValues(emptyForm)
      setShowForm(false)
      await loadBookings()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to create booking.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const decideBooking = async (bookingId, decision) => {
    setBusyId(bookingId)

    try {
      await apiRequest(`/api/owner/bookings/${bookingId}/${decision}`, {
        method: 'POST',
        token: session?.token,
      })

      setFeedback({
        tone: 'idle',
        message: `Booking #${bookingId} ${decision === 'approve' ? 'approved' : 'rejected'}.`,
      })
      await loadBookings()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to update booking.',
      })
    } finally {
      setBusyId(null)
    }
  }

  if (!isOwner && !isUser) {
    return <div className="bk-status error">This page is available for owners and users only.</div>
  }

  return (
    <>
      <style>{styles}</style>

      <div className="bk-toolbar">
        <input
          className="bk-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by venue, time, or status..."
        />
        <select
          className="bk-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Rejected</option>
        </select>
        <button className="bk-button secondary" onClick={loadBookings} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        {isUser ? (
          <button className="bk-button" onClick={() => setShowForm((isOpen) => !isOpen)}>
            {showForm ? 'Cancel' : 'Create Booking'}
          </button>
        ) : null}
      </div>

      {feedback.message ? (
        <div className={`bk-status${feedback.tone === 'error' ? ' error' : ''}`}>{feedback.message}</div>
      ) : null}

      {isUser && showForm ? (
        <form className="bk-panel" onSubmit={createBooking}>
          <p className="bk-panel-title">Create Booking</p>

          <div className="bk-grid">
            <div className="bk-field">
              <label className="bk-label">Venue</label>
              <select className="bk-select" name="venueId" value={formValues.venueId} onChange={handleChange} required>
                <option value="">Select venue</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} {venue.city ? `(${venue.city})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bk-field">
              <label className="bk-label">Date</label>
              <input className="bk-input" type="date" name="date" value={formValues.date} onChange={handleChange} required />
            </div>

            <div className="bk-field">
              <label className="bk-label">Start Time</label>
              <input className="bk-input" type="time" name="startTime" value={formValues.startTime} onChange={handleChange} required />
            </div>

            <div className="bk-field">
              <label className="bk-label">End Time</label>
              <input className="bk-input" type="time" name="endTime" value={formValues.endTime} onChange={handleChange} required />
            </div>

            <div className="bk-field">
              <label className="bk-label">Guests Count</label>
              <input
                className="bk-input"
                type="number"
                min="1"
                name="guestsCount"
                value={formValues.guestsCount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="bk-actions">
            <button className="bk-button" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Submit Booking'}
            </button>
            <button className="bk-button secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="bk-table">
        <div className="bk-row header">
          <p className="bk-label-row">Venue</p>
          <p className="bk-label-row">Date</p>
          <p className="bk-label-row">Time</p>
          <p className="bk-label-row">Total Price</p>
          <p className="bk-label-row">Status</p>
        </div>

        {filteredBookings.length === 0 ? (
          loading ? <div className="bk-empty">Loading bookings...</div> : null
        ) : (
          filteredBookings.map((booking) => {
            const status = booking.status?.toLowerCase() || 'pending'

            return (
              <div key={booking.id} className="bk-row">
                <div>
                  <p className="bk-main">{booking.venueName || '--'}</p>
                  <p className="bk-copy">Booking #{booking.id}</p>
                </div>
                <div className="bk-copy">{formatDate(booking.date)}</div>
                <div className="bk-copy">{booking.time || '--'}</div>
                <div className="bk-copy">{booking.totalPrice ?? 0}</div>
                <div>
                  {isOwner && status === 'pending' ? (
                    <div className="bk-inline-actions">
                      <button
                        className="bk-button secondary"
                        onClick={() => decideBooking(booking.id, 'approve')}
                        disabled={busyId === booking.id}
                      >
                        Approve
                      </button>
                      <button
                        className="bk-button secondary"
                        onClick={() => decideBooking(booking.id, 'reject')}
                        disabled={busyId === booking.id}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`bk-badge ${status}`}>{booking.status}</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default Bookings
