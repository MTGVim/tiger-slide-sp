<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# src

## Purpose

애플리케이션 소스 코드가 있는 디렉터리입니다. 최상위 앱 상태, 전역 CSS, React 진입점, 화면 컴포넌트, 테스트, 퍼즐/기록/소리/PWA 유틸리티를 포함합니다.

## Key Files

| File | Description |
|------|-------------|
| `main.jsx` | React 앱을 `#root`에 마운트하는 진입점입니다. |
| `App.jsx` | 퍼즐 게임 상태, 입력 처리, 타이머, 기록, 소리, 완료 효과를 조정합니다. |
| `index.css` | Tailwind import, 전역 레이아웃 잠금, 선택 방지, 보드 흔들림 애니메이션을 정의합니다. |
| `App.css` | 앱 보조 스타일 파일입니다. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | 화면 구성 React 컴포넌트를 포함합니다. See `components/AGENTS.md`. |
| `utils/` | 퍼즐 규칙, 저장소, 서비스워커, 소리, 시간 유틸리티를 포함합니다. See `utils/AGENTS.md`. |
| `test/` | Vitest 기반 유틸리티 테스트를 포함합니다. See `test/AGENTS.md`. |
| `assets/` | Vite 기본 이미지와 앱 이미지 자산을 포함합니다. See `assets/AGENTS.md`. |

## For AI Agents

### Working In This Directory

- 게임 규칙 변경은 가능하면 `utils/`에 두고, `App.jsx`는 상태 조정과 UI 이벤트 연결에 집중시킵니다.
- 터치/드래그 변경은 iOS WebView 스크롤 잠금과 PC synthetic click 동작을 함께 확인합니다.
- 전역 CSS 변경은 전체 화면 고정 레이아웃과 모바일 viewport 동작에 영향을 줄 수 있습니다.

### Testing Requirements

- `src/utils/` 변경 시 `npm test -- --run`을 실행합니다.
- 입력 처리, 소리, PWA, 전역 CSS 변경 시 `npm run lint`와 production build를 함께 확인합니다.
- UI 변경은 가능하면 개발 서버에서 수동 확인합니다.

### Common Patterns

- 컴포넌트는 named export를 사용합니다.
- 앱 상태는 `App.jsx`에서 `useState`, `useMemo`, `useCallback`, `useRef`, `useEffect`로 관리합니다.
- 사용자가 입력 중인 폼 요소에서는 키보드 퍼즐 조작을 무시합니다.

## Dependencies

### Internal

- `components/`는 `utils/`의 포맷터와 퍼즐 메타데이터를 참조합니다.
- `App.jsx`는 `utils/puzzle.js`, `utils/records.js`, `utils/sound.js`, `utils/time.js`를 조합합니다.

### External

- React
- canvas-confetti
- Tailwind CSS

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
