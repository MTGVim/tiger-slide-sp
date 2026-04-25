export function ImageUploader({ onImageSelect, isProcessing }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white/80 px-6 py-8 text-center shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50/50">
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Upload image</span>
      <span className="text-2xl font-bold text-slate-900">퍼즐로 만들 이미지를 선택하세요</span>
      <span className="max-w-md text-sm text-slate-500">
        가로/세로 사진 모두 중앙 정사각형으로 잘라 부드러운 슬라이딩 퍼즐로 변환합니다.
      </span>
      <input
        className="sr-only"
        type="file"
        accept="image/*"
        disabled={isProcessing}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onImageSelect(file)
          event.target.value = ''
        }}
      />
      <span className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm">
        {isProcessing ? '이미지 처리 중...' : '파일 선택'}
      </span>
    </label>
  )
}
