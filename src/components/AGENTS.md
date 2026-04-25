<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# components

## Purpose

퍼즐 앱의 재사용 화면 컴포넌트를 포함합니다. 보드, 조작부, 최고 기록 패널, PWA 업데이트 알림을 각각 독립 컴포넌트로 나눕니다.

## Key Files

| File | Description |
|------|-------------|
| `Controls.jsx` | 이동 수, 시간, 난이도, 새 게임, 다시하기, 소리 끄기 버튼을 렌더링합니다. |
| `PuzzleBoard.jsx` | 슬라이딩 퍼즐 보드와 블록 버튼, 클릭/드래그 입력, 흔들림 상태를 렌더링합니다. |
| `PwaUpdatePrompt.jsx` | 오프라인 준비 및 새 버전 업데이트 안내 UI를 표시합니다. |
| `RecordsPanel.jsx` | 난이도별 최고 기록을 표시합니다. |

## Subdirectories

이 디렉터리에는 하위 디렉터리가 없습니다.

## For AI Agents

### Working In This Directory

- 컴포넌트는 가능한 한 props로 필요한 상태와 콜백만 받습니다.
- `PuzzleBoard.jsx`의 드래그 처리는 이동 가능한 인접 블록에만 적용됩니다.
- 보드 관련 터치 동작을 수정할 때는 모바일 스크롤과 PC 클릭 후속 이벤트를 함께 고려합니다.
- 버튼 스타일은 기존 둥근 테두리, 밝은 색상, focus ring 패턴을 따릅니다.

### Testing Requirements

- 컴포넌트 변경 후 `npm run lint`를 실행합니다.
- 퍼즐 입력 처리 변경 후 클릭, 드래그, 키보드 이동을 수동 확인합니다.
- PWA 업데이트 UI 변경 후 production build와 서비스워커 등록 경로를 확인합니다.

### Common Patterns

- 모든 버튼은 `type="button"`을 명시합니다.
- 접근성 라벨은 한국어로 제공합니다.
- Tailwind utility class를 직접 사용합니다.
- 시각 상태는 부모 상태 또는 props로 전달받습니다.

## Dependencies

### Internal

- `Controls.jsx`와 `RecordsPanel.jsx`는 `src/utils/puzzle.js`의 난이도 정보를 사용합니다.
- `RecordsPanel.jsx`은 `src/utils/time.js`의 시간 포맷터를 사용합니다.
- `PwaUpdatePrompt.jsx`는 `src/utils/serviceWorker.js`를 사용합니다.

### External

- React 훅
- Tailwind CSS 클래스

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
