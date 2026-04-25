<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# public

## Purpose

브라우저에 그대로 제공되는 정적 자산을 포함합니다. PWA 매니페스트, 아이콘, 서비스워커 원본, 소리 파일이 이 디렉터리에 있습니다.

## Key Files

| File | Description |
|------|-------------|
| `manifest.webmanifest` | PWA 이름, 아이콘, 표시 모드 등 앱 매니페스트입니다. |
| `sw.js` | 개발/원본 서비스워커 파일입니다. production build에서는 `vite.config.js`가 `dist/sw.js`를 생성합니다. |
| `favicon.png` | 브라우저 favicon입니다. |
| `icons.svg` | 앱 아이콘 벡터 자산입니다. |
| `pwa-192x192.png` | PWA 192px 아이콘입니다. |
| `pwa-512x512.png` | PWA 512px 아이콘입니다. |
| `apple-touch-icon.png` | iOS 홈 화면 아이콘입니다. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `sounds/` | 퍼즐 이동음에 쓰이는 wav 파일과 라이선스 메모를 포함합니다. See `sounds/AGENTS.md`. |

## For AI Agents

### Working In This Directory

- 이 디렉터리의 파일은 번들링 없이 public path로 제공됩니다.
- GitHub Pages에서는 base path가 `/tiger-slide-sp/`로 바뀌므로 경로 검증이 필요합니다.
- `public/sw.js`는 원본 참고용이고 production 출력은 빌드 플러그인이 생성하는 `dist/sw.js`입니다.

### Testing Requirements

- PWA 자산이나 서비스워커 관련 변경 후 `GITHUB_PAGES=true npm run build`를 실행합니다.
- 빌드 후 `dist/sw.js`와 `dist/index.html`의 base path를 확인합니다.

### Common Patterns

- public 자산 참조는 `import.meta.env.BASE_URL`를 통해 base path를 고려합니다.
- 서비스워커 app shell에는 핵심 아이콘과 `sounds/slide-smooth.wav`가 포함됩니다.

## Dependencies

### Internal

- `src/utils/serviceWorker.js`가 `sw.js` 등록 경로를 계산합니다.
- `src/utils/sound.js`가 `sounds/slide-smooth.wav`를 사용합니다.
- `vite.config.js`가 production 서비스워커를 생성합니다.

### External

- Browser Service Worker API
- Web App Manifest

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
