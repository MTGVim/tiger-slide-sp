<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# sounds

## Purpose

퍼즐 이동과 관련된 wav 소리 파일을 포함합니다. 라이선스와 출처는 `README.md`에 기록합니다.

## Key Files

| File | Description |
|------|-------------|
| `README.md` | 각 소리 파일의 출처, 라이선스, 편집 내용을 설명합니다. |
| `slide-smooth.wav` | 현재 이동음으로 사용하는 부드러운 슬라이드 소리입니다. |
| `slide-scrape.wav` | 원본 scrape 계열 소리 파일입니다. |
| `slide-swish.wav` | 이전에 사용한 swish 계열 이동 소리입니다. |

## Subdirectories

이 디렉터리에는 하위 디렉터리가 없습니다.

## For AI Agents

### Working In This Directory

- 새 소리 파일을 추가하면 반드시 `README.md`에 출처와 라이선스를 기록합니다.
- `slide-smooth.wav`는 production 서비스워커 app shell에 포함되므로 이름 변경 시 `vite.config.js` 검증도 필요합니다.
- 소리 파일 교체는 사용자 체감이 크므로 브라우저에서 직접 들어보고 확인합니다.

### Testing Requirements

- 소리 파일 이름이나 경로 변경 후 `GITHUB_PAGES=true npm run build`를 실행합니다.
- `dist/sw.js`에 필요한 소리 경로가 포함되는지 확인합니다.

### Common Patterns

- CC0 자산을 사용하고 출처를 문서화합니다.
- 실제 재생은 `src/utils/sound.js`에서 담당합니다.

## Dependencies

### Internal

- `src/utils/sound.js`
- `vite.config.js`

### External

- HTMLAudioElement

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
