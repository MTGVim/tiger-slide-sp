import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('sound utilities', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it('unlocks shared audio and plays slide buffers through Web Audio', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }))
    const startMock = vi.fn()
    const gainNode = { gain: { setValueAtTime: vi.fn() }, connect: vi.fn() }
    const sourceNode = { connect: vi.fn(), start: startMock }
    const context = {
      state: 'running',
      currentTime: 1,
      destination: {},
      resume: vi.fn(() => Promise.resolve()),
      decodeAudioData: vi.fn(() => Promise.resolve({ duration: 0.2 })),
      createBufferSource: vi.fn(() => sourceNode),
      createGain: vi.fn(() => gainNode),
      createBuffer: vi.fn(),
      createBiquadFilter: vi.fn(),
      createOscillator: vi.fn(),
    }
    class AudioContextMock {
      constructor() {
        return context
      }
    }

    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', { AudioContext: AudioContextMock })

    const { playSlideSound, unlockAudio } = await import('../utils/sound.js')

    expect(await unlockAudio()).toBe(true)
    await playSlideSound()

    expect(fetchMock).toHaveBeenCalledWith('/sounds/slide-smooth.wav')
    expect(context.decodeAudioData.mock.calls.length).toBeGreaterThanOrEqual(1)
    expect(context.createBufferSource).toHaveBeenCalledTimes(1)
    expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.16, 1)
    expect(startMock).toHaveBeenCalledTimes(1)
  })

  it('returns false when audio context cannot be created', async () => {
    vi.stubGlobal('window', {})

    const { unlockAudio } = await import('../utils/sound.js')

    expect(await unlockAudio()).toBe(false)
  })
})
