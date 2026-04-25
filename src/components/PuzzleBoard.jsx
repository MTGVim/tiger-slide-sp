import { isAdjacent } from '../utils/puzzle'

const BLOCK_COLORS = [
  'bg-rose-200 text-rose-900 shadow-rose-200/60',
  'bg-orange-200 text-orange-900 shadow-orange-200/60',
  'bg-amber-200 text-amber-900 shadow-amber-200/60',
  'bg-yellow-200 text-yellow-900 shadow-yellow-200/60',
  'bg-lime-200 text-lime-900 shadow-lime-200/60',
  'bg-emerald-200 text-emerald-900 shadow-emerald-200/60',
  'bg-cyan-200 text-cyan-900 shadow-cyan-200/60',
  'bg-sky-200 text-sky-900 shadow-sky-200/60',
  'bg-indigo-200 text-indigo-900 shadow-indigo-200/60',
  'bg-violet-200 text-violet-900 shadow-violet-200/60',
  'bg-fuchsia-200 text-fuchsia-900 shadow-fuchsia-200/60',
  'bg-pink-200 text-pink-900 shadow-pink-200/60',
]

export function PuzzleBoard({ tiles, size, onTileClick }) {
  const emptyTile = size * size - 1
  const emptyIndex = tiles.indexOf(emptyTile)
  const tileSize = 100 / size

  return (
    <div className="rounded-[2rem] bg-white/70 p-3 shadow-2xl shadow-slate-300/70 ring-1 ring-white/80 backdrop-blur">
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-white/80">
        <div
          className="absolute rounded-2xl bg-slate-200/70 ring-2 ring-inset ring-white/80"
          style={{
            width: `${tileSize}%`,
            height: `${tileSize}%`,
            left: `${(emptyIndex % size) * tileSize}%`,
            top: `${Math.floor(emptyIndex / size) * tileSize}%`,
          }}
        />

        {tiles.map((tileId, index) => {
          if (tileId === emptyTile) return null

          const currentRow = Math.floor(index / size)
          const currentCol = index % size
          const canMove = isAdjacent(index, emptyIndex, size)
          const colorClass = BLOCK_COLORS[tileId % BLOCK_COLORS.length]

          return (
            <button
              key={tileId}
              type="button"
              className={`absolute rounded-2xl border-4 border-white/80 shadow-lg transition-all duration-150 ease-out ${colorClass} ${
                canMove
                  ? 'cursor-pointer hover:z-10 hover:scale-[1.04] hover:ring-4 hover:ring-white/90'
                  : 'cursor-default'
              }`}
              style={{
                width: `${tileSize}%`,
                height: `${tileSize}%`,
                transform: `translate(${currentCol * 100}%, ${currentRow * 100}%)`,
              }}
              disabled={!canMove}
              onClick={() => onTileClick(index)}
              aria-label={`${tileId + 1}번 타일`}
            >
              <span className="flex h-full w-full items-center justify-center text-4xl font-black drop-shadow-sm sm:text-5xl">
                {tileId + 1}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
