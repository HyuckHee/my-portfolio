/**
 * 슈팅 게임 2026 — 2023년 바닐라 JS 버전의 TypeScript + Canvas 리라이트.
 * 게임플레이 규칙은 2023 원본과 동일하게 재현하고(설계 문서 규칙 명세 참조),
 * 아키텍처(고정 타임스텝·상태머신)와 게임필(파티클·흔들림·사운드)을 현대화했다.
 * TOP 10 랭킹은 2023년 주석으로 남아있던 미완성 기능의 완성이다.
 */
import { createLoop } from './loop';
import { createSession, startGame, stageUp } from './state';
import { spawnEnemy, updateEnemies, hitEnemy, isExpired, containsPoint, type Enemy } from './entities';
import { Renderer, CANVAS_W, CANVAS_H, HUD_H } from './renderer';
import { burst, updateParticles, type Particle } from './particles';
import { ScreenShake } from './effects';
import { AudioBus } from './audio';
import { attachInput } from './input';
import {
  leaderboardEnabled,
  fetchTop10,
  submitScore,
  qualifiesForTop10,
  isValidName,
  type ScoreRow,
} from './leaderboard';

/* ─── DOM 골격 ─── */
const app = document.getElementById('app');
if (!app) throw new Error('#app not found');
app.innerHTML = `
  <div class="stage-wrap">
    <div class="stage">
      <canvas id="game" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
      <div id="overlay" class="overlay"></div>
    </div>
  </div>
`;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;

/* ─── 시스템 구성 ─── */
const session = createSession();
const enemies: Enemy[] = [];
const particles: Particle[] = [];
const shake = new ScreenShake();
const audio = new AudioBus();
const renderer = new Renderer(canvas);

let top10: ScoreRow[] | null = null;
let lastRunScore = 0;

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

  // 수명 초과 → 게임오버
  for (const e of enemies) {
    if (isExpired(e, session.gameTime)) {
      gameOver();
      return;
    }
  }
}

/* ─── 히트 판정 ─── */
function onTap(x: number, y: number) {
  audio.unlock();
  if (session.phase !== 'playing') return;
  const fx = x;
  const fy = y - HUD_H;
  // 겹칠 때 나중에 그려진(위에 보이는) 적부터
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e.alive || !containsPoint(e, fx, fy)) continue;

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
      }
    } else {
      // 보스 텔레포트 (1~4번째 히트)
      burst(particles, cx, cy, '#ff8c66', 10);
      shake.trigger(6, 150);
      audio.bossHit();
    }
    return; // 한 번의 탭은 한 마리만
  }
}

function clearStage() {
  enemies.length = 0; // 2023 규칙: 스테이지 클리어 시 필드 정리
  stageUp(session);
}

function gameOver() {
  session.phase = 'gameover';
  lastRunScore = session.score;
  enemies.length = 0;
  shake.trigger(12, 300);
  audio.gameOver();
  void showGameOver();
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
      gameTime: session.gameTime,
      playing: session.phase === 'playing',
    },
    alpha,
  );
});

/* ─── 오버레이 UI (타이틀 / 게임오버 / 랭킹) ─── */
function boardHtml(rows: ScoreRow[] | null): string {
  if (!leaderboardEnabled || rows === null) return '';
  const lines = rows.length
    ? rows
        .map(
          (r, i) =>
            `<li><span class="rank">${String(i + 1).padStart(2, ' ')}</span><span class="name">${r.name.padEnd(3, '·')}</span><span class="pts">${r.score}</span></li>`,
        )
        .join('')
    : '<li class="empty">NO RECORDS YET — BE THE FIRST</li>';
  return `<div class="board"><p class="board-title">— TOP 10 —</p><ol>${lines}</ol></div>`;
}

function showTitle() {
  session.phase = 'title';
  overlay.innerHTML = `
    <div class="panel">
      <h1>SHOOTING <span>2026</span></h1>
      <p class="sub">TypeScript · Canvas · 고정 타임스텝 — 2023년 그 게임의 리라이트</p>
      ${boardHtml(top10)}
      <button id="start" class="btn-start"><img src="/game/img/shooting/start.svg" alt="START" /></button>
      <p class="hint">적이 사라지기 전에 클릭! 보스는 5번 맞혀야 다음 레벨<br />스테이지 3부터 적이 움직이고, 보스가 진화합니다</p>
    </div>
  `;
  overlay.querySelector('#start')?.addEventListener('click', () => {
    audio.unlock();
    overlay.innerHTML = '';
    enemies.length = 0;
    particles.length = 0;
    startGame(session);
  });
}

async function showGameOver() {
  const qualifies = qualifiesForTop10(lastRunScore, top10);
  overlay.innerHTML = `
    <div class="panel">
      <h1 class="over">GAME OVER</h1>
      <p class="final">SCORE ${lastRunScore}</p>
      ${
        qualifies
          ? `<div class="entry">
               <p class="entry-title">★ TOP 10 진입! 이니셜을 남기세요 ★</p>
               <form id="initials-form">
                 <input id="initials" maxlength="3" autocomplete="off" spellcheck="false" placeholder="AAA" />
                 <button type="submit">등록</button>
               </form>
               <p id="entry-error" class="entry-error"></p>
             </div>`
          : ''
      }
      <div id="gameover-board">${boardHtml(top10)}</div>
      <button id="retry" class="btn-text">RETRY</button>
      <button id="to-title" class="btn-text dim">TITLE</button>
    </div>
  `;

  // 순위권 밖이어도 최신 기록판을 보여준다 — 캐시로 즉시 렌더 후 백그라운드 갱신
  void fetchTop10().then((rows) => {
    if (rows === null) return;
    top10 = rows;
    const board = overlay.querySelector('#gameover-board');
    if (board) board.innerHTML = boardHtml(top10);
  });

  const form = overlay.querySelector<HTMLFormElement>('#initials-form');
  const input = overlay.querySelector<HTMLInputElement>('#initials');
  if (form && input) {
    input.focus();
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = input.value.trim();
      const errorEl = overlay.querySelector('#entry-error');
      if (!isValidName(name)) {
        if (errorEl) errorEl.textContent = 'A–Z·0–9 조합 1~3글자만 가능합니다';
        return;
      }
      form.querySelector('button')?.setAttribute('disabled', 'true');
      const ok = await submitScore(name, lastRunScore);
      if (ok) {
        audio.rankIn();
        top10 = await fetchTop10();
        showTitle();
      } else if (errorEl) {
        errorEl.textContent = '등록 실패 — 잠시 후 다시 시도해주세요';
        form.querySelector('button')?.removeAttribute('disabled');
      }
    });
  }

  overlay.querySelector('#retry')?.addEventListener('click', () => {
    overlay.innerHTML = '';
    enemies.length = 0;
    particles.length = 0;
    startGame(session);
  });
  overlay.querySelector('#to-title')?.addEventListener('click', () => void refreshBoardAndShowTitle());
}

async function refreshBoardAndShowTitle() {
  top10 = await fetchTop10();
  showTitle();
}

/* ─── 화면 맞춤 (700px 고정 → 뷰포트 축소) ─── */
function fit() {
  const wrap = app!.querySelector<HTMLDivElement>('.stage');
  if (!wrap) return;
  const scale = Math.min(1, (window.innerWidth - 16) / CANVAS_W, (window.innerHeight - 16) / CANVAS_H);
  wrap.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fit);

/* ─── 부트스트랩 ─── */
attachInput(canvas, onTap);

// dev 전용 상태 조회 훅 (프로덕션 번들에서 제거됨)
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__gameDebug = () => ({
    phase: session.phase,
    stage: session.stage,
    score: session.score,
    gameTime: Math.round(session.gameTime),
    enemies: enemies.map((e) => ({ kind: e.kind, hitsLeft: e.hitsLeft, x: e.x, y: e.y, size: e.size, vx: e.vx, vy: e.vy, pattern: e.pattern })),
    spawnInterval: session.spawnInterval,
  });
}

(async () => {
  fit();
  const [, rows] = await Promise.all([renderer.loadAssets(), fetchTop10()]);
  top10 = rows;
  showTitle();
  loop.start();
})().catch((err) => {
  overlay.innerHTML = `<div class="panel"><h1 class="over">LOAD ERROR</h1><p class="sub">${String(err)}</p></div>`;
});
