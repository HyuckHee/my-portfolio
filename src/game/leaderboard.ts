/**
 * TOP 10 랭킹 — 2023년 주석으로 남아있던 서버 연동(getScore/insertScore)의 완성.
 * Supabase REST API를 SDK 없이 fetch로 직접 호출해 번들 크기를 지킨다.
 * 환경 변수가 없거나 요청이 실패하면 null을 반환하고, 게임은 랭킹 없이 정상 동작한다(fail-soft).
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const leaderboardEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export interface ScoreRow {
  name: string;
  score: number;
}

const NAME_PATTERN = /^[A-Z0-9]{1,3}$/;
/** 오락실 이니셜식 최소 블록리스트 */
const NAME_BLOCKLIST = new Set(['SEX', 'FUK', 'FUC', 'FCK', 'ASS', 'JOT', 'SIB', 'GAE', 'XXX']);

export function isValidName(name: string): boolean {
  return NAME_PATTERN.test(name) && !NAME_BLOCKLIST.has(name);
}

const headers = () => ({
  apikey: SUPABASE_ANON_KEY as string,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
});

export async function fetchTop10(): Promise<ScoreRow[] | null> {
  if (!leaderboardEnabled) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/shooting_scores?select=name,score&order=score.desc,created_at.asc&limit=10`,
      { headers: headers() },
    );
    if (!res.ok) return null;
    return (await res.json()) as ScoreRow[];
  } catch {
    return null;
  }
}

export async function submitScore(name: string, score: number): Promise<boolean> {
  if (!leaderboardEnabled || !isValidName(name) || !Number.isInteger(score) || score <= 0) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/shooting_scores`, {
      method: 'POST',
      headers: { ...headers(), Prefer: 'return=minimal' },
      body: JSON.stringify({ name, score }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** TOP 10 진입 여부 — 기록판이 덜 찼거나 최하위 점수보다 높으면 진입 */
export function qualifiesForTop10(score: number, rows: ScoreRow[] | null): boolean {
  if (!leaderboardEnabled || rows === null || score <= 0) return false;
  if (rows.length < 10) return true;
  return score > rows[rows.length - 1].score;
}
