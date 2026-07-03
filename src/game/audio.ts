/**
 * WebAudio 효과음.
 * - 발사음은 2023 원본 에셋(shootSound.mp3)을 재사용해 두 버전의 사운드 정체성을 유지.
 * - iOS Safari는 사용자 제스처 안에서만 AudioContext를 시작할 수 있으므로,
 *   첫 포인터 입력에서 unlock()을 호출해 resume한다.
 * - 2023과 달리 오디오 실패가 게임 로직(히트 판정)을 막지 않는다 — 전부 fire-and-forget.
 */
const SHOOT_SRC = '/game/sounds/shooting/shootSound.mp3';

export class AudioBus {
  private ctx: AudioContext | null = null;
  private shootBuffer: AudioBuffer | null = null;
  private loading = false;
  private muted = false;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }

  /** 첫 사용자 제스처에서 호출 — 컨텍스트 생성/재개 + 에셋 로드 */
  unlock() {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return; // WebAudio 미지원 환경 — 무음으로 진행
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
    if (!this.shootBuffer && !this.loading) void this.loadShoot();
  }

  private async loadShoot() {
    if (!this.ctx) return;
    this.loading = true;
    try {
      const res = await fetch(SHOOT_SRC);
      const data = await res.arrayBuffer();
      this.shootBuffer = await this.ctx.decodeAudioData(data);
    } catch {
      // 에셋 로드 실패 — 발사음만 없이 진행
    } finally {
      this.loading = false;
    }
  }

  private playBuffer(buffer: AudioBuffer, volume: number, playbackRate = 1) {
    if (!this.ctx || this.muted) return;
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    src.buffer = buffer;
    src.playbackRate.value = playbackRate;
    gain.gain.value = volume;
    src.connect(gain).connect(this.ctx.destination);
    src.start();
  }

  /** 합성 비프 — 외부 에셋 없이 UI/이벤트 음을 만든다 */
  private beep(freq: number, duration: number, volume = 0.2, type: OscillatorType = 'square') {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration / 1000);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration / 1000);
  }

  shoot() {
    if (this.shootBuffer) this.playBuffer(this.shootBuffer, 0.3);
    else this.beep(880, 80, 0.12);
  }

  bossHit() {
    if (this.shootBuffer) this.playBuffer(this.shootBuffer, 0.35, 0.7);
    else this.beep(440, 100, 0.15);
  }

  stageClear() {
    this.beep(660, 90);
    setTimeout(() => this.beep(880, 90), 100);
    setTimeout(() => this.beep(1320, 140), 200);
  }

  /** 라이프 차감 — 게임오버보다 가볍고 짧은 경고음 */
  lifeLost() {
    this.beep(392, 110, 0.18, 'sawtooth');
    setTimeout(() => this.beep(294, 160, 0.18, 'sawtooth'), 110);
  }

  gameOver() {
    this.beep(330, 180, 0.18, 'sawtooth');
    setTimeout(() => this.beep(220, 260, 0.18, 'sawtooth'), 180);
  }

  rankIn() {
    this.beep(523, 90);
    setTimeout(() => this.beep(659, 90), 100);
    setTimeout(() => this.beep(784, 90), 200);
    setTimeout(() => this.beep(1046, 180), 300);
  }
}
