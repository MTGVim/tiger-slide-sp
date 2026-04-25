import { isAdjacent } from '../utils/puzzle'

export function PuzzleBoard({ tiles, size, imageUrl, onTileClick }) {
  const emptyTile = size * size - 1
  const emptyIndex = tiles.indexOf(emptyTile)

  return (
    <div className="rounded-[2rem] bg-slate-900 p-3 shadow-2xl shadow-slate-300/70">
      <div
        className="grid aspect-square w-full overflow-hidden rounded-[1.5rem] bg-slate-800"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {tiles.map((tileId, index) => {
          const isEmpty = tileId === emptyTile
          const row = Math.floor(tileId / size)
          const col = tileId % size
          const x = size === 1 ? 0 : (col / (size - 1)) * 100
          const y = size === 1 ? 0 : (row / (size - 1)) * 100
          const canMove = !isEmpty && isAdjacent(index, emptyIndex, size)

          return (
            <button
              key={tileId}
              type="button"
              className={`relative border border-slate-900/30 transition-all duration-150 ease-out ${
                isEmpty
                  ? 'cursor-default bg-slate-950/90'
                  : canMove
                    ? 'cursor-pointer hover:z-10 hover:scale-[1.03] hover:ring-4 hover:ring-indigo-300'
                    : 'cursor-default'
              }`}
              style={
                isEmpty || !imageUrl
                  ? undefined
                  : {
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: `${size * 100}% ${size * 100}%`,
                      backgroundPosition: `${x}% ${y}%`,
                    }
              }
              disabled={isEmpty || !canMove}
              onClick={() => onTileClick(index)}
              aria-label={isEmpty ? '빈칸' : `${tileId + 1}번 타일`}
            >
              {!imageUrl && !isEmpty ? (
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
