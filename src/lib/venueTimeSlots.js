function readValue(source, ...keys) {
  for (const key of keys) {
    const value = source?.[key]

    if (value !== undefined && value !== null) {
      return value
    }
  }

  return undefined
}

export function normalizeTimeValue(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  const [hoursValue, minutesValue] = trimmedValue.split(':')
  const hours = Number(hoursValue)
  const minutes = Number(minutesValue)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return trimmedValue.slice(0, 5)
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function normalizeTimeValueForApi(value) {
  const normalizedValue = normalizeTimeValue(value)

  return normalizedValue ? `${normalizedValue}:00` : ''
}

export function parseTimeToMinutes(value) {
  const normalizedValue = normalizeTimeValue(value)

  if (!normalizedValue) {
    return null
  }

  const [hours, minutes] = normalizedValue.split(':').map(Number)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null
  }

  return hours * 60 + minutes
}

export function formatTimeLabel(value) {
  return normalizeTimeValue(value) || '--'
}

export function formatVenueTimeSlot(slot) {
  return `${formatTimeLabel(slot?.startTime)} - ${formatTimeLabel(slot?.endTime)}`
}

export function normalizeVenueTimeSlot(slot) {
  const slotId = Number(readValue(slot, 'id', 'Id'))
  const price = Number(readValue(slot, 'price', 'Price'))

  return {
    id: Number.isInteger(slotId) && slotId > 0 ? slotId : null,
    startTime: normalizeTimeValue(String(readValue(slot, 'startTime', 'StartTime') ?? '')),
    endTime: normalizeTimeValue(String(readValue(slot, 'endTime', 'EndTime') ?? '')),
    price: Number.isFinite(price) ? price : 0,
    isActive: readValue(slot, 'isActive', 'IsActive') !== false,
  }
}

function sortVenueTimeSlots(leftSlot, rightSlot) {
  const leftStart = parseTimeToMinutes(leftSlot.startTime) ?? 0
  const rightStart = parseTimeToMinutes(rightSlot.startTime) ?? 0

  if (leftStart !== rightStart) {
    return leftStart - rightStart
  }

  const leftEnd = parseTimeToMinutes(leftSlot.endTime) ?? 0
  const rightEnd = parseTimeToMinutes(rightSlot.endTime) ?? 0

  return leftEnd - rightEnd
}

export function getVenueTimeSlots(source, { activeOnly = false } = {}) {
  const rawSlots = readValue(source, 'timeSlots', 'TimeSlots', 'time_slots', 'Time_Slots')

  if (!Array.isArray(rawSlots)) {
    return []
  }

  const normalizedSlots = rawSlots
    .map((slot) => normalizeVenueTimeSlot(slot))
    .filter((slot) => slot.startTime && slot.endTime)
    .sort(sortVenueTimeSlots)

  if (!activeOnly) {
    return normalizedSlots
  }

  return normalizedSlots.filter((slot) => slot.isActive)
}

function hasSlotContent(slot) {
  return Boolean(
    slot?.id ||
      normalizeTimeValue(String(slot?.startTime ?? '')) ||
      normalizeTimeValue(String(slot?.endTime ?? '')) ||
      String(slot?.price ?? '').trim(),
  )
}

export function buildVenueTimeSlotPayload(slots) {
  if (!Array.isArray(slots)) {
    return []
  }

  return slots
    .filter((slot) => hasSlotContent(slot))
    .map((slot) => {
      const slotId = Number(slot?.id)
      const price = Number(slot?.price)

      return {
        ...(Number.isInteger(slotId) && slotId > 0 ? { id: slotId } : {}),
        startTime: normalizeTimeValueForApi(String(slot?.startTime ?? '')),
        endTime: normalizeTimeValueForApi(String(slot?.endTime ?? '')),
        price: Number.isFinite(price) ? price : 0,
        isActive: slot?.isActive !== false,
      }
    })
    .sort(sortVenueTimeSlots)
}

export function validateVenueTimeSlots(slots) {
  const sourceSlots = Array.isArray(slots) ? slots.filter((slot) => hasSlotContent(slot)) : []
  const payload = buildVenueTimeSlotPayload(sourceSlots)
  const seenSlots = new Set()

  for (let index = 0; index < payload.length; index += 1) {
    const slot = payload[index]
    const sourceSlot = sourceSlots[index]

    if (!slot.startTime) {
      return 'Start time is required for every time slot.'
    }

    if (!slot.endTime) {
      return 'End time is required for every time slot.'
    }

    if (String(sourceSlot?.price ?? '').trim() === '') {
      return 'Price is required for every time slot.'
    }

    if (slot.price < 0) {
      return 'Time slot price must be greater than or equal to 0.'
    }

    const startMinutes = parseTimeToMinutes(slot.startTime)
    const endMinutes = parseTimeToMinutes(slot.endTime)

    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      return 'Time slot start time must be before the end time.'
    }

    const slotKey = `${slot.startTime}|${slot.endTime}`

    if (seenSlots.has(slotKey)) {
      return 'Duplicate time slots are not allowed for the same venue.'
    }

    seenSlots.add(slotKey)
  }

  return null
}

function serializeVenueTimeSlots(slots) {
  return JSON.stringify(
    buildVenueTimeSlotPayload(slots).map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: Number(slot.price).toFixed(2),
      isActive: slot.isActive,
    })),
  )
}

export function areVenueTimeSlotsEqual(currentSlots, requestedSlots) {
  return serializeVenueTimeSlots(currentSlots) === serializeVenueTimeSlots(requestedSlots)
}
