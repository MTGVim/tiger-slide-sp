import { useMemo, useState } from 'react'
import { Controls } from './components/Controls'
import { ImageUploader } from './components/ImageUploader'
import { PuzzleBoard } from './components/PuzzleBoard'
import { processImage } from './utils/image'
import { createSolvedTiles, isSolved, moveTile, shuffleTiles } from './utils/puzzle'

function App() {
  const [size, setSize] = useState(3)
  const [imageUrl, setImageUrl] = useState(null)
  const [tiles, setTiles] = useState(() => shuffleTiles(createSolvedTiles(3), 3))
  const [moves, setMoves] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const solved = useMemo(() => isSolved(tiles), [tiles])
  const hasImage = Boolean(imageUrl)

  function startPuzzle(nextSize = size) {
    setTiles(shuffleTiles(createSolvedTiles(nextSize), nextSize))
    setMoves(0)
  }

  async function handleImageSelect(file) {
    setIsProcessing(true)
    setError('')

    try {
      const processedImageUrl = await processImage(file)
      setImageUrl(processedImageUrl)
      startPuzzle(size)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setIsProcessing(false)
    }
  }

  function handleSizeChange(nextSize) {
    setSize(nextSize)
    startPuzzle(nextSize)
  }

  function handleTileClick(tileIndex) {
    if (!hasImage || solved) return

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-600">Image Sliding Puzzle</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            내 이미지로 만드는 슬라이딩 퍼즐
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            이미지를 업로드하면 중앙 crop과 resize를 거쳐 항상 풀 수 있는 3x3, 4x4, 5x5 퍼즐을 생성합니다.
          </p>
        </header>

        <ImageUploader onImageSelect={handleImageSelect} isProcessing={isProcessing} />

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-center font-semibold text-red-600">{error}</p> : null}

        <Controls
          size={size}
          moves={moves}
          solved={solved}
          hasImage={hasImage}
          onSizeChange={handleSizeChange}
          onShuffle={() => startPuzzle(size)}
          onReset={handleReset}
        />

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="mx-auto w-full max-w-[680px]">
            <PuzzleBoard tiles={tiles} size={size} imageUrl={imageUrl} onTileClick={handleTileClick} />
            {!hasImage ? (
              <p className="mt-4 text-center text-sm font-medium text-slate-500">
                이미지를 업로드하면 숫자 퍼즐이 이미지 퍼즐로 바뀝니다.
              </p>
            ) : null}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-left text-lg font-black text-slate-900">원본 Preview</h2>
            <div className="mt-4 aspect-square overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
              {imageUrl ? (
                <img className="h-full w-full object-cover" src={imageUrl} alt="퍼즐 원본 미리보기" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-slate-400">
                  업로드한 이미지가 여기에 표시됩니다.
                </div>
              )}
            </div>
            <ul className="mt-5 space-y-2 text-left text-sm text-slate-600">
              <li>• 정답 상태에서 빈칸을 랜덤 이동해 항상 풀 수 있습니다.</li>
              <li>• 인접한 타일만 클릭해서 이동할 수 있습니다.</li>
              <li>• 셔플은 현재 이미지와 난이도를 유지합니다.</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  )
}

export default App
