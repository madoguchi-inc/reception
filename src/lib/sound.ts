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

/** 受付完了チャイム — やわらかい3音の上昇チャイム */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // 3音の上昇チャイム (E5 → G#5 → B5) でメジャーコード感
    const notes = [
      { freq: 659.25, start: 0, duration: 0.25 },     // E5
      { freq: 830.61, start: 0.12, duration: 0.25 },   // G#5
      { freq: 987.77, start: 0.24, duration: 0.45 },   // B5（最後は長め）
    ]

    notes.forEach(({ freq, start, duration }) => {
      // メインの音（triangle = 丸みのあるやわらかい音）
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.35, now + start)
      gain.gain.exponentialRampToValueAtTime(0.01, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration + 0.05)

      // 倍音を軽く加えて厚みを出す（1オクターブ上を小さく重ねる）
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2
      gain2.gain.setValueAtTime(0.08, now + start)
      gain2.gain.exponentialRampToValueAtTime(0.01, now + start + duration * 0.7)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + start)
      osc2.stop(now + start + duration + 0.05)
    })
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
