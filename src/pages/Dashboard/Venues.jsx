import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { getVenuePhotoSet } from '../../lib/venueMedia'
import {
  buildVenueTimeSlotPayload,
  getVenueTimeSlots,
  normalizeTimeValue,
  validateVenueTimeSlots,
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
      background: #fff;
      border-radius: 14px;
      padding: 1rem;
      display: grid;
      gap: 0.85rem;
    }
    .vp-slot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 160px auto;
      gap: 0.75rem;
      align-items: end;
    }
    .vp-slot-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 2.75rem;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .vp-slot-remove {
      height: 2.75rem;
      padding: 0 1rem;
      border-radius: 10px;
      border: 1.5px solid rgba(244,63,94,0.22);
      background: rgba(244,63,94,0.08);
      color: #be123c;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .vp-slot-empty {
      padding: 1rem;
      border: 1.5px dashed rgba(79,70,229,0.18);
      background: rgba(79,70,229,0.03);
      border-radius: 12px;
      color: #64748b;
      font-size: 0.85rem;
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
    }
  `

const CATEGORY_OPTIONS = [
  { value: 'WeddingHall', label: 'Wedding Hall', apiValue: 1 },
  { value: 'Farm', label: 'Farm', apiValue: 2 },
]

const PRICING_OPTIONS = [
  { value: 'Hourly', label: 'Hourly', apiValue: 1 },
  { value: 'FixedSlots', label: 'Fixed Slots', apiValue: 2 },
]

const emptyForm = {
  name: '',
  description: '',
  city: '',
  address: '',
  capacity: '',
  category: 'WeddingHall',
  pricingType: 'Hourly',
  pricePerHour: '',
  isActive: true,
  photoItems: [],
  coverPhotoIndex: 0,
  timeSlots: [],
}

const defaultServiceForm = {
  serviceId: '',
  price: '',
}

const MAX_VENUE_IMAGE_WIDTH = 1600
const MAX_VENUE_IMAGE_HEIGHT = 1200
const VENUE_IMAGE_QUALITY = 0.82
let nextTimeSlotKey = 0

function createTimeSlotFormValue(slot = {}) {
  nextTimeSlotKey += 1

  return {
    clientId: slot.clientId ?? `slot-${nextTimeSlotKey}`,
    id: slot.id ?? null,
    startTime: normalizeTimeValue(String(slot.startTime ?? '')),
    endTime: normalizeTimeValue(String(slot.endTime ?? '')),
    price:
      slot.price === null || slot.price === undefined || slot.price === ''
        ? ''
        : String(slot.price),
    isActive: slot.isActive !== false,
  }
}

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

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const widthRatio = MAX_VENUE_IMAGE_WIDTH / image.width
        const heightRatio = MAX_VENUE_IMAGE_HEIGHT / image.height
        const resizeRatio = Math.min(1, widthRatio, heightRatio)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * resizeRatio))
        canvas.height = Math.max(1, Math.round(image.height * resizeRatio))

        const context = canvas.getContext('2d')
        if (!context) {
          resolve(String(reader.result ?? ''))
          return
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', VENUE_IMAGE_QUALITY))
      }

      image.onerror = () => reject(new Error('Unable to process the selected venue image.'))
      image.src = String(reader.result ?? '')
    }

    reader.onerror = () => reject(new Error('Unable to read the selected venue image.'))
    reader.readAsDataURL(file)
  })
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
  const rawValue = readValue(venue, 'pricingType', 'PricingType')

  if (rawValue === 2 || rawValue === 'FixedSlots') {
    return 'FixedSlots'
  }

  return 'Hourly'
}

function getPricingTypeLabel(value) {
  return value === 'FixedSlots' || value === 2 ? 'Fixed Slots' : 'Hourly'
}

function toPricingTypeApiValue(value) {
  return value === 'FixedSlots' ? 2 : 1
}

function getPriceValue(source) {
  const rawValue = readValue(source, 'pricePerHour', 'PricePerHour')
  const amount = Number(rawValue)

  return Number.isFinite(amount) ? amount : null
}

function getPricingSummary(venue) {
  const pricingType = getPricingTypeValue(venue)
  const pricePerHour = getPriceValue(venue)

  if (pricingType === 'Hourly' && pricePerHour !== null) {
    return `${formatCurrency(pricePerHour)} / hour`
  }

  if (pricingType === 'FixedSlots' && pricePerHour !== null) {
    return `${formatCurrency(pricePerHour)} / slot`
  }

  return pricingType === 'FixedSlots' ? 'Fixed slot pricing' : 'Price shared during confirmation'
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
    pricePerHour: getPriceValue(venue),
    timeSlots: getVenueTimeSlots(venue),
    coverPhotoUrl,
    galleryPhotoUrls,
    photoUrls,
  }
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
  const { f } = useI18n()
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

  const handleChange = ({ target: { name, value } }) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  const startEdit = (venue) => {
    const photoItems = Array.isArray(venue.photoUrls)
      ? venue.photoUrls.map((photoUrl, index) => ({
          id: `existing-${venue.id ?? 'venue'}-${index}`,
          name: `Venue photo ${index + 1}`,
          dataUrl: photoUrl,
        }))
      : []
    const coverPhotoIndex = Math.max(0, photoItems.findIndex((item) => item.dataUrl === venue.coverPhotoUrl))

    setEditId(venue.id)
    setFormValues({
      name: venue.name ?? '',
      description: venue.description ?? '',
      city: venue.city ?? '',
      address: venue.address ?? '',
      capacity: String(venue.capacity ?? ''),
      category: getVenueCategoryValue(venue),
      pricingType: getPricingTypeValue(venue),
      pricePerHour: venue.pricePerHour === null ? '' : String(venue.pricePerHour),
      isActive: Boolean(venue.isActive),
      photoItems,
      coverPhotoIndex,
      timeSlots: getVenueTimeSlots(venue).map((slot) => createTimeSlotFormValue(slot)),
    })
    setShowForm(true)
  }

  const addTimeSlotRow = () => {
    setFormValues((currentValues) => ({
      ...currentValues,
      timeSlots: [...currentValues.timeSlots, createTimeSlotFormValue()],
    }))
  }

  const updateTimeSlot = (clientId, field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      timeSlots: currentValues.timeSlots.map((slot) =>
        slot.clientId === clientId
          ? {
              ...slot,
              [field]: field === 'isActive' ? value : value,
            }
          : slot,
      ),
    }))
  }

  const removeTimeSlot = (clientId) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      timeSlots: currentValues.timeSlots.filter((slot) => slot.clientId !== clientId),
    }))
  }

  const handlePhotoSelection = async (event) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (files.length === 0) {
      return
    }

    setProcessingPhotos(true)

    try {
      const nextPhotoItems = await Promise.all(
        files.map(async (file, index) => ({
          id: `${Date.now()}-${index}-${file.name}`,
          name: file.name,
          dataUrl: await readImageFileAsDataUrl(file),
        })),
      )

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
    const pricePerHour =
      formValues.pricePerHour.trim() === '' ? null : Number(formValues.pricePerHour)
    const timeSlots = buildVenueTimeSlotPayload(formValues.timeSlots)
    const slotValidationMessage = validateVenueTimeSlots(formValues.timeSlots)

    if (!Number.isFinite(capacity) || capacity <= 0) {
      setFeedback({
        tone: 'error',
        message: 'Enter a valid capacity before submitting the venue request.',
      })
      return
    }

    if (slotValidationMessage) {
      setFeedback({
        tone: 'error',
        message: slotValidationMessage,
      })
      return
    }

    if (
      formValues.pricingType === 'Hourly' &&
      timeSlots.length === 0 &&
      (pricePerHour === null || !Number.isFinite(pricePerHour) || pricePerHour <= 0)
    ) {
      setFeedback({
        tone: 'error',
        message: 'Enter a valid hourly price for hourly venues.',
      })
      return
    }

    if (pricePerHour !== null && (!Number.isFinite(pricePerHour) || pricePerHour < 0)) {
      setFeedback({
        tone: 'error',
        message: 'Enter a valid price before submitting the venue request.',
      })
      return
    }

    const photoUrls = formValues.photoItems
      .map((photoItem) => photoItem?.dataUrl)
      .filter(Boolean)
    const hasPhotoSelection = photoUrls.length > 0

    if (!editId && photoUrls.length < 10) {
      setFeedback({
        tone: 'error',
        message: 'Add at least 10 venue photos before submitting a new venue request.',
      })
      return
    }

    if (hasPhotoSelection && !photoUrls[formValues.coverPhotoIndex]) {
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
      pricingType: toPricingTypeApiValue(formValues.pricingType),
      pricePerHour,
      timeSlots,
    }

    if (hasPhotoSelection) {
      body.coverPhotoDataUrl = photoUrls[formValues.coverPhotoIndex]
      body.galleryPhotoDataUrls = photoUrls.filter(
        (_, index) => index !== formValues.coverPhotoIndex,
      )
      body.photoDataUrls = photoUrls
    }

    try {
      if (editId) {
        await apiRequest(`/api/owner/edit-requests/venue/${editId}`, {
          method: 'POST',
          token: session?.token,
          body: {
            ...body,
            isActive: String(formValues.isActive) === 'true',
          },
        })
      } else {
        await apiRequest('/api/owner/edit-requests/venue-create', {
          method: 'POST',
          token: session?.token,
          body,
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

            <div className="vp-field">
              <label className="vp-label">Pricing Model</label>
              <select
                className="vp-select"
                name="pricingType"
                value={formValues.pricingType}
                onChange={handleChange}
                required
              >
                {PRICING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="vp-field">
              <label className="vp-label">
                {formValues.pricingType === 'FixedSlots' ? 'Slot Price (JOD)' : 'Hourly Price (JOD)'}
              </label>
              <input
                className="vp-input"
                name="pricePerHour"
                type="number"
                min="0"
                step="0.01"
                value={formValues.pricePerHour}
                onChange={handleChange}
                required={formValues.pricingType === 'Hourly'}
              />
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

          <div className="vp-slot-section">
            <div className="vp-slot-toolbar">
              <div>
                <label className="vp-label">Time Slots</label>
                <div className="vp-photo-count">
                  Owner-defined booking slots override manual time entry for users.
                </div>
              </div>
              <button className="vp-button secondary" type="button" onClick={addTimeSlotRow}>
                + Add Slot
              </button>
            </div>

            {formValues.timeSlots.length > 0 ? (
              <div className="vp-slot-list">
                {formValues.timeSlots.map((slot) => (
                  <div key={slot.clientId} className="vp-slot-card">
                    <div className="vp-slot-grid">
                      <div className="vp-field">
                        <label className="vp-label">Start Time</label>
                        <input
                          className="vp-input"
                          type="time"
                          value={slot.startTime}
                          onChange={(event) => updateTimeSlot(slot.clientId, 'startTime', event.target.value)}
                        />
                      </div>

                      <div className="vp-field">
                        <label className="vp-label">End Time</label>
                        <input
                          className="vp-input"
                          type="time"
                          value={slot.endTime}
                          onChange={(event) => updateTimeSlot(slot.clientId, 'endTime', event.target.value)}
                        />
                      </div>

                      <div className="vp-field">
                        <label className="vp-label">Price (JOD)</label>
                        <input
                          className="vp-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={slot.price}
                          onChange={(event) => updateTimeSlot(slot.clientId, 'price', event.target.value)}
                        />
                      </div>

                      <label className="vp-slot-toggle">
                        <input
                          type="checkbox"
                          checked={slot.isActive}
                          onChange={(event) => updateTimeSlot(slot.clientId, 'isActive', event.target.checked)}
                        />
                        Active
                      </label>

                      <button
                        type="button"
                        className="vp-slot-remove"
                        onClick={() => removeTimeSlot(slot.clientId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vp-slot-empty">
                No time slots added yet. Leave this empty only if the venue should keep the manual booking fallback.
              </div>
            )}
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
                  accept="image/*"
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
                        src={photoItem.dataUrl}
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
                    <img src={venue.coverPhotoUrl} alt={venue.name || 'Venue cover'} />
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
    </>
  )
}

export default Venues
