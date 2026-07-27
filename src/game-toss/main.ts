/**
 * 슈팅 게임 2026 — 앱인토스(Apps in Toss) 미니앱 셸.
 *
 * 게임 규칙·렌더 코어(`src/game/`)는 포트폴리오 웹 버전과 100% 공유하고,
 * 이 파일은 모바일 세로 전체화면 레이아웃과 토스 네이티브 연동만 담당한다.
 * - 레이아웃: 필드 면적을 데스크톱과 동일하게 보존해 화면 비율이 난이도를 바꾸지 않는다(layout.ts)
 * - 랭킹: 기존 Supabase TOP 10을 그대로 쓰고, 토스 앱 안에서는 게임센터 리더보드에도 제출한다
 * - 네이티브 연동은 전부 fail-soft(toss.ts) — 일반 브라우저에서도 같은 빌드가 그대로 돌아간다
 */
import './styles.css';
import { createGame, exposeDebugHooks, type Game, type GameEvent } from '../game/engine';
import { fillLayout, type Layout } from '../game/layout';
import {
  leaderboardEnabled,
  fetchTop10,
  submitScore,
  qualifiesForTop10,
  isValidName,
  type ScoreRow,
} from '../game/leaderboard';
import {
  haptic,
  inTossApp,
  keepScreenAwake,
  openLeaderboard,
  submitLeaderboardScore,
  type HapticType,
} from './toss';

// Vite가 번들에 포함시키고 해시 URL로 바꿔준다 — 미니앱은 로컬 번들에서 실행되므로 절대 경로를 쓸 수 없다
import bgUrl from './assets/shooting_bg.webp';
import enemyUrl from './assets/enemy.webp';
import bossUrl from '../../public/game/img/shooting/boss.svg';
import shootSoundUrl from '../../public/game/sounds/shooting/shootSound.mp3';

/** HUD 기본 높이(CSS px) — 상단 세이프에어리어가 여기에 더해진다 */
const HUD_BASE_H = 52;

/* ─── DOM 골격 ─── */
const app = document.getElementById('app');
if (!app) throw new Error('#app not found');
app.innerHTML = `
  <canvas id="game"></canvas>
  <div id="overlay" class="overlay"></div>
`;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;

/* ─── 레이아웃 ─── */
/** CSS env(safe-area-inset-top) 값을 읽는다 — 노치 아래로 HUD를 밀어준다 */
function safeAreaTop(): number {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;visibility:hidden;height:env(safe-area-inset-top,0px)';
  document.body.appendChild(probe);
  const value = probe.getBoundingClientRect().height;
  probe.remove();
  return Number.isFinite(value) ? value : 0;
}

function currentLayout(): Layout {
  // visualViewport는 키보드/브라우저 UI를 반영한 실제 가시 영역이다
  const vw = window.visualViewport?.width ?? window.innerWidth;
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const top = safeAreaTop();
  return fillLayout(vw, vh, HUD_BASE_H + top, top);
}

function applyCanvasSize(layout: Layout) {
  canvas.style.width = `${layout.cssW}px`;
  canvas.style.height = `${layout.cssH}px`;
  app!.style.setProperty('--hud-h', `${layout.hudH}px`);
}

/* ─── 게임 ─── */
let top10: ScoreRow[] | null = null;
let lastRunScore = 0;

/** 게임 이벤트 → 햅틱. 게임필의 절반은 손끝에서 온다 */
const HAPTICS: Record<GameEvent, HapticType> = {
  kill: 'tickWeak',
  bossHit: 'tickMedium',
  stageClear: 'success',
  lifeLost: 'basicMedium',
  civilianHit: 'error',
  gameOver: 'error',
};

const initialLayout = currentLayout();
applyCanvasSize(initialLayout);

const game: Game = createGame({
  canvas,
  layout: initialLayout,
  assets: { bg: bgUrl, enemy: enemyUrl, boss: bossUrl },
  bgFit: 'cover',
  shootSoundSrc: shootSoundUrl,
  onEvent: (event) => haptic(HAPTICS[event]),
  onGameOver: (score) => {
    lastRunScore = score;
    keepScreenAwake(false);
    void showGameOver();
  },
});
const { audio } = game;

/* ─── 오버레이 UI ─── */
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

/** 토스 앱 안에서만 노출되는 게임센터 랭킹 버튼 */
const gameCenterButtonHtml = inTossApp
  ? '<button id="gamecenter" class="btn dim">토스 게임센터 랭킹</button>'
  : '';

function bindGameCenterButton() {
  overlay.querySelector('#gamecenter')?.addEventListener('click', () => {
    haptic('tap');
    openLeaderboard();
  });
}

function startRun() {
  audio.unlock();
  overlay.innerHTML = '';
  keepScreenAwake(true);
  game.startRun();
}

function showTitle() {
  game.session.phase = 'title';
  keepScreenAwake(false);
  overlay.innerHTML = `
    <div class="panel">
      <h1>SHOOTING <span>2026</span></h1>
      <p class="sub">적이 사라지기 전에 탭!<br />보스는 5번 맞혀야 다음 레벨</p>
      ${boardHtml(top10)}
      <button id="start" class="btn">게임 시작</button>
      ${gameCenterButtonHtml}
      <p class="hint">스테이지 3부터 적이 움직이고 보스가 진화합니다<br />스테이지 5부터 우주비행사🧑‍🚀를 쏘면 라이프가 깎여요</p>
    </div>
  `;
  overlay.querySelector('#start')?.addEventListener('click', startRun);
  bindGameCenterButton();
}

async function showGameOver() {
  // 게임센터 제출은 결과를 기다리지 않는다 — 랭킹 UI를 막을 이유가 없다
  void submitLeaderboardScore(lastRunScore);

  const qualifies = qualifiesForTop10(lastRunScore, top10);
  overlay.innerHTML = `
    <div class="panel">
      <h1 class="over">GAME OVER</h1>
      <p class="final">${lastRunScore}</p>
      ${
        qualifies
          ? `<div class="entry">
               <p class="entry-title">★ TOP 10 진입! 이니셜을 남기세요 ★</p>
               <form id="initials-form">
                 <input id="initials" maxlength="3" autocomplete="off" spellcheck="false" placeholder="AAA" inputmode="latin" />
                 <button type="submit">등록</button>
               </form>
               <p id="entry-error" class="entry-error"></p>
             </div>`
          : ''
      }
      <div id="gameover-board">${boardHtml(top10)}</div>
      <button id="retry" class="btn">다시 하기</button>
      ${gameCenterButtonHtml}
      <button id="to-title" class="btn dim">타이틀로</button>
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
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      input.blur(); // 모바일 키보드를 내려 결과가 가려지지 않게
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
        haptic('confetti');
        top10 = await fetchTop10();
        showTitle();
      } else if (errorEl) {
        errorEl.textContent = '등록 실패 — 잠시 후 다시 시도해주세요';
        form.querySelector('button')?.removeAttribute('disabled');
      }
    });
  }

  overlay.querySelector('#retry')?.addEventListener('click', startRun);
  overlay.querySelector('#to-title')?.addEventListener('click', () => void refreshBoardAndShowTitle());
  bindGameCenterButton();
}

async function refreshBoardAndShowTitle() {
  top10 = await fetchTop10();
  showTitle();
}

/* ─── 회전·리사이즈 ─── */
function relayout() {
  const layout = currentLayout();
  applyCanvasSize(layout);
  game.setLayout(layout);
}
window.addEventListener('resize', relayout);
window.addEventListener('orientationchange', relayout);
window.visualViewport?.addEventListener('resize', relayout);

/* ─── 음소거 ─── */
const MUTE_KEY = 'shooting2026-muted';
const muteBtn = document.createElement('button');
muteBtn.className = 'mute-btn';
muteBtn.setAttribute('aria-label', '소리 켜기/끄기');
const applyMute = (muted: boolean) => {
  audio.setMuted(muted);
  muteBtn.textContent = muted ? '🔇' : '🔊';
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // 저장 불가 환경 — 세션 내에서만 유지
  }
};
muteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  audio.unlock();
  applyMute(!audio.isMuted());
});
app.appendChild(muteBtn);
try {
  applyMute(localStorage.getItem(MUTE_KEY) === '1');
} catch {
  applyMute(false);
}

/* ─── 백그라운드 진입 시 화면 깨움 해제 ─── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) keepScreenAwake(false);
  else if (game.session.phase === 'playing') keepScreenAwake(true);
});

/* ─── 부트스트랩 ─── */
if (import.meta.env.DEV) exposeDebugHooks(game);

(async () => {
  const [, rows] = await Promise.all([game.boot(), fetchTop10()]);
  top10 = rows;
  showTitle();
})().catch((err) => {
  overlay.innerHTML = `<div class="panel"><h1 class="over">LOAD ERROR</h1><p class="sub">${String(err)}</p></div>`;
});
