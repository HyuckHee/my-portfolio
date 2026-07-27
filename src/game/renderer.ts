/**
 * Canvas 2D 렌더러.
 * - HUD는 CSS 픽셀 좌표계, 필드는 논리 좌표계로 그린다(layout.ts 참조).
 *   덕분에 데스크톱 고정 스테이지(700×610)와 앱인토스 세로 전체화면이 같은 코드를 쓴다.
 * - devicePixelRatio만큼 백킹스토어를 키워 레티나에서도 선명하다.
 * - 적은 2023의 CSS wobble(±2deg)을 캔버스 회전으로 재현.
 */
import { bossHueFor, type Enemy } from './entities';
import type { Particle } from './particles';
import { desktopLayout, REF_FIELD_H, REF_FIELD_W, REF_HUD_H, type Layout } from './layout';

/** 데스크톱 고정 스테이지 크기 — 포트폴리오 셸이 캔버스 CSS 크기로 쓴다 */
export const HUD_H = REF_HUD_H;
export const CANVAS_W = REF_FIELD_W;
export const CANVAS_H = REF_HUD_H + REF_FIELD_H;

export interface RendererAssets {
  bg: string;
  enemy: string;
  boss: string;
}

/** 데스크톱 셸이 쓰는 기본 에셋 경로 (public/) */
export const DEFAULT_ASSETS: RendererAssets = {
  bg: '/game/img/shooting/shooting_bg.png',
  enemy: '/game/img/shooting/enemy.png',
  boss: '/game/img/shooting/boss.svg',
};

export interface RendererOptions {
  assets?: RendererAssets;
  /**
   * 배경 이미지 맞춤 방식.
   * - `stretch`: 필드에 늘려 채운다 (데스크톱 — 기존 렌더 결과 유지)
   * - `cover`: 비율을 지키며 채우고 넘치는 부분은 잘라낸다 (세로 화면 왜곡 방지)
   */
  bgFit?: 'stretch' | 'cover';
}

type ImageKey = keyof RendererAssets;

export interface Scene {
  enemies: Enemy[];
  particles: Particle[];
  shake: { x: number; y: number };
  score: number;
  stage: number;
  lives: number;
  gameTime: number;
  playing: boolean;
  banner: { title: string; sub: string; until: number };
}

/** HUD 하트 표시 기준 — state.ts의 MAX_LIVES와 일치 */
const MAX_LIVES_DISPLAY = 3;

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private images = new Map<ImageKey, HTMLImageElement>();
  /** 스테이지별 보스 색조 캐시 — key: hue(도) */
  private tintCache = new Map<number, HTMLCanvasElement>();
  private assets: RendererAssets;
  private bgFit: 'stretch' | 'cover';
  private layout: Layout = desktopLayout();
  private dpr = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    options: RendererOptions = {},
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.assets = options.assets ?? DEFAULT_ASSETS;
    this.bgFit = options.bgFit ?? 'stretch';
    this.setLayout(this.layout);
  }

  /** 레이아웃 변경(회전·리사이즈) 시 백킹스토어를 다시 잡는다 */
  setLayout(layout: Layout) {
    this.layout = layout;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(layout.cssW * this.dpr);
    this.canvas.height = Math.round(layout.cssH * this.dpr);
  }

  async loadAssets(): Promise<void> {
    await Promise.all(
      (Object.entries(this.assets) as [ImageKey, string][]).map(
        ([key, src]) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              this.images.set(key, img);
              resolve();
            };
            img.onerror = () => reject(new Error(`asset load failed: ${src}`));
            img.src = src;
          }),
      ),
    );
  }

  draw(scene: Scene, alpha: number) {
    const { ctx, layout } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, layout.cssW, layout.cssH);

    this.drawHud(scene);

    // 필드 영역 (흔들림은 필드에만, CSS px 단위로 적용 — 기기와 무관하게 같은 세기)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, layout.hudH, layout.cssW, layout.cssH - layout.hudH);
    ctx.clip();
    ctx.translate(scene.shake.x, layout.hudH + scene.shake.y);
    ctx.scale(layout.scale, layout.scale);

    this.drawBackground();

    for (const e of scene.enemies) this.drawEnemy(e, scene.gameTime, scene.stage, alpha);
    this.drawParticles(scene.particles, alpha);
    if (scene.playing) this.drawBanner(scene);

    ctx.restore();
  }

  /** 8px 여백을 더해 흔들릴 때 가장자리가 비지 않게 한다 */
  private drawBackground() {
    const bg = this.images.get('bg');
    if (!bg) return;
    const { ctx, layout } = this;
    const w = layout.fieldW + 16;
    const h = layout.fieldH + 16;

    if (this.bgFit === 'stretch') {
      ctx.drawImage(bg, -8, -8, w, h);
      return;
    }

    // cover — 원본 비율을 지키며 채우고 넘치는 쪽을 중앙 기준으로 잘라낸다
    const sw = bg.naturalWidth || w;
    const sh = bg.naturalHeight || h;
    const s = Math.max(w / sw, h / sh);
    const dw = sw * s;
    const dh = sh * s;
    ctx.drawImage(bg, -8 - (dw - w) / 2, -8 - (dh - h) / 2, dw, dh);
  }

  /** 스테이지 전환 배너 — 새 시스템 안내, 마지막 500ms 동안 페이드아웃 */
  private drawBanner(scene: Scene) {
    const remaining = scene.banner.until - scene.gameTime;
    if (remaining <= 0 || !scene.banner.title) return;
    const { ctx, layout } = this;
    const fade = Math.min(1, remaining / 500);

    ctx.save();
    ctx.globalAlpha = 0.65 * fade;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, layout.fieldH / 2 - 58, layout.fieldW, 116);

    ctx.globalAlpha = fade;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 40px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(scene.banner.title, layout.fieldW / 2, layout.fieldH / 2 - 16);

    // 좁은 세로 화면에서 안내문이 잘리지 않도록 필요한 만큼만 줄인다
    ctx.fillStyle = '#ffd447';
    let size = 17;
    const maxWidth = layout.fieldW * 0.92;
    do {
      ctx.font = `${size}px "JetBrains Mono", ui-monospace, monospace`;
      if (ctx.measureText(scene.banner.sub).width <= maxWidth) break;
      size -= 1;
    } while (size > 10);
    ctx.fillText(scene.banner.sub, layout.fieldW / 2, layout.fieldH / 2 + 26);
    ctx.restore();
  }

  private drawHud(scene: Scene) {
    const { ctx, layout } = this;
    const w = layout.cssW;
    // 노치/상태바 아래 영역의 중앙에 내용을 놓는다
    const cy = layout.hudTop + (layout.hudH - layout.hudTop) / 2;
    // 좁은 화면(모바일 세로)에서는 'score : ' 라벨을 떼서 가운데 하트와 겹치지 않게 한다.
    // 데스크톱 폭(700)에서는 아래 값이 전부 기존 상수와 같아져 렌더 결과가 그대로 유지된다.
    const fontSize = Math.min(22, w * 0.055);
    const pad = 20;
    const scoreText = w < 480 ? `${scene.score}` : `score : ${scene.score}`;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, layout.hudH);
    ctx.fillStyle = '#00ff41';
    ctx.font = `bold ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(scoreText, pad, cy);
    ctx.textAlign = 'right';
    ctx.fillText(`lv.${scene.stage}`, w - pad, cy);

    // LIFE 하트 — 중앙 (잃은 라이프는 어둡게)
    ctx.textAlign = 'center';
    ctx.font = '20px ui-monospace, monospace';
    for (let i = 0; i < MAX_LIVES_DISPLAY; i++) {
      ctx.fillStyle = i < scene.lives ? '#ff5f57' : '#3a3a3a';
      ctx.fillText('♥', w / 2 + (i - 1) * 30, cy);
    }
    ctx.strokeStyle = 'rgba(0,255,65,0.25)';
    ctx.strokeRect(0.5, 0.5, w - 1, layout.hudH - 1);
  }

  private drawEnemy(e: Enemy, gameTime: number, stage: number, alpha: number) {
    const { ctx } = this;

    // 민간인(우주비행사)은 이모지 렌더링 — 별도 에셋 불필요
    if (e.kind === 'civilian') {
      this.drawCivilian(e, gameTime, alpha);
      return;
    }

    const baseImg = this.images.get(e.kind === 'boss' ? 'boss' : 'enemy');
    if (!baseImg) return;

    // 스테이지 3+ 보스는 스테이지별 색조 (오프스크린 틴트 — ctx.filter의 Safari 이슈 회피)
    const hue = e.kind === 'boss' ? bossHueFor(stage) : 0;
    const img: CanvasImageSource = hue > 0 ? this.tinted(baseImg, hue) : baseImg;

    // 이동하는 적은 고정 타임스텝 사이를 보간해 고주사율에서도 부드럽게
    const ix = e.prevX + (e.x - e.prevX) * alpha;
    const iy = e.prevY + (e.y - e.prevY) * alpha;
    const cx = ix + e.size / 2;
    const cy = iy + e.size / 2;

    // 2023 CSS 애니메이션 재현: 일반 적 ±2deg wobble, 보스는 피격 직후 ±15deg 진동
    let angle = Math.sin(gameTime / 50 + e.bornAt) * (2 * Math.PI / 180);
    if (e.kind === 'boss' && gameTime - e.lastHitAt < 200) {
      angle = Math.sin(gameTime / 15) * (15 * Math.PI / 180);
    }

    // 수명 임박 경고: 남은 수명 20% 이하에서 깜빡임
    const lifeLeft = (e.bornAt + e.lifetime - gameTime) / e.lifetime;
    const blink = lifeLeft < 0.2 && Math.floor(gameTime / 120) % 2 === 0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = blink ? 0.45 : 1;
    ctx.drawImage(img, -e.size / 2, -e.size / 2, e.size, e.size);
    ctx.restore();
  }

  private drawCivilian(e: Enemy, gameTime: number, alpha: number) {
    const { ctx } = this;
    const ix = e.prevX + (e.x - e.prevX) * alpha;
    const iy = e.prevY + (e.y - e.prevY) * alpha;

    // 우주 유영 느낌 — 느린 회전 + 수명 임박 시 깜빡임
    const angle = Math.sin(gameTime / 400 + e.bornAt) * (12 * Math.PI / 180);
    const lifeLeft = (e.bornAt + e.lifetime - gameTime) / e.lifetime;
    const blink = lifeLeft < 0.25 && Math.floor(gameTime / 120) % 2 === 0;

    ctx.save();
    ctx.translate(ix + e.size / 2, iy + e.size / 2);
    ctx.rotate(angle);
    ctx.globalAlpha = blink ? 0.45 : 1;
    ctx.font = `${Math.round(e.size * 0.85)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧑‍🚀', 0, 4);
    ctx.restore();
  }

  /** 이미지에 hue 기반 색을 입힌 오프스크린 캔버스 (hue별 캐시) */
  private tinted(img: HTMLImageElement, hue: number): HTMLCanvasElement {
    const cached = this.tintCache.get(hue);
    if (cached) return cached;

    const off = document.createElement('canvas');
    off.width = img.naturalWidth || 140;
    off.height = img.naturalHeight || 140;
    const octx = off.getContext('2d');
    if (octx) {
      octx.drawImage(img, 0, 0, off.width, off.height);
      octx.globalCompositeOperation = 'source-atop';
      octx.globalAlpha = 0.45;
      octx.fillStyle = `hsl(${hue}, 90%, 55%)`;
      octx.fillRect(0, 0, off.width, off.height);
    }
    this.tintCache.set(hue, off);
    return off;
  }

  private drawParticles(pool: Particle[], alpha: number) {
    const { ctx } = this;
    for (const p of pool) {
      // 고정 타임스텝 사이를 보간해 고주사율에서도 부드럽게
      const x = p.prevX + (p.x - p.prevX) * alpha;
      const y = p.prevY + (p.y - p.prevY) * alpha;
      ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
