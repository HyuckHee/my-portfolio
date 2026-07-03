/**
 * 적/보스 엔티티 — 스폰 위치·수명·히트 규칙은 2023 원본의 의도된 규칙을 재현.
 * 2023 고유 버그(처치된 적의 리스트 잔류, 마지막 히트에도 텔레포트)는 재현하지 않는다.
 *
 * 스테이지 진화(2026 전용): 스테이지 1~2는 2023과 동일한 정지 적 + classic 보스(비교 기준점).
 * 스테이지 3+부터 적이 드리프트 이동하고 보스 패턴이 진화한다 — 설계 문서 "스테이지 진화" 표 참조.
 */
export const FIELD_W = 700;
export const FIELD_H = 550;

export type EnemyKind = 'normal' | 'boss' | 'civilian';

/** 민간인(우주비행사) 등장 시작 스테이지 / 일반 적 스폰당 동반 등장 확률 */
export const CIVILIAN_STAGE = 5;
export const CIVILIAN_CHANCE = 0.25;

/** 보스 행동 패턴 — 스테이지에 따라 진화 */
export type BossPattern = 'classic' | 'drifter' | 'phantom';

export interface Enemy {
  kind: EnemyKind;
  x: number;
  y: number;
  /** 렌더 보간용 직전 위치 */
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  size: number;
  /** 스폰 시점의 게임 시간(ms) */
  bornAt: number;
  /** 수명(ms): 일반 3000 / 보스 5000 — 전 스테이지 동일 */
  lifetime: number;
  hitsLeft: number;
  value: number;
  alive: boolean;
  /** 렌더 이펙트용 — 마지막 피격 시점 */
  lastHitAt: number;
  pattern: BossPattern;
  /** phantom 보스의 다음 자가 텔레포트 시점(게임 시간) */
  nextSelfTeleportAt: number;
}

const SPEC = {
  normal: { size: 80, lifetime: 3000, hits: 1, value: 100 },
  boss: { size: 140, lifetime: 5000, hits: 5, value: 1000 },
  // 민간인: 쏘면 라이프 차감, 수명이 다하면 무벌점으로 퇴장
  civilian: { size: 80, lifetime: 2500, hits: 1, value: 0 },
} as const;

/** phantom 보스 자가 텔레포트 주기(ms) */
const PHANTOM_TELEPORT_INTERVAL = 1200;

/** 2023 randomPosition(0, container, unitSize): 스프라이트가 영역 안에 완전히 들어오는 랜덤 좌표 */
const randomPos = (max: number, size: number) => Math.random() * (max - size + 1);

/** 스테이지별 일반 적 이동 속도(px/ms). 1~2는 정지(2023 동일), 3부터 점증, 상한 캡 */
export function enemySpeedFor(stage: number): number {
  if (stage < 3) return 0;
  return Math.min(0.03 + (stage - 3) * 0.012, 0.12);
}

/** 스테이지별 보스 패턴: 1~2 classic(2023 동일) → 3~4 drifter → 5+ phantom */
export function bossPatternFor(stage: number): BossPattern {
  if (stage < 3) return 'classic';
  if (stage < 5) return 'drifter';
  return 'phantom';
}

/** 스테이지별 보스 색조(도 단위 hue 회전). 1~2는 원본(0) */
export function bossHueFor(stage: number): number {
  if (stage < 3) return 0;
  return ((stage - 2) * 55) % 360;
}

const randomVelocity = (speed: number) => {
  const angle = Math.random() * Math.PI * 2;
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
};

export function spawnEnemy(kind: EnemyKind, gameTime: number, stage: number): Enemy {
  const spec = SPEC[kind];
  const pattern = kind === 'boss' ? bossPatternFor(stage) : 'classic';

  let speed = 0;
  if (kind === 'normal') speed = enemySpeedFor(stage);
  else if (kind === 'civilian') speed = enemySpeedFor(stage) * 0.7; // 우주 유영 — 적보다 느긋하게
  else if (pattern !== 'classic') speed = enemySpeedFor(stage) * 1.25; // 보스는 타깃이 커서(140px) 더 빨라도 공정

  const { vx, vy } = speed > 0 ? randomVelocity(speed) : { vx: 0, vy: 0 };
  const x = randomPos(FIELD_W, spec.size);
  const y = randomPos(FIELD_H, spec.size);

  return {
    kind,
    x,
    y,
    prevX: x,
    prevY: y,
    vx,
    vy,
    size: spec.size,
    bornAt: gameTime,
    lifetime: spec.lifetime,
    hitsLeft: spec.hits,
    value: spec.value,
    alive: true,
    lastHitAt: -Infinity,
    pattern,
    nextSelfTeleportAt: pattern === 'phantom' ? gameTime + PHANTOM_TELEPORT_INTERVAL : Infinity,
  };
}

/** 이동(벽 반사) + phantom 자가 텔레포트. 고정 타임스텝에서 호출 */
export function updateEnemies(enemies: Enemy[], dt: number, gameTime: number): Enemy[] {
  const teleported: Enemy[] = [];
  for (const e of enemies) {
    e.prevX = e.x;
    e.prevY = e.y;

    if (e.vx !== 0 || e.vy !== 0) {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      if (e.x < 0) { e.x = 0; e.vx = Math.abs(e.vx); }
      if (e.x > FIELD_W - e.size) { e.x = FIELD_W - e.size; e.vx = -Math.abs(e.vx); }
      if (e.y < 0) { e.y = 0; e.vy = Math.abs(e.vy); }
      if (e.y > FIELD_H - e.size) { e.y = FIELD_H - e.size; e.vy = -Math.abs(e.vy); }
    }

    if (e.pattern === 'phantom' && gameTime >= e.nextSelfTeleportAt) {
      teleportEnemy(e);
      e.nextSelfTeleportAt = gameTime + PHANTOM_TELEPORT_INTERVAL;
      teleported.push(e);
    }
  }
  return teleported;
}

function teleportEnemy(e: Enemy) {
  e.x = randomPos(FIELD_W, e.size);
  e.y = randomPos(FIELD_H, e.size);
  e.prevX = e.x; // 텔레포트는 보간하지 않는다 (순간이동이 미끄러져 보이면 안 됨)
  e.prevY = e.y;
}

export const isExpired = (e: Enemy, gameTime: number) => e.alive && gameTime > e.bornAt + e.lifetime;

export const containsPoint = (e: Enemy, x: number, y: number) =>
  x >= e.x && x <= e.x + e.size && y >= e.y && y <= e.y + e.size;

export interface HitResult {
  killed: boolean;
  teleported: boolean;
}

/** 히트 처리. 보스는 1~4번째 히트에서 랜덤 텔레포트, 마지막 히트에선 즉사만. */
export function hitEnemy(e: Enemy, gameTime: number): HitResult {
  e.hitsLeft -= 1;
  e.lastHitAt = gameTime;
  if (e.hitsLeft <= 0) {
    e.alive = false;
    return { killed: true, teleported: false };
  }
  if (e.kind === 'boss') {
    teleportEnemy(e);
    return { killed: false, teleported: true };
  }
  return { killed: false, teleported: false };
}
