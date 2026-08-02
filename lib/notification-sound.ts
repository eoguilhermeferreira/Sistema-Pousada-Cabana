let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  return audioContext;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  peak = 0.28,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

/** Toca um "ding-dong" curto pra chamar a atenção da recepção — gerado na
 * hora pela Web Audio API, sem depender de nenhum arquivo de áudio. */
export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  const now = ctx.currentTime;
  tone(ctx, 880, now, 0.35); // A5
  tone(ctx, 1108.73, now + 0.16, 0.4); // C#6
}
