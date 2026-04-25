import { beforeEach, describe, expect, it } from 'vitest'
import { SOUND_MUTED_STORAGE_KEY, readSoundMuted, writeSoundMuted } from '../utils/settings.js'

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
})
