import { DIFFICULTIES } from '../utils/puzzle'

export function Controls({ size, moves, elapsedTime, onSizeChange, onShuffle, onReset }) {
  return (
    <section className="rounded-[1.5rem] border-4 border-white/80 bg-white/70 p-3 shadow-xl shadow-violet-200/40 backdrop-blur sm:p-4">
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-black sm:text-base">
        <span className="rounded-xl bg-white/60 px-3 py-1.5 text-violet-950">
          {size}x{size} · 이동 {moves} · 시간 {elapsedTime}
        </span>

        {DIFFICULTIES.map((difficulty) => (
          <button
            key={difficulty.size}
            type="button"
            className={`rounded-xl border-2 border-white/80 px-3 py-1.5 text-sm font-extrabold shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-200 ${
              size === difficulty.size
                ? 'bg-violet-500 text-white'
                : 'bg-violet-100 text-violet-900 hover:bg-violet-200'
            }`}
            onClick={() => onSizeChange(difficulty.size)}
          >
            {difficulty.label}
          </button>
        ))}

        <button
          type="button"
          className="rounded-xl border-2 border-white/80 bg-rose-200 px-3 py-1.5 text-sm font-extrabold text-rose-950 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-200"
          onClick={onShuffle}
        >
          새 게임
        </button>
        <button
          type="button"
          className="rounded-xl border-2 border-white/80 bg-amber-200 px-3 py-1.5 text-sm font-extrabold text-amber-950 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-amber-200"
          onClick={onReset}
        >
          다시하기
        </button>
      </div>
    </section>
  )
}
