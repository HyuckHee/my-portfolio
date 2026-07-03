/**
 * 고정 타임스텝 게임 루프.
 * update는 항상 STEP(≈16.67ms) 단위로 호출되어 물리·타이머가 프레임레이트와 무관하게 결정적이고,
 * render는 남은 누적 시간 비율(alpha)을 받아 프레임 사이를 보간한다.
 * 120Hz+ 모니터에서 게임이 2배속이 되는 문제를 구조적으로 차단한다.
 */
export type UpdateFn = (dt: number) => void;
export type RenderFn = (alpha: number) => void;

export const STEP = 1000 / 60;

/** 탭 비활성화 후 복귀 시 거대한 delta로 업데이트가 폭주하는 것을 방지 */
const MAX_FRAME_DELTA = 250;

export function createLoop(update: UpdateFn, render: RenderFn) {
  let rafId = 0;
  let last = 0;
  let accumulator = 0;
  let running = false;

  const frame = (now: number) => {
    if (!running) return;
    if (last === 0) last = now;
    accumulator += Math.min(now - last, MAX_FRAME_DELTA);
    last = now;

    try {
      while (accumulator >= STEP) {
        update(STEP);
        accumulator -= STEP;
      }
      render(accumulator / STEP);
    } catch (err) {
      running = false;
      console.error('[game-loop] crashed:', err);
      throw err;
    }

    rafId = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      accumulator = 0;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
    },
  };
}
