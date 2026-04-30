import { useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import {
  formatVenueTimeSlot,
  getVenueTimeSlots,
  parseTimeToMinutes,
} from '../../lib/venueTimeSlots'
import { useI18n } from '../../i18n/I18nProvider'
import { makeDashStyles } from './dashboardPageStyles'

const styles =
  makeDashStyles('bk') +
  `
    .bk-grid-wide {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .bk-option-list {
      display: grid;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .bk-option-card {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
      padding: 0.9rem 1rem;
      border: 1.5px solid #e2e8f0;
      background: #fafbff;
      border-radius: 12px;
    }
    .bk-option-card.selected {
      border-color: rgba(79,70,229,0.28);
      background: rgba(79,70,229,0.05);
    }
    .bk-slot-list {
      display: grid;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .bk-slot-card {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
      padding: 0.9rem 1rem;
      border: 1.5px solid #e2e8f0;
      background: #fafbff;
      border-radius: 12px;
      cursor: pointer;
    }
    .bk-slot-card.selected {
      border-color: rgba(79,70,229,0.28);
      background: rgba(79,70,229,0.05);
    }
    .bk-option-main {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }
    .bk-option-main input {
      margin-top: 0.25rem;
    }
    .bk-option-title {
      margin: 0 0 0.2rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e1b4b;
    }
    .bk-option-copy {
      margin: 0;
      font-size: 0.8rem;
      color: #64748b;
    }
    .bk-option-price {
      white-space: nowrap;
      font-size: 0.85rem;
      font-weight: 800;
      color: #4f46e5;
    }
    .bk-summary-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .bk-summary-card {
      padding: 0.95rem 1rem;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: #fafbff;
    }
    .bk-summary-label {
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .bk-summary-value {
      font-size: 1rem;
      font-weight: 800;
      color: #1e1b4b;
    }
    .bk-note {
      margin-top: 1rem;
      padding: 0.9rem 1rem;
      border: 1.5px dashed rgba(79,70,229,0.18);
      background: rgba(79,70,229,0.04);
      border-radius: 12px;
      color: #64748b;
      font-size: 0.85rem;
      line-height: 1.6;
    }
    .bk-doc-links {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.55rem;
    }
    .bk-link {
      display: inline-flex;
      align-items: center;
      padding: 0.28rem 0.65rem;
      border-radius: 999px;
      text-decoration: none;
      font-size: 0.72rem;
      font-weight: 700;
      background: rgba(79,70,229,0.08);
      color: #4f46e5;
      border: 1px solid rgba(79,70,229,0.16);
    }
    .bk-link:hover {
      background: rgba(79,70,229,0.13);
    }
    .bk-selected-services {
      margin-top: 0.45rem;
      font-size: 0.78rem;
      color: #64748b;
      line-height: 1.55;
    }
    .bk-file-meta {
      margin-top: 0.35rem;
      font-size: 0.76rem;
      color: #64748b;
    }
    .bk-file-control {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
      min-height: 3rem;
      padding: 0.55rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      background: #fff;
    }
    .bk-file-input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .bk-file-button {
      min-height: 2.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 1rem;
      border: 1.5px solid rgba(79,70,229,0.22);
      border-radius: 10px;
      background: #f8f7ff;
      color: #4f46e5;
      font-weight: 800;
      cursor: pointer;
    }
    .bk-file-name {
      min-width: 0;
      flex: 1;
      font-size: 0.82rem;
      font-weight: 700;
      color: #64748b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @media (max-width: 760px) {
      .bk-grid-wide, .bk-summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `

const emptyForm = {
  venueId: '',
  date: '',
  timeSlotId: '',
  startTime: '',
  endTime: '',
  guestsCount: '',
  venueServiceOptionIds: [],
  brideIdDocumentDataUrl: '',
  bridegroomIdDocumentDataUrl: '',
}

function formatDate(value) {
  if (!value) return '--'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'
  return `${amount.toFixed(2)} JOD`
}

function getVenueCategoryValue(venue) {
  const rawValue = venue?.category ?? venue?.Category ?? 'WeddingHall'

  if (rawValue === 2 || rawValue === 'Farm') {
    return 'Farm'
  }

  return 'WeddingHall'
}

function getVenueCategoryLabel(value) {
  if (value === 'Farm' || value === 2) return 'Farm'
  return 'Wedding Hall'
}

function getPricingTypeValue(venue) {
  const rawValue = venue?.pricingType ?? venue?.PricingType ?? 'Hourly'

  if (rawValue === 2 || rawValue === 'FixedSlots') {
    return 'FixedSlots'
  }

  return 'Hourly'
}

function getPricingTypeLabel(value) {
  if (value === 'FixedSlots' || value === 2) {
    return 'Fixed slots'
  }

  return 'Hourly'
}

function getVenuePricePerHour(venue) {
  const rawValue = venue?.pricePerHour ?? venue?.PricePerHour
  const amount = Number(rawValue)

  return Number.isFinite(amount) ? amount : null
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(file)
  })
}

function Bookings({ session, initialBookingDraft = null, onBookingDraftApplied }) {
  const { f } = useI18n()
  const [bookings, setBookings] = useState([])
  const [venues, setVenues] = useState([])
  const [formValues, setFormValues] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [venueTypeFilter, setVenueTypeFilter] = useState('All')
  const [serviceOptions, setServiceOptions] = useState([])
  const [documentNames, setDocumentNames] = useState({ bride: '', bridegroom: '' })
  const [loading, setLoading] = useState(true)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })
  const appliedDraftIdRef = useRef(null)

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

  useEffect(() => {
    if (!isUser || !initialBookingDraft?.id) {
      return
    }

    if (appliedDraftIdRef.current === initialBookingDraft.id) {
      return
    }

    appliedDraftIdRef.current = initialBookingDraft.id
    setShowForm(true)
    setVenueTypeFilter(initialBookingDraft.venueCategory ?? 'All')
    setServiceOptions([])
    setDocumentNames({ bride: '', bridegroom: '' })
    setFeedback({ tone: 'idle', message: '' })
    setFormValues({
      ...emptyForm,
      venueId: String(initialBookingDraft.venueId ?? ''),
      date: initialBookingDraft.date ?? '',
      timeSlotId: initialBookingDraft.timeSlotId
        ? String(initialBookingDraft.timeSlotId)
        : '',
    })
    onBookingDraftApplied?.()
  }, [initialBookingDraft, isUser, onBookingDraftApplied])

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

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      if (venueTypeFilter === 'All') {
        return true
      }

      return getVenueCategoryValue(venue) === venueTypeFilter
    })
  }, [venueTypeFilter, venues])

  const selectedVenue = useMemo(() => {
    const venue = venues.find((item) => String(item.id) === String(formValues.venueId))

    if (!venue) {
      return null
    }

    return {
      ...venue,
      pricePerHour: getVenuePricePerHour(venue),
    }
  }, [formValues.venueId, venues])

  const availableTimeSlots = useMemo(() => {
    return selectedVenue ? getVenueTimeSlots(selectedVenue, { activeOnly: true }) : []
  }, [selectedVenue])

  const selectedTimeSlot = useMemo(() => {
    return (
      availableTimeSlots.find((slot) => String(slot.id) === String(formValues.timeSlotId)) ?? null
    )
  }, [availableTimeSlots, formValues.timeSlotId])

  useEffect(() => {
    if (!formValues.venueId) {
      setServiceOptions([])
      return
    }

    const selectedStillVisible = filteredVenues.some(
      (venue) => String(venue.id) === String(formValues.venueId),
    )

    if (!selectedStillVisible) {
      setFormValues((currentValues) => ({
        ...currentValues,
        venueId: '',
        timeSlotId: '',
        venueServiceOptionIds: [],
      }))
      setServiceOptions([])
    }
  }, [filteredVenues, formValues.venueId])

  useEffect(() => {
    if (!availableTimeSlots.length) {
      return
    }

    const selectedStillAvailable = availableTimeSlots.some(
      (slot) => String(slot.id) === String(formValues.timeSlotId),
    )

    if (!selectedStillAvailable) {
      setFormValues((currentValues) => ({
        ...currentValues,
        timeSlotId: '',
      }))
    }
  }, [availableTimeSlots, formValues.timeSlotId])

  useEffect(() => {
    if (!isUser || !formValues.venueId) {
      setServiceOptions([])
      return
    }

    let isCancelled = false

    const loadServiceOptions = async () => {
      setLoadingOptions(true)

      try {
        const data = await apiRequest(`/api/venues/${formValues.venueId}/service-options`, {
          token: session?.token,
        })

        if (isCancelled) return

        const nextOptions = Array.isArray(data) ? data : []
        setServiceOptions(nextOptions)
        setFormValues((currentValues) => ({
          ...currentValues,
          venueServiceOptionIds: currentValues.venueServiceOptionIds.filter((optionId) =>
            nextOptions.some((option) => option.id === optionId),
          ),
        }))
      } catch {
        if (!isCancelled) {
          setServiceOptions([])
        }
      } finally {
        if (!isCancelled) {
          setLoadingOptions(false)
        }
      }
    }

    loadServiceOptions()

    return () => {
      isCancelled = true
    }
  }, [formValues.venueId, isUser, session?.token])

  const servicesTotal = useMemo(() => {
    return serviceOptions
      .filter((option) => formValues.venueServiceOptionIds.includes(option.id))
      .reduce((sum, option) => sum + Number(option.price || 0), 0)
  }, [formValues.venueServiceOptionIds, serviceOptions])

  const estimatedBasePrice = useMemo(() => {
    if (!selectedVenue) return null

    if (availableTimeSlots.length > 0) {
      return selectedTimeSlot ? Number(selectedTimeSlot.price || 0) : null
    }

    const pricingType = getPricingTypeValue(selectedVenue)
    const pricePerHour = getVenuePricePerHour(selectedVenue)

    if (pricingType !== 'Hourly' || pricePerHour === null || pricePerHour <= 0) {
      return null
    }

    const startMinutes = parseTimeToMinutes(formValues.startTime)
    const endMinutes = parseTimeToMinutes(formValues.endTime)

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return null
    }

    const durationHours = (endMinutes - startMinutes) / 60
    return durationHours * pricePerHour
  }, [availableTimeSlots.length, formValues.endTime, formValues.startTime, selectedTimeSlot, selectedVenue])

  const estimatedTotal =
    estimatedBasePrice === null ? null : estimatedBasePrice + servicesTotal

  const handleChange = ({ target: { name, value } }) => {
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  const handleOptionToggle = (optionId) => {
    setFormValues((currentValues) => {
      const alreadySelected = currentValues.venueServiceOptionIds.includes(optionId)

      return {
        ...currentValues,
        venueServiceOptionIds: alreadySelected
          ? currentValues.venueServiceOptionIds.filter((id) => id !== optionId)
          : [...currentValues.venueServiceOptionIds, optionId],
      }
    })
  }

  const handleDocumentChange = async (kind, event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setDocumentNames((currentNames) => ({ ...currentNames, [kind]: '' }))
      setFormValues((currentValues) => ({
        ...currentValues,
        [kind === 'bride' ? 'brideIdDocumentDataUrl' : 'bridegroomIdDocumentDataUrl']: '',
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        tone: 'error',
        message: 'Each document must be 5 MB or smaller.',
      })
      event.target.value = ''
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)

      setDocumentNames((currentNames) => ({ ...currentNames, [kind]: file.name }))
      setFormValues((currentValues) => ({
        ...currentValues,
        [kind === 'bride' ? 'brideIdDocumentDataUrl' : 'bridegroomIdDocumentDataUrl']:
          dataUrl,
      }))
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to read the document.',
      })
    }
  }

  const resetBookingForm = () => {
    setFormValues(emptyForm)
    setVenueTypeFilter('All')
    setServiceOptions([])
    setDocumentNames({ bride: '', bridegroom: '' })
  }

  const createBooking = async (event) => {
    event.preventDefault()

    if (availableTimeSlots.length > 0 && !selectedTimeSlot) {
      setFeedback({
        tone: 'error',
        message: 'Choose one of the available venue time slots before submitting.',
      })
      return
    }

    if (!formValues.brideIdDocumentDataUrl || !formValues.bridegroomIdDocumentDataUrl) {
      setFeedback({
        tone: 'error',
        message: 'Upload both the bride and bridegroom ID documents before submitting.',
      })
      return
    }

    setSubmitting(true)

    try {
      await apiRequest('/api/bookings', {
        method: 'POST',
        token: session?.token,
        body: {
          venueId: Number(formValues.venueId),
          date: `${formValues.date}T00:00:00Z`,
          guestsCount: Number(formValues.guestsCount),
          ...(selectedTimeSlot
            ? { timeSlotId: Number(formValues.timeSlotId) }
            : {
                startTime: formValues.startTime,
                endTime: formValues.endTime,
              }),
          venueServiceOptionIds: formValues.venueServiceOptionIds,
          brideIdDocumentDataUrl: formValues.brideIdDocumentDataUrl,
          bridegroomIdDocumentDataUrl: formValues.bridegroomIdDocumentDataUrl,
        },
      })

      setFeedback({ tone: 'idle', message: 'Booking created successfully.' })
      resetBookingForm()
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
          <option>Cancelled</option>
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

          <div className="bk-grid-wide">
            <div className="bk-field">
              <label className="bk-label">Venue Type</label>
              <select
                className="bk-select"
                value={venueTypeFilter}
                onChange={(event) => setVenueTypeFilter(event.target.value)}
              >
                <option value="All">All</option>
                <option value="WeddingHall">Wedding Hall</option>
                <option value="Farm">Farm</option>
              </select>
            </div>

            <div className="bk-field">
              <label className="bk-label">Venue</label>
              <select
                className="bk-select"
                name="venueId"
                value={formValues.venueId}
                onChange={handleChange}
                required
              >
                <option value="">Select venue</option>
                {filteredVenues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} {venue.city ? `(${venue.city})` : ''} -{' '}
                    {getVenueCategoryLabel(getVenueCategoryValue(venue))}
                  </option>
                ))}
              </select>
            </div>

            <div className="bk-field">
              <label className="bk-label">Date</label>
              <input
                className="bk-input"
                type="date"
                name="date"
                value={formValues.date}
                onChange={handleChange}
                required
              />
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

            {availableTimeSlots.length === 0 ? (
              <>
                <div className="bk-field">
                  <label className="bk-label">Start Time</label>
                  <input
                    className="bk-input"
                    type="time"
                    name="startTime"
                    value={formValues.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="bk-field">
                  <label className="bk-label">End Time</label>
                  <input
                    className="bk-input"
                    type="time"
                    name="endTime"
                    value={formValues.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            ) : null}

            <div className="bk-field">
              <label className="bk-label">Bride ID Document</label>
              <label className="bk-file-control">
                <input
                  className="bk-file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(event) => handleDocumentChange('bride', event)}
                />
                <span className="bk-file-button">{f('Choose bride ID document')}</span>
                <span className="bk-file-name">
                  {documentNames.bride || f('No document selected')}
                </span>
              </label>
            </div>

            <div className="bk-field">
              <label className="bk-label">Bridegroom ID Document</label>
              <label className="bk-file-control">
                <input
                  className="bk-file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(event) => handleDocumentChange('bridegroom', event)}
                />
                <span className="bk-file-button">{f('Choose bridegroom ID document')}</span>
                <span className="bk-file-name">
                  {documentNames.bridegroom || f('No document selected')}
                </span>
              </label>
            </div>
          </div>

          {selectedVenue ? (
            <>
              <div className="bk-note">
                Selected venue type: <strong>{getVenueCategoryLabel(getVenueCategoryValue(selectedVenue))}</strong>
                {' · '}
                Pricing model: <strong>{getPricingTypeLabel(getPricingTypeValue(selectedVenue))}</strong>
                {selectedTimeSlot ? (
                  <>
                    {' · '}Selected slot: <strong>{formatVenueTimeSlot(selectedTimeSlot)}</strong>
                    {' · '}Slot price: <strong>{formatCurrency(selectedTimeSlot.price)}</strong>
                  </>
                ) : getVenuePricePerHour(selectedVenue) ? (
                  <>
                    {' · '}Base rate: <strong>{formatCurrency(selectedVenue.pricePerHour)} / hour</strong>
                  </>
                ) : null}
              </div>

              {availableTimeSlots.length > 0 ? (
                <div style={{ marginTop: '1rem' }}>
                  <label className="bk-label">Available Time Slots</label>
                  <div className="bk-slot-list">
                    {availableTimeSlots.map((slot) => {
                      const selected = String(formValues.timeSlotId) === String(slot.id)

                      return (
                        <label key={slot.id} className={`bk-slot-card${selected ? ' selected' : ''}`}>
                          <div className="bk-option-main">
                            <input
                              type="radio"
                              name="timeSlotId"
                              checked={selected}
                              onChange={() =>
                                setFormValues((currentValues) => ({
                                  ...currentValues,
                                  timeSlotId: String(slot.id),
                                }))
                              }
                            />
                            <div>
                              <p className="bk-option-title">{formatVenueTimeSlot(slot)}</p>
                              <p className="bk-option-copy">
                                Only active owner-defined time slots can be booked.
                              </p>
                            </div>
                          </div>
                          <span className="bk-option-price">{formatCurrency(slot.price)}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: '1rem' }}>
                <label className="bk-label">Optional Add-ons</label>
                {loadingOptions ? (
                  <div className="bk-note">Loading available add-ons for this venue...</div>
                ) : serviceOptions.length > 0 ? (
                  <div className="bk-option-list">
                    {serviceOptions.map((option) => {
                      const selected = formValues.venueServiceOptionIds.includes(option.id)

                      return (
                        <label
                          key={option.id}
                          className={`bk-option-card${selected ? ' selected' : ''}`}
                        >
                          <div className="bk-option-main">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => handleOptionToggle(option.id)}
                            />
                            <div>
                              <p className="bk-option-title">{option.serviceName}</p>
                              <p className="bk-option-copy">
                                Optional venue add-on charged on top of the base booking price.
                              </p>
                            </div>
                          </div>
                          <span className="bk-option-price">+ {formatCurrency(option.price)}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div className="bk-note">
                    This venue does not have configured add-ons yet.
                  </div>
                )}
              </div>

              <div className="bk-summary-grid">
                <div className="bk-summary-card">
                  <span className="bk-summary-label">Base Estimate</span>
                  <span className="bk-summary-value">
                    {estimatedBasePrice === null ? 'Depends on slot' : formatCurrency(estimatedBasePrice)}
                  </span>
                </div>
                <div className="bk-summary-card">
                  <span className="bk-summary-label">Add-ons</span>
                  <span className="bk-summary-value">{formatCurrency(servicesTotal)}</span>
                </div>
                <div className="bk-summary-card">
                  <span className="bk-summary-label">Estimated Total</span>
                  <span className="bk-summary-value">
                    {estimatedTotal === null ? 'Calculated after submit' : formatCurrency(estimatedTotal)}
                  </span>
                </div>
              </div>
            </>
          ) : null}

          <div className="bk-actions">
            <button className="bk-button" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Submit Booking'}
            </button>
            <button
              className="bk-button secondary"
              type="button"
              onClick={() => {
                resetBookingForm()
                setShowForm(false)
              }}
            >
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
          loading ? (
            <div className="bk-empty">Loading bookings...</div>
          ) : (
            <div className="bk-empty">No bookings found.</div>
          )
        ) : (
          filteredBookings.map((booking) => {
            const status = booking.status?.toLowerCase() || 'pending'

            return (
              <div key={booking.id} className="bk-row">
                <div>
                  <p className="bk-main">{booking.venueName || '--'}</p>
                  <p className="bk-copy">Booking #{booking.id}</p>
                  {booking.services?.length ? (
                    <p className="bk-selected-services">
                      Add-ons: {booking.services.map((service) => service.serviceName).join(', ')}
                    </p>
                  ) : null}
                  {(booking.brideIdDocumentDataUrl || booking.bridegroomIdDocumentDataUrl) ? (
                    <div className="bk-doc-links">
                      {booking.brideIdDocumentDataUrl ? (
                        <a
                          className="bk-link"
                          href={booking.brideIdDocumentDataUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Bride ID
                        </a>
                      ) : null}
                      {booking.bridegroomIdDocumentDataUrl ? (
                        <a
                          className="bk-link"
                          href={booking.bridegroomIdDocumentDataUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Bridegroom ID
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="bk-copy">{formatDate(booking.date)}</div>
                <div className="bk-copy">{booking.time || '--'}</div>
                <div className="bk-copy">
                  {formatCurrency(booking.totalPrice)}
                  {Number(booking.servicesPrice) > 0 ? (
                    <p className="bk-copy" style={{ marginTop: '0.3rem' }}>
                      Extras {formatCurrency(booking.servicesPrice)}
                    </p>
                  ) : null}
                </div>
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

