<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# assets

## Purpose

앱에서 사용할 수 있는 정적 이미지 자산을 포함합니다. 현재는 Vite/React 기본 자산과 호랑이 테마 이미지가 함께 있습니다.

## Key Files

| File | Description |
|------|-------------|
| `hero.png` | 앱 테마에 사용할 수 있는 히어로 이미지 자산입니다. |
| `react.svg` | Vite React 템플릿 기본 React 로고입니다. |
| `vite.svg` | Vite 템플릿 기본 Vite 로고입니다. |

## Subdirectories

이 디렉터리에는 하위 디렉터리가 없습니다.

## For AI Agents

### Working In This Directory

- 이미지 자산을 교체할 때는 실제 참조 여부를 먼저 확인합니다.
- 큰 이미지 추가 시 번들 크기와 모바일 로딩 비용을 고려합니다.
- PWA 아이콘은 `public/`에 있으므로 앱 내부 이미지와 혼동하지 않습니다.

### Testing Requirements

- 참조되는 이미지 변경 후 `npm run build`를 실행합니다.
- UI에 표시되는 이미지라면 개발 서버에서 화면을 확인합니다.

### Common Patterns

- Vite가 import한 정적 자산을 빌드 시 fingerprinted asset으로 처리합니다.

## Dependencies

### Internal

- 이미지가 사용될 경우 `src/` 컴포넌트나 CSS에서 참조됩니다.

### External

- Vite asset pipeline

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
