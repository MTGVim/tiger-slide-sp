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

export function PuzzleBoard({ tiles, size, onTileClick, disabled, movingTile, shakeDirection }) {
  const emptyTile = getEmptyTile(size)
  const emptyIndex = tiles.indexOf(emptyTile)
  const tileSize = 100 / size
  const tilePositions = new Map(tiles.map((tile, index) => [tile, index]))

  return (
    <div
      tabIndex={0}
      className={`relative aspect-square w-full overflow-hidden rounded-[2rem] border-[10px] border-white bg-violet-100 shadow-2xl shadow-violet-200/60 ${
        shakeDirection ? `board-shake-${shakeDirection}` : ''
      }`}
      aria-label={`${size} 곱하기 ${size} 슬라이딩 퍼즐판. 방향키 또는 WASD로 빈칸을 움직일 수 있습니다.`}
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(255,255,255,.5) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,.35) 25%, transparent 25%)',
        backgroundSize: `${tileSize}% ${tileSize}%`,
      }}
    >
      <div
        className="absolute rounded-3xl border-4 border-dashed border-violet-200/90 bg-white/35"
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

        return (
          <button
            key={tile}
            type="button"
            className={`absolute grid place-items-center rounded-3xl border-4 border-white bg-gradient-to-br ${colorClass} text-3xl font-black text-violet-950 shadow-lg transition-[transform,box-shadow,filter] duration-150 ease-out focus:z-10 focus:outline-none focus:ring-4 focus:ring-violet-300 sm:text-4xl ${
              canMove ? 'cursor-pointer hover:brightness-105 hover:drop-shadow-xl' : 'cursor-default'
            }`}
            style={{
              width: `${tileSize}%`,
              height: `${tileSize}%`,
              transform: `translate(${col * 100}%, ${row * 100}%) scale(0.94)`,
              transition: 'transform 150ms ease, box-shadow 150ms ease, filter 150ms ease',
              willChange: 'transform',
              zIndex: movingTile === tile ? 2 : 1,
            }}
            disabled={disabled || !canMove}
            onClick={() => onTileClick(index)}
            aria-label={`블록 ${tile + 1}${canMove ? ', 이동 가능' : ''}`}
          >
            <span className="grid h-3/5 w-3/5 place-items-center rounded-2xl bg-white/45 shadow-inner">
              {tile + 1}
            </span>
          </button>
        )
      })}
    </div>
  )
}
