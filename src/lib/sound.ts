// Web Audio API を使った効果音（外部ファイル不要）
// iOS Safari 対応: ボタン押下時に unlockAudio() → fetch完了後に playSuccessSound()

let audioCtx: AudioContext | null = null
let audioUnlocked = false

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/** 無音バッファを再生して iOS の AudioContext を完全にアンロック。ボタン押下時（ユーザージェスチャー中）に呼ぶ。 */
export function unlockAudio() {
  try {
    const ctx = getAudioContext()
    if (audioUnlocked && ctx.state === 'running') return
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)
    audioUnlocked = true
  } catch {
    // 無視
  }
}

/** ページ上の最初のタップで AudioContext を初期化＋アンロック（iOS対策） */
export function initAudioOnInteraction() {
  const handler = () => {
    unlockAudio()
    document.removeEventListener('touchstart', handler)
    document.removeEventListener('touchend', handler)
    document.removeEventListener('click', handler)
  }
  document.addEventListener('touchstart', handler, { once: false })
  document.addEventListener('touchend', handler, { once: false })
  document.addEventListener('click', handler, { once: false })
}

/** 受付完了チャイム — ANA国際線風の洗練された上昇3音チャイム */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    function playNote(freq: number, start: number, duration: number, type: OscillatorType, vol: number) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(vol, now + start)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration + 0.05)
    }

    // 1音目: B♭5
    playNote(932.33, 0, 0.55, 'sine', 0.28)
    playNote(1864.66, 0, 0.35, 'sine', 0.08)
    playNote(932.33, 0, 0.3, 'triangle', 0.06)

    // 2音目: D6（上昇）
    playNote(1174.66, 0.45, 0.55, 'sine', 0.28)
    playNote(2349.32, 0.45, 0.35, 'sine', 0.08)
    playNote(1174.66, 0.45, 0.3, 'triangle', 0.06)

    // 3音目: F6（さらに上昇、長い余韻）
    playNote(1396.91, 0.9, 1.2, 'sine', 0.25)
    playNote(2793.83, 0.9, 0.8, 'sine', 0.07)
    playNote(1396.91, 0.9, 0.6, 'triangle', 0.05)
    playNote(698.46, 0.9, 0.8, 'sine', 0.04)  // F5 低い支え
  } catch {
    // Audio API が使えない環境では無視
  }
}

/** エラー音（低めの下降2音） */
export function playErrorSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 330, start: 0, duration: 0.15 },
      { freq: 262, start: 0.15, duration: 0.3 },
    ]

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.3, now + start)
      gain.gain.exponentialRampToValueAtTime(0.01, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration + 0.05)
    })
  } catch {}
}
