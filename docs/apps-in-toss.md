# 슈팅 게임 2026 — 앱인토스(Apps in Toss) 미니앱

포트폴리오의 슈팅 게임 2026을 토스 앱 안에서 도는 미니앱으로 포팅한 기록.
**게임 규칙·렌더 코드는 웹 버전과 100% 같은 소스를 쓴다.** 셸(레이아웃 + 플랫폼 연동)만 따로 있다.

## 구조

미니앱은 **`appintoss/`에 자체 package.json을 가진 별도 패키지**다.
앱인토스 SDK 의존성 트리가 1GB에 가까운데 포트폴리오 빌드는 그걸 하나도 쓰지 않기 때문이다.
루트 `npm install`(= Vercel 빌드)은 SDK를 건드리지 않는다.

```
src/game/              게임 코어 — 두 셸이 공유
  engine.ts              루프·스폰·히트 판정·스테이지 (신규: main.ts에서 분리)
  layout.ts              좌표계 정의 (신규)
  renderer.ts            HUD는 CSS px, 필드는 논리 px
  entities.ts            필드 크기를 layout.field에서 읽는다
  main.ts                ← 포트폴리오 웹 셸 (700×610 고정)

appintoss/             ← 미니앱 패키지 (자체 node_modules)
  package.json
  tsconfig.json          include에 ../src/game 을 넣어 코어까지 타입체크
  granite.config.ts      앱인토스 설정
  vite.config.ts
  index.html
  src/
    main.ts              세로 전체화면 레이아웃 + 오버레이 UI
    toss.ts              네이티브 브릿지 래퍼 (전부 fail-soft)
    styles.css
    assets/*.webp        미니앱 전용 경량 에셋

scripts/build-appintoss-assets.mjs   원본 PNG → 경량 WebP 변환
```

게임 코어는 `../../src/game/...` 상대 경로로 가져다 쓴다. 코어는 npm 패키지를 하나도
import하지 않는 순수 TS라 패키지 경계를 넘어도 문제가 없다.

### 좌표계 — 화면 비율이 난이도를 바꾸지 않게

데스크톱 필드는 700×550, 폰은 세로로 길다. 뷰포트를 그대로 논리 크기로 쓰면
필드 면적이 2배 넓어져 같은 게임이 훨씬 어려워진다.

그래서 **필드 면적(385,000 논리 px²)을 보존한 채 종횡비만 바꾼다.**
적 크기(80/140)가 논리 좌표 그대로이므로 `무작위 탭이 적을 맞힐 확률 = 적 면적 / 필드 면적`이
기기와 무관하게 유지된다. 393×852 화면에서는 필드가 435×885로 잡히고 배율은 0.904다.

HUD만 CSS 픽셀로 그린다 — 기기가 달라도 점수·하트가 같은 물리 크기로 보인다.
상단 세이프에어리어(`env(safe-area-inset-top)`)만큼 HUD가 아래로 밀린다.

### 웹 버전 렌더 결과는 그대로

리팩터링 후 데스크톱 `game2026` 타이틀 화면을 리팩터링 전 커밋과 픽셀 비교했다 —
**차이 0**. HUD 여백·폰트 크기 계산식은 폭 700에서 기존 상수와 같은 값이 나오도록 맞췄다.
(좁은 화면에서만 `score : ` 라벨을 떼서 가운데 하트와 겹치지 않게 한다.)

## 토스 연동

`appintoss/src/toss.ts`가 감싼다. **전부 fail-soft** — 토스 앱 밖에서는 호출이 조용히 무시되므로
같은 빌드를 데스크톱 브라우저에서 그대로 열어 개발·QA할 수 있다.

| 기능 | 브릿지 | 쓰는 곳 |
| --- | --- | --- |
| 햅틱 | `generateHapticFeedback` | 처치/보스 히트/라이프 손실/민간인 오사/스테이지 클리어/게임오버 |
| 게임센터 점수 제출 | `submitGameCenterLeaderBoardScore` | 게임오버 시 자동 |
| 게임센터 랭킹 화면 | `openGameCenterLeaderboard` | 타이틀·게임오버의 "토스 게임센터 랭킹" 버튼 |
| 화면 꺼짐 방지 | `setScreenAwakeMode` | 플레이 중 on, 백그라운드/게임오버 시 off |

Supabase TOP 10(이니셜 등록)은 웹 버전 그대로 유지된다. 게임센터 제출은 그 위에 얹히는 보너스다.
네트워크가 막히면 기록판만 빠지고 게임은 그대로 돌아간다.

### 타입 관련 주의

`@apps-in-toss/web-framework` v2.10.7은 런타임에는 햅틱·게임센터 브릿지를 모두 re-export하지만
배포된 `.d.ts`에는 이 이름들이 빠져 있다. 그래서 `toss.ts`에서 필요한 함수만
`RuntimeBridges` 인터페이스로 좁혀 캐스팅해 쓴다. SDK를 올릴 때 이 부분을 확인할 것.

## 명령어

처음 한 번은 미니앱 패키지에 의존성을 설치해야 한다:

```bash
cd appintoss && npm install     # SDK 트리 약 1GB — 루트와 분리돼 있다
```

이후:

```bash
cd appintoss
npm run dev          # localhost:4100 — 브라우저에서 모바일 뷰포트로 개발
npm run build        # dist/web 으로 웹 번들 빌드
npm run build:ait    # 위 빌드 + .ait 아티팩트 생성
npm run deploy       # .ait 업로드 — API 키 필요
```

루트에서 바로 부르는 단축 스크립트도 있다:

```bash
npm run appintoss:dev
npm run appintoss:build
npm run appintoss:deploy
```

> `ait build`는 `<outdir>/web/index.html`이 이미 있으면 웹 빌드를 건너뛴다.
> `build:ait`가 먼저 `dist`를 지우는 이유다. 직접 `npx ait build`를 부를 거면
> `npm run clean`을 먼저 돌릴 것.

에셋을 다시 만들 일이 생기면 (원본 PNG 교체 시) — 루트에서:

```bash
npm install --no-save sharp
node scripts/build-appintoss-assets.mjs   # 2,671KB → 106KB
```

## 배포 전 남은 일 (콘솔 작업 — 코드로 못 하는 것)

1. **파트너센터 등록** — <https://toss.im/apps-in-toss>에서 미니앱 등록, 앱 유형 **게임**으로 신청
2. **`appintoss/granite.config.ts`의 `brand.icon`** — 지금 빈 문자열. 콘솔에 올린 아이콘 이미지 URL로 채울 것
3. **`appName`** — `shooting-2026`. 콘솔에 등록한 앱 식별자와 반드시 일치시킬 것
4. **게임센터 리더보드 생성** — 콘솔에서 이 앱의 리더보드를 만들어야 점수 제출이 `SUCCESS`를 반환한다.
   없으면 `LEADERBOARD_NOT_FOUND`가 오고, 코드는 조용히 넘어간다
5. **배포 토큰** — `appintoss/`에서 `npx ait token add`로 API 키 등록 후 `npm run deploy`
6. **샌드박스 실기 테스트** — 아래 "검증 안 된 것" 항목들은 실제 토스 앱에서만 확인된다

## 검증한 것 / 못 한 것

검증함 (헤드리스 Chromium, 393×852 세로):

- 세로 레이아웃 — 필드 435×885(면적 보존), 가로 스크롤 없음, DPR 2 백킹스토어
- 탭 히트 판정 — 논리 좌표 역변환 정확
- 프로덕션 번들을 하위 경로에서 서빙 — 상대 경로 에셋 전부 로드, 콘솔 에러 0, dev 훅 제거됨
- 데스크톱 웹 버전 회귀 없음 — 타이틀 화면 픽셀 차이 0, 히트 판정 정상(CSS 축소 배율 0.691 포함)
- `.ait` 아티팩트 빌드 성공 — `web/` 7개 파일(212KB) 포함
- 루트 `npm ci` 후 포트폴리오 빌드·타입체크 정상 — SDK 없이도 돌아간다

검증 못 함 (토스 앱 실기 필요):

- 햅틱·게임센터·화면 꺼짐 방지의 실제 동작
- 노치 기기의 세이프에어리어 값 (헤드리스에서는 0으로 잡힌다)
- **미니앱 웹뷰에서 Supabase 호출이 되는지** — 번들 로컬 실행이라 origin이 `null`일 수 있다.
  막히면 TOP 10 기록판만 빠지고 게임은 정상 동작한다(fail-soft). 막힐 경우
  게임센터 리더보드로 일원화하는 것이 자연스러운 다음 수순
- 배포 (`ait deploy`) — API 키 필요

## 번들 크기

| | |
| --- | --- |
| JS | 46.8KB (gzip 17.8KB) |
| CSS | 3.1KB (gzip 1.1KB) |
| 에셋 (webp·svg·mp3) | 161KB |
| **웹 페이로드 합계** | **약 212KB** |
| `.ait` 전체 | 3.8MB (대부분 플랫폼이 넣는 RN 호스트 번들) |

JS가 웹 버전(gzip 8.3KB)보다 큰 건 `@apps-in-toss/web-framework` 런타임(약 9.5KB gzip) 때문이다.
브릿지 이벤트 에미터(`window.__GRANITE_NATIVE_EMITTER`) 설치가 모든 네이티브 호출의 전제라
이 import는 뺄 수 없다.
