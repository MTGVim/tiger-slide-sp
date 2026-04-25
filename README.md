# Tiger-Slide

오프라인에서도 즐길 수 있는 React 기반 슬라이딩 퍼즐 게임입니다. 모바일 터치 조작과 키보드 조작을 모두 지원하며, GitHub Pages 배포와 PWA 설치를 염두에 두고 구성되어 있습니다.

## 주요 기능

- 3x3 `쉬움`, 4x4 `보통` 난이도 지원
- 클릭, 탭, 빈칸 방향 스와이프로 블록 이동
- 방향키 또는 WASD로 빈칸 이동
- 이동 횟수와 경과 시간 표시
- 난이도별 개인 최고 기록 저장(localStorage)
- 슬라이드/착지/완성 사운드와 음소거 토글
- 퍼즐 완성 시 축하 배너와 confetti 효과
- 서비스 워커 기반 오프라인 실행 및 새 버전 업데이트 안내

## 기술 스택

- React 19
- Vite 8
- Tailwind CSS 4
- Vitest
- ESLint

## 시작하기

```bash
npm install
npm run dev
```

개발 서버가 실행되면 Vite가 출력하는 로컬 주소로 접속합니다.

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm test` | Vitest 테스트 1회 실행 |
| `npm run test:watch` | Vitest watch 모드 실행 |

## 조작법

- 이동 가능한 블록을 클릭하거나 탭하면 빈칸으로 이동합니다.
- 모바일에서는 빈칸을 향해 블록을 스와이프해 이동할 수 있습니다.
- 키보드는 방향키와 WASD를 지원합니다. 입력 방향으로 빈칸이 움직이며, 이동할 수 없는 방향이면 보드가 짧게 흔들립니다.
- `새 게임`은 현재 난이도에서 새 퍼즐을 섞고, 난이도 버튼은 해당 크기의 새 게임을 시작합니다.
- `다시하기`는 현재 퍼즐의 최초 섞임 상태로 되돌립니다.

## 기록 저장

게임을 완성하면 난이도별 최고 기록을 브라우저 localStorage에 저장합니다. 이동 횟수가 적은 기록이 우선이며, 이동 횟수가 같으면 더 빠른 시간이 최고 기록이 됩니다.

## PWA와 오프라인 지원

프로덕션 빌드에는 `manifest.webmanifest`와 서비스 워커(`sw.js`)가 포함됩니다. 한 번 접속한 뒤에는 앱 셸, 아이콘, 효과음이 캐시되어 오프라인에서도 플레이할 수 있고, 새 서비스 워커가 준비되면 화면 하단에 업데이트 안내가 표시됩니다.

## GitHub Pages 배포 빌드

GitHub Pages 경로(`/tiger-slide-sp/`)로 빌드하려면 `GITHUB_PAGES=true` 환경 변수를 사용합니다.

```bash
GITHUB_PAGES=true npm run build
```

일반 로컬/루트 경로 배포는 기본 `npm run build`를 사용합니다.

## 검증

변경 전후 기본 검증은 다음 명령으로 수행합니다.

```bash
npm run lint
npm test -- --run
GITHUB_PAGES=true npm run build
```
