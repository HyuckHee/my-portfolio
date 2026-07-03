/**
 * 적/보스 엔티티 — 스폰 위치·수명·히트 규칙은 2023 원본의 의도된 규칙을 재현.
 * 2023 고유 버그(처치된 적의 리스트 잔류, 마지막 히트에도 텔레포트)는 재현하지 않는다.
 */
export const FIELD_W = 700;
export const FIELD_H = 550;

export type EnemyKind = 'normal' | 'boss';

export interface Enemy {
  kind: EnemyKind;
  x: number;
  y: number;
  size: number;
  /** 스폰 시점의 게임 시간(ms) */
  bornAt: number;
  /** 수명(ms): 일반 3000 / 보스 5000 */
  lifetime: number;
  hitsLeft: number;
  value: number;
  alive: boolean;
  /** 렌더 이펙트용 — 마지막 피격 시점 */
  lastHitAt: number;
}

const SPEC = {
  normal: { size: 80, lifetime: 3000, hits: 1, value: 100 },
  boss: { size: 140, lifetime: 5000, hits: 5, value: 1000 },
} as const;

/** 2023 randomPosition(0, container, unitSize): 스프라이트가 영역 안에 완전히 들어오는 랜덤 좌표 */
const randomPos = (max: number, size: number) => Math.random() * (max - size + 1);

export function spawnEnemy(kind: EnemyKind, gameTime: number): Enemy {
  const spec = SPEC[kind];
  return {
    kind,
    x: randomPos(FIELD_W, spec.size),
    y: randomPos(FIELD_H, spec.size),
    size: spec.size,
    bornAt: gameTime,
    lifetime: spec.lifetime,
    hitsLeft: spec.hits,
    value: spec.value,
    alive: true,
    lastHitAt: -Infinity,
  };
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
    e.x = randomPos(FIELD_W, e.size);
    e.y = randomPos(FIELD_H, e.size);
    return { killed: false, teleported: true };
  }
  return { killed: false, teleported: false };
}
