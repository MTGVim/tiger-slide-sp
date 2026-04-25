export function createSolvedTiles(size) {
  return Array.from({ length: size * size }, (_, index) => index)
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

export function shuffleTiles(tiles, size, steps = size * size * 30) {
  const shuffled = [...tiles]
  let emptyIndex = shuffled.length - 1
  let previousIndex = -1

  for (let i = 0; i < steps; i += 1) {
    const candidates = getNeighbors(emptyIndex, size).filter((index) => index !== previousIndex)
    const nextIndex = candidates[Math.floor(Math.random() * candidates.length)]

    ;[shuffled[emptyIndex], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[emptyIndex]]

    previousIndex = emptyIndex
    emptyIndex = nextIndex
  }

  return shuffled
}

export function moveTile(tiles, tileIndex, size) {
  const emptyTile = size * size - 1
  const emptyIndex = tiles.indexOf(emptyTile)

  if (!isAdjacent(tileIndex, emptyIndex, size)) {
    return tiles
  }

  const nextTiles = [...tiles]
  ;[nextTiles[tileIndex], nextTiles[emptyIndex]] = [nextTiles[emptyIndex], nextTiles[tileIndex]]

  return nextTiles
}

export function isSolved(tiles) {
  return tiles.every((tile, index) => tile === index)
}
