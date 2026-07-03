/**
 * 화면 흔들림 — 0.1~0.3초 사이 지속시간에 이징 감쇠를 적용한다.
 */
export class ScreenShake {
  private elapsed = 0;
  private duration = 0;
  private magnitude = 0;

  /** @param magnitude 최대 흔들림(px) @param duration 지속시간(ms, 100~300 권장) */
  trigger(magnitude: number, duration: number) {
    // 더 강한 흔들림이 진행 중이면 유지
    if (this.remaining() > 0 && this.magnitude > magnitude) return;
    this.elapsed = 0;
    this.duration = duration;
    this.magnitude = magnitude;
  }

  update(dt: number) {
    if (this.elapsed < this.duration) this.elapsed += dt;
  }

  private remaining() {
    return Math.max(0, this.duration - this.elapsed);
  }

  /** 남은 시간 비율의 제곱(ease-out)으로 감쇠한 랜덤 오프셋 */
  offset(): { x: number; y: number } {
    const t = this.duration > 0 ? this.remaining() / this.duration : 0;
    if (t <= 0) return { x: 0, y: 0 };
    const damp = t * t;
    return {
      x: (Math.random() * 2 - 1) * this.magnitude * damp,
      y: (Math.random() * 2 - 1) * this.magnitude * damp,
    };
  }
}
