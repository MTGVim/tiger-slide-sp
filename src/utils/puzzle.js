export const DIFFICULTIES = [
  { label: '쉬움', size: 3 },
  { label: '보통', size: 4 },
]

export function createSolvedTiles(size) {
  return Array.from({ length: size * size }, (_, index) => index)
}

export function getEmptyTile(size) {
  return size * size - 1
}

export function getRandomEmptyTile(size, rng = Math.random) {
  return Math.floor(rng() * size * size)
}

export function getNeighbors(index, size) {
  const row = Math.floor(index / size)
  const col = index % size
  const neighbors = []

  if (row > 0) neighbors.push(index - size)
  if (row < size - 1) neighbors.push(index + size)
  if (col > 0) neighbors.push(index - 1)
  if (col < size - 1) neighbors.push(index + 1)

  return neighbors
}

export function isAdjacent(a, b, size) {
  const ar = Math.floor(a / size)
  const ac = a % size
  const br = Math.floor(b / size)
  const bc = b % size

  return Math.abs(ar - br) + Math.abs(ac - bc) === 1
}

export function isReachableBySlide(tileIndex, emptyIndex, size) {
  const tileRow = Math.floor(tileIndex / size)
  const tileCol = tileIndex % size
  const emptyRow = Math.floor(emptyIndex / size)
  const emptyCol = emptyIndex % size

  return tileRow === emptyRow || tileCol === emptyCol
}

export function isSolved(tiles) {
  return tiles.every((tile, index) => tile === index)
}

export function moveTile(tiles, tileIndex, size, emptyTile = getEmptyTile(size)) {
  const emptyIndex = tiles.indexOf(emptyTile)

  if (tileIndex < 0 || tileIndex >= tiles.length || !isReachableBySlide(tileIndex, emptyIndex, size) || tileIndex === emptyIndex) {
    return { tiles, moved: false }
  }

  const nextTiles = [...tiles]
  const step = tileIndex < emptyIndex ? 1 : -1
  const sameRow = Math.floor(tileIndex / size) === Math.floor(emptyIndex / size)
  const offset = sameRow ? step : step * size

  for (let index = emptyIndex; index !== tileIndex; index -= offset) {
    nextTiles[index] = nextTiles[index - offset]
  }
  nextTiles[tileIndex] = emptyTile

  return { tiles: nextTiles, moved: true }
}

export function getKeyboardMoveIndex(tiles, size, key, emptyTile = getEmptyTile(size), maxDistance = 1) {
  const emptyIndex = tiles.indexOf(emptyTile)
  const emptyRow = Math.floor(emptyIndex / size)
  const emptyCol = emptyIndex % size
  const normalizedKey = key.toLowerCase()
  const distance = Math.max(1, maxDistance)

  if (normalizedKey === 'arrowup' || normalizedKey === 'w') {
    if (emptyRow >= size - 1) return -1
    return emptyIndex + size * Math.min(distance, size - 1 - emptyRow)
  }

  if (normalizedKey === 'arrowdown' || normalizedKey === 's') {
    if (emptyRow <= 0) return -1
    return emptyIndex - size * Math.min(distance, emptyRow)
  }

  if (normalizedKey === 'arrowleft' || normalizedKey === 'a') {
    if (emptyCol >= size - 1) return -1
    return emptyIndex + Math.min(distance, size - 1 - emptyCol)
  }

  if (normalizedKey === 'arrowright' || normalizedKey === 'd') {
    if (emptyCol <= 0) return -1
    return emptyIndex - Math.min(distance, emptyCol)
  }

  return -1
}

function pickIndex(rng, length) {
  return Math.floor(rng() * length)
}

export function shuffleTiles(
  tiles,
  size,
  { steps = size * size * 20, rng = Math.random, returnTrace = false, emptyTile = getEmptyTile(size) } = {},
) {
  const shuffled = [...tiles]
  let emptyIndex = shuffled.indexOf(emptyTile)
  let previousEmpty = -1
  const trace = []

  for (let step = 0; step < steps; step += 1) {
    let candidates = getNeighbors(emptyIndex, size).filter((neighbor) => neighbor !== previousEmpty)

    if (candidates.length === 0) {
      candidates = getNeighbors(emptyIndex, size)
    }

    const nextEmpty = candidates[pickIndex(rng, candidates.length)]
    trace.push({ from: emptyIndex, to: nextEmpty })
    ;[shuffled[emptyIndex], shuffled[nextEmpty]] = [shuffled[nextEmpty], shuffled[emptyIndex]]
    previousEmpty = emptyIndex
    emptyIndex = nextEmpty
  }

  if (isSolved(shuffled)) {
    const nextEmpty = getNeighbors(emptyIndex, size)[0]
    trace.push({ from: emptyIndex, to: nextEmpty })
    ;[shuffled[emptyIndex], shuffled[nextEmpty]] = [shuffled[nextEmpty], shuffled[emptyIndex]]
  }

  return returnTrace ? { tiles: shuffled, trace } : shuffled
}

export function createShuffledTiles(size, options) {
  return shuffleTiles(createSolvedTiles(size), size, options)
}
