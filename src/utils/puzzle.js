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

export function isSolved(tiles) {
  return tiles.every((tile, index) => tile === index)
}

export function moveTile(tiles, tileIndex, size, emptyTile = getEmptyTile(size)) {
  const emptyIndex = tiles.indexOf(emptyTile)

  if (tileIndex < 0 || tileIndex >= tiles.length || !isAdjacent(tileIndex, emptyIndex, size)) {
    return { tiles, moved: false }
  }

  const nextTiles = [...tiles]
  ;[nextTiles[tileIndex], nextTiles[emptyIndex]] = [nextTiles[emptyIndex], nextTiles[tileIndex]]

  return { tiles: nextTiles, moved: true }
}

export function getKeyboardMoveIndex(tiles, size, key, emptyTile = getEmptyTile(size)) {
  const emptyIndex = tiles.indexOf(emptyTile)
  const emptyRow = Math.floor(emptyIndex / size)
  const emptyCol = emptyIndex % size
  const normalizedKey = key.toLowerCase()

  if ((normalizedKey === 'arrowup' || normalizedKey === 'w') && emptyRow < size - 1) {
    return emptyIndex + size
  }

  if ((normalizedKey === 'arrowdown' || normalizedKey === 's') && emptyRow > 0) {
    return emptyIndex - size
  }

  if ((normalizedKey === 'arrowleft' || normalizedKey === 'a') && emptyCol < size - 1) {
    return emptyIndex + 1
  }

  if ((normalizedKey === 'arrowright' || normalizedKey === 'd') && emptyCol > 0) {
    return emptyIndex - 1
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
