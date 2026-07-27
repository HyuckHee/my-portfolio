/**
 * 화면 레이아웃 — 고정 700×610 데스크톱 스테이지와 앱인토스 세로 전체화면을
 * 하나의 렌더러/게임 코어로 동시에 지원하기 위한 좌표계 정의.
 *
 * 좌표계는 두 개다.
 * - HUD: CSS 픽셀. 기기가 달라도 점수·하트가 같은 물리 크기로 보인다.
 * - 필드: 논리 픽셀. 적 크기(80/140)와 속도(px/ms)가 기기와 무관하게 유지된다.
 *
 * 세로 화면에서는 필드의 **면적**을 데스크톱과 동일하게 보존한 채 종횡비만 바꾼다.
 * 적 크기가 논리 좌표 그대로이므로 `무작위 탭이 적을 맞힐 확률 = 적 면적 / 필드 면적`이
 * 보존되고, 화면 비율이 난이도를 바꾸지 않는다. (단순히 뷰포트를 논리 크기로 쓰면
 * 세로 화면에서 필드가 2배 넓어져 같은 게임이 훨씬 어려워진다.)
 */

/** 데스크톱 기준값 — 2023 원본과 동일한 필드 크기 */
export const REF_FIELD_W = 700;
export const REF_FIELD_H = 550;
export const REF_HUD_H = 60;

/** 보존 대상 — 데스크톱 필드 면적(논리 px²) */
const REF_AREA = REF_FIELD_W * REF_FIELD_H;

export interface Layout {
  /** 캔버스 CSS 크기 */
  cssW: number;
  cssH: number;
  /** HUD 띠의 전체 높이(CSS px) — 상단 세이프에어리어를 포함한다 */
  hudH: number;
  /** HUD 안에서 실제 내용이 시작되는 y(CSS px) — 노치/상태바 여백 */
  hudTop: number;
  /** 필드 논리 크기 */
  fieldW: number;
  fieldH: number;
  /** 논리 1px이 화면에서 차지하는 CSS px */
  scale: number;
}

/**
 * 현재 필드 크기. entities의 스폰·벽 반사·텔레포트가 참조하는 가변 상태다.
 * 레이아웃이 정해지는 시점에 `applyLayout`으로 한 번 갱신한다.
 */
export const field = { w: REF_FIELD_W, h: REF_FIELD_H };

export function applyLayout(layout: Layout) {
  field.w = layout.fieldW;
  field.h = layout.fieldH;
}

/** 데스크톱(포트폴리오) 스테이지 — 2023/2026 웹 버전과 픽셀 단위로 동일 */
export function desktopLayout(): Layout {
  return {
    cssW: REF_FIELD_W,
    cssH: REF_HUD_H + REF_FIELD_H,
    hudH: REF_HUD_H,
    hudTop: 0,
    fieldW: REF_FIELD_W,
    fieldH: REF_FIELD_H,
    scale: 1,
  };
}

/**
 * 뷰포트를 꽉 채우는 레이아웃(앱인토스 세로 모드).
 * 면적 보존이므로 `cssW / fieldW === (cssH - hudH) / fieldH` — 가로·세로 배율이 같고
 * 레터박스나 왜곡이 생기지 않는다.
 */
export function fillLayout(cssW: number, cssH: number, hudH: number, hudTop = 0): Layout {
  const fieldCssH = Math.max(1, cssH - hudH);
  const aspect = cssW / fieldCssH;
  const fieldW = Math.sqrt(REF_AREA * aspect);
  return {
    cssW,
    cssH,
    hudH,
    hudTop,
    fieldW,
    fieldH: REF_AREA / fieldW,
    scale: cssW / fieldW,
  };
}
