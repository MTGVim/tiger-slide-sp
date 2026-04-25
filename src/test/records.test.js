import { beforeEach, describe, expect, it } from 'vitest'
import { RECORDS_STORAGE_KEY, readRecords, saveBestRecord } from '../utils/records.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    clear: () => values.clear(),
  }
}

describe('record utilities', () => {
  let storage

  beforeEach(() => {
    storage = createStorage()
  })

  it('returns empty records when storage is missing or corrupt', () => {
    expect(readRecords(storage)).toEqual({})
    storage.setItem(RECORDS_STORAGE_KEY, '{bad json')
    expect(readRecords(storage)).toEqual({})
  })

  it('creates a new record for a difficulty', () => {
    const result = saveBestRecord(3, { moves: 42, seconds: 120 }, storage)

    expect(result.updated).toBe(true)
    expect(readRecords(storage)[3]).toMatchObject({ moves: 42, seconds: 120 })
  })

  it('updates records with lower moves', () => {
    saveBestRecord(4, { moves: 80, seconds: 220 }, storage)
    const result = saveBestRecord(4, { moves: 70, seconds: 300 }, storage)

    expect(result.updated).toBe(true)
    expect(readRecords(storage)[4]).toMatchObject({ moves: 70, seconds: 300 })
  })

  it('updates equal moves only when time is lower', () => {
    saveBestRecord(5, { moves: 100, seconds: 240 }, storage)
    expect(saveBestRecord(5, { moves: 100, seconds: 260 }, storage).updated).toBe(false)
    expect(saveBestRecord(5, { moves: 100, seconds: 200 }, storage).updated).toBe(true)
    expect(readRecords(storage)[5]).toMatchObject({ moves: 100, seconds: 200 })
  })

  it('keeps records keyed per difficulty', () => {
    saveBestRecord(3, { moves: 30, seconds: 90 }, storage)
    saveBestRecord(4, { moves: 40, seconds: 120 }, storage)

    expect(Object.keys(readRecords(storage)).sort()).toEqual(['3', '4'])
  })
})
