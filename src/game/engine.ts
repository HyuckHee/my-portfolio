/**
 * 게임 코어 — 상태머신·스폰·히트 판정·렌더 루프를 하나로 묶는다.
 *
 * UI(타이틀/게임오버 오버레이)와 플랫폼 연동(랭킹·햅틱)은 셸이 맡는다.
 * 덕분에 포트폴리오 웹(`src/game/main.ts`)과 앱인토스 미니앱(`src/game-toss/main.ts`)이
 * 규칙 코드를 한 벌만 공유한다.
 */
import { createLoop } from './loop';
import { createSession, startGame, stageUp, type Session } from './state';
import {
  spawnEnemy,
  updateEnemies,
  hitEnemy,
  isExpired,
  containsPoint,
  CIVILIAN_STAGE,
  civilianChanceFor,
  type Enemy,
} from './entities';
import { Renderer, type RendererAssets } from './renderer';
import { burst, updateParticles, type Particle } from './particles';
import { ScreenShake } from './effects';
import { AudioBus } from './audio';
import { attachInput } from './input';
import { applyLayout, type Layout } from './layout';

/** 셸이 햅틱·통계 등에 쓰는 게임 이벤트 (사운드는 엔진이 직접 낸다) */
export type GameEvent =
  | 'kill'
  | 'bossHit'
  | 'stageClear'
  | 'lifeLost'
  | 'civilianHit'
  | 'gameOver';

export interface GameOptions {
  canvas: HTMLCanvasElement;
  layout: Layout;
  assets?: RendererAssets;
  bgFit?: 'stretch' | 'cover';
  /** 발사음 에셋 경로 (미지정 시 합성 비프로 대체) */
  shootSoundSrc?: string;
  /** 게임오버 — 최종 점수를 넘긴다. 셸이 랭킹 등록 UI를 띄운다 */
  onGameOver: (score: number) => void;
  onEvent?: (event: GameEvent) => void;
}

export interface Game {
  readonly session: Session;
  readonly audio: AudioBus;
  /** 에셋 로드 후 루프 시작 */
  boot(): Promise<void>;
  /** 새 판 시작 (타이틀/게임오버 → 플레이) */
  startRun(): void;
  /** 회전·리사이즈 대응 */
  setLayout(layout: Layout): void;
  destroy(): void;
  /** dev 전용 — 상위 스테이지 점프 */
  debugForceStage(stage: number): string;
  /** dev 전용 — 현재 상태 스냅샷 */
  debugSnapshot(): Record<string, unknown>;
}

export function createGame(options: GameOptions): Game {
  const session = createSession();
  const enemies: Enemy[] = [];
  const particles: Particle[] = [];
  const shake = new ScreenShake();
  const audio = new AudioBus(options.shootSoundSrc);
  const renderer = new Renderer(options.canvas, { assets: options.assets, bgFit: options.bgFit });

  let layout = options.layout;
  applyLayout(layout);
  renderer.setLayout(layout);

  const emit = (event: GameEvent) => options.onEvent?.(event);

  /* ─── 업데이트 (고정 타임스텝) ─── */
  function update(dt: number) {
    shake.update(dt);
    updateParticles(particles, dt);
    if (session.phase !== 'playing') return;

    session.gameTime += dt;
    session.spawnTimer += dt;

    // 일반 적 스폰 — 쿼터까지 spawnInterval 간격
    if (session.spawned < session.enemyQuota && session.spawnTimer >= session.spawnInterval) {
      session.spawnTimer = 0;
      enemies.push(spawnEnemy('normal', session.gameTime, session.stage));
      session.spawned += 1;
      if (session.spawned === session.enemyQuota) session.bossCountdown = 500; // 보스 예고

      // 스테이지 5+: 일반 적 스폰과 함께 확률적으로 민간인(우주비행사) 등장 — 스테이지가 오를수록 잦아짐
      if (session.stage >= CIVILIAN_STAGE && Math.random() < civilianChanceFor(session.stage)) {
        enemies.push(spawnEnemy('civilian', session.gameTime, session.stage));
      }
    }

    // 보스 스폰 — 쿼터 도달 +500ms (게임 시간 기준)
    if (session.bossCountdown !== null && !session.bossSpawned) {
      session.bossCountdown -= dt;
      if (session.bossCountdown <= 0) {
        enemies.push(spawnEnemy('boss', session.gameTime, session.stage));
        session.bossSpawned = true;
      }
    }

    // 스테이지 3+ 진화: 이동(벽 반사) + phantom 보스 자가 텔레포트
    const selfTeleported = updateEnemies(enemies, dt, session.gameTime);
    for (const e of selfTeleported) {
      burst(particles, e.x + e.size / 2, e.y + e.size / 2, '#b48cff', 8, 0.15);
    }

    // 민간인은 수명이 다하면 무벌점 퇴장
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.kind === 'civilian' && isExpired(e, session.gameTime)) {
        burst(particles, e.x + e.size / 2, e.y + e.size / 2, '#9ecbff', 6, 0.1);
        enemies.splice(i, 1);
      }
    }

    // 수명 초과 → 라이프 차감 (2026 전용 규칙: 2023은 1미스 즉사)
    // 같은 틱에 여러 마리가 만료돼도 라이프는 1개만 차감 — 일괄 제거로 연쇄 차감 방지
    const expired = enemies.filter((e) => isExpired(e, session.gameTime));
    if (expired.length > 0) {
      let bossLost = false;
      for (const e of expired) {
        burst(particles, e.x + e.size / 2, e.y + e.size / 2, '#ff5f57', 14, 0.2);
        if (e.kind === 'boss') bossLost = true;
        enemies.splice(enemies.indexOf(e), 1);
      }
      session.lives -= 1;
      shake.trigger(8, 250);

      if (session.lives <= 0) {
        gameOver();
        return;
      }
      audio.lifeLost();
      emit('lifeLost');
      // 보스를 놓쳤으면 재소환 예약 (안 하면 스테이지 진행 불가)
      if (bossLost) {
        session.bossSpawned = false;
        session.bossCountdown = 500;
      }
    }
  }

  /* ─── 히트 판정 (필드 논리 좌표) ─── */
  function onTap(fx: number, fy: number) {
    audio.unlock();
    if (session.phase !== 'playing') return;
    // 겹칠 때 나중에 그려진(위에 보이는) 적부터
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e.alive || !containsPoint(e, fx, fy)) continue;

      // 민간인 오사(誤射): 점수 대신 라이프를 잃는다
      if (e.kind === 'civilian') {
        enemies.splice(i, 1);
        session.lives -= 1;
        burst(particles, e.x + e.size / 2, e.y + e.size / 2, '#ff5f57', 20, 0.22);
        shake.trigger(9, 250);
        if (session.lives <= 0) {
          gameOver();
          return;
        }
        audio.civilianHit();
        emit('civilianHit');
        return;
      }

      const result = hitEnemy(e, session.gameTime);
      const cx = e.x + e.size / 2;
      const cy = e.y + e.size / 2;

      if (result.killed) {
        session.score += e.value;
        enemies.splice(i, 1);
        burst(particles, cx, cy, e.kind === 'boss' ? '#ffd447' : '#7dff9b', e.kind === 'boss' ? 42 : 16);
        if (e.kind === 'boss') {
          shake.trigger(10, 300);
          audio.stageClear();
          clearStage();
        } else {
          shake.trigger(4, 120);
          audio.shoot();
          emit('kill');
        }
      } else {
        // 보스 텔레포트 (1~4번째 히트)
        burst(particles, cx, cy, '#ff8c66', 10);
        shake.trigger(6, 150);
        audio.bossHit();
        emit('bossHit');
      }
      return; // 한 번의 탭은 한 마리만
    }
  }

  function clearStage() {
    enemies.length = 0; // 2023 규칙: 스테이지 클리어 시 필드 정리
    stageUp(session);
    emit('stageClear');
  }

  function gameOver() {
    session.phase = 'gameover';
    const finalScore = session.score;
    enemies.length = 0;
    shake.trigger(12, 300);
    audio.gameOver();
    emit('gameOver');
    options.onGameOver(finalScore);
  }

  /* ─── 렌더 ─── */
  const loop = createLoop(update, (alpha) => {
    renderer.draw(
      {
        enemies,
        particles,
        shake: shake.offset(),
        score: session.score,
        stage: session.stage,
        lives: session.lives,
        gameTime: session.gameTime,
        playing: session.phase === 'playing',
        banner: { title: session.bannerTitle, sub: session.bannerSub, until: session.bannerUntil },
      },
      alpha,
    );
  });

  const detachInput = attachInput(options.canvas, () => layout, onTap);

  return {
    session,
    audio,
    async boot() {
      await renderer.loadAssets();
      loop.start();
    },
    startRun() {
      enemies.length = 0;
      particles.length = 0;
      startGame(session);
    },
    setLayout(next: Layout) {
      layout = next;
      applyLayout(next);
      renderer.setLayout(next);
    },
    destroy() {
      loop.stop();
      detachInput();
    },
    debugForceStage(n: number) {
      if (session.phase !== 'playing') return 'not playing';
      session.stage = n - 1;
      enemies.length = 0;
      stageUp(session);
      return `stage ${session.stage}`;
    },
    debugSnapshot() {
      return {
        phase: session.phase,
        stage: session.stage,
        score: session.score,
        lives: session.lives,
        gameTime: Math.round(session.gameTime),
        layout: { fieldW: Math.round(layout.fieldW), fieldH: Math.round(layout.fieldH), scale: +layout.scale.toFixed(3) },
        enemies: enemies.map((e) => ({
          kind: e.kind, hitsLeft: e.hitsLeft, x: e.x, y: e.y, size: e.size, vx: e.vx, vy: e.vy, pattern: e.pattern,
        })),
        banner: {
          title: session.bannerTitle,
          sub: session.bannerSub,
          activeFor: Math.max(0, Math.round(session.bannerUntil - session.gameTime)),
        },
        spawnInterval: session.spawnInterval,
      };
    },
  };
}

/**
 * dev 전용 디버그 훅 등록 — 상위 스테이지(민간인·팬텀) 수동 테스트용.
 * 호출부가 `import.meta.env.DEV` 가드 안에 있어 프로덕션 번들에서는 제거된다.
 */
export function exposeDebugHooks(game: Game) {
  const w = window as unknown as Record<string, unknown>;
  w.__gameForceStage = (n: number) => game.debugForceStage(n);
  w.__gameDebug = () => game.debugSnapshot();
}
