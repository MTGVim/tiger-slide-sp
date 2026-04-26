import { DEFAULT_IMAGE_SOURCE_ID, isValidImageSourceId } from './imageSources'

export const SOUND_MUTED_STORAGE_KEY = 'tiger-slide-sound-muted'
export const IMAGE_MODE_SETTINGS_STORAGE_KEY = 'tiger-slide-image-mode-settings'
export const RANDOM_EMPTY_TILE_STORAGE_KEY = 'tiger-slide-random-empty-tile'
export const IMAGE_PREVIEW_VISIBLE_STORAGE_KEY = 'tiger-slide-image-preview-visible'

export const DEFAULT_IMAGE_MODE_SETTINGS = {
  enabled: true,
  sourceId: DEFAULT_IMAGE_SOURCE_ID,
}

function getStorage(storage) {
  if (storage) return storage
  if (typeof window === 'undefined') return null
  return window.localStorage ?? null
}

export function readSoundMuted(storage) {
  const target = getStorage(storage)
  if (!target) return false

  try {
    return target.getItem(SOUND_MUTED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeSoundMuted(soundMuted, storage) {
  const target = getStorage(storage)
  if (!target) return soundMuted

  try {
    target.setItem(SOUND_MUTED_STORAGE_KEY, String(soundMuted))
  } catch {
    return soundMuted
  }

  return soundMuted
}

export function readRandomEmptyTileEnabled(storage) {
  const target = getStorage(storage)
  if (!target) return false

  try {
    return target.getItem(RANDOM_EMPTY_TILE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeRandomEmptyTileEnabled(enabled, storage) {
  const target = getStorage(storage)
  if (!target) return enabled

  try {
    target.setItem(RANDOM_EMPTY_TILE_STORAGE_KEY, String(enabled))
  } catch {
    return enabled
  }

  return enabled
}

export function readImagePreviewVisible(storage) {
  const target = getStorage(storage)
  if (!target) return true

  try {
    const value = target.getItem(IMAGE_PREVIEW_VISIBLE_STORAGE_KEY)
    return value === null ? true : value === 'true'
  } catch {
    return true
  }
}

export function writeImagePreviewVisible(visible, storage) {
  const target = getStorage(storage)
  if (!target) return visible

  try {
    target.setItem(IMAGE_PREVIEW_VISIBLE_STORAGE_KEY, String(visible))
  } catch {
    return visible
  }

  return visible
}

export function normalizeImageModeSettings(settings) {
  const enabled = settings?.enabled === true
  const sourceId = isValidImageSourceId(settings?.sourceId) ? settings.sourceId : DEFAULT_IMAGE_SOURCE_ID

  return { enabled, sourceId }
}

export function readImageModeSettings(storage) {
  const target = getStorage(storage)
  if (!target) return DEFAULT_IMAGE_MODE_SETTINGS

  try {
    const raw = target.getItem(IMAGE_MODE_SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_IMAGE_MODE_SETTINGS
    return normalizeImageModeSettings(JSON.parse(raw))
  } catch {
    return DEFAULT_IMAGE_MODE_SETTINGS
  }
}

export function writeImageModeSettings(settings, storage) {
  const normalized = normalizeImageModeSettings(settings)
  const target = getStorage(storage)
  if (!target) return normalized

  try {
    target.setItem(IMAGE_MODE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    return normalized
  }

  return normalized
}
