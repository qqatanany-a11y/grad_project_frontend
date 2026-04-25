import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import {
  sanitizeNameInput,
  sanitizePhoneInput,
  validateEmail,
  validateName,
  validatePhone,
} from '../../lib/validation'

const styles = `
  .up-toolbar,
  .up-inline {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .up-input {
    flex: 1;
    min-width: 220px;
    height: 2.75rem;
    padding: 0 0.85rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    color: #1c1917;
    font: inherit;
  }

  .up-input:focus {
    outline: none;
    border-color: #1c1917;
  }

  .up-button {
    height: 2.75rem;
    padding: 0 1.1rem;
    border: none;
    background: #1c1917;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }

  .up-button.secondary {
    background: #fff;
    border: 1px solid #e7e5e4;
    color: #1c1917;
  }

  .up-status {
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid #e7e5e4;
    background: #fff;
  }

  .up-status.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .up-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 1rem;
  }

  .up-card {
    border: 1px solid #e7e5e4;
    background: #fff;
    padding: 1rem;
  }

  .up-card-title {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .up-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .up-row {
    padding: 0.9rem;
    border: 1px solid #f1f5f9;
    background: #fafaf9;
    cursor: pointer;
  }

  .up-row.active {
    border-color: #1c1917;
    background: #fff;
  }

  .up-name {
    margin: 0 0 0.25rem;
    font-size: 0.88rem;
    font-weight: 600;
  }

  .up-copy {
    margin: 0;
    font-size: 0.8rem;
    color: #57534e;
  }

  .up-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .up-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    background: #f5f5f4;
    color: #57534e;
  }

  .up-empty {
    padding: 2rem 1rem;
    text-align: center;
    color: #78716c;
  }

  .up-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 0.9rem;
  }

  .up-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #78716c;
  }

  .up-actions {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  @media (max-width: 980px) {
    .up-grid {
      grid-template-columns: 1fr;
    }
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
          className="up-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter loaded users by name, email, or phone..."
        />
        <button className="up-button" onClick={() => loadUsers(selectedUser?.id)} disabled={loading}>
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
                  {busyAction === 'update' ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          ) : (
            <div className="up-empty">Select a user to edit or manage it.</div>
          )}
        </section>
      </div>
    </>
  )
}

export default Users
