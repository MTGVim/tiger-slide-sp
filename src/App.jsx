import confetti from 'canvas-confetti'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controls } from './components/Controls'
import { PuzzleBoard } from './components/PuzzleBoard'
import { RecordsPanel } from './components/RecordsPanel'
import { createShuffledTiles, getKeyboardMoveIndex, isSolved, moveTile } from './utils/puzzle'
import { readRecords, saveBestRecord } from './utils/records'
import { playClearSound, playSlideSound } from './utils/sound'
import { formatSeconds } from './utils/time'

const DEFAULT_SIZE = 3
const MOVE_ANIMATION_MS = 170
const MOVE_KEYS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'])
const KEY_DIRECTIONS = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
}

function launchClearConfetti() {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  confetti({
    particleCount: 90,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.78 },
    colors: ['#facc15', '#fb7185', '#38bdf8', '#a78bfa', '#34d399'],
  })

  confetti({
    particleCount: 90,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.78 },
    colors: ['#f97316', '#f9a8d4', '#67e8f9', '#c4b5fd', '#bef264'],
  })
}

function createGame(size) {
  const tiles = createShuffledTiles(size)
  const now = Date.now()

  return {
    tiles,
    initialTiles: tiles,
    moves: 0,
    startedAt: now,
    completedAt: null,
  }
}

function App() {
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [game, setGame] = useState(() => createGame(DEFAULT_SIZE))
  const [records, setRecords] = useState(() => readRecords())
  const [now, setNow] = useState(() => Date.now())
  const [isMoving, setIsMoving] = useState(false)
  const [movingTile, setMovingTile] = useState(null)
  const [shakeDirection, setShakeDirection] = useState(null)
  const moveUnlockTimerRef = useRef(null)
  const shakeTimerRef = useRef(null)

  const solved = useMemo(() => isSolved(game.tiles), [game.tiles])
  const completed = solved && game.moves > 0
  const elapsedSeconds = Math.max(0, Math.floor(((game.completedAt ?? now) - game.startedAt) / 1000))

  useEffect(() => {
    if (completed) return undefined

    const timerId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [completed])

  useEffect(() => {
    return () => {
      window.clearTimeout(moveUnlockTimerRef.current)
      window.clearTimeout(shakeTimerRef.current)
    }
  }, [])

  const startNewGame = useCallback((nextSize = size) => {
    window.clearTimeout(moveUnlockTimerRef.current)
    setIsMoving(false)
    setMovingTile(null)
    setSize(nextSize)
    setGame(createGame(nextSize))
    setNow(Date.now())
  }, [size])

  const resetPuzzle = useCallback(() => {
    window.clearTimeout(moveUnlockTimerRef.current)
    setIsMoving(false)
    setMovingTile(null)

    const startedAt = Date.now()
    setGame((current) => ({
      ...current,
      tiles: current.initialTiles,
      moves: 0,
      startedAt,
      completedAt: null,
    }))
    setNow(startedAt)
  }, [])

  const shakeBoard = useCallback((direction) => {
    setShakeDirection(null)
    window.clearTimeout(shakeTimerRef.current)

    requestAnimationFrame(() => {
      setShakeDirection(direction)
      shakeTimerRef.current = window.setTimeout(() => {
        setShakeDirection(null)
      }, 180)
    })
  }, [])

  const handleTileClick = useCallback((tileIndex) => {
    if (completed || isMoving) return

    const result = moveTile(game.tiles, tileIndex, size)
    if (!result.moved) return

    playSlideSound()
    setMovingTile(game.tiles[tileIndex])
    setIsMoving(true)
    window.clearTimeout(moveUnlockTimerRef.current)
    moveUnlockTimerRef.current = window.setTimeout(() => {
      setIsMoving(false)
      setMovingTile(null)
    }, MOVE_ANIMATION_MS)

    const nextMoves = game.moves + 1
    const completedAt = isSolved(result.tiles) ? Date.now() : null

    if (completedAt) {
      const seconds = Math.max(0, Math.floor((completedAt - game.startedAt) / 1000))
      const nextRecordState = saveBestRecord(size, {
        moves: nextMoves,
        seconds,
        completedAt: new Date(completedAt).toISOString(),
      })

      setRecords(nextRecordState.records)
      playClearSound()
      launchClearConfetti()
    }

    setGame({
      ...game,
      tiles: result.tiles,
      moves: nextMoves,
      completedAt,
    })
  }, [completed, game, isMoving, size])

  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      const normalizedKey = event.key.toLowerCase()

      if (isTyping || !MOVE_KEYS.has(normalizedKey)) return

      event.preventDefault()
      if (completed || isMoving) return

      const tileIndex = getKeyboardMoveIndex(game.tiles, size, event.key)
      if (tileIndex === -1) {
        shakeBoard(KEY_DIRECTIONS[normalizedKey])
        return
      }

      handleTileClick(tileIndex)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [completed, game.tiles, handleTileClick, isMoving, shakeBoard, size])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fde68a,transparent_32%),radial-gradient(circle_at_top_right,#fbcfe8,transparent_30%),radial-gradient(circle_at_bottom_right,#bfdbfe,transparent_34%),linear-gradient(135deg,#fff7ed,#fdf2f8_45%,#eef2ff)] px-4 py-8 text-violet-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section className="grid gap-6">
          <header className="rounded-[2rem] border-4 border-white/80 bg-white/70 p-5 text-center shadow-2xl shadow-violet-200/50 backdrop-blur sm:p-6">
            <h1 className="text-4xl font-black tracking-tight text-violet-950 sm:text-6xl">
              Tiger-Slide 🐯
            </h1>
          </header>

          <div className="mx-auto w-full max-w-[640px]">
            <PuzzleBoard
              tiles={game.tiles}
              size={size}
              onTileClick={handleTileClick}
              disabled={completed || isMoving}
              movingTile={movingTile}
              shakeDirection={shakeDirection}
            />
          </div>

          <Controls
            size={size}
            moves={game.moves}
            elapsedTime={formatSeconds(elapsedSeconds)}
            solved={completed}
            onSizeChange={startNewGame}
            onShuffle={() => startNewGame(size)}
            onReset={resetPuzzle}
          />
        </section>

        <aside className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <RecordsPanel records={records} />
          {completed ? (
            <div className="rounded-[2rem] border-4 border-white bg-emerald-200 p-5 text-center shadow-xl shadow-emerald-200/60 sm:col-span-2 lg:col-span-1">
              <p className="text-2xl font-black text-emerald-950">완성!</p>
              <p className="mt-1 text-sm font-bold text-emerald-900">
                {game.moves}회 이동 · {formatSeconds(elapsedSeconds)}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  )
}

export default App
