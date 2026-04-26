import { describe, expect, it } from 'vitest'
import {
  createSolvedTiles,
  getKeyboardMoveIndex,
  getNeighbors,
  getRandomEmptyTile,
  isAdjacent,
  isReachableBySlide,
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

  it('detects tiles that can slide across the empty slot row or column', () => {
    expect(isReachableBySlide(5, 8, 3)).toBe(true)
    expect(isReachableBySlide(2, 8, 3)).toBe(true)
    expect(isReachableBySlide(0, 8, 3)).toBe(false)
    expect(isReachableBySlide(1, 4, 3)).toBe(true)
  })

  it('moves tiles across the empty slot in one slide', () => {
    const solved = createSolvedTiles(3)
    const adjacent = moveTile(solved, 5, 3)
    expect(adjacent.moved).toBe(true)
    expect(adjacent.tiles).toEqual([0, 1, 2, 3, 4, 8, 6, 7, 5])

    const horizontalTwoStep = moveTile([0, 8, 1, 3, 4, 2, 6, 7, 5], 2, 3)
    expect(horizontalTwoStep.moved).toBe(true)
    expect(horizontalTwoStep.tiles).toEqual([0, 1, 8, 3, 4, 2, 6, 7, 5])

    const verticalTwoStep = moveTile([0, 1, 2, 3, 4, 5, 6, 7, 8], 2, 3)
    expect(verticalTwoStep.moved).toBe(true)
    expect(verticalTwoStep.tiles).toEqual([0, 1, 8, 3, 4, 2, 6, 7, 5])

    const customEmpty = moveTile(solved, 3, 3, 4)
    expect(customEmpty.moved).toBe(true)
    expect(customEmpty.tiles).toEqual([0, 1, 2, 4, 3, 5, 6, 7, 8])

    const unreachable = moveTile(solved, 0, 3)
    expect(unreachable.moved).toBe(false)
    expect(unreachable.tiles).toBe(solved)
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

  it('selects the farthest reachable tile when using Shift movement', () => {
    const solved3 = createSolvedTiles(3)
    const solved4 = createSolvedTiles(4)

    expect(getKeyboardMoveIndex(solved3, 3, 'ArrowDown', 8, 2)).toBe(2)
    expect(getKeyboardMoveIndex(solved3, 3, 's', 8, 2)).toBe(2)
    expect(getKeyboardMoveIndex(solved3, 3, 'ArrowRight', 8, 2)).toBe(6)
    expect(getKeyboardMoveIndex(solved3, 3, 'd', 8, 2)).toBe(6)

    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowDown', 15, 3)).toBe(3)
    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowRight', 15, 3)).toBe(12)

    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowDown', 10, 3)).toBe(2)
    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowRight', 10, 3)).toBe(8)
    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowUp', 10, 3)).toBe(14)
    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowLeft', 10, 3)).toBe(11)

    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowUp', 3, 3)).toBe(15)
    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowLeft', 12, 3)).toBe(15)
    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowUp', 15, 3)).toBe(-1)
    expect(getKeyboardMoveIndex(solved4, 4, 'ArrowLeft', 15, 3)).toBe(-1)
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
