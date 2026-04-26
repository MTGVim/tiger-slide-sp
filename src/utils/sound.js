let audioContext
let audioUnlocked = false
let slideBufferPromise
let clearBufferPromise

function getAssetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`
}

function getAudioContext() {
  if (typeof window === 'undefined') return null

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return null

  if (!audioContext) {
    audioContext = new AudioContextConstructor()
  }

  return audioContext
}

async function fetchAudioBuffer(path) {
  const context = getAudioContext()
  if (!context) return null

  const response = await fetch(getAssetUrl(path))
  if (!response.ok) throw new Error('사운드를 불러오지 못했어요.')
  const arrayBuffer = await response.arrayBuffer()
  return context.decodeAudioData(arrayBuffer)
}

function getSlideBufferPromise() {
  if (!slideBufferPromise) {
    slideBufferPromise = fetchAudioBuffer('sounds/slide-smooth.wav').catch((error) => {
      slideBufferPromise = null
      throw error
    })
  }

  return slideBufferPromise
}

function getClearBufferPromise() {
  if (!clearBufferPromise) {
    clearBufferPromise = fetchAudioBuffer('sounds/tada-meme.mp3').catch((error) => {
      clearBufferPromise = null
      throw error
    })
  }

  return clearBufferPromise
}

function playBuffer(buffer, volume) {
  const context = getAudioContext()
  if (!context || !buffer || context.state !== 'running') return false

  const source = context.createBufferSource()
  source.buffer = buffer
  const gain = context.createGain()
  gain.gain.setValueAtTime(volume, context.currentTime)
  source.connect(gain)
  gain.connect(context.destination)
  source.start()
  return true
}

export async function unlockAudio() {
  const context = getAudioContext()
  if (!context) return false

  try {
    if (context.state === 'suspended') {
      await context.resume()
    }

    audioUnlocked = context.state === 'running'
    if (audioUnlocked) {
      void getSlideBufferPromise()
      void getClearBufferPromise()
    }
    return audioUnlocked
  } catch {
    audioUnlocked = false
    return false
  }
}

export async function playSlideSound() {
  if (!(await unlockAudio())) return

  try {
    const buffer = await getSlideBufferPromise()
    playBuffer(buffer, 0.16)
  } catch {
    return
  }
}

export async function playSlideLandSound() {
  if (!(await unlockAudio())) return

  const context = getAudioContext()
  if (!context || context.state !== 'running') return

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

export async function playClearSound() {
  if (!(await unlockAudio())) return

  try {
    const buffer = await getClearBufferPromise()
    playBuffer(buffer, 0.55)
  } catch {
    return
  }
}
