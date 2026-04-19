import { useState, useEffect } from 'react'
import { apiRequest } from '../../lib/apiClient'
import {
  sanitizeNameInput,
  validateEmail,
  validateName,
} from '../../lib/validation'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .hp-root {
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: #1c1917;
    background: #fff;
    scroll-behavior: smooth;
  }

  /* ─── Navbar ─── */
  .hp-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #e7e5e4;
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 4rem;
    justify-content: space-between;
    transition: box-shadow 0.2s;
  }

  .hp-nav.scrolled {
    box-shadow: 0 1px 16px rgba(28,25,23,0.06);
  }

  .hp-nav-logo {
    font-size: 1rem;
    font-weight: 600;
    color: #1c1917;
    letter-spacing: -0.01em;
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
    padding: 0;
  }

  .hp-nav-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .hp-nav-link {
    padding: 0.45rem 0.875rem;
    font-size: 0.85rem;
    font-weight: 400;
    color: #78716c;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;
  }

  .hp-nav-link:hover { color: #1c1917; background: #fafaf9; }
  .hp-nav-link.active { color: #1c1917; font-weight: 500; }

  .hp-nav-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .hp-login-btn {
    height: 2.25rem;
    padding: 0 1.25rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.82rem;
    font-weight: 400;
    font-family: inherit;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;
    letter-spacing: 0.02em;
  }
  .hp-login-btn:hover { background: #292524; }

  /* ─── Hero ─── */
  .hp-hero {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding-top: 60px;
  }

  .hp-hero-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 5rem 5rem 5rem 5rem;
  }

  .hp-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #a8a29e;
    margin-bottom: 1.75rem;
  }

  .hp-hero-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a8a29e;
    display: inline-block;
  }

  .hp-hero-title {
    font-size: 3rem;
    font-weight: 300;
    letter-spacing: -0.04em;
    line-height: 1.1;
    color: #1c1917;
    margin-bottom: 1.5rem;
  }

  .hp-hero-title strong { font-weight: 600; }

  .hp-hero-desc {
    font-size: 1rem;
    font-weight: 300;
    color: #78716c;
    line-height: 1.7;
    margin-bottom: 2.5rem;
    max-width: 400px;
  }

  .hp-hero-cta {
    display: flex;
    gap: 0.875rem;
    flex-wrap: wrap;
  }

  .hp-cta-primary {
    height: 3rem;
    padding: 0 2rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    font-family: inherit;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;
    letter-spacing: 0.02em;
  }
  .hp-cta-primary:hover { background: #292524; }

  .hp-cta-secondary {
    height: 3rem;
    padding: 0 1.75rem;
    background: transparent;
    color: #1c1917;
    border: 1px solid #e7e5e4;
    font-size: 0.875rem;
    font-weight: 400;
    font-family: inherit;
    cursor: pointer;
    border-radius: 4px;
    transition: border-color 0.15s, background 0.1s;
  }
  .hp-cta-secondary:hover { border-color: #1c1917; background: #fafaf9; }

  .hp-hero-stats {
    display: flex;
    gap: 2.5rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e7e5e4;
  }

  .hp-stat { display: flex; flex-direction: column; gap: 3px; }

  .hp-stat-num {
    font-size: 1.6rem;
    font-weight: 300;
    color: #1c1917;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .hp-stat-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a8a29e;
  }

  .hp-hero-right {
    position: relative;
    overflow: hidden;
  }

  .hp-hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .hp-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(28,25,23,0.05) 0%, rgba(28,25,23,0.25) 100%);
  }

  .hp-hero-caption {
    position: absolute;
    bottom: 2.5rem;
    left: 2.5rem;
    right: 2.5rem;
  }

  .hp-hero-caption h3 {
    font-size: 1.35rem;
    font-weight: 300;
    color: #fff;
    letter-spacing: -0.01em;
    margin-bottom: 0.35rem;
  }

  .hp-hero-caption p {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.7);
    font-weight: 300;
  }

  /* ─── Sections shared ─── */
  .hp-section {
    padding: 6rem 5rem;
  }

  .hp-section-alt {
    background: #fafaf9;
  }

  .hp-section-tag {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #a8a29e;
    margin-bottom: 1rem;
    display: block;
  }

  .hp-section-title {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: -0.03em;
    color: #1c1917;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .hp-section-title strong { font-weight: 500; }

  .hp-section-lead {
    font-size: 1rem;
    font-weight: 300;
    color: #78716c;
    line-height: 1.7;
    max-width: 560px;
    margin-bottom: 3rem;
  }

  /* ─── About ─── */
  .hp-about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
  }

  .hp-about-features {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .hp-feature-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .hp-feature-icon {
    width: 36px;
    height: 36px;
    border: 1px solid #e7e5e4;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 4px;
  }

  .hp-feature-text h4 {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1c1917;
    margin-bottom: 3px;
  }

  .hp-feature-text p {
    font-size: 0.82rem;
    font-weight: 300;
    color: #78716c;
    line-height: 1.6;
  }

  .hp-about-visual {
    background: #f5f5f4;
    border: 1px solid #e7e5e4;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hp-about-stat-card {
    background: #fff;
    border: 1px solid #e7e5e4;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .hp-about-stat-num {
    font-size: 1.75rem;
    font-weight: 300;
    color: #1c1917;
    letter-spacing: -0.03em;
    min-width: 60px;
  }

  .hp-about-stat-desc {
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 300;
    line-height: 1.4;
  }

  /* ─── Halls / Request ─── */
  .hp-halls-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: #e7e5e4;
    border: 1px solid #e7e5e4;
    margin-bottom: 2.5rem;
  }

  .hp-hall-card {
    background: #fff;
    padding: 2rem;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font: inherit;
    transition: background 0.18s ease, transform 0.18s ease;
  }

  .hp-hall-card:hover,
  .hp-hall-card:focus-visible {
    background: #fafaf9;
    transform: translateY(-2px);
    outline: none;
  }

  .hp-hall-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1c1917;
    margin-bottom: 0.4rem;
  }

  .hp-hall-cap {
    font-size: 0.78rem;
    color: #a8a29e;
    font-weight: 300;
    margin-bottom: 0.75rem;
  }

  .hp-hall-features {
    font-size: 0.78rem;
    color: #78716c;
    font-weight: 300;
    line-height: 1.5;
  }

  .hp-hall-tag {
    display: inline-block;
    margin-top: 1rem;
    font-size: 0.67rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.5rem;
    border: 1px solid #e7e5e4;
    color: #78716c;
    border-radius: 2px;
  }

  .hp-hall-hint {
    display: block;
    margin-top: 1rem;
    font-size: 0.72rem;
    color: #a8a29e;
  }

  .hp-venue-overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    background: rgba(28,25,23,0.46);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .hp-venue-panel {
    width: min(720px, 100%);
    background: #fff;
    border: 1px solid #e7e5e4;
    box-shadow: 0 24px 60px rgba(28,25,23,0.18);
  }

  .hp-venue-panel-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid #f5f5f4;
  }

  .hp-venue-panel-title {
    font-size: 1.35rem;
    font-weight: 500;
    color: #1c1917;
    letter-spacing: -0.02em;
    margin-bottom: 0.35rem;
  }

  .hp-venue-panel-subtitle {
    font-size: 0.86rem;
    color: #78716c;
    line-height: 1.5;
  }

  .hp-venue-close {
    border: 1px solid #e7e5e4;
    background: #fff;
    color: #57534e;
    width: 2.3rem;
    height: 2.3rem;
    cursor: pointer;
    font: inherit;
  }

  .hp-venue-body {
    padding: 1.5rem;
  }

  .hp-venue-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  .hp-venue-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    background: #f5f5f4;
    color: #57534e;
    font-size: 0.76rem;
  }

  .hp-venue-description {
    font-size: 0.92rem;
    line-height: 1.8;
    color: #44403c;
    margin-bottom: 1.35rem;
  }

  .hp-venue-detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .hp-venue-detail {
    padding: 0.95rem 1rem;
    background: #fafaf9;
    border: 1px solid #f5f5f4;
  }

  .hp-venue-detail-label {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .hp-venue-detail-value {
    font-size: 0.9rem;
    color: #1c1917;
    line-height: 1.6;
  }

  .hp-request-cta {
    background: #1c1917;
    padding: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .hp-request-cta-text h3 {
    font-size: 1.25rem;
    font-weight: 300;
    color: #fff;
    margin-bottom: 0.4rem;
    letter-spacing: -0.02em;
  }

  .hp-request-cta-text p {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.55);
    font-weight: 300;
  }

  .hp-request-cta-btn {
    height: 3rem;
    padding: 0 2rem;
    background: #fff;
    color: #1c1917;
    border: none;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .hp-request-cta-btn:hover { background: #fafaf9; }

  /* ─── Contact ─── */
  .hp-contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: start;
  }

  .hp-contact-item {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .hp-contact-icon {
    width: 34px;
    height: 34px;
    background: #f5f5f4;
    border: 1px solid #e7e5e4;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .hp-contact-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #a8a29e;
    margin-bottom: 3px;
  }

  .hp-contact-value {
    font-size: 0.875rem;
    font-weight: 300;
    color: #1c1917;
  }

  .hp-contact-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hp-cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }

  .hp-cf-input, .hp-cf-textarea {
    width: 100%;
    height: 2.875rem;
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
  }

  .hp-cf-textarea {
    height: auto;
    padding: 0.75rem 0.875rem;
    resize: vertical;
    min-height: 5rem;
  }

  .hp-cf-input:focus, .hp-cf-textarea:focus { border-color: #1c1917; }

  .hp-cf-input[aria-invalid='true'], .hp-cf-textarea[aria-invalid='true'] {
    border-color: #dc2626;
  }

  .hp-cf-error {
    margin: 0;
    font-size: 0.72rem;
    color: #dc2626;
  }

  .hp-cf-submit {
    height: 2.875rem;
    background: #1c1917;
    color: #fff;
    border: none;
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 0;
    transition: background 0.15s;
    font-weight: 400;
  }
  .hp-cf-submit:hover { background: #292524; }

  /* ─── Footer ─── */
  .hp-footer {
    background: #1c1917;
    padding: 2.5rem 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .hp-footer-brand {
    font-size: 0.9rem;
    font-weight: 500;
    color: #fff;
    letter-spacing: -0.01em;
  }

  .hp-footer-links {
    display: flex;
    gap: 1.5rem;
  }

  .hp-footer-link {
    font-size: 0.78rem;
    font-weight: 300;
    color: rgba(255,255,255,0.45);
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s;
    padding: 0;
  }
  .hp-footer-link:hover { color: rgba(255,255,255,0.8); }

  .hp-footer-copy {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.3);
    font-weight: 300;
  }

  @media (max-width: 900px) {
    .hp-nav { padding: 0 2rem; }
    .hp-hero { grid-template-columns: 1fr; }
    .hp-hero-left { padding: 3rem 2rem; }
    .hp-hero-right { min-height: 300px; }
    .hp-section { padding: 4rem 2rem; }
    .hp-about-grid, .hp-contact-grid { grid-template-columns: 1fr; gap: 2rem; }
    .hp-halls-grid { grid-template-columns: 1fr; }
    .hp-request-cta { flex-direction: column; }
    .hp-footer { padding: 2rem; flex-direction: column; align-items: flex-start; }
    .hp-hero-title { font-size: 2.2rem; }
    .hp-venue-detail-grid { grid-template-columns: 1fr; }
    .hp-venue-panel-head { padding: 1.25rem 1.25rem 1rem; }
    .hp-venue-body { padding: 1.25rem; }
  }
`

const fallbackVenues = [
  {
    id: 1,
    name: 'Main Venue A',
    capacity: 500,
    city: 'Amman',
    description: 'Large events',
    companyName: 'EventPlan',
  },
  {
    id: 2,
    name: 'Conference Venue B',
    capacity: 80,
    city: 'Amman',
    description: 'Meetings',
    companyName: 'EventPlan',
  },
  {
    id: 3,
    name: 'Seminar Venue C',
    capacity: 200,
    city: 'Amman',
    description: 'Seminars',
    companyName: 'EventPlan',
  },
]

const navLinks = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'halls', label: 'Our Venues' },
  { id: 'contact', label: 'Contact' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function formatVenuePrice(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return '--'
  }

  return `${amount} JOD`
}

function HomePage({ onNavigate, session }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [cfValues, setCfValues] = useState({ name: '', email: '', message: '' })
  const [cfErrors, setCfErrors] = useState({})
  const [cfSent, setCfSent] = useState(false)
  const [venues, setVenues] = useState(fallbackVenues)
  const [selectedVenue, setSelectedVenue] = useState(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const sections = navLinks.map(l => l.id)
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el && window.scrollY + 80 >= el.offsetTop) {
          setActiveSection(sections[i])
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await apiRequest('/api/Venues/all')
        if (Array.isArray(data) && data.length > 0) {
          setVenues(data)
        }
      } catch {
        setVenues(fallbackVenues)
      }
    }

    loadVenues()
  }, [])

  useEffect(() => {
    if (!selectedVenue) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedVenue(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedVenue])

  const getContactFieldError = (name, value) => {
    if (name === 'name') return validateName(value, 'Name')
    if (name === 'email') return validateEmail(value)
    return ''
  }

  const handleCfChange = ({ target: { name, value } }) => {
    const nextValue = name === 'name' ? sanitizeNameInput(value) : value

    setCfValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }))

    if (cfErrors[name]) {
      setCfErrors((currentErrors) => ({
        ...currentErrors,
        [name]: getContactFieldError(name, nextValue),
      }))
    }
  }

  const handleCfSubmit = (e) => {
    e.preventDefault()
    const nextErrors = {}

    ;['name', 'email'].forEach((fieldName) => {
      const fieldError = getContactFieldError(fieldName, cfValues[fieldName])
      if (fieldError) {
        nextErrors[fieldName] = fieldError
      }
    })

    setCfErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setCfSent(true)
    setCfErrors({})
    setCfValues({ name: '', email: '', message: '' })
  }

  return (
    <>
      <style>{styles}</style>
      <div className="hp-root">

        {/* ── Navbar ── */}
        <nav className={`hp-nav${scrolled ? ' scrolled' : ''}`}>
          <button className="hp-nav-logo" onClick={() => scrollTo('hero')}>EventPlan</button>

          <div className="hp-nav-links">
            {navLinks.map(link => (
              <button
                key={link.id}
                className={`hp-nav-link${activeSection === link.id ? ' active' : ''}`}
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}
            <button
              className="hp-nav-link"
              onClick={() => onNavigate('add-hall')}
            >
              Register Company
            </button>
          </div>

          <div className="hp-nav-right">
            <button
              className="hp-login-btn"
              onClick={() => onNavigate(session ? 'venues' : 'auth')}
            >
              {session ? 'Dashboard' : 'Log In'}
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section id="hero" className="hp-hero">
          <div className="hp-hero-left">
            <span className="hp-hero-badge">
              <span className="hp-hero-badge-dot" />
              Event Management Platform
            </span>

            <h1 className="hp-hero-title">
              Plan Your<br />
              <strong>Perfect Event</strong><br />
              Effortlessly
            </h1>

            <p className="hp-hero-desc">
              A modern platform for managing venues, company registration requests,
              and event bookings from one connected backend.
            </p>

            <div className="hp-hero-cta">
              <button className="hp-cta-primary" onClick={() => onNavigate('add-hall')}>
                Register Company
              </button>
              <button className="hp-cta-secondary" onClick={() => scrollTo('about')}>
                Learn More
              </button>
            </div>

            <div className="hp-hero-stats">
              <div className="hp-stat">
                <span className="hp-stat-num">{venues.length}+</span>
                <span className="hp-stat-label">Venues</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-num">50+</span>
                <span className="hp-stat-label">Events</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-num">200+</span>
                <span className="hp-stat-label">Clients</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-num">5★</span>
                <span className="hp-stat-label">Rating</span>
              </div>
            </div>
          </div>

          <div className="hp-hero-right">
            <img
              src="/event-hero.png"
              alt="Elegant event venue"
              className="hp-hero-img"
              onError={e => {
                e.target.style.display = 'none'
                e.target.parentElement.style.background =
                  'linear-gradient(135deg, #292524 0%, #57534e 60%, #a8a29e 100%)'
              }}
            />
            <div className="hp-hero-overlay" />
            <div className="hp-hero-caption">
              <h3>Elegant Spaces,<br />Flawless Events</h3>
              <p>From intimate gatherings to grand ceremonies</p>
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section id="about" className="hp-section hp-section-alt">
          <div className="hp-about-grid">
            <div>
              <span className="hp-section-tag">About Us</span>
              <h2 className="hp-section-title">
                Where <strong>Vision</strong><br />Meets Venue
              </h2>
              <p className="hp-section-lead">
                EventPlan is dedicated to making event management seamless. Whether you're
                planning a corporate conference, an academic seminar, or a grand celebration —
                we provide the perfect space and the tools to make it happen.
              </p>

              <div className="hp-about-features">
                {[
                  {
                    title: 'Expert Management',
                    desc: 'Our admin team reviews every request personally to ensure the best experience.',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#78716c" strokeWidth="1.4">
                        <path d="M8 1.5L14 5v6l-6 3.5L2 11V5L8 1.5z" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    title: 'Modern Facilities',
                    desc: 'Equipped venues with the latest technology for presentations and events.',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#78716c" strokeWidth="1.4">
                        <rect x="1.5" y="3" width="13" height="9" rx="1" />
                        <path d="M5 14h6M8 12v2" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    title: 'Fast Approvals',
                    desc: 'Submit your company registration and receive a response after admin review.',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#78716c" strokeWidth="1.4">
                        <circle cx="8" cy="8" r="6.5" />
                        <path d="M8 5v3.5l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                ].map(f => (
                  <div key={f.title} className="hp-feature-item">
                    <div className="hp-feature-icon">{f.icon}</div>
                    <div className="hp-feature-text">
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hp-about-visual">
              {[
                { num: '500+', desc: 'Maximum venue capacity for grand events' },
                { num: '24h', desc: 'Average company-registration review time' },
                { num: '100%', desc: 'Client satisfaction rate' },
              ].map(s => (
                <div key={s.num} className="hp-about-stat-card">
                  <span className="hp-about-stat-num">{s.num}</span>
                  <p className="hp-about-stat-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Halls ── */}
        <section id="halls" className="hp-section">
          <span className="hp-section-tag">Our Venues</span>
          <h2 className="hp-section-title">
            Spaces for Every <strong>Occasion</strong>
          </h2>
          <p className="hp-section-lead">
            From large-scale conferences to intimate seminars, our venues are designed
            to accommodate every type of event with style and comfort.
          </p>

          <div className="hp-halls-grid">
            {venues.map(venue => (
              <button
                key={venue.id ?? venue.name}
                type="button"
                className="hp-hall-card"
                onClick={() => setSelectedVenue(venue)}
              >
                <p className="hp-hall-name">{venue.name}</p>
                <p className="hp-hall-cap">Up to {venue.capacity ?? 0} guests · {venue.city || 'No city'}</p>
                <p className="hp-hall-features">{venue.description || venue.companyName || 'No description provided'}</p>
                <span className="hp-hall-tag">{venue.companyName || 'Venue'}</span>
                <span className="hp-hall-hint">Click to view details</span>
              </button>
            ))}
          </div>

          <div className="hp-request-cta">
            <div className="hp-request-cta-text">
              <h3>Want to register your company?</h3>
              <p>Submit your company registration and the admin can review it from the connected dashboard.</p>
            </div>
            <button className="hp-request-cta-btn" onClick={() => onNavigate('add-hall')}>
              Register Company →
            </button>
          </div>
        </section>

        {/* ── Contact ── */}
        {selectedVenue ? (
          <div className="hp-venue-overlay" onClick={() => setSelectedVenue(null)}>
            <div className="hp-venue-panel" onClick={(event) => event.stopPropagation()}>
              <div className="hp-venue-panel-head">
                <div>
                  <h3 className="hp-venue-panel-title">{selectedVenue.name || 'Venue details'}</h3>
                  <p className="hp-venue-panel-subtitle">
                    {selectedVenue.companyName || 'Venue'} - {selectedVenue.city || 'No city'}
                  </p>
                </div>
                <button
                  type="button"
                  className="hp-venue-close"
                  onClick={() => setSelectedVenue(null)}
                >
                  x
                </button>
              </div>

              <div className="hp-venue-body">
                <div className="hp-venue-meta">
                  <span className="hp-venue-chip">Up to {selectedVenue.capacity ?? 0} guests</span>
                  <span className="hp-venue-chip">{formatVenuePrice(selectedVenue.minimalPrice)} min price</span>
                  <span className="hp-venue-chip">{selectedVenue.city || 'No city'}</span>
                </div>

                <p className="hp-venue-description">
                  {selectedVenue.description || 'No description provided for this venue yet.'}
                </p>

                <div className="hp-venue-detail-grid">
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Company</span>
                    <span className="hp-venue-detail-value">{selectedVenue.companyName || '--'}</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Capacity</span>
                    <span className="hp-venue-detail-value">{selectedVenue.capacity ?? 0} guests</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">City</span>
                    <span className="hp-venue-detail-value">{selectedVenue.city || '--'}</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Address</span>
                    <span className="hp-venue-detail-value">{selectedVenue.address || '--'}</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Minimal Price</span>
                    <span className="hp-venue-detail-value">{formatVenuePrice(selectedVenue.minimalPrice)}</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Venue Name</span>
                    <span className="hp-venue-detail-value">{selectedVenue.name || '--'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <section id="contact" className="hp-section hp-section-alt">
          <span className="hp-section-tag">Contact</span>
          <h2 className="hp-section-title">
            Get in <strong>Touch</strong>
          </h2>

          <div className="hp-contact-grid">
            <div>
              <p className="hp-section-lead" style={{ marginBottom: '2rem' }}>
                Have questions? Reach out to us and we'll be happy to help you plan your next event.
              </p>

              {[
                {
                  label: 'Email',
                  value: 'info@eventplan.sa',
                  icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#78716c" strokeWidth="1.3"><rect x="1" y="3" width="13" height="9" rx="1" /><path d="M1 4l6.5 5L14 4" strokeLinecap="round" /></svg>,
                },
                {
                  label: 'Phone',
                  value: '+966 11 000 0000',
                  icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#78716c" strokeWidth="1.3"><path d="M3 1.5A1 1 0 0 0 2 2.5v1c0 5.523 4.477 10 10 10h1a1 1 0 0 0 1-1v-1.5a1 1 0 0 0-.75-.97l-2-.5a1 1 0 0 0-1.07.38l-.5.75a8 8 0 0 1-3.34-3.34l.75-.5a1 1 0 0 0 .38-1.07l-.5-2A1 1 0 0 0 6 3H3z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                },
                {
                  label: 'Location',
                  value: 'Riyadh, Saudi Arabia',
                  icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#78716c" strokeWidth="1.3"><path d="M7.5 1.5A4.5 4.5 0 0 0 3 6c0 3 4.5 7.5 4.5 7.5S12 9 12 6a4.5 4.5 0 0 0-4.5-4.5z" /><circle cx="7.5" cy="6" r="1.5" /></svg>,
                },
              ].map(item => (
                <div key={item.label} className="hp-contact-item">
                  <div className="hp-contact-icon">{item.icon}</div>
                  <div>
                    <p className="hp-contact-label">{item.label}</p>
                    <p className="hp-contact-value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <form className="hp-contact-form" onSubmit={handleCfSubmit}>
              {cfSent ? (
                <div style={{ padding: '2rem', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#16a34a', marginBottom: '0.3rem' }}>Message Sent!</p>
                  <p style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 300 }}>We'll get back to you shortly.</p>
                </div>
              ) : (
                <>
                  <div className="hp-cf-row">
                    <input className="hp-cf-input" name="name" placeholder="Your Name" value={cfValues.name}
                      onChange={handleCfChange} aria-invalid={cfErrors.name ? 'true' : 'false'} />
                    <input className="hp-cf-input" name="email" type="email" placeholder="Email Address" value={cfValues.email}
                      onChange={handleCfChange} aria-invalid={cfErrors.email ? 'true' : 'false'} />
                  </div>
                  {cfErrors.name ? <p className="hp-cf-error">{cfErrors.name}</p> : null}
                  {cfErrors.email ? <p className="hp-cf-error">{cfErrors.email}</p> : null}
                  <textarea className="hp-cf-textarea" placeholder="Your message..." rows={5}
                    value={cfValues.message}
                    onChange={e => setCfValues(p => ({ ...p, message: e.target.value }))} />
                  <button type="submit" className="hp-cf-submit">Send Message</button>
                </>
              )}
            </form>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="hp-footer">
          <span className="hp-footer-brand">EventPlan</span>
          <div className="hp-footer-links">
            {navLinks.map(l => (
              <button key={l.id} className="hp-footer-link" onClick={() => scrollTo(l.id)}>{l.label}</button>
            ))}
            <button className="hp-footer-link" onClick={() => onNavigate('add-hall')}>Register Company</button>
          </div>
          <span className="hp-footer-copy">© 2026 EventPlan. All rights reserved.</span>
        </footer>

      </div>
    </>
  )
}

export default HomePage


