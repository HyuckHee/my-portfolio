/**
 * 앱인토스(Apps in Toss) 미니앱 설정.
 *
 * 빌드 흐름: `ait build`가 아래 `web.commands.build`를 실행한 뒤
 * `<outdir>/web/index.html`을 찾아 .ait 아티팩트로 묶는다.
 * 그래서 `outdir`와 vite.appintoss.config.ts의 `build.outDir`(= `<outdir>/web`)는 항상 같이 움직여야 한다.
 *
 * `webViewProps.type: 'game'`이 이 미니앱을 게임으로 표시한다 — 토스 게임센터 리더보드 연동의 전제.
 */
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'shooting-2026',
  brand: {
    displayName: '슈팅 2026',
    primaryColor: '#00ff41',
    // 파트너센터에 등록한 아이콘 이미지 URL을 넣어주세요 (배포 전 필수)
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 4100,
    commands: {
      dev: 'npm run dev:appintoss',
      build: 'npm run build:appintoss',
    },
  },
  webViewProps: {
    type: 'game',
    // 게임 화면이 스크롤/당겨서 새로고침으로 끌리지 않게 한다
    bounces: false,
    pullToRefreshEnabled: false,
    overScrollMode: 'never',
    allowsInlineMediaPlayback: true,
    // 효과음은 최초 탭(사용자 제스처)에서 unlock되므로 별도 탭 요구가 필요 없다
    mediaPlaybackRequiresUserAction: false,
    allowsBackForwardNavigationGestures: false,
  },
  // 카메라·연락처 등 기기 권한을 쓰지 않는다
  permissions: [],
  outdir: 'dist-appintoss',
});
