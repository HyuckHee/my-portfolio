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
  /** 스테이지 전환 배너 — 게임 시간 기준 표시 종료 시점 */
  bannerUntil: number;
  bannerTitle: string;
  bannerSub: string;
}

/** 스테이지 진입 배너 문구 — 새로 추가되는 시스템을 플레이어에게 알린다 */
export function stageNotice(stage: number): string {
  if (stage === 1) return '적이 사라지기 전에 클릭!';
  if (stage === 2) return '스폰 속도 증가';
  if (stage === 3) return '적이 움직이기 시작합니다';
  if (stage === 4) return '더 빠르게, 더 어렵게';
  if (stage === 5) return '팬텀 보스 · 우주비행사를 쏘지 마세요!';
  return '속도 증가 — 한계에 도전하세요';
}

const BANNER_DURATION = 1800;

function showBanner(s: Session) {
  s.bannerTitle = `STAGE ${s.stage}`;
  s.bannerSub = stageNotice(s.stage);
  s.bannerUntil = s.gameTime + BANNER_DURATION;
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
    bannerUntil: 0,
    bannerTitle: '',
    bannerSub: '',
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
  showBanner(s);
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
  showBanner(s);
}
