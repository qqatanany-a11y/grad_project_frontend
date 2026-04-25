import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import {
  sanitizeNameInput,
  sanitizePhoneInput,
  validateEmail,
  validateName,
  validatePhone,
} from '../../lib/validation'
import { makeDashStyles } from './dashboardPageStyles'

const styles = makeDashStyles('up') + `
  .up-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 1.25rem;
  }
  .up-card {
    border: 1.5px solid #e2e8f0; background: #fff;
    border-radius: 16px; padding: 1.5rem;
    box-shadow: 0 4px 16px rgba(79,70,229,0.07);
    animation: upFadeUp 0.4s ease both;
  }
  .up-card-title {
    margin: 0 0 1.25rem; font-size: 1rem; font-weight: 800;
    color: #1e1b4b; letter-spacing: -0.02em;
  }
  .up-list { display: flex; flex-direction: column; gap: 0.6rem; }
  .up-row {
    padding: 1rem 1.1rem; border: 1.5px solid #e2e8f0;
    background: #fafbff; border-radius: 12px; cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  }
  .up-row:hover {
    background: rgba(79,70,229,0.04);
    border-color: rgba(79,70,229,0.2);
  }
  .up-row.active {
    border-color: #4f46e5;
    background: rgba(79,70,229,0.06);
    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
  }
  .up-name { margin: 0 0 0.2rem; font-size: 0.9rem; font-weight: 700; color: #1e1b4b; }
  .up-copy { margin: 0; font-size: 0.82rem; color: #64748b; }
  .up-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.5rem; }
  .up-badge {
    display: inline-flex; align-items: center;
    padding: 0.22rem 0.6rem; border-radius: 999px;
    font-size: 0.7rem; font-weight: 700;
    background: rgba(79,70,229,0.08); color: #4f46e5;
    border: 1px solid rgba(79,70,229,0.15);
  }
  .up-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.9rem; }
  .up-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 1.25rem; }
  @media (max-width: 980px) {
    .up-grid { grid-template-columns: 1fr; }
  }
`

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
}

function buildDisplayName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Unnamed user'
}

function formatDate(value) {
  if (!value) return '--'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getUserValidationMessage(values) {
  return (
    validateName(values.firstName, 'First name', { required: false }) ||
    validateName(values.lastName, 'Last name', { required: false }) ||
    validateEmail(values.email, { required: false }) ||
    validatePhone(values.phoneNumber, 'Phone number', { required: false })
  )
}

function Users({ session }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [lookupEmail, setLookupEmail] = useState('')
  const [lookupId, setLookupId] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [formValues, setFormValues] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })

  const applySelectedUser = (user) => {
    setSelectedUser(user)
    setFormValues({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    })
  }

  const loadUsers = async (preferredUserId) => {
    setLoading(true)

    try {
      const data = await apiRequest('/api/admin/users', {
        token: session?.token,
      })

      const nextUsers = Array.isArray(data) ? data : []
      setUsers(nextUsers)

      const nextSelectedUser =
        nextUsers.find((user) => user.id === preferredUserId) ??
        nextUsers.find((user) => user.id === selectedUser?.id) ??
        nextUsers[0] ??
        null

      applySelectedUser(nextSelectedUser)
      setFeedback({ tone: 'idle', message: '' })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load users.',
      })
      setUsers([])
      applySelectedUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.role === 'Admin') {
      loadUsers()
    }
  }, [session?.role, session?.token])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      if (!query) return true

      return (
        buildDisplayName(user).toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phoneNumber?.toLowerCase().includes(query)
      )
    })
  }, [search, users])

  const lookupUser = async (path) => {
    setBusyAction('lookup')

    try {
      const user = await apiRequest(path, { token: session?.token })
      applySelectedUser(user)
      setFeedback({
        tone: 'idle',
        message: `Loaded user #${user?.id ?? ''}.`,
      })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Lookup failed.',
      })
    } finally {
      setBusyAction('')
    }
  }

  const handleLookupEmail = async () => {
    if (!lookupEmail.trim()) {
      setFeedback({ tone: 'error', message: 'Enter an email to search.' })
      return
    }

    const emailError = validateEmail(lookupEmail)
    if (emailError) {
      setFeedback({ tone: 'error', message: emailError })
      return
    }

    await lookupUser(`/api/admin/users/email/${encodeURIComponent(lookupEmail.trim())}`)
  }

  const handleLookupId = async () => {
    const userId = Number(lookupId)

    if (!Number.isInteger(userId) || userId <= 0) {
      setFeedback({ tone: 'error', message: 'Enter a valid user ID.' })
      return
    }

    await lookupUser(`/api/admin/users/${userId}`)
  }

  const handleUpdate = async (event) => {
    event.preventDefault()

    if (!selectedUser?.id) {
      setFeedback({ tone: 'error', message: 'Select a user first.' })
      return
    }

    const validationMessage = getUserValidationMessage(formValues)
    if (validationMessage) {
      setFeedback({ tone: 'error', message: validationMessage })
      return
    }

    setBusyAction('update')

    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        token: session?.token,
        body: formValues,
      })

      setFeedback({
        tone: 'idle',
        message: `User #${selectedUser.id} updated successfully.`,
      })
      await loadUsers(selectedUser.id)
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Update failed.',
      })
    } finally {
      setBusyAction('')
    }
  }

  const handleChange = ({ target: { name, value } }) => {
    const nextValue =
      name === 'firstName' || name === 'lastName'
        ? sanitizeNameInput(value)
        : name === 'phoneNumber'
          ? sanitizePhoneInput(value)
          : value

    setFormValues((currentValues) => ({ ...currentValues, [name]: nextValue }))
  }

  if (session?.role !== 'Admin') {
    return <div className="up-status error">This page is available for admins only.</div>
  }

  return (
    <>
      <style>{styles}</style>

      <div className="up-toolbar">
        <input
          className="up-input up-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter loaded users by name, email, or phone..."
        />
        <button className="up-button secondary" onClick={() => loadUsers(selectedUser?.id)} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="up-inline">
        <input
          className="up-input"
          type="email"
          value={lookupEmail}
          onChange={(event) => setLookupEmail(event.target.value)}
          placeholder="Lookup user by email..."
        />
        <button className="up-button secondary" onClick={handleLookupEmail} disabled={busyAction === 'lookup'}>
          Search Email
        </button>

        <input
          className="up-input"
          value={lookupId}
          onChange={(event) => setLookupId(event.target.value)}
          placeholder="Lookup user by ID..."
        />
        <button className="up-button secondary" onClick={handleLookupId} disabled={busyAction === 'lookup'}>
          Search ID
        </button>
      </div>

      {feedback.message ? (
        <div className={`up-status${feedback.tone === 'error' ? ' error' : ''}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="up-grid">
        <section className="up-card">
          <p className="up-card-title">Users</p>

          {filteredUsers.length === 0 ? (
            <div className="up-empty">
              {loading ? 'Loading users...' : 'No users found.'}
            </div>
          ) : (
            <div className="up-list">
              {filteredUsers.map((user) => (
                <article
                  key={user.id}
                  className={`up-row${selectedUser?.id === user.id ? ' active' : ''}`}
                  onClick={() => applySelectedUser(user)}
                >
                  <p className="up-name">{buildDisplayName(user)}</p>
                  <p className="up-copy">{user.email || '--'}</p>
                  <div className="up-badges">
                    <span className="up-badge">#{user.id}</span>
                    <span className="up-badge">{user.phoneNumber || 'No phone'}</span>
                    <span className="up-badge">Joined {formatDate(user.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="up-card">
          <p className="up-card-title">Selected User</p>

          {selectedUser ? (
            <form onSubmit={handleUpdate}>
              <div className="up-field">
                <label className="up-label">First Name</label>
                <input className="up-input" name="firstName" value={formValues.firstName} onChange={handleChange} />
              </div>

              <div className="up-field">
                <label className="up-label">Last Name</label>
                <input className="up-input" name="lastName" value={formValues.lastName} onChange={handleChange} />
              </div>

              <div className="up-field">
                <label className="up-label">Email</label>
                <input className="up-input" name="email" type="email" value={formValues.email} onChange={handleChange} />
              </div>

              <div className="up-field">
                <label className="up-label">Phone Number</label>
                <input className="up-input" name="phoneNumber" inputMode="numeric" maxLength={10} value={formValues.phoneNumber} onChange={handleChange} />
              </div>

              <div className="up-actions">
                <button className="up-button" type="submit" disabled={busyAction === 'update'}>
                  {busyAction === 'update' ? 'Saving...' : 'Update User'}
                </button>
              </div>
            </form>
          ) : (
            <div className="up-empty">Select a user from the list to edit.</div>
          )}
        </section>
      </div>
    </>
  )
}

export default Users
