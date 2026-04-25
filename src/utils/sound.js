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
  playTone(context, startTime, 180, 0.055, 0.09)
  playTone(context, startTime + 0.01, 280, 0.04, 0.045)
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
