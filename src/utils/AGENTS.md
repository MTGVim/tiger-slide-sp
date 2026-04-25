<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# utils

## Purpose

UI와 분리된 퍼즐 규칙, 기록 저장, 서비스워커 등록, 소리 재생, 시간 포맷 유틸리티를 포함합니다.

## Key Files

| File | Description |
|------|-------------|
| `puzzle.js` | 난이도, 퍼즐 생성, 인접 판정, 이동, 키보드 이동 대상 계산, 섞기 로직을 제공합니다. |
| `records.js` | localStorage 기반 최고 기록 읽기/쓰기와 더 좋은 기록 판정을 제공합니다. |
| `serviceWorker.js` | production 환경에서 서비스워커 등록, 업데이트 알림, 오프라인 준비 알림을 처리합니다. |
| `sound.js` | 이동음, 이동 마무리음, 완료음을 재생합니다. |
| `time.js` | 초 단위 시간을 `m:ss` 문자열로 변환합니다. |

## Subdirectories

이 디렉터리에는 하위 디렉터리가 없습니다.

## For AI Agents

### Working In This Directory

- `puzzle.js`는 순수 함수 중심으로 유지하고 UI 상태를 넣지 않습니다.
- `records.js`는 테스트하기 쉽도록 storage 인자를 받을 수 있는 형태를 유지합니다.
- `sound.js`는 브라우저 오디오 제한을 고려해 재생 실패를 사용자 흐름에서 방해하지 않게 처리합니다.
- `serviceWorker.js`는 production 환경에서만 동작해야 합니다.

### Testing Requirements

- `puzzle.js`나 `records.js` 변경 시 `npm test -- --run`을 실행합니다.
- `sound.js` 변경은 자동 테스트 외에 브라우저에서 소리 켜기/끄기와 실제 이동음을 수동 확인합니다.
- `serviceWorker.js` 변경은 `GITHUB_PAGES=true npm run build`와 배포 경로 검증을 실행합니다.

### Common Patterns

- 실패 가능한 브라우저 API는 조용히 fallback하거나 무시합니다.
- 퍼즐 배열은 숫자 tile id 배열이고, 빈 칸은 `size * size - 1`입니다.
- 기록은 난이도 크기를 key로 저장합니다.

## Dependencies

### Internal

- `App.jsx`가 이 디렉터리의 대부분 유틸리티를 직접 사용합니다.
- `components/RecordsPanel.jsx`가 `time.js`와 `puzzle.js`를 사용합니다.

### External

- Web Audio API
- HTMLAudioElement
- Service Worker API
- localStorage

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
