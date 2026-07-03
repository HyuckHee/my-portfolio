/**
 * 게임 세션 상태머신.
 * 규칙 수치는 2023 원본(Shooting.js/Enemy.js)의 의도된 규칙을 그대로 재현한다 — 설계 문서의 규칙 명세 표 참조.
 */
export type GamePhase = 'title' | 'playing' | 'gameover';

/** 2026 전용 규칙 확장: 2023은 1미스 즉사, 2026은 라이프 3개 */
export const MAX_LIVES = 3;

export interface Session {
  phase: GamePhase;
  stage: number;
  score: number;
  lives: number;
  /** 일반 적 스폰 간격(ms). 스테이지 클리어마다 가속 */
  spawnInterval: number;
  /** 이번 스테이지의 일반 적 쿼터 (15~20 랜덤) */
  enemyQuota: number;
  /** 이번 스테이지에 스폰된 일반 적 수 */
  spawned: number;
  /** 게임 시간(ms) — 스폰·수명 판정은 벽시계가 아니라 이 값 기준 */
  gameTime: number;
  spawnTimer: number;
  /** 쿼터 도달 후 보스 등장까지 +500ms 대기 */
  bossCountdown: number | null;
  bossSpawned: boolean;
}

/** 스테이지당 일반 적 수: 15~20 (2023: random*(20-15+1)+15) */
export const rollEnemyQuota = () => Math.floor(Math.random() * 6) + 15;

export function createSession(): Session {
  return {
    phase: 'title',
    stage: 1,
    score: 0,
    lives: MAX_LIVES,
    spawnInterval: 1000,
    enemyQuota: rollEnemyQuota(),
    spawned: 0,
    gameTime: 0,
    spawnTimer: 0,
    bossCountdown: null,
    bossSpawned: false,
  };
}

export function startGame(s: Session) {
  s.phase = 'playing';
  s.stage = 1;
  s.score = 0;
  s.lives = MAX_LIVES;
  s.spawnInterval = 1000;
  s.enemyQuota = rollEnemyQuota();
  s.spawned = 0;
  s.gameTime = 0;
  s.spawnTimer = 0;
  s.bossCountdown = null;
  s.bossSpawned = false;
}

/**
 * 보스 처치 → 다음 스테이지.
 * 가속 공식은 2023 원본과 동일: speed -= floor(speed/100) * (5 * stage), stage는 증가 후 값.
 * floor(speed/100)가 0이 되는 지점(≈100ms 미만)부터 자연 수렴하므로 별도 하한이 필요 없다.
 */
export function stageUp(s: Session) {
  s.stage += 1;
  s.spawnInterval -= Math.floor(s.spawnInterval / 100) * (5 * s.stage);
  s.enemyQuota = rollEnemyQuota();
  s.spawned = 0;
  s.spawnTimer = 0;
  s.bossCountdown = null;
  s.bossSpawned = false;
}
