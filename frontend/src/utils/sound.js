let unlocked = false

export function unlockAudio() {
  if (unlocked) return
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    if (ctx.state === 'suspended') ctx.resume()
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)
    unlocked = true
    ctx.close()
  } catch {
    /* ignore */
  }
}

/** Short dual-tone alert for admin when a new question arrives */
export function playNotifySound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    if (ctx.state === 'suspended') ctx.resume()

    const beep = (freq, start, dur) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + dur + 0.02)
    }

    const t = ctx.currentTime
    beep(880, t, 0.14)
    beep(1175, t + 0.16, 0.22)

    setTimeout(() => ctx.close(), 800)
  } catch {
    /* ignore */
  }
}
