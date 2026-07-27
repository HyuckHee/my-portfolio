/**
 * 앱인토스 미니앱 전용 Vite 설정 — 포트폴리오 빌드(vite.config.ts)와 완전히 분리한다.
 *
 * - `base: './'` : 미니앱은 .ait 번들 안의 로컬 파일로 실행되므로 절대 경로를 쓸 수 없다
 * - `publicDir: false` : 포트폴리오 public/(약 8MB)이 미니앱 번들에 딸려 들어가지 않게 한다.
 *   게임 에셋은 소스에서 import해서 실제로 쓰는 것만 번들에 포함시킨다.
 * - `outDir` : `ait build`가 `<outdir>/web/index.html`을 찾으므로 그 위치에 맞춘다
 *   (granite.config.ts의 `outdir`와 반드시 같이 움직여야 한다)
 */
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = resolve(__dirname, 'appintoss');

export default defineConfig({
  root,
  base: './',
  publicDir: false,
  server: {
    port: 4100,
    host: true,
    // index.html이 root 밖의 src/를 참조한다
    fs: { allow: [resolve(__dirname)] },
  },
  build: {
    outDir: resolve(__dirname, 'dist-appintoss/web'),
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
});
