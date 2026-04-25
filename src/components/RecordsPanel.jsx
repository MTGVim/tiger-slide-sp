import { DIFFICULTIES } from '../utils/puzzle'
import { formatSeconds } from '../utils/time'

export function RecordsPanel({ records }) {
  return (
    <section
      className="rounded-2xl border-2 border-white/80 bg-white/70 p-2.5 shadow-xl shadow-violet-200/40 backdrop-blur sm:rounded-[2rem] sm:border-4 sm:p-5"
      aria-label="개인 최고 기록"
    >
      <h2 className="text-sm font-black text-violet-950 sm:text-lg">최고 기록</h2>
      <div className="mt-2 grid gap-1.5 sm:mt-3 sm:gap-3">
        {DIFFICULTIES.map((difficulty) => {
          const record = records[difficulty.size]

          return (
            <div
              key={difficulty.size}
              className="flex min-w-0 items-center justify-between gap-1.5 rounded-xl bg-white/70 px-2 py-1.5 text-xs sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
            >
              <p className="min-w-0 shrink truncate font-black text-violet-900">
                {difficulty.label} <span className="font-semibold text-violet-600">{difficulty.size}x{difficulty.size}</span>
              </p>
              {record ? (
                <p className="min-w-0 shrink-0 truncate text-right text-xs font-black text-violet-900 sm:text-sm">
                  {record.moves}회 · <span className="text-violet-600">{formatSeconds(record.seconds)}</span>
                </p>
              ) : (
                <p className="text-xs font-bold text-violet-400 sm:text-sm">없음</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
