import imageCompression from 'browser-image-compression'
import confetti from 'canvas-confetti'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controls, SoundMuteButton } from './components/Controls'
import { PuzzleBoard } from './components/PuzzleBoard'
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt'
import { RecordsPanel } from './components/RecordsPanel'
import { getImageSource } from './utils/imageSources'
import { createShuffledTiles, getKeyboardMoveIndex, isSolved, moveTile } from './utils/puzzle'
import { readRecords, saveBestRecord } from './utils/records'
import { readImageModeSettings, readSoundMuted, writeImageModeSettings, writeSoundMuted } from './utils/settings'
import { playClearSound, playSlideLandSound, playSlideSound } from './utils/sound'
import { formatSeconds } from './utils/time'

const DEFAULT_SIZE = 3
const MOVE_ANIMATION_MS = 170
const SLIDE_LAND_SOUND_DELAY_MS = MOVE_ANIMATION_MS + 70
const CLEAR_SOUND_DELAY_MS = SLIDE_LAND_SOUND_DELAY_MS + 120
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
const COMPRESSED_IMAGE_MAX_EDGE_PX = 900
const COMPRESSED_IMAGE_MAX_SIZE_MB = 0.35

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

async function cropImageFileToSquare(imageFile) {
  const sourceObjectUrl = URL.createObjectURL(imageFile)

  try {
    const image = await new Promise((resolve, reject) => {
      const nextImage = new Image()
      nextImage.onload = () => resolve(nextImage)
      nextImage.onerror = () => reject(new Error('이미지를 불러오지 못했어요.'))
      nextImage.src = sourceObjectUrl
    })
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight)
    const cropX = Math.floor((image.naturalWidth - cropSize) / 2)
    const cropY = Math.floor((image.naturalHeight - cropSize) / 2)
    const canvas = document.createElement('canvas')
    canvas.width = cropSize
    canvas.height = cropSize
    const context = canvas.getContext('2d')
    if (!context) throw new Error('이미지를 처리하지 못했어요.')

    context.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize)

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((nextBlob) => {
        if (nextBlob) {
          resolve(nextBlob)
        } else {
          reject(new Error('이미지를 처리하지 못했어요.'))
        }
      }, 'image/jpeg', 0.9)
    })

    return new File([blob], 'puzzle-source-image.jpg', { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(sourceObjectUrl)
  }
}

async function createCompressedImageUrl(source) {
  const response = await fetch(await source.fetchImage(), { cache: 'no-store' })
  if (!response.ok) throw new Error('이미지를 불러오지 못했어요.')

  const blob = await response.blob()
  const imageFile = new File([blob], 'puzzle-source-image', { type: blob.type || 'image/jpeg' })
  const squareImageFile = await cropImageFileToSquare(imageFile)
  const compressedFile = await imageCompression(squareImageFile, {
    maxSizeMB: COMPRESSED_IMAGE_MAX_SIZE_MB,
    maxWidthOrHeight: COMPRESSED_IMAGE_MAX_EDGE_PX,
    useWebWorker: false,
  })

  return URL.createObjectURL(compressedFile)
}

function App() {
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [game, setGame] = useState(() => createGame(DEFAULT_SIZE))
  const [records, setRecords] = useState(() => readRecords())
  const [now, setNow] = useState(() => Date.now())
  const [isMoving, setIsMoving] = useState(false)
  const [movingTile, setMovingTile] = useState(null)
  const [shakeDirection, setShakeDirection] = useState(null)
  const [soundMuted, setSoundMuted] = useState(() => readSoundMuted())
  const [imageModeSettings, setImageModeSettings] = useState(() => readImageModeSettings())
  const [imageUrl, setImageUrl] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState('')
  const appScrollRef = useRef(null)
  const boardRef = useRef(null)
  const moveUnlockTimerRef = useRef(null)
  const shakeTimerRef = useRef(null)
  const landSoundTimerRef = useRef(null)
  const clearSoundTimerRef = useRef(null)
  const imageRequestIdRef = useRef(0)
  const imageObjectUrlRef = useRef(null)
  const mountedRef = useRef(true)

  const solved = useMemo(() => isSolved(game.tiles), [game.tiles])
  const completed = solved && game.moves > 0
  const elapsedSeconds = Math.max(0, Math.floor(((game.completedAt ?? now) - game.startedAt) / 1000))

  useEffect(() => {
    writeSoundMuted(soundMuted)

    if (soundMuted) {
      window.clearTimeout(landSoundTimerRef.current)
      window.clearTimeout(clearSoundTimerRef.current)
    }
  }, [soundMuted])

  const replaceImageUrl = useCallback((nextImageUrl) => {
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current)
    }

    imageObjectUrlRef.current = nextImageUrl
    setImageUrl(nextImageUrl)
  }, [])

  const loadRandomImage = useCallback(async (settings) => {
    imageRequestIdRef.current += 1
    const requestId = imageRequestIdRef.current

    if (!settings.enabled) {
      replaceImageUrl(null)
      setImageLoading(false)
      setImageError('')
      return
    }

    if (navigator.onLine === false) {
      replaceImageUrl(null)
      setImageLoading(false)
      setImageError('온라인에서만 이미지 모드를 사용할 수 있어요.')
      return
    }

    replaceImageUrl(null)
    setImageLoading(true)
    setImageError('')

    try {
      const compressedImageUrl = await createCompressedImageUrl(getImageSource(settings.sourceId))

      if (!mountedRef.current || imageRequestIdRef.current !== requestId) {
        URL.revokeObjectURL(compressedImageUrl)
        return
      }

      replaceImageUrl(compressedImageUrl)
    } catch {
      if (!mountedRef.current || imageRequestIdRef.current !== requestId) return
      replaceImageUrl(null)
      setImageError('이미지를 불러오지 못해서 숫자 퍼즐로 표시해요.')
    } finally {
      if (mountedRef.current && imageRequestIdRef.current === requestId) {
        setImageLoading(false)
      }
    }
  }, [replaceImageUrl])

  useEffect(() => {
    const normalizedSettings = writeImageModeSettings(imageModeSettings)
    const timerId = window.setTimeout(() => {
      loadRandomImage(normalizedSettings)
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [imageModeSettings, loadRandomImage])

  useEffect(() => {
    if (completed) return undefined

    const timerId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [completed])

  useEffect(() => {
    mountedRef.current = true
    const appScrollElement = appScrollRef.current
    if (!appScrollElement) return undefined

    function keepTouchWithinAppScroll(event) {
      const canScroll = appScrollElement.scrollHeight > appScrollElement.clientHeight
      if (!canScroll) return

      const atTop = appScrollElement.scrollTop <= 0
      const atBottom = appScrollElement.scrollTop + appScrollElement.clientHeight >= appScrollElement.scrollHeight
      const touch = event.touches[0]
      if (!touch || event.touches.length !== 1) return

      const movingDown = touch.clientY > keepTouchWithinAppScroll.lastY
      const movingUp = touch.clientY < keepTouchWithinAppScroll.lastY
      keepTouchWithinAppScroll.lastY = touch.clientY

      if ((atTop && movingDown) || (atBottom && movingUp)) {
        event.preventDefault()
      }
    }

    function captureTouchStart(event) {
      const touch = event.touches[0]
      keepTouchWithinAppScroll.lastY = touch?.clientY ?? 0
    }

    appScrollElement.addEventListener('touchstart', captureTouchStart, { passive: true })
    appScrollElement.addEventListener('touchmove', keepTouchWithinAppScroll, { passive: false })

    return () => {
      mountedRef.current = false
      imageRequestIdRef.current += 1
      appScrollElement.removeEventListener('touchstart', captureTouchStart)
      appScrollElement.removeEventListener('touchmove', keepTouchWithinAppScroll)
      window.clearTimeout(moveUnlockTimerRef.current)
      window.clearTimeout(shakeTimerRef.current)
      window.clearTimeout(landSoundTimerRef.current)
      window.clearTimeout(clearSoundTimerRef.current)
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current)
        imageObjectUrlRef.current = null
      }
    }
  }, [])

  const resetGameState = useCallback((nextSize = size) => {
    window.clearTimeout(moveUnlockTimerRef.current)
    window.clearTimeout(landSoundTimerRef.current)
    window.clearTimeout(clearSoundTimerRef.current)
    setIsMoving(false)
    setMovingTile(null)
    setSize(nextSize)
    setGame(createGame(nextSize))
    setNow(Date.now())
  }, [size])

  const startNewGame = useCallback((nextSize = size) => {
    resetGameState(nextSize)
    loadRandomImage(imageModeSettings)
  }, [imageModeSettings, loadRandomImage, resetGameState, size])

  const resetPuzzle = useCallback(() => {
    window.clearTimeout(moveUnlockTimerRef.current)
    window.clearTimeout(landSoundTimerRef.current)
    window.clearTimeout(clearSoundTimerRef.current)
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

  const handleImageModeEnabledChange = useCallback((enabled) => {
    resetGameState(size)
    setImageModeSettings((current) => ({ ...current, enabled }))
  }, [resetGameState, size])

  const handleImageSourceChange = useCallback((sourceId) => {
    resetGameState(size)
    setImageModeSettings((current) => ({ ...current, sourceId }))
  }, [resetGameState, size])

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
    if (completed || isMoving || imageLoading) return

    const result = moveTile(game.tiles, tileIndex, size)
    if (!result.moved) return

    if (!soundMuted) {
      playSlideSound()
      window.clearTimeout(landSoundTimerRef.current)
      landSoundTimerRef.current = window.setTimeout(playSlideLandSound, SLIDE_LAND_SOUND_DELAY_MS)
    }
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
      if (!soundMuted) {
        window.clearTimeout(clearSoundTimerRef.current)
        clearSoundTimerRef.current = window.setTimeout(playClearSound, CLEAR_SOUND_DELAY_MS)
      }
      launchClearConfetti(boardRef.current)
    }

    setGame({
      ...game,
      tiles: result.tiles,
      moves: nextMoves,
      completedAt,
    })
  }, [completed, game, imageLoading, isMoving, size, soundMuted])

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
      if (completed || isMoving || imageLoading) return

      const tileIndex = getKeyboardMoveIndex(game.tiles, size, event.key)
      if (tileIndex === -1) {
        shakeBoard(KEY_DIRECTIONS[normalizedKey])
        return
      }

      handleTileClick(tileIndex)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [completed, game.tiles, handleTileClick, imageLoading, isMoving, shakeBoard, size])

  return (
    <main ref={appScrollRef} className="fixed inset-0 overflow-y-auto overscroll-none bg-[radial-gradient(circle_at_top_left,#fde68a,transparent_32%),radial-gradient(circle_at_top_right,#fbcfe8,transparent_30%),radial-gradient(circle_at_bottom_right,#bfdbfe,transparent_34%),linear-gradient(135deg,#fff7ed,#fdf2f8_45%,#eef2ff)] px-2 py-3 text-violet-950 min-[360px]:px-3 sm:px-6 sm:py-8 lg:px-8">
      <PwaUpdatePrompt />
      <div className="mx-auto flex w-full max-w-[600px] min-w-0 flex-col gap-2.5 sm:gap-4 lg:max-w-5xl lg:gap-6">
        <header className="relative grid gap-1.5 rounded-[1.25rem] border-2 border-white/80 bg-white/70 p-2 pt-11 text-center shadow-2xl shadow-violet-200/50 backdrop-blur sm:gap-3 sm:rounded-[2rem] sm:border-4 sm:p-4 lg:p-5">
          <SoundMuteButton
            soundMuted={soundMuted}
            onSoundMutedChange={setSoundMuted}
          />
          <h1 className="hidden font-['Bagel_Fat_One'] text-4xl font-black tracking-wide text-violet-950 drop-shadow-[0_3px_0_rgba(255,255,255,0.95)] sm:block sm:text-6xl">
            Tiger-Slide 🐯
          </h1>
          <Controls
            size={size}
            moves={game.moves}
            elapsedTime={formatSeconds(elapsedSeconds)}
            imageModeEnabled={imageModeSettings.enabled}
            imageSourceId={imageModeSettings.sourceId}
            imageLoading={imageLoading}
            onImageModeEnabledChange={handleImageModeEnabledChange}
            onImageSourceChange={handleImageSourceChange}
            onSizeChange={startNewGame}
            onShuffle={() => startNewGame(size)}
            onReset={resetPuzzle}
          />
          {imageError && (
            <p className="text-xs font-extrabold text-rose-700 sm:text-sm">{imageError}</p>
          )}
        </header>

        <div className="flex flex-col items-start gap-3 sm:gap-4 lg:flex-row lg:justify-center lg:gap-6">
          <div className="relative w-full lg:max-w-[720px] lg:flex-1">
            <div ref={boardRef}>
              <PuzzleBoard
                tiles={game.tiles}
                size={size}
                onTileClick={handleTileClick}
                disabled={completed || isMoving || imageLoading}
                movingTile={movingTile}
                shakeDirection={shakeDirection}
                imageUrl={imageUrl}
                imageLoading={imageLoading}
                completed={completed}
              />
            </div>
            {completed && (
              <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 text-center text-sm font-black text-violet-950 shadow-xl shadow-violet-200/50 sm:mt-4 sm:rounded-3xl sm:border-4 sm:px-5 sm:py-3 sm:text-xl">
                <p>완성!</p>
                <button
                  type="button"
                  className="rounded-xl border-2 border-white/80 bg-rose-200 px-3 py-1.5 text-xs font-extrabold text-rose-950 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-200 sm:px-4 sm:py-2 sm:text-sm"
                  onClick={() => startNewGame(size)}
                >
                  새 게임
                </button>
              </div>
            )}
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
