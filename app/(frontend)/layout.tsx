import type { Metadata, Viewport } from 'next'
import { Mukta } from 'next/font/google'
import Script from 'next/script'

import { BreakingTicker } from '@/components/breaking-ticker'
import { JsonLd } from '@/components/json-ld'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Toaster } from '@/components/ui/sonner'
import { getArticles, getCategories, getSite } from '@/lib/queries'
import { absoluteUrl, INDEXABLE, SITE_DESCRIPTION, SITE_NAME, SITE_NAME_NE, SITE_URL } from '@/lib/site'
import './globals.css'

const mukta = Mukta({ subsets: ['devanagari', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ${SITE_NAME_NE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // No canonical here: children would inherit it. Every page sets its own.
  alternates: { types: { 'application/rss+xml': [{ url: '/feed.xml', title: SITE_NAME }] } },
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'ne_NP', images: [{ url: '/og-default.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  robots: INDEXABLE ? { index: true, follow: true, 'max-image-preview': 'large' } : { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: '#1e4fa0' }

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [site, categories, breaking] = await Promise.all([getSite(), getCategories(), getArticles({ breaking: true, limit: 5 })])
  const sameAs = [site.social?.facebook, site.social?.youtube, site.social?.tiktok, site.social?.instagram, site.social?.x].filter(Boolean)
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="ne" className={mukta.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <SiteHeader categories={categories} tagline={site.tagline} />
        <BreakingTicker items={breaking.docs} />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter site={site} categories={categories} />
        <Toaster position="top-center" />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'NewsMediaOrganization',
                '@id': `${SITE_URL}/#org`,
                name: SITE_NAME,
                alternateName: SITE_NAME_NE,
                legalName: 'Mission Khabar Pvt. Ltd.',
                url: SITE_URL,
                logo: { '@type': 'ImageObject', url: absoluteUrl('/logo-512.png'), width: 512, height: 512 },
                sameAs,
                ...(site.contact?.email ? { email: site.contact.email } : {}),
              },
              {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                name: SITE_NAME,
                url: SITE_URL,
                inLanguage: 'ne',
                publisher: { '@id': `${SITE_URL}/#org` },
                potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/search?q={query}`, 'query-input': 'required name=query' },
              },
            ],
          }}
        />
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
