const DB_NAME = 'tiger-slide-image-cache'
const DB_VERSION = 1
const STORE_NAME = 'images'
const MAX_IMAGES_PER_SOURCE = 10

function hasIndexedDb() {
  return typeof indexedDB !== 'undefined'
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('이미지 캐시 작업에 실패했어요.'))
  })
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('이미지 캐시 저장에 실패했어요.'))
    transaction.onerror = () => reject(transaction.error ?? new Error('이미지 캐시 저장에 실패했어요.'))
  })
}

async function openDb() {
  if (!hasIndexedDb()) return null

  const request = indexedDB.open(DB_NAME, DB_VERSION)
  request.onupgradeneeded = () => {
    const database = request.result
    if (database.objectStoreNames.contains(STORE_NAME)) return

    const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
    store.createIndex('sourceId', 'sourceId', { unique: false })
    store.createIndex('createdAt', 'createdAt', { unique: false })
  }

  return requestToPromise(request)
}

function createId(sourceId, createdAt) {
  return `${sourceId}-${createdAt}-${Math.random().toString(36).slice(2, 10)}`
}

export async function listCachedImages(sourceId) {
  const database = await openDb()
  if (!database) return []

  try {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('sourceId')
    const records = await requestToPromise(index.getAll(sourceId))
    await transactionDone(transaction)
    return records.sort((a, b) => a.createdAt - b.createdAt)
  } finally {
    database.close()
  }
}

export async function saveCachedImage(sourceId, blob, maxImagesPerSource = MAX_IMAGES_PER_SOURCE) {
  const database = await openDb()
  if (!database) return null

  try {
    const createdAt = Date.now()
    const record = {
      id: createId(sourceId, createdAt),
      sourceId,
      blob,
      createdAt,
      byteSize: blob.size,
    }

    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.put(record)
    await transactionDone(transaction)
    database.close()

    const records = await listCachedImages(sourceId)
    const overflow = records.slice(0, Math.max(0, records.length - maxImagesPerSource))
    if (overflow.length === 0) return record

    const pruneDatabase = await openDb()
    if (!pruneDatabase) return record

    try {
      const pruneTransaction = pruneDatabase.transaction(STORE_NAME, 'readwrite')
      const pruneStore = pruneTransaction.objectStore(STORE_NAME)
      for (const oldRecord of overflow) {
        pruneStore.delete(oldRecord.id)
      }
      await transactionDone(pruneTransaction)
      return record
    } finally {
      pruneDatabase.close()
    }
  } finally {
    database.close()
  }
}

export async function getRandomCachedImage(sourceId) {
  const records = await listCachedImages(sourceId)
  if (records.length === 0) return null
  return records[Math.floor(Math.random() * records.length)]
}
