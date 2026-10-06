/// <reference types="vite/client" />
import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import type { ReactNode } from 'react'
import indexCss from '../index.css?url'

// ---- Brand settings: change them here once, they apply to the whole site ----
const SITE_NAME = 'AR Accessories Co.'
const SITE_URL = 'https://ar-accessories-store.vercel.app' // replace with the real domain later
const SITE_TITLE = 'AR Accessories Co. — Maroc Store'
const SITE_DESCRIPTION =
  'AR Accessories Co. — premium accessories with delivery across Morocco. Cash on delivery (COD) or card payment (CMI).'

/**
 * Pre-paint theme script. Runs synchronously in <head> BEFORE first paint, so
 * the document renders in the correct theme on the very first frame (no flash).
 * Dark mode is a single `.dark` class on <html>, persisted to localStorage,
 * falling back to the system preference.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`

const queryClient = new QueryClient()

/**
 * Root route: owns the HTML document (SSR), the global <head> (SEO) and the
 * app-wide providers. Pages override title/description in their own head().
 *
 * Note: this document is server-rendered. Any child that reads browser-only
 * state at render (localStorage, window, auth state) must be wrapped in the
 * a ClientOnly boundary, otherwise the page can ship blank or mismatched.
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      { name: 'theme-color', content: '#0a0a0a' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'ar_MA' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'stylesheet', href: indexCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* MUST be first: sets the theme class before paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
        {/* Business identity for Google / AI search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
                {
                  '@type': 'Organization',
                  name: SITE_NAME,
                  url: SITE_URL,
                  areaServed: 'MA',
                  sameAs: [],
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={0}>
            <Toaster />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}