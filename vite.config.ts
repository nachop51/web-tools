/// <reference types="vitest/config" />
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import { nitroV2Plugin as nitro } from '@solidjs/vite-plugin-nitro-2'
import { solidStart } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'

const buildSha = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
})()
const buildDate = new Date().toISOString().slice(0, 10)

export default defineConfig({
  plugins: [solidStart(), tailwindcss(), nitro()],
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  test: {
    exclude: ['.claude/**', 'node_modules/**'],
  },
})
