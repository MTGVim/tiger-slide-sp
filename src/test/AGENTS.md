<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# test

## Purpose

Vitest 기반 유틸리티 테스트를 포함합니다. 현재는 퍼즐 규칙과 기록 저장 로직을 검증합니다.

## Key Files

| File | Description |
|------|-------------|
| `puzzle.test.js` | 퍼즐 생성, 인접 판정, 이동, 키보드 이동, 섞기 로직을 테스트합니다. |
| `records.test.js` | 최고 기록 저장/갱신/난이도별 분리와 깨진 저장값 처리를 테스트합니다. |

## Subdirectories

이 디렉터리에는 하위 디렉터리가 없습니다.

## For AI Agents

### Working In This Directory

- 테스트는 사용자 시나리오보다 유틸리티의 결정적 규칙을 검증하는 데 집중합니다.
- storage나 random은 테스트에서 주입 가능한 fake를 사용합니다.
- 새 퍼즐 규칙을 추가하면 먼저 `puzzle.test.js`에 경계 조건을 추가합니다.

### Testing Requirements

- 전체 테스트: `npm test -- --run`
- 테스트 파일 단독 실행이 필요하면 Vitest 파일 경로를 지정할 수 있습니다.

### Common Patterns

- `describe`, `it`, `expect`를 Vitest에서 가져옵니다.
- 순서가 중요하지 않은 배열 비교는 정렬 후 비교합니다.
- localStorage 의존 테스트는 Map 기반 fake storage를 사용합니다.

## Dependencies

### Internal

- `src/utils/puzzle.js`
- `src/utils/records.js`

### External

- Vitest

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
