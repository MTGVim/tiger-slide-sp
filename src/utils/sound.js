let audioContext
let slideAudio

function getAssetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`
}

function getSlideAudio() {
  if (typeof window === 'undefined') return null

  if (!slideAudio) {
    slideAudio = new Audio(getAssetUrl('sounds/slide-smooth.wav'))
    slideAudio.preload = 'auto'
    slideAudio.volume = 0.32
  }

  return slideAudio
}

function getAudioContext() {
  if (typeof window === 'undefined') return null

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return null

  if (!audioContext) {
    audioContext = new AudioContextConstructor()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  return audioContext
}

function createGain(context, startTime, peakVolume, endTime) {
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peakVolume, startTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime)
  gain.connect(context.destination)
  return gain
}

export function playSlideSound() {
  const audio = getSlideAudio()
  if (!audio) return

  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function playSlideLandSound() {
  const context = getAudioContext()
  if (!context) return

  const startTime = context.currentTime
  playImpactNoise(context, startTime, 0.038, 0.16)
  playImpactTone(context, startTime + 0.002, 1550, 0.032, 0.042, 'triangle', 4800)
  playImpactTone(context, startTime + 0.012, 2600, 0.018, 0.018, 'sine', 6800)
}

function createImpactGain(context, startTime, peakVolume, endTime) {
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peakVolume, startTime + 0.003)
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime)
  gain.connect(context.destination)
  return gain
}

function playImpactNoise(context, startTime, duration, volume) {
  const frameCount = Math.max(1, Math.floor(context.sampleRate * duration))
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let index = 0; index < frameCount; index += 1) {
    const decay = 1 - index / frameCount
    data[index] = (Math.random() * 2 - 1) * decay * decay
  }

  const source = context.createBufferSource()
  source.buffer = buffer

  const bandpass = context.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.setValueAtTime(3600, startTime)
  bandpass.Q.setValueAtTime(0.75, startTime)

  const lowpass = context.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.setValueAtTime(7600, startTime)

  const gain = createImpactGain(context, startTime, volume, startTime + duration)
  source.connect(bandpass)
  bandpass.connect(lowpass)
  lowpass.connect(gain)
  source.start(startTime)
  source.stop(startTime + duration)
}

function playImpactTone(context, startTime, frequency, duration, volume, type, cutoff) {
  const oscillator = context.createOscillator()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.82, startTime + duration)

  const lowpass = context.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.setValueAtTime(cutoff, startTime)

  const gain = createImpactGain(context, startTime, volume, startTime + duration)
  oscillator.connect(lowpass)
  lowpass.connect(gain)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

function playTone(context, startTime, frequency, duration, volume) {
  const oscillator = context.createOscillator()
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(frequency, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.08, startTime + duration)

  const gain = createGain(context, startTime, volume, startTime + duration)

  oscillator.connect(gain)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export function playClearSound() {
  const context = getAudioContext()
  if (!context) return

  const startTime = context.currentTime
  playTone(context, startTime, 392, 0.22, 0.16)
  playTone(context, startTime + 0.18, 523.25, 0.32, 0.2)
  playTone(context, startTime + 0.18, 659.25, 0.32, 0.11)
}
