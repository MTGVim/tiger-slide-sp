export function processImage(file, boardSize = 900) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = boardSize
      canvas.height = boardSize

      const cropSize = Math.min(image.width, image.height)
      const sx = (image.width - cropSize) / 2
      const sy = (image.height - cropSize) / 2

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, boardSize, boardSize)

      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지를 불러오지 못했습니다.'))
    }

    image.src = objectUrl
  })
}
