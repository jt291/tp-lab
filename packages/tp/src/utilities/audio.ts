// audio.ts
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (audioContext) return audioContext;

  const Ctor =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!Ctor) {
    return null;
  }

  audioContext = new Ctor();
  return audioContext;
}

async function ensureAudioUnlocked(): Promise<AudioContext | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Safari peut jeter ici si pas de gesture utilisateur
      return null;
    }
  }

  return ctx;
}

// À appeler depuis tp-timer
export async function playTripleBeep(): Promise<void> {
  const ctx = await ensureAudioUnlocked();
  if (!ctx) return;

  const beep = (time: number) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.15;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(time);
    oscillator.stop(time + 0.08);
  };

  const now = ctx.currentTime;

  beep(now);
  beep(now + 0.18);
  beep(now + 0.36);
}

/**
 * À appeler depuis une interaction utilisateur (clic, etc.)
 * pour "débloquer" l’audio sur Safari.
 */
export async function unlockAudio(): Promise<void> {
  await ensureAudioUnlocked();
}