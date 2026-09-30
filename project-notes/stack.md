# Tech stack — Mission Khabar Media

Installed versions as of 2026-09-30.

## Core
| Layer | Tech | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.3.6 | Route groups `(frontend)` and `(payload)`. ISR plus a `content` cache tag |
| UI runtime | React / React DOM | 19.2.8 | |
| Language | TypeScript | 5.9.3 | `@/*` → project root, `@payload-config` → `payload.config.ts` |
| Runtime | Node.js | 24 (local), 24.x (Vercel) | `engines: >=20.9.0` |

## CMS & data
| Tech | Version | Used for |
|---|---|---|
| Payload CMS (`payload`, `@payloadcms/next`, `@payloadcms/ui`) | 3.90.2 | Admin at `/admin`, content collections, REST API |
| `@payloadcms/db-postgres` | 3.90.2 | Postgres adapter (Drizzle), migrations in `migrations/` |
| `@payloadcms/richtext-lexical` | 3.90.2 | Article/page editor, plus YouTube and Facebook embed blocks |
| PostgreSQL on **Neon** | Postgres 18, Singapore region | Pooled URL for the app, direct URL for migrations |
| `pg` | 8.23.0 | Pool shared by Better Auth and @mention search |
| `graphql` | 16.14.2 | Payload peer dependency |
| `sharp` | 0.35.5 | Image processing for Payload |

## Auth, media, email
| Tech | Version | Used for |
|---|---|---|
| Better Auth | 1.7.6 | Reader accounts: email/password with verification, Google, `username` plugin, `nextCookies`, account deletion |
| Cloudinary (`cloudinary` SDK) | 2.11.0 | Media storage (custom adapter in `lib/cloudinary-adapter.ts`) and delivery (`lib/cloudinary-loader.ts`) |
| Resend (`@payloadcms/email-resend`) | 3.90.2 | Auth emails, contact form, @mention alerts |

## UI
| Tech | Version | Used for |
|---|---|---|
| Tailwind CSS (`tailwindcss`, `@tailwindcss/postcss`) | 4.3.3 | Styling. Brand tokens in `app/(frontend)/globals.css` |
| shadcn/ui (CLI `shadcn`) | 4.21.0 | Components in `components/ui/`, `base-nova` style |
| Base UI (`@base-ui/react`) | 1.8.0 | Primitives under shadcn (uses the `render` prop, not `asChild`) |
| `class-variance-authority`, `clsx`, `tailwind-merge` | 0.7.1 / 2.1.1 / 3.7.0 | `cn()` in `lib/utils.ts` and component variants |
| `lucide-react` | 1.48.0 | Icons |
| `sonner` | 2.0.8 | Toasts |
| `tw-animate-css` | 1.4.0 | Animations for shadcn |
| Mukta (via `next/font/google`) | — | Devanagari and Latin font |

## Utilities
| Tech | Version | Used for |
|---|---|---|
| `nepali-date-converter` | 3.4.0 | BS dates (converted via Asia/Kathmandu time) |
| `cross-env` | 10.1.0 | Cross-platform npm scripts |
| ESLint + `eslint-config-next` | 9.39.5 / 16.3.6 | Linting |

## Hosting & services
| Service | Details |
|---|---|
| **Vercel** | Project `mission-khabar-media` (scope `anil-shresthas-projects`), region `sin1`. Build command `npm run vercel-build` (migrate, then build). Auto-deploys from GitHub `main` |
| **GitHub** | `anil0403/mission-khabar-media` |
| **Neon** | Postgres, `ap-southeast-1` |
| **Cloudinary** | Folder `mission-khabar/media/` |
| **Resend** | Sending domain `missionkhabarmedia.com.np` (not yet verified) |
| **Google Cloud** | OAuth client for "Continue with Google" |
| **YouTube RSS** | Channel feed, no API key |
| **Future** | VPS: `output: 'standalone'` + pm2/Docker + Caddy |
