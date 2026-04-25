import { useRef } from 'react'
import { createSolvedTiles, getEmptyTile, isAdjacent } from '../utils/puzzle'

const BLOCK_COLORS = [
  'from-pink-200 to-rose-300',
  'from-orange-200 to-amber-300',
  'from-yellow-200 to-lime-200',
  'from-emerald-200 to-teal-300',
  'from-cyan-200 to-sky-300',
  'from-blue-200 to-indigo-300',
  'from-violet-200 to-purple-300',
  'from-fuchsia-200 to-pink-300',
]

const SWIPE_THRESHOLD_PX = 24

function isSwipeTowardEmpty(tileIndex, emptyIndex, size, dx, dy) {
  const tileRow = Math.floor(tileIndex / size)
  const tileCol = tileIndex % size
  const emptyRow = Math.floor(emptyIndex / size)
  const emptyCol = emptyIndex % size

  if (Math.abs(dx) > Math.abs(dy)) {
    if (emptyRow !== tileRow) return false
    return (emptyCol < tileCol && dx < 0) || (emptyCol > tileCol && dx > 0)
  }

  if (emptyCol !== tileCol) return false
  return (emptyRow < tileRow && dy < 0) || (emptyRow > tileRow && dy > 0)
}

export function PuzzleBoard({ tiles, size, onTileClick, disabled, movingTile, shakeDirection, imageUrl, imageLoading, completed }) {
  const emptyTile = getEmptyTile(size)
  const emptyIndex = tiles.indexOf(emptyTile)
  const tileSize = 100 / size
  const tilePositions = new Map(tiles.map((tile, index) => [tile, index]))
  const numberFontSize = `clamp(1.45rem, ${22 / size}vw, ${10 / size}rem)`
  const revealImage = Boolean(imageUrl && completed)
  const showThumbnail = Boolean(imageUrl && !completed && !imageLoading)
  const gestureRef = useRef(null)
  const suppressClickRef = useRef(false)

  function handlePointerDown(event, index, canMove) {
    if (!canMove || !event.isPrimary) return

    gestureRef.current = {
      pointerId: event.pointerId,
      tileIndex: index,
      startX: event.clientX,
      startY: event.clientY,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handlePointerUp(event, index) {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.tileIndex !== index) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD_PX) return

    suppressClickRef.current = true
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 80)

    if (isSwipeTowardEmpty(index, emptyIndex, size, dx, dy)) {
      onTileClick(index)
    }
  }

  function handlePointerCancel(event) {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  function handleClick(event, tile) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      event.preventDefault()
      event.stopPropagation()
      return
    }

    onTileClick(tilePositions.get(tile))
  }

  return (
    <div
      tabIndex={0}
      className={`relative aspect-square w-full overflow-hidden rounded-2xl border-[5px] border-white bg-violet-100 shadow-2xl shadow-violet-200/60 outline-none focus:outline-none sm:rounded-[2rem] sm:border-[10px] ${
        shakeDirection ? `board-shake-${shakeDirection}` : ''
      }`}
      aria-label={`${size} 곱하기 ${size} 슬라이딩 퍼즐판. 방향키 또는 WASD로 빈칸을 움직일 수 있습니다.`}
      style={{
        touchAction: 'pan-y',
        backgroundImage: revealImage
          ? `url(${imageUrl})`
          : 'linear-gradient(135deg, rgba(255,255,255,.5) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,.35) 25%, transparent 25%)',
        backgroundPosition: revealImage ? 'center' : undefined,
        backgroundRepeat: revealImage ? 'no-repeat' : undefined,
        backgroundSize: revealImage ? 'cover' : `${tileSize}% ${tileSize}%`,
      }}
    >
      {showThumbnail && (
        <div className="pointer-events-none absolute right-2 top-2 z-20 size-16 overflow-hidden rounded-xl border-2 border-white/90 bg-white shadow-xl shadow-violet-950/25 sm:right-4 sm:top-4 sm:size-24 sm:rounded-2xl sm:border-4">
          <img className="size-full object-cover" src={imageUrl} alt="퍼즐 원본 이미지 미리보기" />
        </div>
      )}

      {imageLoading && (
        <div className="absolute inset-0 z-10 bg-violet-100" aria-label="이미지 퍼즐 불러오는 중">
          <div
            className="grid h-full gap-1.5 p-1.5 sm:gap-3 sm:p-3"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: size * size }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border-2 border-white/70 bg-gradient-to-br from-white/90 via-violet-100 to-sky-100 shadow-inner sm:rounded-3xl sm:border-4"
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="absolute inset-0 grid place-items-center bg-white/20">
            <div className="grid place-items-center gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-4 py-3 text-xs font-black text-violet-950 shadow-xl shadow-violet-950/20 sm:rounded-3xl sm:border-4 sm:px-5 sm:py-4 sm:text-sm">
              <div className="size-7 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600 sm:size-9" aria-hidden="true" />
              <span>이미지 불러오는 중</span>
            </div>
          </div>
        </div>
      )}

      <div
        className={`absolute rounded-xl border-2 border-dashed border-violet-200/90 bg-white/35 transition-opacity duration-500 ease-out sm:rounded-3xl sm:border-4 ${
          revealImage ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
        style={{
          width: `${tileSize}%`,
          height: `${tileSize}%`,
          transform: `translate(${(emptyIndex % size) * 100}%, ${Math.floor(emptyIndex / size) * 100}%)`,
        }}
      />

      {createSolvedTiles(size).map((tile) => {
        if (tile === emptyTile) return null

        const index = tilePositions.get(tile)
        const row = Math.floor(index / size)
        const col = index % size
        const canMove = !disabled && isAdjacent(index, emptyIndex, size)
        const colorClass = BLOCK_COLORS[tile % BLOCK_COLORS.length]
        const imageRow = Math.floor(tile / size)
        const imageCol = tile % size
        const tileStyle = imageUrl
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${size * 100}% ${size * 100}%`,
              backgroundPosition: `${(imageCol / (size - 1)) * 100}% ${(imageRow / (size - 1)) * 100}%`,
            }
          : null

        return (
          <button
            key={tile}
            type="button"
            className={`absolute grid place-items-center rounded-xl border-2 border-white font-black text-violet-950 shadow-lg transition-[transform,box-shadow,filter,opacity] duration-500 ease-out focus:z-10 focus:outline-none focus:ring-4 focus:ring-violet-300 sm:rounded-3xl sm:border-4 ${
              imageUrl ? 'bg-white bg-no-repeat' : `bg-gradient-to-br ${colorClass}`
            } ${revealImage ? 'opacity-0' : 'opacity-100'} ${canMove ? 'cursor-pointer hover:brightness-105 hover:drop-shadow-xl' : 'cursor-default'}`}
            style={{
              width: `${tileSize}%`,
              height: `${tileSize}%`,
              touchAction: canMove ? 'none' : 'pan-y',
              transform: `translate(${col * 100}%, ${row * 100}%) scale(0.94)`,
              transition: 'transform 150ms ease-out, opacity 420ms ease-in-out',
              willChange: 'transform, opacity',
              zIndex: movingTile === tile ? 2 : 1,
              fontSize: numberFontSize,
              ...tileStyle,
            }}
            disabled={disabled || !canMove}
            onPointerDown={(event) => handlePointerDown(event, index, canMove)}
            onPointerUp={(event) => handlePointerUp(event, index)}
            onPointerCancel={handlePointerCancel}
            onClick={(event) => handleClick(event, tile)}
            aria-label={`블록 ${tile + 1}${canMove ? ', 이동 가능' : ''}`}
          >
            {!imageUrl && (
              <span className="flex h-[78%] w-[78%] items-center justify-center rounded-2xl bg-white/45 leading-none shadow-inner">
                <span className="translate-y-[0.06em]">{tile + 1}</span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
