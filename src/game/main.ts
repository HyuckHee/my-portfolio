/**
 * 슈팅 게임 2026 (포트폴리오 웹 셸) — 2023년 바닐라 JS 버전의 TypeScript + Canvas 리라이트.
 * 게임플레이 규칙은 2023 원본과 동일하게 재현하고(설계 문서 규칙 명세 참조),
 * 아키텍처(고정 타임스텝·상태머신)와 게임필(파티클·흔들림·사운드)을 현대화했다.
 * TOP 10 랭킹은 2023년 주석으로 남아있던 미완성 기능의 완성이다.
 *
 * 규칙·렌더 코어는 `engine.ts`에 있고 앱인토스 미니앱 셸(`src/game-toss/`)과 공유한다.
 * 이 파일은 700×610 고정 스테이지와 오버레이 UI(타이틀·게임오버·Supabase 랭킹)만 담당한다.
 */
import { createGame, exposeDebugHooks } from './engine';
import { desktopLayout } from './layout';
import { CANVAS_W, CANVAS_H } from './renderer';
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

let top10: ScoreRow[] | null = null;
let lastRunScore = 0;

const game = createGame({
  canvas,
  layout: desktopLayout(),
  onGameOver: (score) => {
    lastRunScore = score;
    void showGameOver();
  },
});
const { audio } = game;

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
  game.session.phase = 'title';
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
    game.startRun();
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
    game.startRun();
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

/* ─── 음소거 버튼 (플레이 중에도 접근 가능하도록 오버레이 밖) ─── */
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
    // localStorage 불가 환경(시크릿 등) — 세션 내에서만 유지
  }
};
muteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  audio.unlock();
  applyMute(!audio.isMuted());
});
app.querySelector('.stage')?.appendChild(muteBtn);
applyMute(localStorage.getItem(MUTE_KEY) === '1');

/* ─── 부트스트랩 ─── */
if (import.meta.env.DEV) exposeDebugHooks(game);

(async () => {
  fit();
  const [, rows] = await Promise.all([game.boot(), fetchTop10()]);
  top10 = rows;
  showTitle();
})().catch((err) => {
  overlay.innerHTML = `<div class="panel"><h1 class="over">LOAD ERROR</h1><p class="sub">${String(err)}</p></div>`;
});
