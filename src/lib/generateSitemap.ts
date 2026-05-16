// src/lib/generateSitemap.ts
import { listings } from '@/data/listings'

const BASE_URL = 'https://the-class-luxury.pages.dev'

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/servizi', priority: '0.9', changefreq: 'daily' },
  { path: '/itinerari', priority: '0.8', changefreq: 'weekly' },
  { path: '/concierge', priority: '0.8', changefreq: 'weekly' },
  { path: '/richiesta-su-misura', priority: '0.7', changefreq: 'monthly' },
  { path: '/stories', priority: '0.8', changefreq: 'weekly' },
  { path: '/chi-siamo', priority: '0.6', changefreq: 'monthly' },
  { path: '/contatti', priority: '0.6', changefreq: 'monthly' },
  { path: '/faq', priority: '0.5', changefreq: 'monthly' },
]

export function generateSitemapXML(): string {
  const now = new Date().toISOString().split('T')[0]

  const staticEntries = STATIC_PAGES.map(p => `
  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

  const listingEntries = listings.map(l => `
  <url>
    <loc>${BASE_URL}/servizi/${l.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${listingEntries}
</urlset>`
}
