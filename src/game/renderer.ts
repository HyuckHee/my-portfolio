/**
 * Canvas 2D 렌더러.
 * - 논리 좌표계는 700×610(HUD 60 + 필드 550)으로 고정하고, devicePixelRatio만큼
 *   백킹스토어를 키워 레티나에서도 선명하게 그린다.
 * - 적은 2023의 CSS wobble(±2deg)을 캔버스 회전으로 재현.
 */
import type { Enemy } from './entities';
import type { Particle } from './particles';

export const HUD_H = 60;
export const CANVAS_W = 700;
export const CANVAS_H = HUD_H + 550;

const IMG_SRC = {
  bg: '/game/img/shooting/shooting_bg.png',
  enemy: '/game/img/shooting/enemy.png',
  boss: '/game/img/shooting/boss.svg',
} as const;

type ImageKey = keyof typeof IMG_SRC;

export interface Scene {
  enemies: Enemy[];
  particles: Particle[];
  shake: { x: number; y: number };
  score: number;
  stage: number;
  gameTime: number;
  playing: boolean;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private images = new Map<ImageKey, HTMLImageElement>();

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.applyDpr();
  }

  private applyDpr() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = CANVAS_W * dpr;
    this.canvas.height = CANVAS_H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  async loadAssets(): Promise<void> {
    await Promise.all(
      (Object.entries(IMG_SRC) as [ImageKey, string][]).map(
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
    const { ctx } = this;
    ctx.save();
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    this.drawHud(scene);

    // 필드 영역 (흔들림은 필드에만 적용)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, HUD_H, CANVAS_W, CANVAS_H - HUD_H);
    ctx.clip();
    ctx.translate(scene.shake.x, HUD_H + scene.shake.y);

    const bg = this.images.get('bg');
    if (bg) ctx.drawImage(bg, -8, -8, CANVAS_W + 16, CANVAS_H - HUD_H + 16);

    for (const e of scene.enemies) this.drawEnemy(e, scene.gameTime);
    this.drawParticles(scene.particles, alpha);

    ctx.restore();
    ctx.restore();
  }

  private drawHud(scene: Scene) {
    const { ctx } = this;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_W, HUD_H);
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 22px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`score : ${scene.score}`, 20, HUD_H / 2);
    ctx.textAlign = 'right';
    ctx.fillText(`lv.${scene.stage}`, CANVAS_W - 20, HUD_H / 2);
    ctx.strokeStyle = 'rgba(0,255,65,0.25)';
    ctx.strokeRect(0.5, 0.5, CANVAS_W - 1, HUD_H - 1);
  }

  private drawEnemy(e: Enemy, gameTime: number) {
    const { ctx } = this;
    const img = this.images.get(e.kind === 'boss' ? 'boss' : 'enemy');
    if (!img) return;

    // 2023 CSS 애니메이션 재현: 일반 적 ±2deg wobble, 보스는 피격 직후 ±15deg 진동
    const cx = e.x + e.size / 2;
    const cy = e.y + e.size / 2;
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
