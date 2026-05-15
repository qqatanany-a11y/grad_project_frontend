import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDialog } from '../../components/ui/AppDialogProvider'
import { apiRequest, getVenueAvailableSlots } from '../../lib/apiClient'
import { useI18n } from '../../i18n/I18nProvider'
import {
  formatVenueDateLabel,
  formatVenueTimeSlot,
  getVenueAvailabilitySlots,
} from '../../lib/venueTimeSlots'
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
      align-items: stretch;
      padding: 1rem 1.05rem;
      border: 1.5px solid #e2e8f0;
      background: linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
      border-radius: 16px;
      cursor: pointer;
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.04);
      transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    }
    .bk-slot-card:hover {
      transform: translateY(-2px);
      border-color: rgba(79,70,229,0.22);
      box-shadow: 0 18px 36px rgba(79,70,229,0.1);
    }
    .bk-slot-card.selected {
      border-color: rgba(79,70,229,0.32);
      background: linear-gradient(180deg, rgba(79,70,229,0.08) 0%, rgba(79,70,229,0.04) 100%);
      box-shadow: 0 20px 40px rgba(79,70,229,0.14);
    }
    .bk-slot-main {
      display: flex;
      gap: 0.9rem;
      align-items: flex-start;
      min-width: 0;
      flex: 1;
    }
    .bk-slot-main input {
      margin-top: 0.35rem;
      accent-color: #4f46e5;
      flex-shrink: 0;
    }
    .bk-slot-content {
      min-width: 0;
      display: grid;
      gap: 0.55rem;
    }
    .bk-slot-badges {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .bk-slot-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.28rem 0.62rem;
      border-radius: 999px;
      border: 1px solid rgba(79,70,229,0.14);
      background: rgba(79,70,229,0.07);
      color: #4338ca;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .bk-slot-meta {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .bk-slot-meta-item {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 600;
    }
    .bk-slot-price {
      min-width: 110px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      gap: 0.25rem;
      text-align: right;
    }
    .bk-slot-price-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .bk-slot-price-value {
      font-size: 1rem;
      font-weight: 800;
      color: #4f46e5;
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
    .bk-status-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .bk-inline-button {
      height: 2.2rem;
      padding: 0 0.95rem;
      font-size: 0.8rem;
    }
    .bk-status-stack {
      display: grid;
      gap: 0.65rem;
    }
    .bk-payment-panel {
      margin-top: 0.15rem;
      padding: 0.9rem 1rem;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: #fafbff;
    }
    .bk-payment-panel.accent {
      border-color: rgba(79,70,229,0.18);
      background: rgba(79,70,229,0.04);
    }
    .bk-payment-meta {
      display: grid;
      gap: 0.45rem;
    }
    .bk-payment-line {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
      font-size: 0.78rem;
      color: #64748b;
    }
    .bk-payment-line strong {
      color: #1e1b4b;
      font-size: 0.82rem;
    }
    .bk-payment-choices {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      margin-top: 0.85rem;
    }
    .bk-payment-choice {
      padding: 0.85rem 0.95rem;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: #fff;
      cursor: pointer;
      transition: border-color 0.18s, background 0.18s, transform 0.18s;
    }
    .bk-payment-choice:hover {
      transform: translateY(-1px);
      border-color: rgba(79,70,229,0.2);
    }
    .bk-payment-choice.selected {
      border-color: rgba(79,70,229,0.28);
      background: rgba(79,70,229,0.06);
    }
    .bk-payment-choice-title {
      margin: 0 0 0.2rem;
      font-size: 0.84rem;
      font-weight: 800;
      color: #1e1b4b;
    }
    .bk-payment-choice-copy {
      margin: 0;
      font-size: 0.76rem;
      color: #64748b;
      line-height: 1.5;
    }
    .bk-payment-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.85rem;
    }
    .bk-proof-preview {
      display: block;
      max-width: 100%;
      max-height: 180px;
      margin-top: 0.55rem;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: #fff;
      object-fit: cover;
    }
    @media (max-width: 760px) {
      .bk-grid-wide, .bk-summary-grid, .bk-payment-choices {
        grid-template-columns: 1fr;
      }
    }

    /* â”€â”€ Payment Modal â”€â”€ */
    @keyframes bkModalFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes bkModalSlideUp {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    .bk-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(8px);
      animation: bkModalFadeIn 0.18s ease both;
    }
    .bk-modal {
      width: min(100%, 480px);
      border-radius: 24px;
      background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
      border: 1px solid rgba(99,102,241,0.16);
      box-shadow: 0 32px 80px rgba(15,23,42,0.28);
      animation: bkModalSlideUp 0.24s cubic-bezier(0.22,1,0.36,1) both;
      overflow: hidden;
    }
    .bk-modal-head {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1.1rem 1.25rem;
      background: linear-gradient(135deg, rgba(79,70,229,0.07), rgba(129,140,248,0.04));
      border-bottom: 1px solid rgba(226,232,240,0.9);
    }
    .bk-modal-icon {
      width: 2.6rem;
      height: 2.6rem;
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #4338ca;
      background: linear-gradient(135deg, rgba(79,70,229,0.15), rgba(129,140,248,0.1));
      border: 1px solid rgba(79,70,229,0.12);
    }
    .bk-modal-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #1e1b4b;
      flex: 1;
    }
    .bk-modal-close {
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      border: 1.5px solid #e2e8f0;
      background: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #64748b;
      font-size: 1rem;
      transition: background 0.15s, color 0.15s;
      flex-shrink: 0;
    }
    .bk-modal-close:hover { background: #f1f5f9; color: #1e1b4b; }
    .bk-modal-body {
      padding: 1.15rem 1.25rem 1.35rem;
    }
    .bk-modal-info {
      display: grid;
      gap: 0.45rem;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: 1.5px solid rgba(79,70,229,0.14);
      background: rgba(79,70,229,0.04);
      margin-bottom: 1rem;
    }
    .bk-modal-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: #64748b;
      gap: 1rem;
    }
    .bk-modal-info-row strong { color: #1e1b4b; font-size: 0.84rem; }
    .bk-modal-choices {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.7rem;
      margin-bottom: 1rem;
    }
    .bk-modal-choice {
      padding: 0.85rem 0.95rem;
      border-radius: 14px;
      border: 2px solid #e2e8f0;
      background: #fff;
      cursor: pointer;
      transition: border-color 0.18s, background 0.18s, transform 0.16s;
      text-align: start;
    }
    .bk-modal-choice:hover { transform: translateY(-1px); border-color: rgba(79,70,229,0.22); }
    .bk-modal-choice.selected {
      border-color: rgba(79,70,229,0.55);
      background: rgba(79,70,229,0.06);
    }
    .bk-modal-choice-title {
      margin: 0 0 0.18rem;
      font-size: 0.88rem;
      font-weight: 800;
      color: #1e1b4b;
    }
    .bk-modal-choice-copy {
      margin: 0;
      font-size: 0.74rem;
      color: #64748b;
      line-height: 1.45;
    }
    .bk-modal-upload { margin-bottom: 0.9rem; }
    .bk-modal-proof {
      display: block;
      max-width: 100%;
      max-height: 160px;
      margin-top: 0.5rem;
      border-radius: 10px;
      border: 1.5px solid #e2e8f0;
      object-fit: cover;
    }
    .bk-modal-footer {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .bk-modal-footer .bk-button { flex: 1; justify-content: center; }
    @media (max-width: 640px) {
      .bk-modal-backdrop { padding: 1rem; }
      .bk-modal-choices { grid-template-columns: 1fr; }
      .bk-modal-footer { flex-direction: column; }
    }
  `

const emptyForm = {
  venueId: '',
  date: '',
  timeSlotId: '',
  venueAvailabilityId: '',
  startTime: '',
  endTime: '',
  guestsCount: '',
  venueServiceOptionIds: [],
  brideIdDocumentDataUrl: '',
  bridegroomIdDocumentDataUrl: '',
}

const PAYMENT_METHOD_CASH = 1
const PAYMENT_METHOD_CLIQ = 2

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

function formatPercentage(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'

  return Number.isInteger(amount) ? `${amount}%` : `${amount.toFixed(2)}%`
}

function formatDateTime(value) {
  if (!value) return '--'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getBookingStatusValue(booking) {
  const rawStatus = booking?.status
  return typeof rawStatus === 'string' ? rawStatus.toLowerCase() : 'pending'
}

function getPaymentMethodLabel(value) {
  return typeof value === 'string' && value.toLowerCase() === 'cliq' ? 'CliQ' : 'Cash'
}

function isBookingAtLeastTwoWeeksAway(value) {
  if (!value) return false

  const bookingDate = new Date(value)
  if (Number.isNaN(bookingDate.getTime())) return false

  const now = new Date()
  const bookingDateUtc = Date.UTC(
    bookingDate.getUTCFullYear(),
    bookingDate.getUTCMonth(),
    bookingDate.getUTCDate(),
  )
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const daysLeft = (bookingDateUtc - todayUtc) / (1000 * 60 * 60 * 24)

  return daysLeft >= 14
}

function canCancelBooking(booking) {
  const status = getBookingStatusValue(booking)
  return (status === 'pending' || status === 'confirmed') && isBookingAtLeastTwoWeeksAway(booking?.date)
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
  return 'FixedSlots'
}

function getPricingTypeLabel(value) {
  return 'Fixed slots'
}

function getVenuePricePerHour(venue) {
  return null
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
  const { f, direction } = useI18n()
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
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [venueAvailabilitySlots, setVenueAvailabilitySlots] = useState([])
  const [availabilityError, setAvailabilityError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [paymentDraft, setPaymentDraft] = useState({
    bookingId: null,
    paymentMethod: PAYMENT_METHOD_CASH,
    cliqTransferImageDataUrl: '',
    cliqTransferImageName: '',
  })
  const [paymentSubmittingId, setPaymentSubmittingId] = useState(null)
  const [paymentModalBooking, setPaymentModalBooking] = useState(null)
  const [modalError, setModalError] = useState('')
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })
  const appliedDraftIdRef = useRef(null)
  const { confirm, prompt } = useAppDialog()

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
      venueAvailabilityId: initialBookingDraft.venueAvailabilityId
        ? String(initialBookingDraft.venueAvailabilityId)
        : '',
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
    return venues.find((item) => String(item.id) === String(formValues.venueId)) ?? null
  }, [formValues.venueId, venues])

  const usesVenueAvailability = useMemo(() => {
    return selectedVenue ? getPricingTypeValue(selectedVenue) === 'FixedSlots' : false
  }, [selectedVenue])

  const availableTimeSlots = useMemo(() => {
    if (!selectedVenue || !formValues.date) {
      return []
    }

    return venueAvailabilitySlots
  }, [formValues.date, selectedVenue, venueAvailabilitySlots])

  const selectedTimeSlot = useMemo(() => {
    return (
      availableTimeSlots.find(
        (slot) => String(slot.id) === String(formValues.venueAvailabilityId),
      ) ?? null
    )
  }, [availableTimeSlots, formValues.venueAvailabilityId])

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
        venueAvailabilityId: '',
        venueServiceOptionIds: [],
      }))
      setServiceOptions([])
    }
  }, [filteredVenues, formValues.venueId])

  useEffect(() => {
    if (!selectedVenue?.id || !usesVenueAvailability || !formValues.date) {
      setVenueAvailabilitySlots([])
      setAvailabilityError('')
      setLoadingAvailability(false)
      return undefined
    }

    let isCancelled = false

    const loadVenueAvailability = async () => {
      setLoadingAvailability(true)
      setAvailabilityError('')

      try {
        const data = await getVenueAvailableSlots(selectedVenue.id, formValues.date)

        if (isCancelled) {
          return
        }

        setVenueAvailabilitySlots(getVenueAvailabilitySlots(data))
      } catch (error) {
        if (!isCancelled) {
          setVenueAvailabilitySlots([])
          setAvailabilityError(
            error instanceof Error ? error.message : 'Unable to load venue availability.',
          )
        }
      } finally {
        if (!isCancelled) {
          setLoadingAvailability(false)
        }
      }
    }

    loadVenueAvailability()

    return () => {
      isCancelled = true
    }
  }, [formValues.date, selectedVenue?.id, usesVenueAvailability])

  useEffect(() => {
    if (!availableTimeSlots.length) {
      if (formValues.venueAvailabilityId) {
        setFormValues((currentValues) => ({
          ...currentValues,
          venueAvailabilityId: '',
        }))
      }

      return
    }

    const selectedStillAvailable = availableTimeSlots.some(
      (slot) => String(slot.id) === String(formValues.venueAvailabilityId),
    )

    if (!selectedStillAvailable) {
      setFormValues((currentValues) => ({
        ...currentValues,
        venueAvailabilityId: '',
      }))
    }
  }, [availableTimeSlots, formValues.venueAvailabilityId])

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

  const updateBookingStatus = (bookingId, nextStatus) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: nextStatus,
            }
          : booking,
      ),
    )
  }

  const servicesTotal = useMemo(() => {
    return serviceOptions
      .filter((option) => formValues.venueServiceOptionIds.includes(option.id))
      .reduce((sum, option) => sum + Number(option.price || 0), 0)
  }, [formValues.venueServiceOptionIds, serviceOptions])

  const estimatedBasePrice = useMemo(() => {
    return selectedTimeSlot ? Number(selectedTimeSlot.price || 0) : null
  }, [selectedTimeSlot])

  const estimatedTotal =
    estimatedBasePrice === null ? null : estimatedBasePrice + servicesTotal

  const availabilitySummary = useMemo(() => {
    if (!selectedVenue || !usesVenueAvailability) {
      return null
    }

    if (!formValues.date) {
      return f('Choose a booking date to load the scheduled fixed slots for this venue.')
    }

    if (loadingAvailability) {
      return f('Loading the scheduled fixed slots for the selected date...')
    }

    if (availabilityError) {
      return availabilityError
    }

    if (availableTimeSlots.length === 0) {
      return f('No fixed slots are available on {date}.', {
        date: formatVenueDateLabel(formValues.date),
      })
    }

    return f('Available fixed slots on {date}: {count}', {
      date: formatVenueDateLabel(formValues.date),
      count: availableTimeSlots.length,
    })
  }, [
    availabilityError,
    availableTimeSlots.length,
    formValues.date,
    f,
    loadingAvailability,
    selectedVenue,
    usesVenueAvailability,
  ])

  const selectVenueSlot = (slotId) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      venueAvailabilityId: String(slotId),
    }))
  }

  const getBookingTimingValidationMessage = () => {
    if (!selectedVenue?.id) {
      return f('Choose a venue before submitting.')
    }

    if (!formValues.date) {
      return f('Choose a booking date before submitting.')
    }

    if (loadingAvailability) {
      return f('Loading the scheduled fixed slots for the selected date...')
    }

    if (availabilityError) {
      return availabilityError
    }

    if (availableTimeSlots.length === 0) {
      return f('This venue does not have any bookable fixed slots on the selected date.')
    }

    if (!selectedTimeSlot) {
      return f('Choose one of the available fixed slots before submitting.')
    }

    return null
  }

  const handleChange = ({ target: { name, value } }) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
      ...(name === 'venueId' || name === 'date'
        ? {
            venueAvailabilityId: '',
          }
        : {}),
    }))
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
    setVenueAvailabilitySlots([])
    setAvailabilityError('')
    setLoadingAvailability(false)
  }

  const resetPaymentDraft = () => {
    setPaymentDraft({
      bookingId: null,
      paymentMethod: PAYMENT_METHOD_CASH,
      cliqTransferImageDataUrl: '',
      cliqTransferImageName: '',
    })
  }

  const createBooking = async (event) => {
    event.preventDefault()

    const timingValidationMessage = getBookingTimingValidationMessage()

    if (timingValidationMessage) {
      setFeedback({
        tone: 'error',
        message: timingValidationMessage,
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
          venueAvailabilityId: Number(selectedTimeSlot.id),
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
    let body

    if (decision === 'reject') {
      const reason = await prompt({
        tone: 'danger',
        title: 'Reject request',
        message: 'Enter rejection reason (optional):',
        description: 'Add a rejection reason if you want the requester to see more context.',
        inputLabel: 'Rejection Reason',
        placeholder: 'Type your note here...',
        confirmLabel: 'Reject',
        cancelLabel: 'Cancel',
      })

      if (reason === null) {
        return
      }

      body = { reason }
    }

    setBusyId(bookingId)

    try {
      await apiRequest(`/api/owner/bookings/${bookingId}/${decision}`, {
        method: 'POST',
        token: session?.token,
        ...(body ? { body } : {}),
      })

      updateBookingStatus(bookingId, decision === 'approve' ? 'Confirmed' : 'Rejected')
      setFeedback({
        tone: 'idle',
        message: `Booking #${bookingId} ${decision === 'approve' ? 'approved' : 'rejected'}.`,
      })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to update booking.',
      })
    } finally {
      setBusyId(null)
    }
  }

  const cancelBooking = async (bookingId) => {
    const isConfirmed = await confirm({
      tone: 'danger',
      title: 'Confirm booking cancellation',
      message: 'Cancel this booking?',
      description: 'Your booking will be marked as cancelled immediately after confirmation.',
      confirmLabel: 'Yes, cancel booking',
      cancelLabel: 'Keep booking',
    })

    if (!isConfirmed) {
      return
    }

    setBusyId(bookingId)

    try {
      const result = await apiRequest(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        token: session?.token,
      })

      updateBookingStatus(bookingId, 'Cancelled')
      setFeedback({
        tone: 'idle',
        message:
          typeof result === 'string' && result
            ? result
            : `Booking #${bookingId} cancelled successfully.`,
      })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to update booking.',
      })
    } finally {
      setBusyId(null)
    }
  }

  const handlePaymentProofChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setPaymentDraft((currentDraft) => ({
        ...currentDraft,
        cliqTransferImageDataUrl: '',
        cliqTransferImageName: '',
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        tone: 'error',
        message: 'CliQ transfer image must be 5 MB or smaller.',
      })
      event.target.value = ''
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)

      setPaymentDraft((currentDraft) => ({
        ...currentDraft,
        cliqTransferImageDataUrl: dataUrl,
        cliqTransferImageName: file.name,
      }))
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to read the selected file.',
      })
    }
  }

  const submitPayment = async (booking) => {
    if (!booking?.id) return

    setModalError('')

    if (
      paymentDraft.paymentMethod === PAYMENT_METHOD_CLIQ &&
      !paymentDraft.cliqTransferImageDataUrl
    ) {
      setModalError('Upload a CliQ transfer image before submitting the payment.')
      return
    }

    setPaymentSubmittingId(booking.id)

    try {
      const response = await apiRequest('/api/payments/pay', {
        method: 'POST',
        token: session?.token,
        body: {
          bookingId: booking.id,
          paymentMethod: paymentDraft.paymentMethod,
          ...(paymentDraft.paymentMethod === PAYMENT_METHOD_CLIQ
            ? { cliqTransferImageDataUrl: paymentDraft.cliqTransferImageDataUrl }
            : {}),
        },
      })

      // CliQ => Paid, Cash => Pending Payment
      const nextStatus =
        paymentDraft.paymentMethod === PAYMENT_METHOD_CLIQ ? 'Paid' : 'Pending Payment'

      setFeedback({
        tone: 'idle',
        message:
          typeof response === 'string' && response
            ? response
            : paymentDraft.paymentMethod === PAYMENT_METHOD_CASH
              ? `Cash payment selected for booking #${booking.id}. Please complete the payment within 24 hours.`
              : `CliQ payment submitted for booking #${booking.id}.`,
      })
      updateBookingStatus(booking.id, nextStatus)
      setPaymentModalBooking(null)
      setModalError('')
      resetPaymentDraft()
      await loadBookings()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to submit the payment.'
      console.error('[Payment]', msg, error)
      setModalError(msg)
    } finally {
      setPaymentSubmittingId(null)
    }
  }

  const openPaymentModal = (booking) => {
    setModalError('')
    setPaymentModalBooking(booking)
    setPaymentDraft({
      bookingId: booking.id,
      paymentMethod: PAYMENT_METHOD_CASH,
      cliqTransferImageDataUrl: '',
      cliqTransferImageName: '',
    })
  }

  const closePaymentModal = () => {
    setModalError('')
    setPaymentModalBooking(null)
    resetPaymentDraft()
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
                {' Â· '}
                Pricing model: <strong>{getPricingTypeLabel(getPricingTypeValue(selectedVenue))}</strong>
                {selectedTimeSlot ? (
                  <>
                    {' Â· '}Selected slot: <strong>{formatVenueTimeSlot(selectedTimeSlot)}</strong>
                    {' Â· '}Slot price: <strong>{formatCurrency(selectedTimeSlot.price)}</strong>
                  </>
                ) : getVenuePricePerHour(selectedVenue) ? (
                  <>
                    {' Â· '}Base rate: <strong>{formatCurrency(selectedVenue.pricePerHour)} / hour</strong>
                  </>
                ) : null}
              </div>

              {availabilitySummary ? <div className="bk-note">{availabilitySummary}</div> : null}

              {availableTimeSlots.length > 0 ? (
                <div style={{ marginTop: '1rem' }}>
                  <label className="bk-label">{f('Available Fixed Slots')}</label>
                  <div className="bk-slot-list">
                    {availableTimeSlots.map((slot) => {
                      const selected = String(formValues.venueAvailabilityId) === String(slot.id)
                      const slotDateLabel = formatVenueDateLabel(slot.date || formValues.date)

                      return (
                        <label key={slot.id} className={`bk-slot-card${selected ? ' selected' : ''}`}>
                          <div className="bk-slot-main">
                            <input
                              type="radio"
                              name="venueAvailabilityId"
                              checked={selected}
                              onChange={() => selectVenueSlot(slot.id)}
                            />
                            <div className="bk-slot-content">
                              <div className="bk-slot-badges">
                                <span className="bk-slot-badge">{slotDateLabel}</span>
                                <span className="bk-slot-badge">{f('Scheduled slot')}</span>
                              </div>
                              <p className="bk-option-title">{formatVenueTimeSlot(slot)}</p>
                              <div className="bk-slot-meta">
                                <span className="bk-slot-meta-item">{f('Start Time')}: {slot.startTime}</span>
                                <span className="bk-slot-meta-item">{f('End Time')}: {slot.endTime}</span>
                              </div>
                              <p className="bk-option-copy">
                                {f('Fixed booking slot prepared by the venue owner for this exact date.')}
                              </p>
                            </div>
                          </div>
                          <div className="bk-slot-price">
                            <span className="bk-slot-price-label">{f('Slot price')}</span>
                            <span className="bk-slot-price-value">{formatCurrency(slot.price)}</span>
                          </div>
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
                    {estimatedBasePrice === null ? f('Choose a slot') : formatCurrency(estimatedBasePrice)}
                  </span>
                </div>
                <div className="bk-summary-card">
                  <span className="bk-summary-label">Add-ons</span>
                  <span className="bk-summary-value">{formatCurrency(servicesTotal)}</span>
                </div>
                <div className="bk-summary-card">
                  <span className="bk-summary-label">Estimated Total</span>
                  <span className="bk-summary-value">
                    {estimatedTotal === null ? f('Calculated after slot selection') : formatCurrency(estimatedTotal)}
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
          <p className="bk-label-row">Status / Actions</p>
        </div>

        {filteredBookings.length === 0 ? (
          loading ? (
            <div className="bk-empty">Loading bookings...</div>
          ) : (
            <div className="bk-empty">No bookings found.</div>
          )
        ) : (
          filteredBookings.map((booking) => {
            const status = getBookingStatusValue(booking)
            const showCancelAction = isUser && canCancelBooking(booking)
            const payment = booking.payment
            const paymentFormOpen = paymentDraft.bookingId === booking.id
            const depositAmount = Number(booking.depositAmount)
            const hasDeposit = Number.isFinite(depositAmount) && depositAmount > 0
            // Show Pay Now for confirmed bookings that haven't been paid yet
            const showPayButton = isUser && (booking.canPay || (status === 'confirmed' && !payment))

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
                  {hasDeposit ? (
                    <p className="bk-copy" style={{ marginTop: '0.3rem' }}>
                      Deposit {formatPercentage(booking.depositPercentage)} -{' '}
                      {formatCurrency(booking.depositAmount)}
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
                    <div className="bk-status-stack">
                      <div className="bk-status-actions">
                        <span className={`bk-badge ${status.replace(/\s+/g, '-')}`}>{booking.status}</span>
                        {showPayButton ? (
                          <button
                            className="bk-button secondary bk-inline-button"
                            onClick={() => openPaymentModal(booking)}
                            disabled={paymentSubmittingId === booking.id}
                          >
                            Pay now
                          </button>
                        ) : null}
                        {showCancelAction ? (
                          <button
                            className="bk-button danger bk-inline-button"
                            onClick={() => cancelBooking(booking.id)}
                            disabled={busyId === booking.id || paymentSubmittingId === booking.id}
                          >
                            {busyId === booking.id ? 'Cancelling...' : 'Cancel booking'}
                          </button>
                        ) : null}
                      </div>

                      {payment ? (
                        <div className="bk-payment-panel">
                          <div className="bk-payment-meta">
                            <div className="bk-payment-line">
                              <span>Payment method</span>
                              <strong>{getPaymentMethodLabel(payment.paymentMethod)}</strong>
                            </div>
                            <div className="bk-payment-line">
                              <span>Payment status</span>
                              <strong>{payment.status || '--'}</strong>
                            </div>
                            <div className="bk-payment-line">
                              <span>Deposit amount</span>
                              <strong>{formatCurrency(payment.amount)}</strong>
                            </div>
                            {payment.paidAt ? (
                              <div className="bk-payment-line">
                                <span>Submitted at</span>
                                <strong>{formatDateTime(payment.paidAt)}</strong>
                              </div>
                            ) : null}
                          </div>

                          {payment.cliqTransferImageDataUrl ? (
                            <div className="bk-doc-links">
                              <a
                                className="bk-link"
                                href={payment.cliqTransferImageDataUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View CliQ proof
                              </a>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {paymentModalBooking ? (
        <div
          className="bk-modal-backdrop"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closePaymentModal() }}
        >
          <div className="bk-modal" dir={direction}>
            <div className="bk-modal-head">
              <div className="bk-modal-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <p className="bk-modal-title">Confirm Payment</p>
              <button type="button" className="bk-modal-close" onClick={closePaymentModal} aria-label="Close">âœ•</button>
            </div>
            <div className="bk-modal-body">
              {/* Compute deposit: use backend value if present, otherwise 10% of total */}
              {(() => {
                const total = Number(paymentModalBooking.totalPrice) || 0
                const backendDeposit = Number(paymentModalBooking.depositAmount)
                const backendPct = Number(paymentModalBooking.depositPercentage)
                const depositAmt = backendDeposit > 0 ? backendDeposit : total * 0.10
                const depositPct = backendPct > 0 ? backendPct : (total > 0 ? 10 : 0)

                return (
                  <div className="bk-modal-info">
                    <div className="bk-modal-info-row">
                      <span>Total booking price</span>
                      <strong>{formatCurrency(total)}</strong>
                    </div>
                    <div className="bk-modal-info-row">
                      <span>Required deposit (10%)</span>
                      <strong style={{ color: '#4f46e5' }}>
                        {formatCurrency(depositAmt)}
                        {depositPct > 0 ? ` — ${formatPercentage(depositPct)}` : ''}
                      </strong>
                    </div>
                    <div className="bk-modal-info-row">
                      <span>Allowed methods</span>
                      <strong>Cash or CliQ only</strong>
                    </div>
                  </div>
                )
              })()}
              <div className="bk-modal-choices">
                <button
                  type="button"
                  className={`bk-modal-choice${paymentDraft.paymentMethod === PAYMENT_METHOD_CASH ? ' selected' : ''}`}
                  onClick={() => setPaymentDraft((d) => ({ ...d, paymentMethod: PAYMENT_METHOD_CASH, cliqTransferImageDataUrl: '', cliqTransferImageName: '' }))}
                >
                  <p className="bk-modal-choice-title">Cash</p>
                  <p className="bk-modal-choice-copy">Pay in person at the venue. Status will be set to pending payment.</p>
                </button>
                <button
                  type="button"
                  className={`bk-modal-choice${paymentDraft.paymentMethod === PAYMENT_METHOD_CLIQ ? ' selected' : ''}`}
                  onClick={() => setPaymentDraft((d) => ({ ...d, paymentMethod: PAYMENT_METHOD_CLIQ }))}
                >
                  <p className="bk-modal-choice-title">CliQ</p>
                  <p className="bk-modal-choice-copy">Upload the transfer image before submitting.</p>
                </button>
              </div>
              {paymentDraft.paymentMethod === PAYMENT_METHOD_CASH ? (
                <div className="bk-note" style={{ marginBottom: '0.85rem', fontSize: '0.78rem' }}>
                  ⚠ If the cash payment is not completed within 24 hours, your booking will be automatically cancelled.
                </div>
              ) : null}
              {paymentDraft.paymentMethod === PAYMENT_METHOD_CLIQ ? (
                <div className="bk-modal-upload">
                  <label className="bk-label">CliQ Transfer Image</label>
                  <input className="bk-input" type="file" accept="image/*" onChange={handlePaymentProofChange} required />
                  {paymentDraft.cliqTransferImageName ? (
                    <span className="bk-file-meta">{paymentDraft.cliqTransferImageName}</span>
                  ) : null}
                  {paymentDraft.cliqTransferImageDataUrl ? (
                    <img className="bk-modal-proof" src={paymentDraft.cliqTransferImageDataUrl} alt="CliQ proof preview" />
                  ) : null}
                </div>
              ) : null}
              <div className="bk-modal-footer" style={{ flexDirection: 'column', gap: '0.6rem' }}>
                {modalError ? (
                  <div style={{
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    background: 'rgba(244,63,94,0.08)',
                    border: '1.5px solid rgba(244,63,94,0.22)',
                    color: '#be123c',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    ⚠ {modalError}
                  </div>
                ) : null}
                <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
                  <button
                    className="bk-button"
                    type="button"
                    style={{ flex: 1 }}
                    onClick={() => submitPayment(paymentModalBooking)}
                    disabled={paymentSubmittingId === paymentModalBooking.id}
                  >
                    {paymentSubmittingId === paymentModalBooking.id ? 'Submitting...' : 'Submit payment'}
                  </button>
                  <button
                    className="bk-button secondary"
                    type="button"
                    style={{ flex: 1 }}
                    onClick={closePaymentModal}
                    disabled={paymentSubmittingId === paymentModalBooking.id}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Bookings
