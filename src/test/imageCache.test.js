import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getRandomCachedImage, listCachedImages, saveCachedImage } from '../utils/imageCache.js'

describe('image cache utilities', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('tiger-slide-image-cache')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve()
    })
  })

  it('stores images per source and prunes to 10 newest entries', async () => {
    for (let index = 0; index < 12; index += 1) {
      await saveCachedImage('random-dog', new Blob([`dog-${index}`], { type: 'image/jpeg' }))
    }

    const cached = await listCachedImages('random-dog')
    expect(cached).toHaveLength(10)
    expect(cached.every((entry) => entry.sourceId === 'random-dog')).toBe(true)
    expect(cached.every((entry, index, all) => index === 0 || entry.createdAt >= all[index - 1].createdAt)).toBe(true)
  })

  it('does not prune entries from other sources', async () => {
    for (let index = 0; index < 12; index += 1) {
      await saveCachedImage('random-dog', new Blob([`dog-${index}`], { type: 'image/jpeg' }))
    }
    await saveCachedImage('random-fox', new Blob(['fox'], { type: 'image/jpeg' }))

    expect(await listCachedImages('random-dog')).toHaveLength(10)
    expect(await listCachedImages('random-fox')).toHaveLength(1)
  })

  it('returns one of the cached images for a source', async () => {
    await saveCachedImage('random-dog', new Blob(['a'], { type: 'image/jpeg' }))
    await saveCachedImage('random-dog', new Blob(['b'], { type: 'image/jpeg' }))

    const cached = await listCachedImages('random-dog')
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const selected = await getRandomCachedImage('random-dog')

    expect(selected.id).toBe(cached.at(-1).id)
  })
})
