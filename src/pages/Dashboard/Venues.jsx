import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppDialog } from '../../components/ui/AppDialogProvider'
import { apiRequest, resolveApiAssetUrl } from '../../lib/apiClient'
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_MULTI_IMAGE_COUNT,
  revokeObjectUrl,
  validateSafeImageFile,
} from '../../lib/imageUpload'
import { getVenuePhotoSet } from '../../lib/venueMedia'
import {
  formatVenueTimeSlot,
  normalizeTimeValue,
  normalizeVenueAvailabilitySlot,
} from '../../lib/venueTimeSlots'
import { useI18n } from '../../i18n/I18nProvider'
import { makeDashStyles } from './dashboardPageStyles'

const styles =
  makeDashStyles('vp') +
  `
    .vp-note {
      margin-top: 1rem;
      padding: 0.95rem 1rem;
      border-radius: 12px;
      border: 1.5px dashed rgba(79,70,229,0.18);
      background: rgba(79,70,229,0.04);
      color: #64748b;
      font-size: 0.85rem;
      line-height: 1.6;
    }
    .vp-slot-section {
      margin-top: 1rem;
      display: grid;
      gap: 0.9rem;
    }
    .vp-slot-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .vp-slot-list {
      display: grid;
      gap: 0.85rem;
    }
    .vp-slot-card {
      border: 1.5px solid #e2e8f0;
      background: linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
      border-radius: 18px;
      padding: 1rem;
      display: grid;
      gap: 0.85rem;
      box-shadow: 0 10px 28px rgba(79,70,229,0.08);
    }
    .vp-slot-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }
    .vp-slot-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .vp-slot-main {
      display: grid;
      gap: 0.22rem;
    }
    .vp-slot-time {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.02em;
    }
    .vp-slot-copy {
      margin: 0;
      font-size: 0.8rem;
      color: #64748b;
      line-height: 1.55;
    }
    .vp-slot-price {
      font-size: 0.96rem;
      font-weight: 900;
      color: #4338ca;
      white-space: nowrap;
    }
    .vp-slot-meta {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .vp-slot-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.28rem 0.7rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
      border: 1px solid rgba(79,70,229,0.16);
      background: rgba(79,70,229,0.08);
      color: #4f46e5;
    }
    .vp-slot-badge.booked {
      border-color: rgba(245,158,11,0.24);
      background: rgba(245,158,11,0.12);
      color: #b45309;
    }
    .vp-slot-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .vp-slot-remove,
    .vp-slot-submit {
      height: 2.75rem;
      padding: 0 1rem;
      border-radius: 12px;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    }
    .vp-slot-remove:hover,
    .vp-slot-submit:hover {
      transform: translateY(-1px);
    }
    .vp-slot-submit {
      border: none;
      background: linear-gradient(135deg, #4f46e5, #3730a3);
      color: #fff;
      box-shadow: 0 12px 24px rgba(79,70,229,0.22);
    }
    .vp-slot-submit:disabled,
    .vp-slot-remove:disabled {
      opacity: 0.6;
      cursor: wait;
      transform: none;
    }
    .vp-slot-remove {
      border: 1.5px solid rgba(244,63,94,0.22);
      background: rgba(244,63,94,0.08);
      color: #be123c;
    }
    .vp-slot-empty {
      padding: 1rem;
      border: 1.5px dashed rgba(79,70,229,0.18);
      background: rgba(79,70,229,0.03);
      border-radius: 12px;
      color: #64748b;
      font-size: 0.85rem;
    }
    .vp-slot-form-card {
      border: 1.5px solid rgba(79,70,229,0.14);
      background: linear-gradient(180deg, rgba(79,70,229,0.05), rgba(255,255,255,0.95));
      border-radius: 18px;
      padding: 1rem;
      display: grid;
      gap: 0.9rem;
    }
    .vp-slot-form-copy {
      margin: 0;
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.6;
    }
    .vp-day-picker {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 0.65rem;
    }
    .vp-day-chip {
      min-height: 2.8rem;
      padding: 0.7rem 0.85rem;
      border-radius: 12px;
      border: 1.5px solid #dbe3f1;
      background: #fff;
      color: #475569;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
    }
    .vp-day-chip:hover {
      transform: translateY(-1px);
      border-color: rgba(79,70,229,0.28);
    }
    .vp-day-chip.selected {
      border-color: rgba(79,70,229,0.45);
      background: rgba(79,70,229,0.08);
      color: #4338ca;
      box-shadow: inset 0 0 0 1px rgba(79,70,229,0.08);
    }
    .vp-slot-summary {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 700;
    }
    .vp-slot-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1150;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      background: rgba(15,23,42,0.46);
      backdrop-filter: blur(10px);
    }
    .vp-slot-modal {
      width: min(100%, 960px);
      max-height: calc(100vh - 2.5rem);
      display: grid;
      grid-template-rows: auto 1fr;
      overflow: hidden;
      border-radius: 28px;
      border: 1px solid rgba(99,102,241,0.16);
      background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
      box-shadow: 0 36px 90px rgba(15,23,42,0.28);
    }
    .vp-slot-modal-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.15rem 1.25rem;
      background:
        radial-gradient(circle at top right, rgba(244,63,94,0.08), transparent 42%),
        linear-gradient(135deg, rgba(79,70,229,0.08), rgba(244,63,94,0.04));
      border-bottom: 1px solid rgba(226,232,240,0.9);
    }
    .vp-slot-modal-title {
      margin: 0 0 0.25rem;
      font-size: 1.08rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #1e1b4b;
    }
    .vp-slot-modal-copy {
      margin: 0;
      font-size: 0.84rem;
      color: #64748b;
      line-height: 1.6;
    }
    .vp-slot-modal-close {
      width: 2.6rem;
      height: 2.6rem;
      border: 1.5px solid rgba(79,70,229,0.14);
      border-radius: 999px;
      background: rgba(255,255,255,0.9);
      color: #475569;
      cursor: pointer;
      font: inherit;
      font-size: 1.2rem;
      line-height: 1;
      transition: transform 0.18s ease, background 0.18s ease;
    }
    .vp-slot-modal-close:hover {
      background: #fff;
      transform: translateY(-1px);
    }
    .vp-slot-modal-body {
      padding: 1rem 1.25rem 1.25rem;
      overflow: auto;
      display: grid;
      gap: 1rem;
    }
    .vp-service-panel {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .vp-service-heading {
      margin: 0 0 0.35rem;
      font-size: 0.95rem;
      font-weight: 800;
      color: #1e1b4b;
    }
    .vp-service-copy {
      margin: 0 0 0.9rem;
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.6;
    }
    .vp-service-list {
      display: grid;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }
    .vp-service-item {
      display: flex;
      justify-content: space-between;
      gap: 0.9rem;
      align-items: center;
      padding: 0.9rem 1rem;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: #fafbff;
    }
    .vp-service-name {
      margin: 0 0 0.2rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: #1e1b4b;
    }
    .vp-service-desc {
      margin: 0;
      font-size: 0.78rem;
      color: #64748b;
      line-height: 1.55;
    }
    .vp-service-price {
      white-space: nowrap;
      font-size: 0.82rem;
      font-weight: 800;
      color: #4f46e5;
    }
    .vp-service-form {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) auto;
      gap: 0.75rem;
      align-items: end;
      margin-top: 1rem;
    }
    .vp-price-copy {
      margin-top: 0.5rem;
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.55;
    }
    .vp-card-media {
      margin: -1.5rem -1.5rem 1rem;
      height: 200px;
      overflow: hidden;
      background: linear-gradient(135deg, #e0e7ff, #fce7f3);
      border-radius: 16px 16px 0 0;
    }
    .vp-card-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .vp-photo-picker {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .vp-photo-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 0.85rem;
    }
    .vp-photo-count {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
    }
    .vp-photo-file-control {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .vp-photo-file-input {
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
    .vp-photo-file-button {
      min-height: 2.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 1.2rem;
      border: 1.5px solid rgba(79,70,229,0.22);
      border-radius: 12px;
      background: #fff;
      color: #4f46e5;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(79,70,229,0.08);
    }
    .vp-photo-file-note {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 700;
    }
    .vp-photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 0.85rem;
      margin-top: 0.9rem;
    }
    .vp-photo-card {
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      background: #fff;
    }
    .vp-photo-card.cover {
      border-color: rgba(79,70,229,0.35);
      box-shadow: 0 0 0 3px rgba(79,70,229,0.08);
    }
    .vp-photo-preview {
      width: 100%;
      height: 130px;
      object-fit: cover;
      display: block;
      background: #eef2ff;
    }
    .vp-photo-meta {
      padding: 0.75rem;
      display: grid;
      gap: 0.55rem;
    }
    .vp-photo-name {
      font-size: 0.76rem;
      color: #475569;
      line-height: 1.45;
      word-break: break-word;
    }
    .vp-photo-choice {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #1e1b4b;
    }
    .vp-photo-choice label {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
    }
    .vp-photo-remove {
      border: 1px solid rgba(244,63,94,0.2);
      background: rgba(244,63,94,0.07);
      color: #be123c;
      border-radius: 8px;
      font: inherit;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.35rem 0.55rem;
      cursor: pointer;
    }
    .vp-photo-remove:hover {
      background: rgba(244,63,94,0.12);
    }
    @media (max-width: 760px) {
      .vp-service-form {
        grid-template-columns: 1fr;
      }
      .vp-slot-grid {
        grid-template-columns: 1fr;
      }
      .vp-service-item {
        flex-direction: column;
        align-items: flex-start;
      }
      .vp-card-media {
        height: 170px;
      }
      .vp-slot-modal {
        width: 100%;
        max-height: calc(100vh - 2rem);
      }
      .vp-slot-modal-head,
      .vp-slot-modal-body {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `

const CATEGORY_OPTIONS = [
  { value: 'WeddingHall', label: 'Wedding Hall', apiValue: 1 },
  { value: 'Farm', label: 'Farm', apiValue: 2 },
]

const FIXED_PRICING_VALUE = 'FixedSlots'
const FIXED_PRICING_API_VALUE = 2

const emptyForm = {
  name: '',
  description: '',
  city: '',
  address: '',
  capacity: '',
  category: 'WeddingHall',
  isActive: true,
  photoItems: [],
  coverPhotoIndex: 0,
}

const defaultServiceForm = {
  serviceId: '',
  price: '',
}

const emptyAvailabilityForm = {
  dayOfWeekValues: [],
  startTime: '',
  endTime: '',
  price: '',
}

const RECURRING_SLOT_MONTHS = 12

function readValue(source, ...keys) {
  for (const key of keys) {
    const value = source?.[key]

    if (value !== undefined && value !== null) {
      return value
    }
  }

  return undefined
}

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'
  return `${amount.toFixed(2)} JOD`
}

function formatDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function buildRecurringDatesForDayOfWeek(dayOfWeek) {
  const normalizedDayOfWeek = Number(dayOfWeek)

  if (!Number.isInteger(normalizedDayOfWeek) || normalizedDayOfWeek < 0 || normalizedDayOfWeek > 6) {
    return []
  }

  const startDate = new Date()
  startDate.setHours(12, 0, 0, 0)

  const firstDate = new Date(startDate)
  const offset = (normalizedDayOfWeek - firstDate.getDay() + 7) % 7
  firstDate.setDate(firstDate.getDate() + offset)

  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + RECURRING_SLOT_MONTHS)

  const recurringDates = []

  for (
    const currentDate = new Date(firstDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 7)
  ) {
    recurringDates.push(formatDateInputValue(currentDate))
  }

  return recurringDates
}

function getDayOfWeekValueFromDate(value) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${String(value).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.getDay()
}

function buildAvailabilityPatternKey(slot) {
  const dayOfWeekValue = getDayOfWeekValueFromDate(slot?.date)

  if (dayOfWeekValue === null) {
    return ''
  }

  return [
    dayOfWeekValue,
    normalizeTimeValue(String(slot?.startTime ?? '')),
    normalizeTimeValue(String(slot?.endTime ?? '')),
    Number(slot?.price ?? 0).toFixed(2),
  ].join('|')
}

function sortAvailabilitySlots(leftSlot, rightSlot) {
  const leftDate = String(leftSlot?.date ?? '').slice(0, 10)
  const rightDate = String(rightSlot?.date ?? '').slice(0, 10)

  if (leftDate !== rightDate) {
    return leftDate.localeCompare(rightDate)
  }

  const leftStart = normalizeTimeValue(String(leftSlot?.startTime ?? ''))
  const rightStart = normalizeTimeValue(String(rightSlot?.startTime ?? ''))

  if (leftStart !== rightStart) {
    return leftStart.localeCompare(rightStart)
  }

  const leftEnd = normalizeTimeValue(String(leftSlot?.endTime ?? ''))
  const rightEnd = normalizeTimeValue(String(rightSlot?.endTime ?? ''))

  return leftEnd.localeCompare(rightEnd)
}

function normalizeAvailabilitySlotList(slots) {
  if (!Array.isArray(slots)) {
    return []
  }

  return slots
    .map((slot) => normalizeVenueAvailabilitySlot(slot))
    .filter((slot) => slot.id && slot.date && slot.startTime && slot.endTime)
    .sort(sortAvailabilitySlots)
}

function getVenueCategoryValue(venue) {
  const rawValue = readValue(venue, 'category', 'Category')

  if (rawValue === 2 || rawValue === 'Farm') {
    return 'Farm'
  }

  return 'WeddingHall'
}

function getVenueCategoryLabel(value) {
  return value === 'Farm' || value === 2 ? 'Farm' : 'Wedding Hall'
}

function toVenueCategoryApiValue(value) {
  return value === 'Farm' ? 2 : 1
}

function getPricingTypeValue(venue) {
  return FIXED_PRICING_VALUE
}

function getPricingTypeLabel(value) {
  return 'Fixed Slots'
}

function toPricingTypeApiValue(value) {
  return FIXED_PRICING_API_VALUE
}

function getPricingSummary(venue) {
  return 'Fixed slot pricing'
}

function normalizeVenue(venue) {
  const { coverPhotoUrl, galleryPhotoUrls, photoUrls } = getVenuePhotoSet(venue)

  return {
    id: readValue(venue, 'id', 'Id') ?? null,
    name: readValue(venue, 'name', 'Name') ?? '',
    description: readValue(venue, 'description', 'Description') ?? '',
    city: readValue(venue, 'city', 'City') ?? '',
    address: readValue(venue, 'address', 'Address') ?? '',
    capacity: readValue(venue, 'capacity', 'Capacity') ?? 0,
    isActive: Boolean(readValue(venue, 'isActive', 'IsActive')),
    companyName: readValue(venue, 'companyName', 'CompanyName') ?? '',
    category: getVenueCategoryValue(venue),
    pricingType: getPricingTypeValue(venue),
    coverPhotoUrl,
    galleryPhotoUrls,
    photoUrls,
  }
}

function revokePhotoItems(photoItems) {
  if (!Array.isArray(photoItems)) {
    return
  }

  photoItems.forEach((photoItem) => revokeObjectUrl(photoItem?.previewUrl))
}

function normalizeService(service) {
  return {
    id: readValue(service, 'id', 'Id') ?? null,
    name: readValue(service, 'name', 'Name') ?? '',
    description: readValue(service, 'description', 'Description') ?? '',
  }
}

function normalizeVenueServiceOption(option) {
  return {
    id: readValue(option, 'id', 'Id') ?? null,
    serviceId: readValue(option, 'serviceId', 'ServiceId') ?? null,
    serviceName:
      readValue(option, 'serviceName', 'ServiceName') ??
      readValue(option, 'name', 'Name') ??
      '',
    description: readValue(option, 'description', 'Description') ?? '',
    price: Number(readValue(option, 'price', 'Price') ?? 0),
    isActive: Boolean(readValue(option, 'isActive', 'IsActive')),
  }
}

function Venues({ session }) {
  const { confirm } = useAppDialog()
  const { direction, f, language } = useI18n()
  const [venues, setVenues] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })
  const [companyId, setCompanyId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formValues, setFormValues] = useState(emptyForm)
  const [serviceCatalog, setServiceCatalog] = useState([])
  const [serviceOptionsByVenue, setServiceOptionsByVenue] = useState({})
  const [serviceForms, setServiceForms] = useState({})
  const [expandedServiceVenueId, setExpandedServiceVenueId] = useState(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [loadingServiceVenueId, setLoadingServiceVenueId] = useState(null)
  const [savingServiceVenueId, setSavingServiceVenueId] = useState(null)
  const [processingPhotos, setProcessingPhotos] = useState(false)
  const [slotManagerVenue, setSlotManagerVenue] = useState(null)
  const [venueAvailabilityByVenue, setVenueAvailabilityByVenue] = useState({})
  const [loadingAvailabilityVenueId, setLoadingAvailabilityVenueId] = useState(null)
  const [savingAvailabilityVenueId, setSavingAvailabilityVenueId] = useState(null)
  const [availabilityFormValues, setAvailabilityFormValues] = useState(emptyAvailabilityForm)
  const [availabilityError, setAvailabilityError] = useState('')

  const isOwner = session?.role === 'Owner'
  const isAdmin = session?.role === 'Admin'

  const loadVenues = async () => {
    setLoading(true)

    try {
      if (isOwner) {
        const ownerInfo = await apiRequest('/api/owner/me', {
          token: session?.token,
        })

        const nextCompanyId = Number(ownerInfo?.companyId ?? ownerInfo?.CompanyId)

        if (!Number.isFinite(nextCompanyId) || nextCompanyId <= 0) {
          setCompanyId(null)
          setVenues([])
          setFeedback({
            tone: 'error',
            message: 'Owner business information is missing from the backend response.',
          })
          setLoading(false)
          return
        }

        setCompanyId(nextCompanyId)

        const data = await apiRequest(`/api/Venues/VienuesByCompanyId/${nextCompanyId}`, {
          token: session?.token,
        })

        setVenues(Array.isArray(data) ? data.map(normalizeVenue) : [])
      } else if (isAdmin) {
        const data = await apiRequest('/api/admin/venues', {
          token: session?.token,
        })

        setVenues(Array.isArray(data) ? data.map(normalizeVenue) : [])
      } else {
        const data = await apiRequest('/api/Venues/all')
        setVenues(Array.isArray(data) ? data.map(normalizeVenue) : [])
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

  const loadServicesCatalog = async () => {
    if (!isOwner) {
      return
    }

    setCatalogLoading(true)

    try {
      const data = await apiRequest('/api/services', {
        token: session?.token,
      })

      setServiceCatalog(Array.isArray(data) ? data.map(normalizeService) : [])
    } catch (error) {
      setServiceCatalog([])
      setFeedback({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to load the add-on services catalog.',
      })
    } finally {
      setCatalogLoading(false)
    }
  }

  useEffect(() => {
    loadVenues()
  }, [session?.role, session?.token])

  useEffect(() => {
    if (isOwner) {
      loadServicesCatalog()
    }
  }, [session?.role, session?.token])

  useEffect(() => {
    if (!slotManagerVenue) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !savingAvailabilityVenueId) {
        setSlotManagerVenue(null)
        setAvailabilityError('')
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [savingAvailabilityVenueId, slotManagerVenue])

  const resetAvailabilityForm = (dayOfWeekValues = []) => {
    setAvailabilityFormValues({
      ...emptyAvailabilityForm,
      dayOfWeekValues,
    })
  }

  const loadVenueAvailability = async (venueId) => {
    setLoadingAvailabilityVenueId(venueId)

    try {
      const data = await apiRequest(`/api/venue-availabilities/owner/${venueId}`, {
        token: session?.token,
      })

      const nextSlots = normalizeAvailabilitySlotList(data)
      setVenueAvailabilityByVenue((currentMap) => ({
        ...currentMap,
        [venueId]: nextSlots,
      }))

      return nextSlots
    } finally {
      setLoadingAvailabilityVenueId(null)
    }
  }

  const openSlotManager = async (venue) => {
    setSlotManagerVenue(venue)
    setAvailabilityError('')
    resetAvailabilityForm()

    try {
      await loadVenueAvailability(venue.id)
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : f('Unable to load fixed slots for this venue.'),
      )
    }
  }

  const activeVenueAvailabilitySlots = useMemo(() => {
    if (!slotManagerVenue?.id) {
      return []
    }

    return venueAvailabilityByVenue[slotManagerVenue.id] ?? []
  }, [slotManagerVenue, venueAvailabilityByVenue])

  const weekdayOptions = useMemo(() => {
    const locale = language === 'ar' ? 'ar-JO' : 'en-GB'

    return Array.from({ length: 7 }, (_, dayOfWeek) => ({
      value: String(dayOfWeek),
      label: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
        new Date(Date.UTC(2024, 0, 7 + dayOfWeek)),
      ),
    }))
  }, [language])

  const activeVenueAvailabilityPatterns = useMemo(() => {
    const weekdayLabelByValue = new Map(weekdayOptions.map((option) => [option.value, option.label]))
    const patternMap = new Map()

    activeVenueAvailabilitySlots.forEach((slot) => {
      if (slot.isBooked) {
        return
      }

      const dayOfWeekValue = getDayOfWeekValueFromDate(slot.date)
      const patternKey = buildAvailabilityPatternKey(slot)

      if (dayOfWeekValue === null || !patternKey) {
        return
      }

      if (!patternMap.has(patternKey)) {
        patternMap.set(patternKey, {
          key: patternKey,
          dayOfWeekValue,
          dayLabel: weekdayLabelByValue.get(String(dayOfWeekValue)) ?? '--',
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.price,
          slotIds: [],
        })
      }

      patternMap.get(patternKey).slotIds.push(slot.id)
    })

    return Array.from(patternMap.values()).sort((leftPattern, rightPattern) => {
      if (leftPattern.dayOfWeekValue !== rightPattern.dayOfWeekValue) {
        return leftPattern.dayOfWeekValue - rightPattern.dayOfWeekValue
      }

      if (leftPattern.startTime !== rightPattern.startTime) {
        return leftPattern.startTime.localeCompare(rightPattern.startTime)
      }

      return leftPattern.endTime.localeCompare(rightPattern.endTime)
    })
  }, [activeVenueAvailabilitySlots, weekdayOptions])

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
    revokePhotoItems(formValues.photoItems)
    setFormValues(emptyForm)
    setEditId(null)
    setShowForm(false)
  }

  const handleChange = ({ target: { name, value } }) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  const startEdit = (venue) => {
    revokePhotoItems(formValues.photoItems)
    const photoItems = Array.isArray(venue.photoUrls)
      ? venue.photoUrls.map((photoUrl, index) => ({
          id: `existing-${venue.id ?? 'venue'}-${index}`,
          name: `Venue photo ${index + 1}`,
          previewUrl: resolveApiAssetUrl(photoUrl),
          existingUrl: photoUrl,
          file: null,
        }))
      : []
    const coverPhotoIndex = Math.max(
      0,
      photoItems.findIndex((item) => item.existingUrl === venue.coverPhotoUrl),
    )

    setEditId(venue.id)
    setFormValues({
      name: venue.name ?? '',
      description: venue.description ?? '',
      city: venue.city ?? '',
      address: venue.address ?? '',
      capacity: String(venue.capacity ?? ''),
      category: getVenueCategoryValue(venue),
      isActive: Boolean(venue.isActive),
      photoItems,
      coverPhotoIndex,
    })
    setShowForm(true)
  }

  const handleAvailabilityChange = ({ target: { name, value } }) => {
    setAvailabilityError('')
    setAvailabilityFormValues((currentValues) => ({
      ...currentValues,
      [name]: name === 'startTime' || name === 'endTime' ? normalizeTimeValue(value) : value,
    }))
  }

  const handleAvailabilityDayToggle = (dayOfWeekValue) => {
    setAvailabilityError('')
    setAvailabilityFormValues((currentValues) => {
      const currentDayValues = Array.isArray(currentValues.dayOfWeekValues)
        ? currentValues.dayOfWeekValues
        : []
      const selected = currentDayValues.includes(dayOfWeekValue)

      return {
        ...currentValues,
        dayOfWeekValues: selected
          ? currentDayValues.filter((value) => value !== dayOfWeekValue)
          : [...currentDayValues, dayOfWeekValue],
      }
    })
  }

  const addVenueAvailability = async () => {
    if (!slotManagerVenue?.id) {
      return
    }

    const nextDayOfWeekValues = Array.isArray(availabilityFormValues.dayOfWeekValues)
      ? availabilityFormValues.dayOfWeekValues.map((value) => String(value).trim()).filter(Boolean)
      : []
    const nextStartTime = normalizeTimeValue(String(availabilityFormValues.startTime ?? ''))
    const nextEndTime = normalizeTimeValue(String(availabilityFormValues.endTime ?? ''))
    const nextPrice = Number(availabilityFormValues.price)
    const recurringDates = Array.from(
      new Set(nextDayOfWeekValues.flatMap((dayOfWeek) => buildRecurringDatesForDayOfWeek(dayOfWeek))),
    )

    if (nextDayOfWeekValues.length === 0 || recurringDates.length === 0) {
      setAvailabilityError(f('Choose at least one slot day first.'))
      return
    }

    if (!nextStartTime || !nextEndTime) {
      setAvailabilityError(f('Choose both the start and end time for the slot.'))
      return
    }

    if (nextEndTime <= nextStartTime) {
      setAvailabilityError(f('End time must be after start time.'))
      return
    }

    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      setAvailabilityError(f('Enter a valid slot price greater than zero.'))
      return
    }

    const existingSlotKeys = new Set(
      activeVenueAvailabilitySlots.map(
        (slot) => `${slot.date}|${slot.startTime}|${slot.endTime}`,
      ),
    )
    const datesToCreate = recurringDates.filter(
      (date) => !existingSlotKeys.has(`${date}|${nextStartTime}|${nextEndTime}`),
    )

    if (datesToCreate.length === 0) {
      setAvailabilityError(
        f('This fixed slot already exists.'),
      )
      return
    }

    setSavingAvailabilityVenueId(slotManagerVenue.id)

    try {
      const results = await Promise.allSettled(
        datesToCreate.map((date) =>
          apiRequest('/api/venue-availabilities', {
            method: 'POST',
            token: session?.token,
            body: {
              venueId: Number(slotManagerVenue.id),
              date,
              startTime: `${nextStartTime}:00`,
              endTime: `${nextEndTime}:00`,
              price: nextPrice,
            },
          }),
        ),
      )

      const createdSlots = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => normalizeVenueAvailabilitySlot(result.value))
        .filter((slot) => slot.id && slot.date && slot.startTime && slot.endTime)

      if (createdSlots.length === 0) {
        const firstRejectedResult = results.find((result) => result.status === 'rejected')
        throw firstRejectedResult?.reason ?? new Error(f('Unable to add the fixed slot.'))
      }

      const nextSlots = normalizeAvailabilitySlotList([
        ...activeVenueAvailabilitySlots,
        ...createdSlots,
      ])

      setVenueAvailabilityByVenue((currentMap) => ({
        ...currentMap,
        [slotManagerVenue.id]: nextSlots,
      }))
      resetAvailabilityForm(nextDayOfWeekValues)
      setAvailabilityError('')
      setFeedback({
        tone: 'idle',
        message: f('Fixed slot added successfully.'),
      })
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : f('Unable to add the fixed slot.'),
      )
    } finally {
      setSavingAvailabilityVenueId(null)
    }
  }

  const deleteVenueAvailabilityPattern = async (pattern) => {
    if (!slotManagerVenue?.id) {
      return
    }

    const isConfirmed = await confirm({
      title: f('Delete fixed slot'),
      message: f('Remove the {day} slot from {time}?', {
        day: pattern.dayLabel,
        time: formatVenueTimeSlot(pattern),
      }),
      description: f('This action deletes the slot from future booking availability for users.'),
      confirmLabel: f('Delete'),
      cancelLabel: f('Cancel'),
      tone: 'danger',
    })

    if (!isConfirmed) {
      return
    }

    setSavingAvailabilityVenueId(slotManagerVenue.id)

    try {
      const results = await Promise.allSettled(
        pattern.slotIds.map((slotId) =>
          apiRequest(`/api/venue-availabilities/${slotId}`, {
            method: 'DELETE',
            token: session?.token,
          }),
        ),
      )
      const deletedSlotIds = results
        .map((result, index) => (result.status === 'fulfilled' ? pattern.slotIds[index] : null))
        .filter((slotId) => slotId !== null)

      if (deletedSlotIds.length === 0) {
        const firstRejectedResult = results.find((result) => result.status === 'rejected')
        throw firstRejectedResult?.reason ?? new Error(f('Unable to delete the fixed slot.'))
      }

      setVenueAvailabilityByVenue((currentMap) => ({
        ...currentMap,
        [slotManagerVenue.id]: (currentMap[slotManagerVenue.id] ?? []).filter(
          (currentSlot) => !deletedSlotIds.includes(currentSlot.id),
        ),
      }))
      setAvailabilityError('')
      setFeedback({
        tone: 'idle',
        message: f('Fixed slot deleted successfully.'),
      })
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : f('Unable to delete the fixed slot.'),
      )
    } finally {
      setSavingAvailabilityVenueId(null)
    }
  }

  const handlePhotoSelection = async (event) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (files.length === 0) {
      return
    }

    const nextTotalCount = formValues.photoItems.length + files.length
    if (nextTotalCount > MAX_MULTI_IMAGE_COUNT) {
      setFeedback({
        tone: 'error',
        message: `A maximum of ${MAX_MULTI_IMAGE_COUNT} venue photos is allowed.`,
      })
      return
    }

    for (const file of files) {
      const validationMessage = validateSafeImageFile(file, 'Each venue photo')
      if (validationMessage) {
        setFeedback({
          tone: 'error',
          message: validationMessage,
        })
        return
      }
    }

    setProcessingPhotos(true)

    try {
      const nextPhotoItems = files.map((file, index) => ({
          id: `${Date.now()}-${index}-${file.name}`,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
          existingUrl: '',
          file,
        }))

      setFormValues((currentValues) => ({
        ...currentValues,
        photoItems: [...currentValues.photoItems, ...nextPhotoItems],
      }))
    } catch (error) {
      setFeedback({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to process the selected venue images.',
      })
    } finally {
      setProcessingPhotos(false)
    }
  }

  const removePhotoItem = (photoIndex) => {
    setFormValues((currentValues) => {
      revokeObjectUrl(currentValues.photoItems[photoIndex]?.previewUrl)
      const nextPhotoItems = currentValues.photoItems.filter((_, index) => index !== photoIndex)
      let nextCoverPhotoIndex = currentValues.coverPhotoIndex

      if (nextPhotoItems.length === 0) {
        nextCoverPhotoIndex = 0
      } else if (photoIndex < currentValues.coverPhotoIndex) {
        nextCoverPhotoIndex -= 1
      } else if (photoIndex === currentValues.coverPhotoIndex) {
        nextCoverPhotoIndex = 0
      }

      return {
        ...currentValues,
        photoItems: nextPhotoItems,
        coverPhotoIndex: Math.max(0, Math.min(nextCoverPhotoIndex, nextPhotoItems.length - 1)),
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isOwner || !companyId) {
      return
    }

    const capacity = Number(formValues.capacity)

    if (!Number.isFinite(capacity) || capacity <= 0) {
      setFeedback({
        tone: 'error',
        message: 'Enter a valid capacity before submitting the venue request.',
      })
      return
    }

    const photoItems = formValues.photoItems.filter(Boolean)
    const hasPhotoSelection = photoItems.length > 0

    if (photoItems.length > MAX_MULTI_IMAGE_COUNT) {
      setFeedback({
        tone: 'error',
        message: `A maximum of ${MAX_MULTI_IMAGE_COUNT} venue photos is allowed.`,
      })
      return
    }

    if (!editId && photoItems.length < 10) {
      setFeedback({
        tone: 'error',
        message: 'Add at least 10 venue photos before submitting a new venue request.',
      })
      return
    }

    if (hasPhotoSelection && !photoItems[formValues.coverPhotoIndex]) {
      setFeedback({
        tone: 'error',
        message: 'Choose a valid cover photo for the venue before submitting.',
      })
      return
    }

    const body = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      city: formValues.city.trim(),
      address: formValues.address.trim(),
      capacity,
      category: toVenueCategoryApiValue(formValues.category),
      pricingType: toPricingTypeApiValue(FIXED_PRICING_VALUE),
      pricePerHour: null,
      timeSlots: [],
    }

    let submissionBody = body
    let submissionPayload = body

    if (hasPhotoSelection) {
      const photoFiles = []
      const photoTokens = []
      let uploadIndex = 0
      const orderedPhotoReferences = photoItems.map((photoItem) => {
        if (!photoItem?.file) {
          return photoItem?.existingUrl ?? ''
        }

        const uploadToken = `__upload__:${uploadIndex}`
        uploadIndex += 1
        photoTokens.push(uploadToken)
        photoFiles.push(photoItem.file)
        return uploadToken
      })

      submissionBody = {
        ...body,
        imageUrls: orderedPhotoReferences,
        coverPhotoDataUrl: orderedPhotoReferences[formValues.coverPhotoIndex],
      }

      const formData = new FormData()
      formData.append('data', JSON.stringify(submissionBody))
      photoTokens.forEach((token) => formData.append('photoTokens', token))
      photoFiles.forEach((file) => formData.append('photoFiles', file))
      submissionPayload = formData
    }

    try {
      if (editId) {
        await apiRequest(`/api/owner/edit-requests/venue/${editId}`, {
          method: 'POST',
          token: session?.token,
          body:
            submissionPayload instanceof FormData
              ? (() => {
                  const formData = submissionPayload
                  const nextBody = {
                    ...submissionBody,
                    isActive: String(formValues.isActive) === 'true',
                  }
                  formData.set('data', JSON.stringify(nextBody))
                  return formData
                })()
              : {
                  ...submissionBody,
                  isActive: String(formValues.isActive) === 'true',
                },
        })
      } else {
        await apiRequest('/api/owner/edit-requests/venue-create', {
          method: 'POST',
          token: session?.token,
          body: submissionPayload,
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
    const isConfirmed = await confirm({
      tone: 'danger',
      title: 'Delete venue',
      message: 'Delete venue #{venueId}?',
      messageValues: { venueId },
      description: 'This venue will be removed from the dashboard immediately.',
      confirmLabel: 'Delete venue',
      cancelLabel: 'Keep venue',
    })

    if (!isConfirmed) {
      return
    }

    try {
      await apiRequest(`/api/Venues/venues/${venueId}`, {
        method: 'DELETE',
        token: session?.token,
      })

      setFeedback({ tone: 'idle', message: `Venue #${venueId} deleted.` })

      if (expandedServiceVenueId === venueId) {
        setExpandedServiceVenueId(null)
      }

      await loadVenues()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to delete venue.',
      })
    }
  }

  const loadVenueServiceOptions = async (venueId) => {
    setLoadingServiceVenueId(venueId)

    try {
      const data = await apiRequest(`/api/owner/venue-services/${venueId}`, {
        token: session?.token,
      })

      setServiceOptionsByVenue((currentOptions) => ({
        ...currentOptions,
        [venueId]: Array.isArray(data) ? data.map(normalizeVenueServiceOption) : [],
      }))
    } catch (error) {
      setFeedback({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to load venue add-ons for this venue.',
      })
      setServiceOptionsByVenue((currentOptions) => ({
        ...currentOptions,
        [venueId]: [],
      }))
    } finally {
      setLoadingServiceVenueId(null)
    }
  }

  const toggleVenueServices = async (venueId) => {
    const nextVenueId = expandedServiceVenueId === venueId ? null : venueId
    setExpandedServiceVenueId(nextVenueId)

    if (nextVenueId === null) {
      return
    }

    if (!serviceOptionsByVenue[venueId]) {
      await loadVenueServiceOptions(venueId)
    }
  }

  const updateServiceForm = (venueId, field, value) => {
    setServiceForms((currentForms) => ({
      ...currentForms,
      [venueId]: {
        ...defaultServiceForm,
        ...(currentForms[venueId] ?? {}),
        [field]: value,
      },
    }))
  }

  const addVenueServiceOption = async (venueId) => {
    const currentForm = {
      ...defaultServiceForm,
      ...(serviceForms[venueId] ?? {}),
    }

    const serviceId = Number(currentForm.serviceId)
    const price = Number(currentForm.price)

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      setFeedback({
        tone: 'error',
        message: 'Choose a service before adding a venue add-on.',
      })
      return
    }

    if (!Number.isFinite(price) || price < 0) {
      setFeedback({
        tone: 'error',
        message: 'Enter a valid add-on price before saving.',
      })
      return
    }

    setSavingServiceVenueId(venueId)

    try {
      await apiRequest('/api/owner/venue-services', {
        method: 'POST',
        token: session?.token,
        body: {
          venueId,
          serviceId,
          price,
        },
      })

      setFeedback({
        tone: 'idle',
        message: 'Venue add-on saved successfully.',
      })

      setServiceForms((currentForms) => ({
        ...currentForms,
        [venueId]: defaultServiceForm,
      }))

      await loadVenueServiceOptions(venueId)
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to save the venue add-on.',
      })
    } finally {
      setSavingServiceVenueId(null)
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
          placeholder="Search venues by name, city, address, or business..."
        />
        <button className="vp-button secondary" onClick={loadVenues} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        {isOwner ? (
          <button
            className="vp-button"
            onClick={() => {
              if (showForm) {
                resetForm()
                return
              }

              revokePhotoItems(formValues.photoItems)
              setEditId(null)
              setFormValues(emptyForm)
              setShowForm(true)
            }}
          >
            {showForm ? 'Cancel' : '+ Request Venue'}
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
              <label className="vp-label">Venue Type</label>
              <select
                className="vp-select"
                name="category"
                value={formValues.category}
                onChange={handleChange}
                required
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {editId ? (
              <div className="vp-field">
                <label className="vp-label">Active Status</label>
                <select
                  className="vp-select"
                  name="isActive"
                  value={String(formValues.isActive)}
                  onChange={handleChange}
                >
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

          <div className="vp-note">
            {f('Fixed slots are now the only booking model in the system. After the venue is approved, open the venue card and add dated slots from the fixed slots dialog using the date and time pickers.')}
          </div>

          <div className="vp-photo-picker">
            <div className="vp-photo-toolbar">
              <div>
                <label className="vp-label">Venue Photos</label>
                <div className="vp-photo-count">
                  {editId
                    ? f('Selected photos: {count}', { count: formValues.photoItems.length })
                    : f('Selected photos: {count}. Minimum required: 10.', { count: formValues.photoItems.length })}
                </div>
              </div>
              <label className="vp-photo-file-control">
                <input
                  className="vp-photo-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoSelection}
                  disabled={processingPhotos}
                />
                <span className="vp-photo-file-button">{f('Choose venue photos')}</span>
                <span className="vp-photo-file-note">
                  {formValues.photoItems.length > 0
                    ? f('{count} photos selected', { count: formValues.photoItems.length })
                    : f('No photos selected')}
                </span>
              </label>
            </div>

            <div className="vp-note" style={{ marginTop: 0 }}>
              Upload at least 10 venue photos for new halls. Choose one cover photo to appear in venue discovery,
              and the rest will appear inside View details.
            </div>

            {formValues.photoItems.length > 0 ? (
              <div className="vp-photo-grid">
                {formValues.photoItems.map((photoItem, index) => {
                  const isCover = index === formValues.coverPhotoIndex

                  return (
                    <div key={photoItem.id} className={`vp-photo-card${isCover ? ' cover' : ''}`}>
                      <img
                        src={photoItem.previewUrl}
                        alt={photoItem.name || `Venue photo ${index + 1}`}
                        className="vp-photo-preview"
                      />
                      <div className="vp-photo-meta">
                        <div className="vp-photo-name">{photoItem.name || `Venue photo ${index + 1}`}</div>
                        <div className="vp-photo-choice">
                          <label>
                            <input
                              type="radio"
                              name="venue-cover-photo"
                              checked={isCover}
                              onChange={() =>
                                setFormValues((currentValues) => ({
                                  ...currentValues,
                                  coverPhotoIndex: index,
                                }))
                              }
                            />
                            Cover photo
                          </label>
                          <button
                            type="button"
                            className="vp-photo-remove"
                            onClick={() => removePhotoItem(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className="vp-note">
            Optional add-ons such as catering, decoration, photography, or DJ can be configured
            from the venue card after the venue is approved.
          </div>

          <div className="vp-actions">
            <button className="vp-button" type="submit" disabled={processingPhotos}>
              {processingPhotos
                ? 'Processing Photos...'
                : editId
                  ? 'Submit Venue Edit Request'
                  : 'Submit Venue Request'}
            </button>
            <button className="vp-button secondary" type="button" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {filteredVenues.length === 0 ? (
        <div className="vp-empty">{loading ? 'Loading venues...' : 'No venues found.'}</div>
      ) : (
        <div className="vp-cards">
          {filteredVenues.map((venue) => {
            const configuredOptions = serviceOptionsByVenue[venue.id] ?? []
            const currentServiceForm = {
              ...defaultServiceForm,
              ...(serviceForms[venue.id] ?? {}),
            }
            const availableServices = serviceCatalog.filter(
              (service) =>
                !configuredOptions.some(
                  (option) => Number(option.serviceId) === Number(service.id),
                ),
            )
            const showAddOnPanel = expandedServiceVenueId === venue.id

            return (
              <article key={venue.id} className="vp-card">
                {venue.coverPhotoUrl ? (
                  <div className="vp-card-media">
                    <img src={resolveApiAssetUrl(venue.coverPhotoUrl)} alt={venue.name || 'Venue cover'} />
                  </div>
                ) : null}
                <p className="vp-card-title">{venue.name}</p>
                <p className="vp-card-copy">{venue.description || 'No description provided.'}</p>

                <div>
                  <span className={`vp-chip ${venue.isActive ? 'active' : 'inactive'}`}>
                    {venue.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="vp-chip">{getVenueCategoryLabel(venue.category)}</span>
                  <span className="vp-chip">{getPricingTypeLabel(venue.pricingType)}</span>
                  <span className="vp-chip">{venue.capacity ?? 0} guests</span>
                </div>

                <p className="vp-price-copy">{getPricingSummary(venue)}</p>
                <p className="vp-card-copy" style={{ marginTop: '0.5rem' }}>
                  {f('Fixed slots are booked by date and time only.')}
                </p>
                <p className="vp-card-copy" style={{ marginTop: '0.5rem' }}>
                  Address: {venue.address || '--'}
                </p>
                {venue.companyName ? (
                  <p className="vp-card-copy">Business: {venue.companyName}</p>
                ) : null}

                {isOwner ? (
                  <div className="vp-card-actions">
                    <button className="vp-button secondary" onClick={() => startEdit(venue)}>
                      Edit
                    </button>
                    <button className="vp-button secondary" onClick={() => openSlotManager(venue)}>
                      {f('Manage Fixed Slots')}
                    </button>
                    <button
                      className="vp-button secondary"
                      onClick={() => toggleVenueServices(venue.id)}
                    >
                      {showAddOnPanel ? 'Hide Add-ons' : 'Manage Add-ons'}
                    </button>
                    <button className="vp-button secondary" onClick={() => deleteVenue(venue.id)}>
                      Delete
                    </button>
                  </div>
                ) : null}

                {isOwner && showAddOnPanel ? (
                  <div className="vp-service-panel">
                    <p className="vp-service-heading">Venue Add-ons</p>
                    <p className="vp-service-copy">
                      Users can select these optional add-ons during booking, and each selected
                      service is added on top of the venue price.
                    </p>

                    {loadingServiceVenueId === venue.id ? (
                      <div className="vp-note">Loading configured add-ons...</div>
                    ) : configuredOptions.length > 0 ? (
                      <div className="vp-service-list">
                        {configuredOptions.map((option) => (
                          <div key={option.id} className="vp-service-item">
                            <div>
                              <p className="vp-service-name">{option.serviceName}</p>
                              <p className="vp-service-desc">
                                Optional venue add-on available at booking time.
                              </p>
                            </div>
                            <span className="vp-service-price">+ {formatCurrency(option.price)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="vp-note">
                        No add-ons are configured for this venue yet.
                      </div>
                    )}

                    <div className="vp-service-form">
                      <div className="vp-field">
                        <label className="vp-label">Service</label>
                        <select
                          className="vp-select"
                          value={currentServiceForm.serviceId}
                          onChange={(event) =>
                            updateServiceForm(venue.id, 'serviceId', event.target.value)
                          }
                          disabled={catalogLoading || availableServices.length === 0}
                        >
                          <option value="">
                            {catalogLoading ? 'Loading services...' : 'Select service'}
                          </option>
                          {availableServices.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="vp-field">
                        <label className="vp-label">Add-on Price (JOD)</label>
                        <input
                          className="vp-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={currentServiceForm.price}
                          onChange={(event) =>
                            updateServiceForm(venue.id, 'price', event.target.value)
                          }
                        />
                      </div>

                      <button
                        className="vp-button"
                        type="button"
                        onClick={() => addVenueServiceOption(venue.id)}
                        disabled={
                          savingServiceVenueId === venue.id ||
                          catalogLoading ||
                          availableServices.length === 0
                        }
                      >
                        {savingServiceVenueId === venue.id ? 'Saving...' : 'Add Add-on'}
                      </button>
                    </div>

                    {availableServices.length === 0 && !catalogLoading ? (
                      <div className="vp-note">
                        All available services are already configured for this venue.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}

      {slotManagerVenue && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="vp-slot-modal-backdrop"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget && !savingAvailabilityVenueId) {
                  setSlotManagerVenue(null)
                  setAvailabilityError('')
                }
              }}
            >
          <div className="vp-slot-modal" dir={direction}>
            <div className="vp-slot-modal-head">
              <div>
                <p className="vp-slot-modal-title">Manage Fixed Slots</p>
                <p className="vp-slot-modal-copy">
                  {f('Add fixed booking slots for {venue} using the day and time.', {
                    venue: slotManagerVenue.name || f('this venue'),
                  })}
                </p>
              </div>
              <button
                type="button"
                className="vp-slot-modal-close"
                onClick={() => {
                  setSlotManagerVenue(null)
                  setAvailabilityError('')
                }}
                disabled={Boolean(savingAvailabilityVenueId)}
                aria-label={f('Close')}
              >
                ×
              </button>
            </div>

            <div className="vp-slot-modal-body">
              <div className="vp-slot-form-card">
                <div>
                  <label className="vp-label">Fixed Slots</label>
                  <p className="vp-slot-form-copy">
                    {f('Choose the days, then set the same time and price for each one.')}
                  </p>
                </div>

                <div className="vp-slot-grid">
                  <div className="vp-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="vp-label">{f('Days')}</label>
                    <div className="vp-day-picker">
                      {weekdayOptions.map((option) => {
                        const selected = availabilityFormValues.dayOfWeekValues.includes(option.value)

                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`vp-day-chip${selected ? ' selected' : ''}`}
                            onClick={() => handleAvailabilityDayToggle(option.value)}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="vp-field">
                    <label className="vp-label">Price (JOD)</label>
                    <input
                      className="vp-input"
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      value={availabilityFormValues.price}
                      onChange={handleAvailabilityChange}
                    />
                  </div>

                  <div className="vp-field">
                    <label className="vp-label">Start Time</label>
                    <input
                      className="vp-input"
                      type="time"
                      name="startTime"
                      value={availabilityFormValues.startTime}
                      onChange={handleAvailabilityChange}
                    />
                  </div>

                  <div className="vp-field">
                    <label className="vp-label">End Time</label>
                    <input
                      className="vp-input"
                      type="time"
                      name="endTime"
                      value={availabilityFormValues.endTime}
                      onChange={handleAvailabilityChange}
                    />
                  </div>
                </div>

                {availabilityError ? (
                  <div className="vp-status error" style={{ marginBottom: 0 }}>
                    {availabilityError}
                  </div>
                ) : null}

                <div className="vp-slot-actions">
                  <button
                    type="button"
                    className="vp-slot-submit"
                    onClick={addVenueAvailability}
                    disabled={savingAvailabilityVenueId === slotManagerVenue.id}
                  >
                    {savingAvailabilityVenueId === slotManagerVenue.id ? f('Saving...') : f('+ Add Fixed Slot')}
                  </button>
                </div>
              </div>

              <div className="vp-slot-toolbar">
                <div>
                  <label className="vp-label">{f('Configured Fixed Slots')}</label>
                  <div className="vp-slot-summary">
                    {f('Configured fixed slots for this venue: {count}', {
                      count: activeVenueAvailabilityPatterns.length,
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  className="vp-button secondary"
                  onClick={() => openSlotManager(slotManagerVenue)}
                  disabled={loadingAvailabilityVenueId === slotManagerVenue.id}
                >
                  {loadingAvailabilityVenueId === slotManagerVenue.id ? f('Refreshing...') : f('Refresh')}
                </button>
              </div>

              {loadingAvailabilityVenueId === slotManagerVenue.id ? (
                <div className="vp-note">{f('Loading fixed slots...')}</div>
              ) : activeVenueAvailabilityPatterns.length > 0 ? (
                <div className="vp-slot-list">
                  {activeVenueAvailabilityPatterns.map((pattern) => (
                    <div key={pattern.key} className="vp-slot-card">
                      <div className="vp-slot-card-top">
                        <div className="vp-slot-main">
                          <p className="vp-slot-time">{formatVenueTimeSlot(pattern)}</p>
                          <p className="vp-slot-copy">{pattern.dayLabel}</p>
                        </div>
                        <span className="vp-slot-price">{formatCurrency(pattern.price)}</span>
                      </div>

                      <div className="vp-slot-actions">
                        <button
                          type="button"
                          className="vp-slot-remove"
                          onClick={() => deleteVenueAvailabilityPattern(pattern)}
                          disabled={savingAvailabilityVenueId === slotManagerVenue.id}
                        >
                          {f('Remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="vp-slot-empty">
                  {f('No fixed slots added for this venue yet. Add the first one from the form above.')}
                </div>
              )}
            </div>
          </div>
        </div>,
            document.body
          )
        : null}
    </>
  )
}

export default Venues
