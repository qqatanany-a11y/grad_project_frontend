import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { makeDashStyles } from './dashboardPageStyles'

const styles = makeDashStyles('vp')

const emptyForm = {
  name: '',
  description: '',
  city: '',
  address: '',
  capacity: '',
  minimalPrice: '',
  isActive: true,
}

function Venues({ session }) {
  const [venues, setVenues] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })
  const [companyId, setCompanyId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formValues, setFormValues] = useState(emptyForm)

  const isOwner = session?.role === 'Owner'
  const isAdmin = session?.role === 'Admin'
  const isUser = session?.role === 'User'

  const loadVenues = async () => {
    setLoading(true)

    try {
      if (isOwner) {
        const ownerInfo = await apiRequest('/api/owner/me', {
          token: session?.token,
        })

        const nextCompanyId = Number(ownerInfo?.companyId)
        if (!Number.isFinite(nextCompanyId) || nextCompanyId <= 0) {
          setCompanyId(null)
          setVenues([])
          setFeedback({
            tone: 'error',
            message: 'Owner company information is missing from the backend response.',
          })
          setLoading(false)
          return
        }

        setCompanyId(nextCompanyId)

        const data = await apiRequest(
          `/api/Venues/VienuesByCompanyId/${nextCompanyId}`,
          {
            token: session?.token,
          },
        )

        setVenues(Array.isArray(data) ? data : [])
      } else if (isAdmin) {
        const data = await apiRequest('/api/admin/venues', {
          token: session?.token,
        })

        setVenues(Array.isArray(data) ? data : [])
      } else {
        const data = await apiRequest('/api/Venues/all')
        setVenues(Array.isArray(data) ? data : [])
      }

      setFeedback({ tone: 'idle', message: '' })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load venues.',
      })
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVenues()
  }, [session?.role, session?.token])

  const filteredVenues = useMemo(() => {
    const query = search.trim().toLowerCase()

    return venues.filter((venue) => {
      if (!query) return true

      return (
        venue.name?.toLowerCase().includes(query) ||
        venue.city?.toLowerCase().includes(query) ||
        venue.address?.toLowerCase().includes(query) ||
        venue.companyName?.toLowerCase().includes(query)
      )
    })
  }, [search, venues])

  const resetForm = () => {
    setFormValues(emptyForm)
    setEditId(null)
    setShowForm(false)
  }

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const startEdit = (venue) => {
    setEditId(venue.id)
    setFormValues({
      name: venue.name ?? '',
      description: venue.description ?? '',
      city: venue.city ?? '',
      address: venue.address ?? '',
      capacity: String(venue.capacity ?? ''),
      minimalPrice: String(venue.minimalPrice ?? ''),
      isActive: Boolean(venue.isActive),
    })
    setShowForm(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isOwner || !companyId) {
      return
    }

    try {
      if (editId) {
        const body = {
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          city: formValues.city.trim(),
          address: formValues.address.trim(),
          capacity: Number(formValues.capacity),
          minimalPrice: Number(formValues.minimalPrice),
          isActive: Boolean(formValues.isActive),
        }

        await apiRequest(`/api/owner/edit-requests/venue/${editId}`, {
          method: 'POST',
          token: session?.token,
          body,
        })
      } else {
        await apiRequest('/api/owner/edit-requests/venue-create', {
          method: 'POST',
          token: session?.token,
          body: {
            name: formValues.name.trim(),
            description: formValues.description.trim(),
            city: formValues.city.trim(),
            address: formValues.address.trim(),
            capacity: Number(formValues.capacity),
            minimalPrice: Number(formValues.minimalPrice),
          },
        })
      }

      setFeedback({
        tone: 'idle',
        message: editId
          ? 'Venue edit request submitted for admin review.'
          : 'Venue request submitted for admin review.',
      })

      resetForm()
      await loadVenues()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to save venue.',
      })
    }
  }

  const deleteVenue = async (venueId) => {
    if (!window.confirm(`Delete venue #${venueId}?`)) {
      return
    }

    try {
      await apiRequest(`/api/Venues/venues/${venueId}`, {
        method: 'DELETE',
        token: session?.token,
      })

      setFeedback({ tone: 'idle', message: `Venue #${venueId} deleted.` })
      await loadVenues()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to delete venue.',
      })
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="vp-toolbar">
        <input
          className="vp-input vp-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search venues by name, city, address, or company..."
        />
        <button className="vp-button secondary" onClick={loadVenues} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        {isOwner ? (
          <button
            className="vp-button"
            onClick={() => {
              setShowForm((isOpen) => !isOpen)
              if (editId) {
                resetForm()
              }
            }}
          >
            {showForm ? 'Cancel' : '+ Add Venue'}
          </button>
        ) : null}
      </div>

      {feedback.message ? (
        <div className={`vp-status${feedback.tone === 'error' ? ' error' : ''}`}>{feedback.message}</div>
      ) : null}

      {isOwner && showForm ? (
        <form className="vp-panel" onSubmit={handleSubmit}>
          <p className="vp-panel-title">{editId ? 'Request Venue Edit' : 'Request New Venue'}</p>

          <div className="vp-grid">
            <div className="vp-field">
              <label className="vp-label">Venue Name</label>
              <input className="vp-input" name="name" value={formValues.name} onChange={handleChange} required />
            </div>

            <div className="vp-field">
              <label className="vp-label">City</label>
              <input className="vp-input" name="city" value={formValues.city} onChange={handleChange} required />
            </div>

            <div className="vp-field">
              <label className="vp-label">Address</label>
              <input className="vp-input" name="address" value={formValues.address} onChange={handleChange} required />
            </div>

            <div className="vp-field">
              <label className="vp-label">Capacity</label>
              <input
                className="vp-input"
                name="capacity"
                type="number"
                min="1"
                value={formValues.capacity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vp-field">
              <label className="vp-label">Minimal Price</label>
              <input
                className="vp-input"
                name="minimalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formValues.minimalPrice}
                onChange={handleChange}
                required
              />
            </div>

            {editId ? (
              <div className="vp-field">
                <label className="vp-label">Active Status</label>
                <select className="vp-select" name="isActive" value={String(formValues.isActive)} onChange={(event) => setFormValues((currentValues) => ({ ...currentValues, isActive: event.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            ) : null}
          </div>

          <div className="vp-field" style={{ marginTop: '1rem' }}>
            <label className="vp-label">Description</label>
            <textarea className="vp-textarea" name="description" value={formValues.description} onChange={handleChange} />
          </div>

          <div className="vp-actions">
            <button className="vp-button" type="submit">
              {editId ? 'Submit Venue Edit Request' : 'Submit Venue Request'}
            </button>
            <button className="vp-button secondary" type="button" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {filteredVenues.length === 0 ? (
        <div className="vp-empty">
          {loading ? 'Loading venues...' : 'No venues found.'}
        </div>
      ) : (
        <div className="vp-cards">
          {filteredVenues.map((venue) => (
            <article key={venue.id} className="vp-card">
              <p className="vp-card-title">{venue.name}</p>
              <p className="vp-card-copy">{venue.description || 'No description provided.'}</p>

              <div>
                <span className={`vp-chip ${venue.isActive ? 'active' : 'inactive'}`}>
                  {venue.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="vp-chip">{venue.city || 'No city'}</span>
                <span className="vp-chip">{venue.capacity ?? 0} guests</span>
                <span className="vp-chip">From {venue.minimalPrice ?? 0}</span>
              </div>

              <p className="vp-card-copy" style={{ marginTop: '0.5rem' }}>📍 {venue.address || '--'}</p>
              {venue.companyName ? (
                <p className="vp-card-copy">🏢 {venue.companyName}</p>
              ) : null}

              {isOwner ? (
                <div className="vp-card-actions">
                  <button className="vp-button secondary" onClick={() => startEdit(venue)}>
                    Edit
                  </button>
                  <button className="vp-button secondary" onClick={() => deleteVenue(venue.id)}>
                    Delete
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </>
  )
}

export default Venues
