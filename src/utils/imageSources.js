export const DEFAULT_IMAGE_SOURCE_ID = 'random-dog'

const STATIC_IMAGE_PATTERN = /\.(?:jpe?g|png|webp)(?:$|[?#])/i

function withCacheBust(url) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error('이미지를 불러오지 못했어요.')
  return response.json()
}

function assertStaticImageUrl(url) {
  if (typeof url !== 'string' || !STATIC_IMAGE_PATTERN.test(url)) {
    throw new Error('정적 이미지가 아니에요.')
  }

  return url
}

async function fetchRandomDogImage() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const data = await fetchJson('https://random.dog/woof.json')
    if (typeof data.url === 'string' && STATIC_IMAGE_PATTERN.test(data.url)) {
      return withCacheBust(data.url)
    }
  }

  throw new Error('정적 강아지 이미지를 찾지 못했어요.')
}

export const IMAGE_SOURCES = [
  {
    id: 'dog-ceo',
    label: '강아지',
    kind: 'photo',
    requiresAttribution: false,
    async fetchImage() {
      const data = await fetchJson('https://dog.ceo/api/breeds/image/random')
      return withCacheBust(assertStaticImageUrl(data.message))
    },
  },
  {
    id: 'random-fox',
    label: '여우',
    kind: 'photo',
    requiresAttribution: false,
    async fetchImage() {
      const data = await fetchJson('https://randomfox.ca/floof/')
      return withCacheBust(assertStaticImageUrl(data.image))
    },
  },
  {
    id: 'loremflickr-cat',
    label: '고양이',
    kind: 'photo',
    requiresAttribution: false,
    async fetchImage() {
      return withCacheBust('https://loremflickr.com/900/900/cat')
    },
  },
  {
    id: 'random-dog',
    label: '강아지 2',
    kind: 'photo',
    requiresAttribution: false,
    fetchImage: fetchRandomDogImage,
  }
]

export function getImageSource(sourceId) {
  return IMAGE_SOURCES.find((source) => source.id === sourceId) ?? IMAGE_SOURCES.find((source) => source.id === DEFAULT_IMAGE_SOURCE_ID)
}

export function isValidImageSourceId(sourceId) {
  return IMAGE_SOURCES.some((source) => source.id === sourceId)
}
