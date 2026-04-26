import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('sound utilities', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it('rotates slide sound playback through a bounded audio pool', async () => {
    const audioInstances = []
    const playedInstances = []

    class MockAudio {
      constructor(src) {
        this.src = src
        this.currentTime = 3
        this.preload = ''
        this.volume = 1
        this.play = vi.fn(() => {
          playedInstances.push(this)
          return Promise.resolve()
        })
        audioInstances.push(this)
      }
    }

    vi.stubGlobal('window', {})
    vi.stubGlobal('Audio', MockAudio)

    const { playSlideSound } = await import('../utils/sound.js')

    for (let index = 0; index < 5; index += 1) {
      playSlideSound()
    }

    expect(audioInstances).toHaveLength(4)
    expect(playedInstances).toEqual([
      audioInstances[0],
      audioInstances[1],
      audioInstances[2],
      audioInstances[3],
      audioInstances[0],
    ])
    expect(audioInstances.map((audio) => audio.currentTime)).toEqual([0, 0, 0, 0])
    expect(audioInstances.every((audio) => audio.preload === 'auto')).toBe(true)
    expect(audioInstances.every((audio) => audio.volume === 0.16)).toBe(true)
  })
})
