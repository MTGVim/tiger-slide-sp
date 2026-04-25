import { describe, expect, it } from 'vitest'
import {
  createSolvedTiles,
  getKeyboardMoveIndex,
  getNeighbors,
  getRandomEmptyTile,
  isAdjacent,
  isSolved,
  moveTile,
  shuffleTiles,
} from '../utils/puzzle.js'

describe('puzzle utilities', () => {
  it('creates a solved tile list', () => {
    expect(createSolvedTiles(3)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('picks a random empty tile ID within the board', () => {
    expect(getRandomEmptyTile(3, () => 0)).toBe(0)
    expect(getRandomEmptyTile(3, () => 0.5)).toBe(4)
    expect(getRandomEmptyTile(3, () => 0.999)).toBe(8)
  })

  it('returns correct neighbors for corners, edges, and centers', () => {
    expect(getNeighbors(0, 3).sort((a, b) => a - b)).toEqual([1, 3])
    expect(getNeighbors(4, 3).sort((a, b) => a - b)).toEqual([1, 3, 5, 7])
    expect(getNeighbors(5, 4).sort((a, b) => a - b)).toEqual([1, 4, 6, 9])
  })

  it('detects adjacency by Manhattan distance only', () => {
    expect(isAdjacent(0, 1, 3)).toBe(true)
    expect(isAdjacent(0, 3, 3)).toBe(true)
    expect(isAdjacent(0, 4, 3)).toBe(false)
    expect(isAdjacent(2, 3, 3)).toBe(false)
  })

  it('moves only tiles adjacent to the empty slot', () => {
    const solved = createSolvedTiles(3)
    const adjacent = moveTile(solved, 5, 3)
    expect(adjacent.moved).toBe(true)
    expect(adjacent.tiles).toEqual([0, 1, 2, 3, 4, 8, 6, 7, 5])

    const customEmpty = moveTile(solved, 3, 3, 4)
    expect(customEmpty.moved).toBe(true)
    expect(customEmpty.tiles).toEqual([0, 1, 2, 4, 3, 5, 6, 7, 8])

    const nonAdjacent = moveTile(solved, 0, 3)
    expect(nonAdjacent.moved).toBe(false)
    expect(nonAdjacent.tiles).toBe(solved)
  })

  it('selects the tile that moves when using Arrow or WASD keys', () => {
    const solved = createSolvedTiles(3)

    expect(getKeyboardMoveIndex(solved, 3, 'ArrowUp')).toBe(-1)
    expect(getKeyboardMoveIndex(solved, 3, 'w')).toBe(-1)
    expect(getKeyboardMoveIndex(solved, 3, 'ArrowLeft')).toBe(-1)
    expect(getKeyboardMoveIndex(solved, 3, 'a')).toBe(-1)
    expect(getKeyboardMoveIndex(solved, 3, 'ArrowDown')).toBe(5)
    expect(getKeyboardMoveIndex(solved, 3, 's')).toBe(5)
    expect(getKeyboardMoveIndex(solved, 3, 'ArrowRight')).toBe(7)
    expect(getKeyboardMoveIndex(solved, 3, 'd')).toBe(7)
    expect(getKeyboardMoveIndex(solved, 3, 'Enter')).toBe(-1)

    expect(getKeyboardMoveIndex(solved, 3, 'ArrowUp', 4)).toBe(7)
    expect(getKeyboardMoveIndex(solved, 3, 'ArrowDown', 4)).toBe(1)
    expect(getKeyboardMoveIndex(solved, 3, 'ArrowLeft', 4)).toBe(5)
    expect(getKeyboardMoveIndex(solved, 3, 'ArrowRight', 4)).toBe(3)
  })

  it('detects solved boards', () => {
    expect(isSolved([0, 1, 2, 3])).toBe(true)
    expect(isSolved([0, 2, 1, 3])).toBe(false)
  })

  it('shuffles by traceable legal empty-tile moves and preserves tile IDs', () => {
    const rngValues = [0, 0.9, 0.4, 0.1, 0.7, 0.2, 0.8, 0.3]
    let index = 0
    const rng = () => rngValues[index++ % rngValues.length]
    const { tiles, trace } = shuffleTiles(createSolvedTiles(3), 3, {
      steps: 8,
      rng,
      returnTrace: true,
    })

    expect([...tiles].sort((a, b) => a - b)).toEqual(createSolvedTiles(3))
    expect(isSolved(tiles)).toBe(false)
    expect(trace.length).toBeGreaterThanOrEqual(8)
    expect(trace.every(({ from, to }) => getNeighbors(from, 3).includes(to))).toBe(true)
  })

  it('shuffles from a custom empty tile while keeping the standard solved order', () => {
    const { tiles, trace } = shuffleTiles(createSolvedTiles(3), 3, {
      steps: 2,
      rng: () => 0,
      returnTrace: true,
      emptyTile: 4,
    })

    expect(trace[0].from).toBe(4)
    expect([...tiles].sort((a, b) => a - b)).toEqual(createSolvedTiles(3))
    expect(isSolved(createSolvedTiles(3))).toBe(true)
  })
})
