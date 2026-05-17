/**
 * the Class — Social Media Auto-Publisher
 * Mock implementation — wire up real API keys to activate
 *
 * Supported platforms: Twitter/X (via OAuth 2.0), Meta (via Graph API)
 * Run: node social/scripts/upload.js --platform twitter --date 2026-06-01
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.join(__dirname, '..', 'posts.csv')

// --- Config (set via env vars) ---
const CONFIG = {
  twitter: {
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  },
  meta: {
    accessToken: process.env.META_ACCESS_TOKEN,
    pageId: process.env.META_PAGE_ID,
    instagramId: process.env.META_INSTAGRAM_ID,
  },
}

// --- CSV Parser ---
function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] || '').trim()]))
  })
}

// --- Mock Publishers ---
async function publishToTwitter(post) {
  console.log('[Twitter] Publishing:', post.caption.slice(0, 60) + '...')
  // Real implementation:
  // const client = new TwitterApi(CONFIG.twitter)
  // await client.v2.tweet({ text: `${post.caption}\n\n${post.hashtags}` })
  console.log('[Twitter] ✅ Mock: tweet would be posted')
}

async function publishToInstagram(post) {
  console.log('[Instagram] Publishing:', post.caption.slice(0, 60) + '...')
  // Real implementation:
  // Step 1: Upload media container
  // const mediaRes = await fetch(`https://graph.facebook.com/${CONFIG.meta.instagramId}/media`, {
  //   method: 'POST', body: JSON.stringify({ image_url: post.image_url, caption: post.caption, access_token: CONFIG.meta.accessToken })
  // })
  // const { id: mediaId } = await mediaRes.json()
  // Step 2: Publish container
  // await fetch(`https://graph.facebook.com/${CONFIG.meta.instagramId}/media_publish`, {
  //   method: 'POST', body: JSON.stringify({ creation_id: mediaId, access_token: CONFIG.meta.accessToken })
  // })
  console.log('[Instagram] ✅ Mock: post would be published')
}

// --- Main ---
const args = process.argv.slice(2)
const platformArg = args[args.indexOf('--platform') + 1] || 'all'
const dateArg = args[args.indexOf('--date') + 1]

const posts = parseCsv(CSV_PATH)
const toPublish = posts.filter(p =>
  p.status === 'approved' &&
  (platformArg === 'all' || p.platform.toLowerCase() === platformArg.toLowerCase()) &&
  (!dateArg || p.date === dateArg)
)

if (toPublish.length === 0) {
  console.log('No approved posts found for the given filters.')
  console.log('Tip: Change status from "draft" to "approved" in posts.csv to publish.')
  process.exit(0)
}

console.log(`Publishing ${toPublish.length} post(s)...`)
for (const post of toPublish) {
  if (post.platform === 'Twitter') await publishToTwitter(post)
  if (post.platform === 'Instagram') await publishToInstagram(post)
}
console.log('Done.')
