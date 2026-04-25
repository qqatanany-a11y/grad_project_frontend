import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { makeDashStyles } from './dashboardPageStyles'

const styles = makeDashStyles('bk')

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
          className="bk-input bk-search"
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
            {showForm ? 'Cancel' : '+ Create Booking'}
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
          loading
            ? <div className="bk-empty">Loading bookings...</div>
            : <div className="bk-empty">No bookings found.</div>
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
