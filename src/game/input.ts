/**
 * 포인터 입력 — 클릭과 터치를 Pointer Events로 통합 처리.
 * 화면 좌표를 필드 논리 좌표로 역변환해서 넘긴다. 캔버스가 CSS transform으로 축소되든(데스크톱)
 * 뷰포트를 꽉 채우든(앱인토스) 히트 판정 좌표계는 동일하다.
 * (rect는 transform을 반영하므로 DPR·scale 모두 커버)
 *
 * HUD를 탭하면 y가 음수가 되므로 히트 판정은 자연스럽게 빗나간다.
 */
import type { Layout } from './layout';

export function attachInput(
  canvas: HTMLCanvasElement,
  getLayout: () => Layout,
  onTap: (fieldX: number, fieldY: number) => void,
): () => void {
  const handler = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const layout = getLayout();
    const cssX = ((e.clientX - rect.left) / rect.width) * layout.cssW;
    const cssY = ((e.clientY - rect.top) / rect.height) * layout.cssH;
    onTap(cssX / layout.scale, (cssY - layout.hudH) / layout.scale);
  };
  canvas.addEventListener('pointerdown', handler);
  return () => canvas.removeEventListener('pointerdown', handler);
}
