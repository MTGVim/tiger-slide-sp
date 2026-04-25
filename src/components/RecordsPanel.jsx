import { DIFFICULTIES } from '../utils/puzzle'
import { formatSeconds } from '../utils/time'

export function RecordsPanel({ records }) {
  return (
    <section
      className="rounded-[2rem] border-4 border-white/80 bg-white/70 p-4 shadow-xl shadow-violet-200/40 backdrop-blur sm:p-5"
      aria-label="개인 최고 기록"
    >
      <h2 className="text-base font-black text-violet-950 sm:text-lg">최고 기록</h2>
      <div className="mt-2 grid gap-2 sm:mt-3 sm:gap-3">
        {DIFFICULTIES.map((difficulty) => {
          const record = records[difficulty.size]

          return (
            <div
              key={difficulty.size}
              className="flex items-center justify-between gap-2 rounded-2xl bg-white/70 px-3 py-2 text-sm sm:gap-3 sm:px-4 sm:py-3"
            >
              <p className="shrink-0 font-black text-violet-900">
                {difficulty.label} <span className="font-semibold text-violet-600">{difficulty.size}x{difficulty.size}</span>
              </p>
              {record ? (
                <p className="truncate text-right text-xs font-black text-violet-900 sm:text-sm">
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
