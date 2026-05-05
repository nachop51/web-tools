import { MetaProvider } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { CommandPalette } from '~/components/command-palette'
import Footer from '~/components/footer'
import Nav from '~/components/nav'
import './app.css'

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <div class="flex min-h-screen flex-col">
            <Nav />
            <CommandPalette />
            <div class="mx-auto w-full max-w-5xl flex-1 px-4">
              <Suspense>{props.children}</Suspense>
            </div>
            <Footer />
          </div>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
