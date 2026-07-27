/**
 * 앱인토스 미니앱용 게임 에셋 생성기.
 *
 * 포트폴리오 웹은 원본 PNG(합계 약 2.6MB)를 그대로 쓰지만, 미니앱은 .ait 번들에 통째로 실려
 * 다운로드되므로 화면에서 실제로 쓰이는 해상도까지만 줄이고 WebP로 변환한다.
 * (2,671KB → 106KB)
 *
 * 결과물 `appintoss/src/assets/*.webp`는 커밋되어 있으므로 평소 빌드에는 필요 없다.
 * 원본 이미지를 교체했을 때만 다시 돌리면 된다:
 *
 *   npm install --no-save sharp
 *   node scripts/build-appintoss-assets.mjs
 */
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('sharp');

const OUT_DIR = new URL('../appintoss/src/assets/', import.meta.url);
mkdirSync(OUT_DIR, { recursive: true });

const jobs = [
  {
    // 배경: 1200×1200 원본. 세로 화면에 cover로 깔리므로 짧은 변 900px이면 충분하다
    from: 'public/game/img/shooting/shooting_bg.png',
    to: 'shooting_bg.webp',
    pipeline: (img) => img.resize(900, 900, { fit: 'cover' }).webp({ quality: 78 }),
  },
  {
    // 적: 2480×2480 원본. 화면에서 최대 ~150 CSS px이라 DPR 2~3을 감안해도 400px이면 넉넉하다
    from: 'public/game/img/shooting/enemy.png',
    to: 'enemy.webp',
    pipeline: (img) => img.resize(400, 400, { fit: 'inside' }).webp({ quality: 88, alphaQuality: 90 }),
  },
];

for (const job of jobs) {
  const buffer = await job.pipeline(sharp(job.from)).toBuffer();
  const target = new URL(job.to, OUT_DIR);
  writeFileSync(target, buffer);
  const before = statSync(job.from).size / 1024;
  const after = buffer.length / 1024;
  console.log(`${job.from} → appintoss/src/assets/${job.to}  ${before.toFixed(0)}KB → ${after.toFixed(1)}KB`);
}
