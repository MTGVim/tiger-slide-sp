let audioContext

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
  const context = getAudioContext()
  if (!context) return

  const startTime = context.currentTime
  const duration = 0.13
  const bufferSize = Math.floor(context.sampleRate * duration)
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let index = 0; index < bufferSize; index += 1) {
    const progress = index / bufferSize
    const grit = Math.random() * 2 - 1
    data[index] = grit * (1 - progress) * 0.45
  }

  const noise = context.createBufferSource()
  noise.buffer = buffer

  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(520, startTime)
  filter.frequency.exponentialRampToValueAtTime(190, startTime + duration)
  filter.Q.setValueAtTime(5.5, startTime)

  const gain = createGain(context, startTime, 0.11, startTime + duration)

  noise.connect(filter)
  filter.connect(gain)
  noise.start(startTime)
  noise.stop(startTime + duration)
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
