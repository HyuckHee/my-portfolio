/**
 * 앱인토스 네이티브 브릿지 래퍼 — 전부 fail-soft.
 *
 * 토스 앱 밖(일반 브라우저)에서는 브릿지 호출이 reject되므로 전부 삼키고 기본 동작으로 넘어간다.
 * 덕분에 같은 빌드를 데스크톱 브라우저에서 그대로 열어 개발·QA할 수 있다.
 *
 * 타입 주의: `@apps-in-toss/web-framework`는 런타임에는 `web-bridge/bridge.js`를 통해
 * 햅틱·게임센터 브릿지를 모두 re-export하지만, 배포된 `.d.ts`에는 이 이름들이 빠져 있다(v2.10.7).
 * 그래서 필요한 함수만 아래 인터페이스로 좁혀서 캐스팅해 쓴다. 없으면 없는 대로 동작한다.
 * (side-effect import도 겸한다 — `window.__GRANITE_NATIVE_EMITTER` 설치가 브릿지 동작의 전제)
 */
import * as ait from '@apps-in-toss/web-framework';

export type HapticType =
  | 'tickWeak'
  | 'tap'
  | 'tickMedium'
  | 'softMedium'
  | 'basicWeak'
  | 'basicMedium'
  | 'success'
  | 'error'
  | 'wiggle'
  | 'confetti';

export type GameCenterProfile =
  | { statusCode: 'PROFILE_NOT_FOUND' }
  | { statusCode: 'SUCCESS'; nickname: string; profileImageUri: string };

export type SubmitScoreStatus =
  | 'SUCCESS'
  | 'LEADERBOARD_NOT_FOUND'
  | 'PROFILE_NOT_FOUND'
  | 'UNPARSABLE_SCORE';

interface RuntimeBridges {
  generateHapticFeedback(options: { type: HapticType }): Promise<void>;
  setScreenAwakeMode(options: { enabled: boolean }): Promise<{ enabled: boolean }>;
  getGameCenterGameProfile(): Promise<GameCenterProfile | undefined>;
  openGameCenterLeaderboard(): Promise<void>;
  submitGameCenterLeaderBoardScore(params: { score: string }): Promise<{ statusCode: SubmitScoreStatus } | undefined>;
  share(message: { message: string }): Promise<void>;
  closeView(): Promise<void>;
}

const bridges = ait as unknown as Partial<RuntimeBridges>;

/** 토스 앱 웹뷰 안에서 실행 중인지 — 네이티브 호출은 여기서만 의미가 있다 */
export const inTossApp = (() => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView);
})();

async function call<K extends keyof RuntimeBridges>(
  name: K,
  invoke: (fn: NonNullable<Partial<RuntimeBridges>[K]>) => Promise<unknown>,
): Promise<unknown> {
  const fn = bridges[name];
  if (!inTossApp || typeof fn !== 'function') return undefined;
  try {
    return await invoke(fn as NonNullable<Partial<RuntimeBridges>[K]>);
  } catch {
    // 구버전 앱이거나 미지원 환경 — 게임 진행을 막지 않는다
    return undefined;
  }
}

export function haptic(type: HapticType): void {
  void call('generateHapticFeedback', (fn) => fn({ type }));
}

/** 플레이 중 화면이 꺼지지 않게 한다 */
export function keepScreenAwake(enabled: boolean): void {
  void call('setScreenAwakeMode', (fn) => fn({ enabled }));
}

export async function getGameProfile(): Promise<GameCenterProfile | undefined> {
  return (await call('getGameCenterGameProfile', (fn) => fn())) as GameCenterProfile | undefined;
}

export function openLeaderboard(): void {
  void call('openGameCenterLeaderboard', (fn) => fn());
}

/**
 * 게임센터 리더보드에 점수를 제출한다.
 * 점수는 실수 형태의 문자열이어야 한다(SDK 규약).
 * @returns 제출 결과 상태. 미지원·실패면 `undefined`
 */
export async function submitLeaderboardScore(score: number): Promise<SubmitScoreStatus | undefined> {
  if (!Number.isFinite(score) || score <= 0) return undefined;
  const result = (await call('submitGameCenterLeaderBoardScore', (fn) =>
    fn({ score: String(Math.floor(score)) }),
  )) as { statusCode: SubmitScoreStatus } | undefined;
  return result?.statusCode;
}

export function shareText(message: string): void {
  void call('share', (fn) => fn({ message }));
}

/** 미니앱 종료 — 토스 홈으로 돌아간다 */
export function closeMiniApp(): void {
  void call('closeView', (fn) => fn());
}
