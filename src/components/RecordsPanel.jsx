import { DIFFICULTIES } from '../utils/puzzle'
import { formatSeconds } from '../utils/time'

export function RecordsPanel({ records }) {
  return (
    <section
      className="rounded-[2rem] border-4 border-white/80 bg-white/70 p-5 shadow-xl shadow-violet-200/40 backdrop-blur"
      aria-label="개인 최고 기록"
    >
      <h2 className="text-lg font-black text-violet-950">최고 기록</h2>
      <div className="mt-3 grid gap-3">
        {DIFFICULTIES.map((difficulty) => {
          const record = records[difficulty.size]

          return (
            <div
              key={difficulty.size}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3"
            >
              <div>
                <p className="font-black text-violet-900">{difficulty.label}</p>
                <p className="text-sm font-semibold text-violet-600">
                  {difficulty.size}x{difficulty.size}
                </p>
              </div>
              {record ? (
                <p className="text-right text-sm font-black text-violet-900">
                  {record.moves}회 이동
                  <br />
                  <span className="text-violet-600">{formatSeconds(record.seconds)}</span>
                </p>
              ) : (
                <p className="text-sm font-bold text-violet-400">기록 없음</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
