import { DIFFICULTIES } from '../utils/puzzle'

export function SoundMuteButton({ soundMuted, onSoundMutedChange }) {
  return (
    <button
      type="button"
      className={`absolute right-2 top-2 grid size-7 place-items-center rounded-lg border-2 border-white/80 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 sm:right-4 sm:top-4 sm:size-9 sm:rounded-xl ${
        soundMuted
          ? 'bg-slate-200 text-slate-600 hover:bg-slate-300 focus:ring-slate-200'
          : 'bg-emerald-200 text-emerald-950 hover:bg-emerald-300 focus:ring-emerald-200'
      }`}
      aria-label={soundMuted ? '소리 켜기' : '소리 끄기'}
      aria-pressed={soundMuted}
      title={soundMuted ? '소리 켜기' : '소리 끄기'}
      onClick={() => onSoundMutedChange((muted) => !muted)}
    >
      {soundMuted ? (
        <svg className="size-4 sm:size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4Z" />
          <path d="m17 9 4 4m0-4-4 4" />
        </svg>
      ) : (
        <svg className="size-4 sm:size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4Z" />
          <path d="M17 8c1.3 1 2 2.4 2 4s-.7 3-2 4" />
          <path d="M19.5 5.5A8.5 8.5 0 0 1 22 12a8.5 8.5 0 0 1-2.5 6.5" />
        </svg>
      )}
    </button>
  )
}

export function Controls({
  size,
  moves,
  elapsedTime,
  onSizeChange,
  onShuffle,
  onReset,
}) {
  return (
    <section className="rounded-2xl border-2 border-white/80 bg-white/70 p-2 shadow-xl shadow-violet-200/40 backdrop-blur sm:rounded-[1.5rem] sm:border-4 sm:p-4">
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-xs font-black min-[360px]:gap-2 sm:text-base">
        <div className="flex flex-row items-center gap-1.5 min-[360px]:gap-2">
          <span className="rounded-lg bg-white/60 px-2 py-1 text-violet-950 sm:rounded-xl sm:px-3 sm:py-1.5">
            이동 {moves} · 시간 {elapsedTime}
          </span>
        </div>

        <div className="flex flex-row gap-1.5 min-[360px]:gap-2">
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty.size}
              type="button"
              className={`rounded-lg border-2 border-white/80 px-2 py-1 text-xs font-extrabold shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-200 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm ${
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

        <div className="flex flex-row gap-1.5 min-[360px]:gap-2">
          <button
            type="button"
            className="rounded-lg border-2 border-white/80 bg-rose-200 px-2 py-1 text-xs font-extrabold text-rose-950 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-200 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm"
            onClick={onShuffle}
          >
            새 게임
          </button>
          <button
            type="button"
            className="rounded-lg border-2 border-white/80 bg-amber-200 px-2 py-1 text-xs font-extrabold text-amber-950 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-amber-200 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm"
            onClick={onReset}
          >
            다시하기
          </button>
        </div>
      </div>
    </section>
  )
}
