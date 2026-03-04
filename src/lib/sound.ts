// Web Audio API を使った効果音（外部ファイル不要）
// iOS Safari 対応: ユーザージェスチャー中に AudioContext を作成＋無音再生でアンロック

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

/** 無音バッファを再生して iOS の AudioContext を完全にアンロック */
function unlockAudio() {
  if (audioUnlocked) return
  try {
    const ctx = getAudioContext()
    // 極短の無音バッファを作成して再生
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

/** 受付完了チャイム（明るい2音）- ユーザージェスチャー中に呼ぶこと */
export function playSuccessSound() {
  try {
    unlockAudio()
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
    unlockAudio()
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
