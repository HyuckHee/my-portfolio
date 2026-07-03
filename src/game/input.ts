/**
 * 포인터 입력 — 클릭과 터치를 Pointer Events로 통합 처리.
 * 캔버스는 CSS transform scale로 축소될 수 있으므로, getBoundingClientRect 비율로
 * 화면 좌표를 논리 좌표(700×610)로 역변환한다. (rect는 transform을 반영하므로 DPR·scale 모두 커버)
 */
import { CANVAS_W, CANVAS_H } from './renderer';

export function attachInput(canvas: HTMLCanvasElement, onTap: (x: number, y: number) => void): () => void {
  const handler = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    onTap(x, y);
  };
  canvas.addEventListener('pointerdown', handler);
  return () => canvas.removeEventListener('pointerdown', handler);
}
