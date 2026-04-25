import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const styles = `
  .vp-toolbar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .vp-input,
  .vp-select,
  .vp-textarea {
    width: 100%;
    border: 1px solid #e7e5e4;
    background: #fff;
    color: #1c1917;
    font: inherit;
    box-sizing: border-box;
  }

  .vp-input,
  .vp-select {
    height: 2.75rem;
    padding: 0 0.85rem;
  }

  .vp-textarea {
    min-height: 5rem;
    padding: 0.8rem 0.85rem;
    resize: vertical;
  }

  .vp-search {
    flex: 1;
    min-width: 240px;
  }

  .vp-input:focus,
  .vp-select:focus,
  .vp-textarea:focus {
    outline: none;
    border-color: #1c1917;
    box-shadow: 0 0 0 2px rgba(28, 25, 23, 0.08);
  }

  .vp-button {
    height: 2.75rem;
    padding: 0 1.2rem;
    border: none;
    background: #1c1917;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }

  .vp-button.secondary {
    border: 1px solid #e7e5e4;
    background: #fff;
    color: #1c1917;
  }

  .vp-status {
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .vp-status.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .vp-panel {
    margin-bottom: 1rem;
    padding: 1.25rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .vp-panel-title {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .vp-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .vp-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .vp-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #78716c;
  }

  .vp-actions {
    display: flex;
    gap: 0.6rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .vp-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .vp-card {
    padding: 1.2rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .vp-card-title {
    margin: 0 0 0.35rem;
    font-size: 0.96rem;
    font-weight: 600;
  }

  .vp-card-copy {
    margin: 0 0 0.7rem;
    color: #57534e;
    line-height: 1.6;
    font-size: 0.84rem;
  }

  .vp-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    background: #f5f5f4;
    color: #57534e;
    margin-right: 0.4rem;
    margin-bottom: 0.4rem;
  }

  .vp-chip.active {
    background: #f0fdf4;
    color: #166534;
  }

  .vp-chip.inactive {
    background: #fef2f2;
    color: #991b1b;
  }

  .vp-card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.9rem;
  }

  .vp-empty {
    padding: 2.5rem 1rem;
    text-align: center;
    color: #78716c;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  @media (max-width: 760px) {
    .vp-grid {
      grid-template-columns: 1fr;
    }
  }
`

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
            {showForm ? 'Cancel' : 'Add Venue'}
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

          <div className="vp-field">
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
          {loading ? 'Loading venues...' : 'No venues were returned by the backend.'}
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
                <span className="vp-chip">{venue.capacity ?? 0} capacity</span>
                <span className="vp-chip">{venue.minimalPrice ?? 0} min price</span>
              </div>

              <p className="vp-card-copy">Address: {venue.address || '--'}</p>
              {venue.companyName ? (
                <p className="vp-card-copy">Company: {venue.companyName}</p>
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
