<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# workflows

## Purpose

GitHub Actions 워크플로를 포함합니다. 현재는 `master` 브랜치를 GitHub Pages에 배포하는 워크플로가 있습니다.

## Key Files

| File | Description |
|------|-------------|
| `deploy-pages.yml` | `master` push 또는 수동 실행 시 npm 의존성을 설치하고 `GITHUB_PAGES=true npm run build`로 빌드한 뒤 Pages에 배포합니다. |

## Subdirectories

이 디렉터리에는 하위 디렉터리가 없습니다.

## For AI Agents

### Working In This Directory

- 워크플로 권한은 필요한 최소 범위를 유지합니다.
- 배포 대상 브랜치나 Node 버전 변경은 사용자 확인 없이 바꾸지 않습니다.
- build job과 deploy job의 의존 관계를 유지합니다.

### Testing Requirements

- 워크플로 변경 후 YAML 구조를 확인합니다.
- 로컬에서 `GITHUB_PAGES=true npm run build`가 성공하는지 확인합니다.

### Common Patterns

- `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`를 사용합니다.
- `permissions`에는 Pages 배포에 필요한 `contents`, `pages`, `id-token`을 둡니다.

## Dependencies

### Internal

- 루트 `package.json`
- `package-lock.json`
- `vite.config.js`

### External

- GitHub Actions hosted runner
- GitHub Pages deployment actions

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
