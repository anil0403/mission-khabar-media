# Project context — Mission Khabar Media

Running record of the decisions and current state of this project. Update it when something important changes.

## Client & goal
- **Client:** Mission Khabar Pvt. Ltd. (मिसन खबर मिडिया), a Nepali news and entertainment media company. Tagline: "सत्य तथ्य निष्पक्ष समाचार र मनोरञ्जन".
- **Existing presence:**
  - Facebook: https://www.facebook.com/profile.php?id=61557781723797
  - YouTube: https://www.youtube.com/@MissionKhabarMedia (channel ID `UCgdD5Xy5HMH0dFqmUne7OLw`)
- **Goal:** a fast, SEO-first news portal that the client's editors can publish to. The editors are new to websites.
- **Brand (from `logo.jpg`):** sky blue `#0AA5EF`, red `#FF0000`/`#E10600`, orange `#F26522`, navy `#1E4FA0`.

## Requirements (from the owner)
- The site interface and admin panel are in **English**. Articles can be in Nepali, English, or both mixed.
- **SEO from day one.**
- **UI:** shadcn/ui, clean and easy to use.
- **Reader login:** email + password, and Google.
- **On every post:** like, comment (with replies), share to social media, and @mention other readers in comments.
- **Services:** Neon Postgres, Cloudinary for images, Resend for email.
- **Hosting:** Vercel now, a local VPS later, so nothing may be Vercel-only.
- **Commits:** no Claude / AI attribution lines in commits or PRs.

## Key decisions
- **One app:** Payload CMS runs inside the Next.js app, with the admin at `/admin`.
- **Staff and readers are separate accounts.**
  - Staff: Payload `users`, with roles admin / editor / reporter. Reporters can only save drafts.
  - Readers: Better Auth, stored in the `reader*` tables of the same database. Readers can't reach the admin.
- **Caching:** public pages are static (ISR). Every CMS change expires the `content` cache tag (`lib/revalidate.ts`). `cacheComponents` is not enabled because its compatibility with Payload is unverified.
- **Likes and comments** load in the browser, so article pages stay cached.
- **Slugs:** Latin, auto-transliterated from Devanagari. Changing a published slug stores the old one and permanently redirects it.
- **One migration system:** Payload migrations also create the Better Auth tables (`migrations/*_reader_auth.ts`), and `push: false` is set so local dev uses migrations too.
- **Images:** a custom Cloudinary adapter, because the community package only supports Payload 2. A custom `next/image` loader makes Cloudinary do the resizing.
- **Share image fallback:** a static branded `og-default.jpg`. Generated images with headlines can't render Devanagari properly.
- **`.npmrc` `legacy-peer-deps=true`:** npm's peer resolver loops forever on Payload's graphql peer.
- **Indexing:** `NEXT_PUBLIC_INDEXABLE` overrides Vercel's production default. It's `false` until the real domain is live.

## Current status (2026-09-30)
- All plan phases are built and pushed to `main` on GitHub (`anil0403/mission-khabar-media`, currently **public**).
- **Neon database** (Singapore, Postgres 18): migrated and seeded with 9 categories, 4 pages (About, Advertise, Privacy, Contact) and the admin `admin@missionkhabarmedia.com.np`.
- **Deployed** on Vercel (project `mission-khabar-media`, scope `anil-shresthas-projects`) at https://mission-khabar-media.vercel.app, with auto-deploy on push to `main`.
- **Vercel environment:** `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` point to the `vercel.app` URL, and `NEXT_PUBLIC_INDEXABLE=false`.
- **Tested end to end** against the real database: publishing, revalidation, slug redirect, Cloudinary upload/delete, reader sign-up/sign-in, likes, comments, replies, mentions, rate limit and deletes. All test data was removed afterwards.

## Pending / to do
- [ ] **Domain `missionkhabarmedia.com.np`:** attached in Vercel but awaiting .np approval and DNS. Once it's live:
  - Set `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` to `https://missionkhabarmedia.com.np` and `NEXT_PUBLIC_INDEXABLE=true`, then redeploy.
- [ ] **Resend:** the domain isn't verified yet, so no emails send (verification, password reset, contact form, mention alerts). Until it's fixed, email sign-ups can't be confirmed.
- [ ] **Google OAuth redirect URIs:**
  - `https://mission-khabar-media.vercel.app/api/auth/callback/google`
  - later `https://missionkhabarmedia.com.np/api/auth/callback/google`
- [ ] **Google keys:** in Vercel but empty in local `.env`.
- [ ] **Search:** Google Search Console (both sitemaps) and Google News Publisher Center, once the domain is live.
- [ ] **Optional:** GA4 ID, make the GitHub repo private, add `sslmode=verify-full` to the database URLs (silences a pg warning).
- [ ] **Not yet reviewed in a browser:** the UI design itself.
- [ ] **Later:** move to a VPS (see README).

## Known simplifications (`ponytail:` notes in code)
- Slug transliteration doesn't do schwa deletion ("dubanama").
- The sitemap is a single file covering up to 5,000 articles.
- Search uses a `like` query (switch to Postgres full-text search if it gets slow).
- The like count is a count query on each view.
- The comment rate limit is enforced in the database.
- Commenter names are copied onto each comment when it's posted.
- There's no in-app notification bell and no dark mode.
