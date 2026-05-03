import { MetaProvider } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { CommandPalette } from '~/components/command-palette'
import Nav from '~/components/nav'
import './app.css'

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Nav />
          <CommandPalette />
          <div class="mx-auto max-w-5xl px-4">
            <Suspense>{props.children}</Suspense>
          </div>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
