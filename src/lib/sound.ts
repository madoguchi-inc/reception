// Web Audio API を使った効果音（外部ファイル不要）

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  // iOS Safari では suspended 状態で始まるため resume() が必要
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/** ページ上の最初のタップで AudioContext を初期化（iOS対策） */
export function initAudioOnInteraction() {
  const handler = () => {
    getAudioContext()
    document.removeEventListener('touchstart', handler)
    document.removeEventListener('click', handler)
  }
  document.addEventListener('touchstart', handler, { once: true })
  document.addEventListener('click', handler, { once: true })
}

/** 受付完了チャイム（明るい2音） */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 523.25, start: 0, duration: 0.2 },    // C5
      { freq: 783.99, start: 0.18, duration: 0.4 },  // G5
    ]

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.5, now + start)
      gain.gain.exponentialRampToValueAtTime(0.01, now + start + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + start)
      osc.stop(now + start + duration)
    })
  } catch {
    // Audio API が使えない環境では無視
  }
}

/** エラー音（低めの短い音） */
export function playErrorSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = 220 // A3
    gain.gain.setValueAtTime(0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
  } catch {
    // Audio API が使えない環境では無視
  }
}
