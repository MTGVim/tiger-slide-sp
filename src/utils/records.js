export const RECORDS_STORAGE_KEY = 'tiger-slide-best-records'

function getStorage(storage) {
  if (storage) return storage
  if (typeof window === 'undefined') return null
  return window.localStorage ?? null
}

export function readRecords(storage) {
  const target = getStorage(storage)
  if (!target) return {}

  try {
    const raw = target.getItem(RECORDS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function writeRecords(records, storage) {
  const target = getStorage(storage)
  if (!target) return records

  try {
    target.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records))
  } catch {
    return records
  }

  return records
}

export function isBetterRecord(current, candidate) {
  if (!current) return true
  if (candidate.moves < current.moves) return true
  return candidate.moves === current.moves && candidate.seconds < current.seconds
}

export function saveBestRecord(difficulty, result, storage) {
  const records = readRecords(storage)
  const current = records[difficulty]
  const candidate = {
    moves: result.moves,
    seconds: result.seconds,
    completedAt: result.completedAt ?? new Date().toISOString(),
  }

  if (!isBetterRecord(current, candidate)) {
    return { records, updated: false, record: current }
  }

  const nextRecords = {
    ...records,
    [difficulty]: candidate,
  }
  writeRecords(nextRecords, storage)

  return { records: nextRecords, updated: true, record: candidate }
}
