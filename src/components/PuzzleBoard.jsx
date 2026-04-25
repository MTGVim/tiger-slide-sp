import { isAdjacent } from '../utils/puzzle'

export function PuzzleBoard({ tiles, size, imageUrl, onTileClick }) {
  const emptyTile = size * size - 1
  const emptyIndex = tiles.indexOf(emptyTile)
  const tileSize = 100 / size

  return (
    <div className="rounded-[2rem] bg-slate-900 p-3 shadow-2xl shadow-slate-300/70">
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-slate-800">
        <div
          className="absolute bg-slate-950/90"
          style={{
            width: `${tileSize}%`,
            height: `${tileSize}%`,
            left: `${(emptyIndex % size) * tileSize}%`,
            top: `${Math.floor(emptyIndex / size) * tileSize}%`,
          }}
        />

        {tiles.map((tileId, index) => {
          if (tileId === emptyTile) return null

          const correctRow = Math.floor(tileId / size)
          const correctCol = tileId % size
          const currentRow = Math.floor(index / size)
          const currentCol = index % size
          const x = size === 1 ? 0 : (correctCol / (size - 1)) * 100
          const y = size === 1 ? 0 : (correctRow / (size - 1)) * 100
          const canMove = isAdjacent(index, emptyIndex, size)

          return (
            <button
              key={tileId}
              type="button"
              className={`absolute border border-slate-900/30 transition-all duration-150 ease-out ${
                canMove
                  ? 'cursor-pointer hover:z-10 hover:scale-[1.03] hover:ring-4 hover:ring-indigo-300'
                  : 'cursor-default'
              }`}
              style={{
                width: `${tileSize}%`,
                height: `${tileSize}%`,
                transform: `translate(${currentCol * 100}%, ${currentRow * 100}%)`,
                backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                backgroundSize: imageUrl ? `${size * 100}% ${size * 100}%` : undefined,
                backgroundPosition: imageUrl ? `${x}% ${y}%` : undefined,
              }}
              disabled={!canMove}
              onClick={() => onTileClick(index)}
              aria-label={`${tileId + 1}번 타일`}
            >
              {!imageUrl ? (
                <span className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
                  {tileId + 1}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
