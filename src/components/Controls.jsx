import { DIFFICULTIES } from '../utils/puzzle'

export function Controls({ size, moves, elapsedTime, solved, onSizeChange, onShuffle, onReset }) {
  return (
    <section className="rounded-[2rem] border-4 border-white/80 bg-white/70 p-5 shadow-xl shadow-violet-200/40 backdrop-blur">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3">
          <p className="text-lg font-black text-violet-950">
            {size}x{size}
          </p>
          <div className="flex gap-4 text-sm font-black text-violet-700 sm:text-base">
            <span>이동 {moves}</span>
            <span>시간 {elapsedTime}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty.size}
                type="button"
                className={`rounded-2xl border-2 border-white/80 px-4 py-2 font-extrabold shadow-md transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-violet-200 ${
                  size === difficulty.size
                    ? 'bg-violet-500 text-white'
                    : 'bg-violet-100 text-violet-900 hover:bg-violet-200'
                }`}
                onClick={() => onSizeChange(difficulty.size)}
              >
                {difficulty.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-2xl border-2 border-white/80 bg-rose-200 px-4 py-2 font-extrabold text-rose-950 shadow-md transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
              onClick={onShuffle}
            >
              새 게임
            </button>
            <button
              type="button"
              className="rounded-2xl border-2 border-white/80 bg-amber-200 px-4 py-2 font-extrabold text-amber-950 shadow-md transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-200"
              onClick={onReset}
            >
              리셋
            </button>
          </div>
        </div>
      </div>

      {solved ? (
        <p className="mt-4 rounded-2xl border-2 border-white/80 bg-emerald-200 px-4 py-3 text-sm font-black text-emerald-950">
          완료했습니다! 새 게임을 눌러 다시 도전해보세요.
        </p>
      ) : null}
    </section>
  )
}
