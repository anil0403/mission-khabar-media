# Mission Khabar Media — website

News portal for **Mission Khabar Pvt. Ltd.** (मिसन खबर मिडिया).

- **Site:** Next.js 16 (App Router), Tailwind 4 and shadcn/ui.
- **CMS:** Payload CMS 3, with the admin at `/admin`.
- **Services:** Postgres on Neon, images on Cloudinary, email via Resend.
- **Reader accounts:** Better Auth (email + Google).

## Run locally

```bash
cp .env.example .env      # then fill it in (see comments in the file)
npm install
npm run migrate           # create/update database tables
npm run seed              # starter categories + About/Advertise/Privacy/Contact pages (safe to re-run)
npm run dev               # http://localhost:3000 — admin at /admin (first account becomes Admin)
```

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run migrate` | Apply database migrations (uses the direct Neon connection) |
| `npm run migrate:create -- <name>` | After changing anything in `collections/`, generate a migration, then commit it |
| `npm run seed` | Starter categories and pages |
| `npm run check` | Self-checks for slugs, @mentions, Cloudinary URLs and Nepali dates |
| `npm run generate:types` | Refresh `payload-types.ts` after changing collections |

## Where things are

```
collections/          CMS content types: Articles, Categories, Pages, Media, Comments/Likes, Users (staff), Site settings
payload.config.ts     Payload setup (Postgres, Cloudinary, Resend, SEO plugin)
app/(frontend)/       Public site: home, /[category or page], /news/[slug], /author/[id], /search, /videos, /contact, account pages
app/(payload)/        Payload admin + REST API (generated, don't edit)
app/api/              Reader auth (Better Auth), likes/comments data, @mention search
app/sitemap.ts, robots.ts, news-sitemap.xml, feed.xml   SEO
lib/                  queries (cached), auth, community (likes/comments/mentions), slug, dates, Cloudinary
migrations/           Database migrations (Payload tables + reader_* tables for Better Auth)
docs/editor-guide.md  How editors publish news
```

### How it fits together
- **Staff and readers are separate.** Staff log in at `/admin` (Payload `users`, with roles admin / editor / reporter). Readers sign up on the site (Better Auth `reader*` tables) and can never reach the admin.
- **Caching:** public pages are static and cached. Every change in the CMS expires the `content` cache tag (`lib/revalidate.ts`), so new news shows up right away without a redeploy.
- **Likes and comments** load in the browser (`components/article-engagement.tsx`), so article pages stay cached. Editors can hide comments in Admin → Community → Comments.
- **SEO:** Latin slugs are generated automatically from Nepali titles, and old slugs 301-redirect. Pages include OG/Twitter tags, NewsArticle / Breadcrumb / Organization JSON-LD, `sitemap.xml`, a Google News `news-sitemap.xml` and an RSS `feed.xml`. `robots.txt` blocks everything outside production.

## Deploy on Vercel

1. Import the GitHub repo into Vercel and pick the region **Singapore (sin1)** (already set in `vercel.json`).
2. Add every variable from `.env.example` in Project → Settings → Environment Variables. Use the real domain for `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` in Production.
3. Deploy. Vercel runs `npm run vercel-build`, which runs `migrate` and then `build`.
4. When `missionkhabarmedia.com.np` is approved:
   - Add it in Vercel → Domains and point its DNS as Vercel shows.
   - Verify it in Resend: add the SPF/DKIM records, then set `EMAIL_FROM=no-reply@missionkhabarmedia.com.np`.
   - Add `https://missionkhabarmedia.com.np/api/auth/callback/google` to the Google OAuth client.
   - Submit both sitemaps in Google Search Console, and apply in Google News Publisher Center.

### Google sign-in setup
In Google Cloud Console → APIs & Services:
1. Set up the OAuth consent screen: External, app name "Mission Khabar Media".
2. Create a Credentials → OAuth client ID of type **Web application**.
3. Add these authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-project>.vercel.app/api/auth/callback/google`
   - `https://missionkhabarmedia.com.np/api/auth/callback/google`
4. Put the client ID and secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

## Move to a VPS later

1. Add `output: 'standalone'` to `next.config.ts`, then `npm run build` and run it with `node .next/standalone/server.js` (pm2 or Docker), behind Caddy or Nginx for HTTPS.
2. Set `NEXT_PUBLIC_INDEXABLE=true` (Vercel's `VERCEL_ENV` doesn't exist there).
3. Neon, Cloudinary and Resend keep working unchanged. To self-host Postgres: `pg_dump` from Neon → `pg_restore` locally, then change `DATABASE_URL`.
