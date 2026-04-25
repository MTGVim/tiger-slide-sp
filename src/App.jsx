import { useMemo, useState } from 'react'
import { Controls } from './components/Controls'
import { PuzzleBoard } from './components/PuzzleBoard'
import { createSolvedTiles, isSolved, moveTile, shuffleTiles } from './utils/puzzle'

function App() {
  const [size, setSize] = useState(3)
  const [tiles, setTiles] = useState(() => shuffleTiles(createSolvedTiles(3), 3))
  const [moves, setMoves] = useState(0)

  const solved = useMemo(() => isSolved(tiles), [tiles])

  function startPuzzle(nextSize = size) {
    setTiles(shuffleTiles(createSolvedTiles(nextSize), nextSize))
    setMoves(0)
  }

  function handleSizeChange(nextSize) {
    setSize(nextSize)
    startPuzzle(nextSize)
  }

  function handleTileClick(tileIndex) {
    if (solved) return

    const nextTiles = moveTile(tiles, tileIndex, size)

    if (nextTiles === tiles) return

    setTiles(nextTiles)
    setMoves((currentMoves) => currentMoves + 1)
  }

  function handleReset() {
    setTiles(createSolvedTiles(size))
    setMoves(0)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fde68a,transparent_32%),radial-gradient(circle_at_bottom_right,#bfdbfe,transparent_34%),linear-gradient(135deg,#fff7ed,#fdf2f8_45%,#eef2ff)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-rose-500">Pastel Number Puzzle</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            숫자 블록 슬라이딩 퍼즐
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            파스텔톤 숫자 블록을 움직여 순서대로 맞춰보세요. 셔플은 정답 상태에서 빈칸을 이동하는 방식이라 항상 풀 수 있습니다.
          </p>
        </header>

        <Controls
          size={size}
          moves={moves}
          solved={solved}
          onSizeChange={handleSizeChange}
          onShuffle={() => startPuzzle(size)}
          onReset={handleReset}
        />

        <section className="mx-auto grid w-full max-w-[720px] gap-5">
          <PuzzleBoard tiles={tiles} size={size} onTileClick={handleTileClick} />
          <div className="rounded-3xl border border-white/70 bg-white/70 p-5 text-sm text-slate-600 shadow-sm backdrop-blur">
            <ul className="grid gap-2 text-left sm:grid-cols-3">
              <li>• 인접한 블록만 이동</li>
              <li>• 3x3 / 4x4 / 5x5 지원</li>
              <li>• 이동 횟수와 완료 판정 제공</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
