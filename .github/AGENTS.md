<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# .github

## Purpose

GitHub 저장소 자동화 설정을 포함합니다. 현재는 GitHub Pages 배포 워크플로가 중심입니다.

## Key Files

이 디렉터리 루트에는 직접 관리하는 주요 파일이 없습니다.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `workflows/` | GitHub Actions 워크플로 파일을 포함합니다. See `workflows/AGENTS.md`. |

## For AI Agents

### Working In This Directory

- CI/CD 변경은 공유 원격 상태에 영향을 주므로 사용자 의도를 확인하고 최소 변경으로 진행합니다.
- GitHub Pages 배포는 `master` push와 수동 실행으로 동작합니다.

### Testing Requirements

- 워크플로 변경 후 YAML 문법과 빌드 명령을 확인합니다.
- 로컬에서 가능한 경우 `GITHUB_PAGES=true npm run build`로 같은 빌드를 재현합니다.

### Common Patterns

- Node 22와 npm cache를 사용합니다.
- Pages 배포는 artifact upload 후 deploy job으로 분리되어 있습니다.

## Dependencies

### Internal

- 루트 `package.json`
- `vite.config.js`

### External

- GitHub Actions
- GitHub Pages

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
