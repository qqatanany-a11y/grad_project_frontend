import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const EMPTY_FORM = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
}

const createEditableUser = (user) => ({
  firstName: user?.firstName ?? '',
  middleName: user?.middleName ?? '',
  lastName: user?.lastName ?? '',
  email: user?.email ?? '',
  phoneNumber: user?.phoneNumber ?? '',
})

function AdminUsersPage({ session }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [lookupValues, setLookupValues] = useState({ email: '', id: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })

  const applySelectedUser = (user) => {
    setSelectedUser(user)
    setFormValues(user ? createEditableUser(user) : EMPTY_FORM)
  }

  const loadUsers = async (preferredUserId) => {
    setIsLoading(true)

    try {
      const data = await apiRequest('/api/admin', { token: session?.token })
      const nextUsers = Array.isArray(data) ? data : []

      setUsers(nextUsers)
      setFeedback({ tone: 'idle', message: '' })

      const nextSelectedUser =
        nextUsers.find((user) => user.id === preferredUserId) ??
        nextUsers.find((user) => user.id === selectedUser?.id) ??
        nextUsers[0] ??
        null

      applySelectedUser(nextSelectedUser)
    } catch (requestError) {
      setFeedback({
        tone: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load users.',
      })
      setUsers([])
      applySelectedUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const lookupUser = async (path) => {
    setBusyAction('lookup')

    try {
      const user = await apiRequest(path, { token: session?.token })
      applySelectedUser(user)
      setFeedback({
        tone: 'success',
        message: `Loaded user #${user?.id ?? ''} successfully.`,
      })
    } catch (requestError) {
      setFeedback({
        tone: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to find the requested user.',
      })
    } finally {
      setBusyAction('')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleLookupSubmit = async (event, mode) => {
    event.preventDefault()

    if (mode === 'email') {
      const email = lookupValues.email.trim()

      if (!email) {
        setFeedback({ tone: 'error', message: 'Enter an email to search.' })
        return
      }

      await lookupUser(`/api/admin/email/${encodeURIComponent(email)}`)
      return
    }

    const userId = Number(lookupValues.id)

    if (!Number.isInteger(userId) || userId <= 0) {
      setFeedback({ tone: 'error', message: 'Enter a valid positive user ID.' })
      return
    }

    await lookupUser(`/api/admin/id/${userId}`)
  }

  const handleInputChange = ({ target: { name, value } }) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  const handleLookupChange = ({ target: { name, value } }) => {
    setLookupValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  const handleUpdateUser = async (event) => {
    event.preventDefault()

    if (!selectedUser?.id) {
      setFeedback({ tone: 'error', message: 'Select a user before updating.' })
      return
    }

    setBusyAction('update')

    try {
      await apiRequest(`/api/admin/${selectedUser.id}`, {
        method: 'PUT',
        token: session?.token,
        body: formValues,
      })

      setFeedback({
        tone: 'success',
        message: `User #${selectedUser.id} updated successfully.`,
      })
      await loadUsers(selectedUser.id)
    } catch (requestError) {
      setFeedback({
        tone: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to update the user.',
      })
    } finally {
      setBusyAction('')
    }
  }

  const handleUserAction = async (action) => {
    if (!selectedUser?.id) {
      setFeedback({ tone: 'error', message: 'Select a user first.' })
      return
    }

    if (
      action === 'delete' &&
      !window.confirm(`Delete user #${selectedUser.id}? This cannot be undone.`)
    ) {
      return
    }

    const requestMap = {
      activate: {
        path: `/api/admin/Activate/${selectedUser.id}`,
        method: 'PUT',
        successMessage: `Activation request sent for user #${selectedUser.id}.`,
      },
      deactivate: {
        path: `/api/admin/Deactivate/${selectedUser.id}`,
        method: 'PUT',
        successMessage: `Deactivation request sent for user #${selectedUser.id}.`,
      },
      delete: {
        path: `/api/admin/${selectedUser.id}`,
        method: 'DELETE',
        successMessage: `User #${selectedUser.id} deleted successfully.`,
      },
    }

    const requestConfig = requestMap[action]

    if (!requestConfig) {
      return
    }

    setBusyAction(action)

    try {
      await apiRequest(requestConfig.path, {
        method: requestConfig.method,
        token: session?.token,
      })

      setFeedback({
        tone: 'success',
        message: requestConfig.successMessage,
      })
      await loadUsers(action === 'delete' ? undefined : selectedUser.id)
    } catch (requestError) {
      setFeedback({
        tone: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Action failed.',
      })
    } finally {
      setBusyAction('')
    }
  }

  const selectedUserName = selectedUser
    ? [selectedUser.firstName, selectedUser.middleName, selectedUser.lastName]
        .filter(Boolean)
        .join(' ')
    : 'No user selected'

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Users management</h2>
          <p>
            Covers <code>GET /api/admin</code>, lookup by email/ID, update,
            activate, deactivate, and delete.
          </p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-button ghost"
            onClick={() => loadUsers(selectedUser?.id)}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh users'}
          </button>
        </div>
      </div>

      {feedback.message ? (
        <div
          className={`admin-status${
            feedback.tone !== 'idle' ? ` is-${feedback.tone}` : ''
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="admin-grid admin-grid-stats">
        <article className="admin-stat-card">
          <div className="admin-stat-label">Loaded users</div>
          <div className="admin-stat-value">{users.length}</div>
          <p className="admin-stat-detail">
            Straight from the admin listing endpoint.
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Selected user ID</div>
          <div className="admin-stat-value">{selectedUser?.id ?? '--'}</div>
          <p className="admin-stat-detail">Use direct actions on the selected record.</p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Selected email</div>
          <div className="admin-stat-value">
            {selectedUser?.email ? selectedUser.email.slice(0, 14) : '--'}
          </div>
          <p className="admin-stat-detail">
            Full email is available in the edit panel.
          </p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">API note</div>
          <div className="admin-stat-value">No role/status</div>
          <p className="admin-stat-detail">
            The current backend user DTO omits role and activation state.
          </p>
        </article>
      </div>

      <div className="admin-layout-grid">
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">User list</h2>
              <p className="admin-card-copy">
                Select a row to edit or trigger actions. The list uses the
                existing admin index endpoint.
              </p>
            </div>
          </div>

          {users.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`admin-clickable-row${
                        selectedUser?.id === user.id
                          ? ' admin-table-row-selected'
                          : ''
                      }`}
                      onClick={() => applySelectedUser(user)}
                    >
                      <td>{user.id}</td>
                      <td>
                        {[user.firstName, user.middleName, user.lastName]
                          .filter(Boolean)
                          .join(' ')}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              {isLoading ? 'Loading users...' : 'No users were returned by the backend.'}
            </div>
          )}
        </article>

        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Selection and actions</h2>
              <p className="admin-card-copy">
                Search directly, then update the selected user or trigger admin
                actions.
              </p>
            </div>
            <span className="admin-badge warning">{selectedUserName}</span>
          </div>

          <div className="admin-inline-cluster">
            <form
              className="admin-inline-form"
              onSubmit={(event) => handleLookupSubmit(event, 'email')}
            >
              <div className="admin-field">
                <label htmlFor="lookup-email">Find by email</label>
                <input
                  id="lookup-email"
                  name="email"
                  type="email"
                  placeholder="owner@example.com"
                  value={lookupValues.email}
                  onChange={handleLookupChange}
                />
              </div>
              <button
                type="submit"
                className="admin-button ghost"
                disabled={busyAction === 'lookup'}
              >
                Search email
              </button>
            </form>

            <form
              className="admin-inline-form"
              onSubmit={(event) => handleLookupSubmit(event, 'id')}
            >
              <div className="admin-field">
                <label htmlFor="lookup-id">Find by ID</label>
                <input
                  id="lookup-id"
                  name="id"
                  type="number"
                  min="1"
                  placeholder="12"
                  value={lookupValues.id}
                  onChange={handleLookupChange}
                />
              </div>
              <button
                type="submit"
                className="admin-button ghost"
                disabled={busyAction === 'lookup'}
              >
                Search ID
              </button>
            </form>
          </div>

          {selectedUser ? (
            <>
              <div className="admin-note-box">
                Secondary phone, activation state, and role are not included in
                the current admin user responses. This form only surfaces the
                fields that the backend returns and updates.
              </div>

              <form className="admin-stack" onSubmit={handleUpdateUser}>
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor="user-first-name">First name</label>
                    <input
                      id="user-first-name"
                      name="firstName"
                      value={formValues.firstName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-middle-name">Middle name</label>
                    <input
                      id="user-middle-name"
                      name="middleName"
                      value={formValues.middleName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-last-name">Last name</label>
                    <input
                      id="user-last-name"
                      name="lastName"
                      value={formValues.lastName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="user-phone">Phone number</label>
                    <input
                      id="user-phone"
                      name="phoneNumber"
                      value={formValues.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="user-email">Email</label>
                    <input
                      id="user-email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="admin-actions-wrap">
                  <button
                    type="submit"
                    className="admin-button"
                    disabled={busyAction === 'update'}
                  >
                    {busyAction === 'update' ? 'Saving...' : 'Update user'}
                  </button>

                  <button
                    type="button"
                    className="admin-button secondary"
                    onClick={() => handleUserAction('activate')}
                    disabled={Boolean(busyAction)}
                  >
                    Activate
                  </button>

                  <button
                    type="button"
                    className="admin-button ghost"
                    onClick={() => handleUserAction('deactivate')}
                    disabled={Boolean(busyAction)}
                  >
                    Deactivate
                  </button>

                  <button
                    type="button"
                    className="admin-button danger"
                    onClick={() => handleUserAction('delete')}
                    disabled={Boolean(busyAction)}
                  >
                    Delete
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="admin-empty-state">
              Select a user from the list or run a search to open the edit panel.
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

export default AdminUsersPage
