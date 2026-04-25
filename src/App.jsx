import confetti from 'canvas-confetti'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controls } from './components/Controls'
import { PuzzleBoard } from './components/PuzzleBoard'
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt'
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

function getBoardConfettiOrigins(boardElement) {
  if (!boardElement) {
    return {
      left: { x: 0.2, y: 0.82 },
      right: { x: 0.8, y: 0.82 },
    }
  }

  const rect = boardElement.getBoundingClientRect()
  return {
    left: {
      x: (rect.left + rect.width * 0.12) / window.innerWidth,
      y: (rect.top + rect.height * 0.9) / window.innerHeight,
    },
    right: {
      x: (rect.left + rect.width * 0.88) / window.innerWidth,
      y: (rect.top + rect.height * 0.9) / window.innerHeight,
    },
  }
}

function launchClearConfetti(boardElement) {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const origins = getBoardConfettiOrigins(boardElement)

  confetti({
    particleCount: 90,
    angle: 58,
    spread: 62,
    origin: origins.left,
    colors: ['#facc15', '#fb7185', '#38bdf8', '#a78bfa', '#34d399'],
  })

  confetti({
    particleCount: 90,
    angle: 122,
    spread: 62,
    origin: origins.right,
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
  const [soundMuted, setSoundMuted] = useState(false)
  const boardRef = useRef(null)
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

    if (!soundMuted) playSlideSound()
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
      if (!soundMuted) playClearSound()
      launchClearConfetti(boardRef.current)
    }

    setGame({
      ...game,
      tiles: result.tiles,
      moves: nextMoves,
      completedAt,
    })
  }, [completed, game, isMoving, size, soundMuted])

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fde68a,transparent_32%),radial-gradient(circle_at_top_right,#fbcfe8,transparent_30%),radial-gradient(circle_at_bottom_right,#bfdbfe,transparent_34%),linear-gradient(135deg,#fff7ed,#fdf2f8_45%,#eef2ff)] px-2 py-3 text-violet-950 min-[360px]:px-3 sm:px-6 sm:py-8 lg:px-8">
      <PwaUpdatePrompt />
      <div className="mx-auto flex w-full max-w-[600px] min-w-0 flex-col gap-2.5 sm:gap-4 lg:max-w-5xl lg:gap-6">
        <header className="grid gap-1.5 rounded-[1.25rem] border-2 border-white/80 bg-white/70 p-2 text-center shadow-2xl shadow-violet-200/50 backdrop-blur sm:gap-3 sm:rounded-[2rem] sm:border-4 sm:p-4 lg:p-5">
          <h1 className="hidden font-['Bagel_Fat_One'] text-4xl font-black tracking-wide text-violet-950 drop-shadow-[0_3px_0_rgba(255,255,255,0.95)] sm:block sm:text-6xl">
            Tiger-Slide 🐯
          </h1>
          <Controls
            size={size}
            moves={game.moves}
            elapsedTime={formatSeconds(elapsedSeconds)}
            onSizeChange={startNewGame}
            onShuffle={() => startNewGame(size)}
            onReset={resetPuzzle}
            soundMuted={soundMuted}
            onSoundMutedChange={setSoundMuted}
          />
        </header>

        <div className="flex flex-col items-start gap-3 sm:gap-4 lg:flex-row lg:justify-center lg:gap-6">
          <div className="relative w-full lg:max-w-[720px] lg:flex-1">
            {completed && (
              <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-white/90 bg-white px-4 py-2 text-center text-sm font-black text-violet-950 shadow-xl shadow-violet-200/50 sm:rounded-3xl sm:border-4 sm:px-6 sm:py-3 sm:text-xl">
                <p>축하해요!</p>
                <p className="mt-0.5 text-xs text-violet-600 sm:text-sm">완성!</p>
              </div>
            )}
            <div ref={boardRef}>
              <PuzzleBoard
                tiles={game.tiles}
                size={size}
                onTileClick={handleTileClick}
                disabled={completed || isMoving}
                movingTile={movingTile}
                shakeDirection={shakeDirection}
              />
            </div>
          </div>

          <aside className="w-full lg:w-64 lg:shrink-0">
            <RecordsPanel records={records} />
          </aside>
        </div>
      </div>
    </main>
  )
}

export default App
