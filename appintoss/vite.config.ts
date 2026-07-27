/**
 * 앱인토스 미니앱 빌드 설정.
 *
 * - `base: './'` : 미니앱은 .ait 번들 안의 로컬 파일로 실행되므로 절대 경로를 쓸 수 없다
 * - `publicDir: false` : 포트폴리오 public/(약 8MB)이 미니앱 번들에 딸려 들어가지 않게 한다.
 *   게임 에셋은 소스에서 import해서 실제로 쓰는 것만 번들에 포함시킨다.
 * - `outDir: 'dist/web'` : `ait build`가 `<outdir>/web/index.html`을 찾는다.
 *   granite.config.ts의 `outdir`와 반드시 같이 움직여야 한다.
 * - `fs.allow` : 게임 코어(../src/game)와 원본 에셋(../public)이 이 패키지 밖에 있다
 */
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const repoRoot = resolve(__dirname, '..');

export default defineConfig({
  base: './',
  publicDir: false,
  server: {
    port: 4100,
    host: true,
    fs: { allow: [repoRoot] },
  },
  // 상위 디렉터리의 postcss.config.js(포트폴리오 Tailwind 설정)를 주워오지 않게 막는다
  css: { postcss: {} },
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
});
