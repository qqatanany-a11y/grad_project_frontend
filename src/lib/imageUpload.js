export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_MULTI_IMAGE_COUNT = 10

export function isSafeImageFile(file) {
  return Boolean(file && ALLOWED_IMAGE_TYPES.includes(file.type))
}

export function validateSafeImageFile(file, label = 'Image') {
  if (!file) {
    return `${label} is required.`
  }

  if (!isSafeImageFile(file)) {
    return `${label} must be a JPEG, PNG, or WebP image.`
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `${label} must be 5 MB or smaller.`
  }

  return ''
}

export function revokeObjectUrl(value) {
  if (typeof value === 'string' && value.startsWith('blob:')) {
    URL.revokeObjectURL(value)
  }
}
