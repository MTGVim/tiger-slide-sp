export const SOUND_MUTED_STORAGE_KEY = 'tiger-slide-sound-muted'

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
