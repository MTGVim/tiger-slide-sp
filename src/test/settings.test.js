import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_IMAGE_SOURCE_ID, IMAGE_SOURCES, getImageSource, isValidImageSourceId } from '../utils/imageSources.js'
import {
  IMAGE_MODE_SETTINGS_STORAGE_KEY,
  IMAGE_PREVIEW_VISIBLE_STORAGE_KEY,
  RANDOM_EMPTY_TILE_STORAGE_KEY,
  SOUND_MUTED_STORAGE_KEY,
  normalizeImageModeSettings,
  readImageModeSettings,
  readImagePreviewVisible,
  readRandomEmptyTileEnabled,
  readSoundMuted,
  writeImageModeSettings,
  writeImagePreviewVisible,
  writeRandomEmptyTileEnabled,
  writeSoundMuted,
} from '../utils/settings.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    clear: () => values.clear(),
  }
}

describe('settings utilities', () => {
  let storage

  beforeEach(() => {
    storage = createStorage()
  })

  it('returns sound on when storage is missing or unset', () => {
    expect(readSoundMuted()).toBe(false)
    expect(readSoundMuted(storage)).toBe(false)
  })

  it('reads persisted mute setting', () => {
    storage.setItem(SOUND_MUTED_STORAGE_KEY, 'true')

    expect(readSoundMuted(storage)).toBe(true)
  })

  it('writes mute setting as a localStorage value', () => {
    writeSoundMuted(true, storage)
    expect(storage.getItem(SOUND_MUTED_STORAGE_KEY)).toBe('true')

    writeSoundMuted(false, storage)
    expect(storage.getItem(SOUND_MUTED_STORAGE_KEY)).toBe('false')
  })

  it('returns fixed empty tile placement when random empty tile storage is missing or unset', () => {
    expect(readRandomEmptyTileEnabled()).toBe(false)
    expect(readRandomEmptyTileEnabled(storage)).toBe(false)
  })

  it('reads persisted random empty tile setting', () => {
    storage.setItem(RANDOM_EMPTY_TILE_STORAGE_KEY, 'true')

    expect(readRandomEmptyTileEnabled(storage)).toBe(true)
  })

  it('writes random empty tile setting as a localStorage value', () => {
    writeRandomEmptyTileEnabled(true, storage)
    expect(storage.getItem(RANDOM_EMPTY_TILE_STORAGE_KEY)).toBe('true')

    writeRandomEmptyTileEnabled(false, storage)
    expect(storage.getItem(RANDOM_EMPTY_TILE_STORAGE_KEY)).toBe('false')
  })

  it('returns image preview visible when storage is missing or unset', () => {
    expect(readImagePreviewVisible()).toBe(true)
    expect(readImagePreviewVisible(storage)).toBe(true)
  })

  it('reads persisted image preview visibility setting', () => {
    storage.setItem(IMAGE_PREVIEW_VISIBLE_STORAGE_KEY, 'false')
    expect(readImagePreviewVisible(storage)).toBe(false)

    storage.setItem(IMAGE_PREVIEW_VISIBLE_STORAGE_KEY, 'true')
    expect(readImagePreviewVisible(storage)).toBe(true)
  })

  it('writes image preview visibility setting as a localStorage value', () => {
    writeImagePreviewVisible(false, storage)
    expect(storage.getItem(IMAGE_PREVIEW_VISIBLE_STORAGE_KEY)).toBe('false')

    writeImagePreviewVisible(true, storage)
    expect(storage.getItem(IMAGE_PREVIEW_VISIBLE_STORAGE_KEY)).toBe('true')
  })

  it('keeps random image sources to the approved photo providers', () => {
    expect(IMAGE_SOURCES.map((source) => source.id)).toEqual([
      'dog-ceo',
      'random-fox',
      'loremflickr-cat',
      'random-dog',
    ])
    expect(DEFAULT_IMAGE_SOURCE_ID).toBe('random-dog')
    expect(IMAGE_SOURCES.every((source) => source.kind === 'photo')).toBe(true)
    expect(getImageSource('unknown').id).toBe(DEFAULT_IMAGE_SOURCE_ID)
    expect(isValidImageSourceId('robohash')).toBe(false)
    expect(isValidImageSourceId('dicebear')).toBe(false)
  })

  it('normalizes image mode settings', () => {
    expect(normalizeImageModeSettings({ enabled: true, sourceId: 'random-fox' })).toEqual({
      enabled: true,
      sourceId: 'random-fox',
    })
    expect(normalizeImageModeSettings({ enabled: 'true', sourceId: 'unknown' })).toEqual({
      enabled: false,
      sourceId: DEFAULT_IMAGE_SOURCE_ID,
    })
  })

  it('defaults image mode to dog2 enabled when storage is missing or unset', () => {
    expect(readImageModeSettings()).toEqual({ enabled: true, sourceId: 'random-dog' })
    expect(readImageModeSettings(storage)).toEqual({ enabled: true, sourceId: 'random-dog' })
  })

  it('reads persisted image mode settings', () => {
    storage.setItem(IMAGE_MODE_SETTINGS_STORAGE_KEY, JSON.stringify({ enabled: true, sourceId: 'loremflickr-cat' }))

    expect(readImageModeSettings(storage)).toEqual({ enabled: true, sourceId: 'loremflickr-cat' })
  })

  it('falls back to default image mode settings for invalid storage values', () => {
    storage.setItem(IMAGE_MODE_SETTINGS_STORAGE_KEY, '{broken')
    expect(readImageModeSettings(storage)).toEqual({ enabled: true, sourceId: DEFAULT_IMAGE_SOURCE_ID })

    storage.setItem(IMAGE_MODE_SETTINGS_STORAGE_KEY, JSON.stringify({ enabled: true, sourceId: 'unsafe-source' }))
    expect(readImageModeSettings(storage)).toEqual({ enabled: true, sourceId: DEFAULT_IMAGE_SOURCE_ID })
  })

  it('writes normalized image mode settings as localStorage JSON', () => {
    const normalized = writeImageModeSettings({ enabled: true, sourceId: 'loremflickr-cat' }, storage)

    expect(normalized).toEqual({ enabled: true, sourceId: 'loremflickr-cat' })
    expect(JSON.parse(storage.getItem(IMAGE_MODE_SETTINGS_STORAGE_KEY))).toEqual({
      enabled: true,
      sourceId: 'loremflickr-cat',
    })
  })
})
