import type { MetadataRoute } from 'next'

// AI answer engines are the point of this file, not an afterthought: the first
// two real leads both arrived via ChatGPT. Named crawlers are listed explicitly
// so a future blanket block can't quietly take them out.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/vote'] },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: ['/api/', '/vote'] },
    ],
    sitemap: 'https://www.clubf1.com.au/sitemap.xml',
    host: 'https://www.clubf1.com.au',
  }
}
