const COVER_KEYS = [
  'coverPhotoDataUrl',
  'CoverPhotoDataUrl',
  'coverPhotoUrl',
  'CoverPhotoUrl',
  'coverPhoto',
  'CoverPhoto',
  'coverImageUrl',
  'CoverImageUrl',
  'primaryImageUrl',
  'PrimaryImageUrl',
  'mainImageUrl',
  'MainImageUrl',
  'imageUrl',
  'ImageUrl',
  'thumbnailUrl',
  'ThumbnailUrl',
]

const COLLECTION_KEYS = [
  'galleryPhotoDataUrls',
  'GalleryPhotoDataUrls',
  'galleryPhotos',
  'GalleryPhotos',
  'photoDataUrls',
  'PhotoDataUrls',
  'photos',
  'Photos',
  'imageUrls',
  'ImageUrls',
  'images',
  'Images',
  'venuePhotos',
  'VenuePhotos',
  'venueImages',
  'VenueImages',
]

function readValue(source, ...keys) {
  for (const key of keys) {
    const value = source?.[key]

    if (value !== undefined && value !== null) {
      return value
    }
  }

  return undefined
}

function normalizePhotoString(value) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue || null
}

function normalizePhotoItem(item) {
  if (!item) {
    return null
  }

  if (typeof item === 'string') {
    return normalizePhotoString(item)
  }

  if (typeof item === 'object') {
    return normalizePhotoString(
      readValue(
        item,
        'url',
        'Url',
        'src',
        'Src',
        'dataUrl',
        'DataUrl',
        'photoUrl',
        'PhotoUrl',
        'imageUrl',
        'ImageUrl',
      ),
    )
  }

  return null
}

function normalizePhotoCollection(value) {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizePhotoItem(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    const normalizedValue = normalizePhotoString(value)

    if (!normalizedValue) {
      return []
    }

    try {
      const parsedValue = JSON.parse(normalizedValue)
      return normalizePhotoCollection(parsedValue)
    } catch {
      return [normalizedValue]
    }
  }

  if (typeof value === 'object') {
    const nestedCollection = readValue(value, 'items', 'Items', 'photos', 'Photos', 'images', 'Images')

    if (nestedCollection !== undefined) {
      return normalizePhotoCollection(nestedCollection)
    }
  }

  return []
}

function dedupePhotoUrls(photoUrls) {
  return photoUrls.filter((photoUrl, index) => photoUrls.indexOf(photoUrl) === index)
}

export function getVenuePhotoSet(source) {
  const coverPhotoUrl = normalizePhotoItem(readValue(source, ...COVER_KEYS))
  const collectionPhotoUrls = COLLECTION_KEYS.flatMap((key) =>
    normalizePhotoCollection(source?.[key]),
  )
  const photoUrls = dedupePhotoUrls([
    ...(coverPhotoUrl ? [coverPhotoUrl] : []),
    ...collectionPhotoUrls,
  ])

  if (!coverPhotoUrl) {
    return {
      coverPhotoUrl: photoUrls[0] ?? '',
      galleryPhotoUrls: photoUrls.slice(1),
      photoUrls,
    }
  }

  return {
    coverPhotoUrl,
    galleryPhotoUrls: photoUrls.filter((photoUrl) => photoUrl !== coverPhotoUrl),
    photoUrls,
  }
}

