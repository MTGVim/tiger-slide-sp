import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function createServiceWorkerPlugin() {
  let outputDirectory = 'dist'
  let basePath = '/'

  return {
    name: 'create-service-worker',
    apply: 'build',
    configResolved(config) {
      outputDirectory = config.build.outDir
      basePath = config.base
    },
    closeBundle() {
      const indexPath = join(outputDirectory, 'index.html')
      if (!existsSync(indexPath)) return

      const indexHtml = readFileSync(indexPath, 'utf8')
      const assetUrls = Array.from(indexHtml.matchAll(/(?:src|href)="([^"]+)"/g), (match) => match[1])
        .filter((url) => !url.startsWith('http') && !url.startsWith('data:'))
        .map((url) => normalizeAppUrl(url, basePath))
      const appShell = Array.from(new Set([
        normalizeAppUrl('index.html', basePath),
        ...assetUrls,
        ...[
          'manifest.webmanifest',
          'favicon.svg',
          'icons.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'apple-touch-icon.png',
          'sounds/slide-smooth.wav',
        ].map((url) => normalizeAppUrl(url, basePath)),
      ]))

      writeFileSync(join(outputDirectory, 'sw.js'), buildServiceWorker(appShell, basePath))
    },
  }
}

function normalizeAppUrl(url, basePath) {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`
  const withoutBase = url.startsWith(normalizedBase) ? url.slice(normalizedBase.length) : url.replace(/^\//, '')
  return posix.join(normalizedBase, withoutBase)
}

function buildServiceWorker(appShell, basePath) {
  const version = new Date().toISOString()

  return `const CACHE_PREFIX = 'tiger-slide-'
const VERSION = ${JSON.stringify(`tiger-slide-${version}`)}
const APP_SHELL_CACHE = \`${'${VERSION}'}-app-shell\`
const RUNTIME_CACHE = \`${'${VERSION}'}-runtime\`
const BASE_PATH = ${JSON.stringify(basePath)}
const APP_SHELL = ${JSON.stringify(appShell, null, 2)}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(BASE_PATH + 'index.html')))
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response

        const responseToCache = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseToCache))
        return response
      })
    }),
  )
})
`
}

const base = process.env.GITHUB_PAGES === 'true' ? '/tiger-slide-sp/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), createServiceWorkerPlugin()],
})
