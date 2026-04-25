const DIFFICULTIES = [
  { label: 'Easy', size: 3 },
  { label: 'Normal', size: 4 },
  { label: 'Hard', size: 5 },
]

export function Controls({ size, moves, solved, hasImage, onSizeChange, onShuffle, onReset }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-left">
          <p className="text-sm font-medium text-slate-500">Moves</p>
          <p className="text-4xl font-black text-slate-900">{moves}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty.size}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                size === difficulty.size
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => onSizeChange(difficulty.size)}
            >
              {difficulty.label} {difficulty.size}x{difficulty.size}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!hasImage}
            onClick={onShuffle}
          >
            셔플
          </button>
          <button
            type="button"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            disabled={!hasImage}
            onClick={onReset}
          >
            리셋
          </button>
        </div>
      </div>

      {solved && hasImage ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          완료했습니다! 셔플을 눌러 다시 도전해보세요.
        </p>
      ) : null}
    </section>
  )
}
