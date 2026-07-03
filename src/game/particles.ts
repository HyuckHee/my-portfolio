/**
 * 파티클 시스템 — 처치/피격 이펙트.
 * 고정 타임스텝으로 update되고, 렌더 시 prev→curr 보간(alpha)으로 프레임 사이를 채운다.
 */
export interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function burst(pool: Particle[], x: number, y: number, color: string, count: number, speed = 0.25) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random() * 0.6);
    const life = 350 + Math.random() * 300;
    pool.push({
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - 0.08,
      life,
      maxLife: life,
      size: 2 + Math.random() * 4,
      color,
    });
  }
}

export function updateParticles(pool: Particle[], dt: number) {
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.prevX = p.x;
    p.prevY = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.0007 * dt; // 약한 중력
    p.life -= dt;
    if (p.life <= 0) pool.splice(i, 1);
  }
}
