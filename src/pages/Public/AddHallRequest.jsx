import { useState } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

  .ahr-root {
    min-height: 100vh;
    background: #fafaf9;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: #1c1917;
    display: flex;
    flex-direction: column;
  }

  .ahr-topbar {
    background: #fff;
    border-bottom: 1px solid #e7e5e4;
    padding: 0 2.5rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ahr-brand {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1c1917;
    cursor: pointer;
    background: none;
    border: none;
    font-family: inherit;
    padding: 0;
  }

  .ahr-back-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: #78716c;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.1s;
    padding: 0;
  }
  .ahr-back-btn:hover { color: #1c1917; }

  .ahr-body {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 3rem 1.5rem;
  }

  .ahr-card {
    background: #fff;
    border: 1px solid #e7e5e4;
    width: 100%;
    max-width: 620px;
    padding: 2.5rem;
  }

  .ahr-card-title {
    font-size: 1.35rem;
    font-weight: 400;
    letter-spacing: -0.02em;
    color: #1c1917;
    margin: 0 0 0.5rem;
  }

  .ahr-card-sub {
    font-size: 0.85rem;
    color: #a8a29e;
    font-weight: 300;
    margin: 0 0 2rem;
  }

  .ahr-divider {
    border: none;
    border-top: 1px solid #e7e5e4;
    margin: 1.75rem 0;
  }

  .ahr-section-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a8a29e;
    margin: 0 0 1.25rem;
  }

  .ahr-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .ahr-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1.25rem;
  }

  .ahr-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #78716c;
  }

  .ahr-input, .ahr-select, .ahr-textarea {
    width: 100%;
    padding: 0 0.875rem;
    height: 3rem;
    border: 1px solid #e7e5e4;
    background: #fff;
    font-size: 0.875rem;
    color: #1c1917;
    font-family: inherit;
    font-weight: 300;
    outline: none;
    border-radius: 0;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }

  .ahr-textarea {
    height: auto;
    padding: 0.75rem 0.875rem;
    resize: vertical;
    min-height: 4.5rem;
  }

  .ahr-input:focus, .ahr-select:focus, .ahr-textarea:focus {
    border-color: #1c1917;
    box-shadow: 0 0 0 2px rgba(28,25,23,0.06);
  }

  .ahr-input[aria-invalid="true"] { border-color: #ef4444; }

  .ahr-error {
    font-size: 0.72rem;
    color: #ef4444;
    margin: 0;
  }

  .ahr-submit {
    width: 100%;
    height: 3.25rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.9rem;
    font-weight: 400;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.15s;
    border-radius: 0;
    margin-top: 0.5rem;
  }
  .ahr-submit:hover { background: #292524; }

  .ahr-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    padding: 1.5rem;
    text-align: center;
    border-radius: 2px;
  }

  .ahr-success-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #dcfce7;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
  }

  .ahr-success-title {
    font-size: 1rem;
    font-weight: 500;
    color: #16a34a;
    margin: 0 0 0.4rem;
  }

  .ahr-success-sub {
    font-size: 0.85rem;
    color: #4ade80;
    font-weight: 300;
    margin: 0 0 1.25rem;
  }

  .ahr-new-btn {
    height: 2.5rem;
    padding: 0 1.5rem;
    background: #fff;
    color: #16a34a;
    border: 1px solid #bbf7d0;
    font-size: 0.82rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 2px;
    transition: background 0.1s;
    font-weight: 400;
  }
  .ahr-new-btn:hover { background: #f0fdf4; }
`

const STORAGE_KEY = 'hall_requests'

const initial = {
  orgName: '', contactName: '', contactEmail: '', contactPhone: '',
  hallName: '', capacity: '', floor: '', features: '', notes: '',
}

function AddHallRequest({ onNavigate }) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = (v) => {
    const e = {}
    if (!v.orgName.trim()) e.orgName = 'Organization name is required.'
    if (!v.contactEmail.trim()) e.contactEmail = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.contactEmail)) e.contactEmail = 'Enter a valid email.'
    if (!v.hallName.trim()) e.hallName = 'Hall name is required.'
    if (!v.capacity || isNaN(Number(v.capacity)) || Number(v.capacity) < 1)
      e.capacity = 'Enter a valid capacity.'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const existing = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
    })()
    const newReq = {
      ...values,
      id: Date.now(),
      capacity: Number(values.capacity),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newReq, ...existing]))
    setSubmitted(true)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ahr-root">

        <header className="ahr-topbar">
          <button className="ahr-brand" onClick={() => onNavigate('home')}>EventPlan</button>
          <button className="ahr-back-btn" onClick={() => onNavigate('home')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </button>
        </header>

        <div className="ahr-body">
          <div className="ahr-card">

            {submitted ? (
              <div className="ahr-success">
                <div className="ahr-success-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.8">
                    <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="ahr-success-title">Request Submitted!</p>
                <p className="ahr-success-sub">
                  Your hall request has been received. Our team will review it and get back to you.
                </p>
                <button className="ahr-new-btn" onClick={() => { setSubmitted(false); setValues(initial) }}>
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h1 className="ahr-card-title">Request a Hall</h1>
                <p className="ahr-card-sub">Fill in the details below and we'll review your request shortly.</p>

                <p className="ahr-section-label">Contact Information</p>

                <div className="ahr-grid-2">
                  <div className="ahr-field">
                    <label className="ahr-label">Organization Name *</label>
                    <input className="ahr-input" name="orgName" value={values.orgName}
                      onChange={handleChange} aria-invalid={errors.orgName ? 'true' : 'false'}
                      placeholder="Your organization or company" />
                    {errors.orgName && <p className="ahr-error">{errors.orgName}</p>}
                  </div>
                  <div className="ahr-field">
                    <label className="ahr-label">Contact Person</label>
                    <input className="ahr-input" name="contactName" value={values.contactName}
                      onChange={handleChange} placeholder="Full name" />
                  </div>
                  <div className="ahr-field">
                    <label className="ahr-label">Email Address *</label>
                    <input className="ahr-input" name="contactEmail" type="email"
                      value={values.contactEmail} onChange={handleChange}
                      aria-invalid={errors.contactEmail ? 'true' : 'false'}
                      placeholder="contact@example.com" />
                    {errors.contactEmail && <p className="ahr-error">{errors.contactEmail}</p>}
                  </div>
                  <div className="ahr-field">
                    <label className="ahr-label">Phone Number</label>
                    <input className="ahr-input" name="contactPhone" value={values.contactPhone}
                      onChange={handleChange} placeholder="+966 5xx xxx xxxx" />
                  </div>
                </div>

                <hr className="ahr-divider" />
                <p className="ahr-section-label">Hall Details</p>

                <div className="ahr-grid-2">
                  <div className="ahr-field">
                    <label className="ahr-label">Hall Name *</label>
                    <input className="ahr-input" name="hallName" value={values.hallName}
                      onChange={handleChange} aria-invalid={errors.hallName ? 'true' : 'false'}
                      placeholder="e.g. Main Conference Hall" />
                    {errors.hallName && <p className="ahr-error">{errors.hallName}</p>}
                  </div>
                  <div className="ahr-field">
                    <label className="ahr-label">Guest Capacity *</label>
                    <input className="ahr-input" name="capacity" type="number"
                      value={values.capacity} onChange={handleChange}
                      aria-invalid={errors.capacity ? 'true' : 'false'}
                      placeholder="Max number of guests" min="1" />
                    {errors.capacity && <p className="ahr-error">{errors.capacity}</p>}
                  </div>
                  <div className="ahr-field">
                    <label className="ahr-label">Floor / Location</label>
                    <input className="ahr-input" name="floor" value={values.floor}
                      onChange={handleChange} placeholder="e.g. Ground Floor" />
                  </div>
                  <div className="ahr-field">
                    <label className="ahr-label">Available Features</label>
                    <input className="ahr-input" name="features" value={values.features}
                      onChange={handleChange} placeholder="e.g. Projector, Sound System" />
                  </div>
                </div>

                <div className="ahr-field" style={{ marginBottom: 0 }}>
                  <label className="ahr-label">Additional Notes</label>
                  <textarea className="ahr-textarea" name="notes" value={values.notes}
                    onChange={handleChange} rows={3}
                    placeholder="Any additional information about the hall or request..." />
                </div>

                <button type="submit" className="ahr-submit">Submit Hall Request</button>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

export default AddHallRequest
