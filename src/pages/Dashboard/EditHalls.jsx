import { useState } from 'react'

const styles = `
  .eh-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .eh-add-btn {
    height: 2.5rem;
    padding: 0 1.25rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.82rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 2px;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .eh-add-btn:hover { background: #292524; }

  .eh-count {
    font-size: 0.8rem;
    color: #a8a29e;
    font-weight: 300;
    margin: 0;
  }

  /* Add / Edit Panel */
  .eh-panel {
    background: #fafaf9;
    border: 1px solid #e7e5e4;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .eh-panel-title {
    font-size: 0.85rem;
    font-weight: 500;
    color: #1c1917;
    margin: 0 0 1.25rem;
  }

  .eh-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .eh-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .eh-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #78716c;
  }

  .eh-input {
    height: 2.75rem;
    padding: 0 0.875rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font-size: 0.85rem;
    color: #1c1917;
    font-family: inherit;
    font-weight: 300;
    outline: none;
    border-radius: 0;
    transition: border-color 0.15s;
    box-sizing: border-box;
    width: 100%;
  }
  .eh-input:focus { border-color: #1c1917; }

  .eh-textarea {
    width: 100%;
    padding: 0.75rem 0.875rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font-size: 0.85rem;
    color: #1c1917;
    font-family: inherit;
    font-weight: 300;
    outline: none;
    border-radius: 0;
    resize: vertical;
    min-height: 4rem;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }
  .eh-textarea:focus { border-color: #1c1917; }

  .eh-panel-actions { display: flex; gap: 0.625rem; }

  .eh-btn-primary {
    height: 2.5rem;
    padding: 0 1.25rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.82rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 2px;
    transition: background 0.15s;
  }
  .eh-btn-primary:hover { background: #292524; }

  .eh-btn-secondary {
    height: 2.5rem;
    padding: 0 1.25rem;
    background: #fff;
    color: #78716c;
    border: 1px solid #e7e5e4;
    font-size: 0.82rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 2px;
    transition: border-color 0.15s, color 0.1s;
  }
  .eh-btn-secondary:hover { border-color: #1c1917; color: #1c1917; }

  /* Halls grid */
  .eh-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .eh-card {
    background: #fff;
    border: 1px solid #e7e5e4;
    padding: 1.5rem;
    position: relative;
    transition: border-color 0.15s;
  }
  .eh-card:hover { border-color: #d4ceca; }
  .eh-card.editing { border-color: #1c1917; }

  .eh-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .eh-card-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1c1917;
    margin: 0;
  }

  .eh-card-actions { display: flex; gap: 4px; }

  .eh-edit-btn, .eh-del-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    transition: color 0.1s, background 0.1s;
  }

  .eh-edit-btn { color: #a8a29e; }
  .eh-edit-btn:hover { color: #1c1917; background: #f5f5f4; }
  .eh-del-btn { color: #d4ceca; }
  .eh-del-btn:hover { color: #ef4444; background: #fef2f2; }

  .eh-card-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }

  .eh-card-row:last-child { margin-bottom: 0; }

  .eh-card-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a8a29e;
    min-width: 60px;
  }

  .eh-card-value {
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 300;
  }

  .eh-capacity-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 500;
    color: #78716c;
    background: #fafaf9;
    border: 1px solid #e7e5e4;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    margin-top: 0.5rem;
  }

  .eh-empty {
    grid-column: 1 / -1;
    padding: 4rem 2rem;
    text-align: center;
    background: #fff;
    border: 1px solid #e7e5e4;
    color: #a8a29e;
    font-size: 0.85rem;
    font-weight: 300;
  }
`

const STORAGE_KEY = 'ar_halls'

const seedHalls = [
  { id: 1, name: 'Main Hall A', capacity: 500, floor: '1st Floor', features: 'Projector, Sound System', description: '' },
  { id: 2, name: 'Conference Room B', capacity: 80, floor: '2nd Floor', features: 'Video Conferencing', description: '' },
  { id: 3, name: 'Seminar Hall C', capacity: 200, floor: '3rd Floor', features: 'Stage, Microphone', description: '' },
]

function load() {
  try { const v = localStorage.getItem(STORAGE_KEY); if (v) return JSON.parse(v) } catch {}
  return seedHalls
}

const emptyForm = { name: '', capacity: '', floor: '', features: '', description: '' }

function EditHalls() {
  const [halls, setHalls] = useState(load)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const save = (updated) => { setHalls(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) }

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleAdd = () => {
    if (!form.name.trim()) return
    save([...halls, { ...form, id: Date.now(), capacity: Number(form.capacity) || 0 }])
    setForm(emptyForm)
    setShowAdd(false)
  }

  const startEdit = (hall) => {
    setEditId(hall.id)
    setForm({ name: hall.name, capacity: String(hall.capacity), floor: hall.floor || '', features: hall.features || '', description: hall.description || '' })
    setShowAdd(false)
  }

  const handleSaveEdit = () => {
    if (!form.name.trim()) return
    save(halls.map(h => h.id === editId ? { ...h, ...form, capacity: Number(form.capacity) || h.capacity } : h))
    setEditId(null)
    setForm(emptyForm)
  }

  const cancelEdit = () => { setEditId(null); setForm(emptyForm) }
  const deleteHall = (id) => { save(halls.filter(h => h.id !== id)); if (editId === id) cancelEdit() }

  const isEditing = editId !== null
  const isAddOpen = showAdd && !isEditing

  return (
    <>
      <style>{styles}</style>

      <div className="eh-top">
        <p className="eh-count">{halls.length} hall{halls.length !== 1 ? 's' : ''}</p>
        <button className="eh-add-btn" onClick={() => { setShowAdd(v => !v); cancelEdit() }}>
          {isAddOpen ? 'Cancel' : '+ Add Hall'}
        </button>
      </div>

      {isAddOpen && (
        <div className="eh-panel">
          <p className="eh-panel-title">New Hall</p>
          <div className="eh-form-grid">
            <div className="eh-field">
              <label className="eh-label">Hall Name</label>
              <input className="eh-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Main Hall A" />
            </div>
            <div className="eh-field">
              <label className="eh-label">Capacity</label>
              <input className="eh-input" name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="Max guests" min="1" />
            </div>
            <div className="eh-field">
              <label className="eh-label">Floor / Location</label>
              <input className="eh-input" name="floor" value={form.floor} onChange={handleChange} placeholder="e.g. 1st Floor" />
            </div>
            <div className="eh-field">
              <label className="eh-label">Features</label>
              <input className="eh-input" name="features" value={form.features} onChange={handleChange} placeholder="e.g. Projector, Sound" />
            </div>
          </div>
          <div className="eh-field" style={{ marginBottom: '1rem' }}>
            <label className="eh-label">Description (Optional)</label>
            <textarea className="eh-textarea" name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Brief description of the hall..." />
          </div>
          <div className="eh-panel-actions">
            <button className="eh-btn-primary" onClick={handleAdd}>Add Hall</button>
            <button className="eh-btn-secondary" onClick={() => { setShowAdd(false); setForm(emptyForm) }}>Cancel</button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="eh-panel">
          <p className="eh-panel-title">Edit Hall</p>
          <div className="eh-form-grid">
            <div className="eh-field">
              <label className="eh-label">Hall Name</label>
              <input className="eh-input" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="eh-field">
              <label className="eh-label">Capacity</label>
              <input className="eh-input" name="capacity" type="number" value={form.capacity} onChange={handleChange} min="1" />
            </div>
            <div className="eh-field">
              <label className="eh-label">Floor / Location</label>
              <input className="eh-input" name="floor" value={form.floor} onChange={handleChange} />
            </div>
            <div className="eh-field">
              <label className="eh-label">Features</label>
              <input className="eh-input" name="features" value={form.features} onChange={handleChange} />
            </div>
          </div>
          <div className="eh-field" style={{ marginBottom: '1rem' }}>
            <label className="eh-label">Description</label>
            <textarea className="eh-textarea" name="description" value={form.description} onChange={handleChange} rows={2} />
          </div>
          <div className="eh-panel-actions">
            <button className="eh-btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            <button className="eh-btn-secondary" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      <div className="eh-grid">
        {halls.length === 0 && (
          <div className="eh-empty">No halls added yet. Click "Add Hall" to get started.</div>
        )}

        {halls.map(h => (
          <div key={h.id} className={`eh-card${editId === h.id ? ' editing' : ''}`}>
            <div className="eh-card-header">
              <p className="eh-card-name">{h.name}</p>
              <div className="eh-card-actions">
                <button className="eh-edit-btn" title="Edit" onClick={() => startEdit(h)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="eh-del-btn" title="Delete" onClick={() => deleteHall(h.id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M5 6l.5 5M9 6l-.5 5" strokeLinecap="round" />
                    <path d="M3 3.5l.8 8a.5.5 0 0 0 .5.5h5.4a.5.5 0 0 0 .5-.5l.8-8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="eh-card-row">
              <span className="eh-card-label">Floor</span>
              <span className="eh-card-value">{h.floor || '—'}</span>
            </div>
            {h.features && (
              <div className="eh-card-row">
                <span className="eh-card-label">Features</span>
                <span className="eh-card-value">{h.features}</span>
              </div>
            )}
            {h.description && (
              <div className="eh-card-row">
                <span className="eh-card-label">Notes</span>
                <span className="eh-card-value">{h.description}</span>
              </div>
            )}
            <span className="eh-capacity-badge">Capacity: {h.capacity}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default EditHalls
