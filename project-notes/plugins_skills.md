# Plugins & skills — Mission Khabar Media

## Payload CMS plugins (in `payload.config.ts`)
| Plugin | Purpose | Config notes |
|---|---|---|
| `@payloadcms/plugin-seo` | Meta title, description and image fields with a Google-style preview on Articles, Categories and Pages | Auto-generates title, description, image and URL. `tabbedUI: false` |
| `@payloadcms/plugin-cloud-storage` | Sends Media uploads to Cloudinary through a custom adapter (`lib/cloudinary-adapter.ts`) | Enabled only when `CLOUDINARY_CLOUD_NAME` is set. `alwaysInsertFields: true`, `disablePayloadAccessControl: true` |
| `@payloadcms/email-resend` | Email adapter used by Payload and Better Auth | Falls back to printing emails in the console when `RESEND_API_KEY` is empty |
| Lexical `BlocksFeature` | Custom editor blocks: **YouTube video**, **Facebook post/video** | Rendered in `components/rich-text.tsx` |

## Better Auth plugins (in `lib/auth.ts`)
| Plugin | Purpose |
|---|---|
| `username` (+ `usernameClient`) | Unique usernames for @mentions. Google sign-ups get one generated automatically |
| `nextCookies` | Sets auth cookies from server actions |
| Google social provider | "Continue with Google" (enabled when the Google keys are set) |

## shadcn/ui components (`components/ui/`)
avatar, badge, button, card, dialog, dropdown-menu, input, label, separator, sheet, skeleton, sonner, tabs, textarea.
Add more with `npx shadcn@latest add <name>`. After adding, check the imports use `@/lib/utils` (the CLI once imported an npm package called `cn` instead).

## Claude Code plugins & skills used while building
| Plugin / skill | How it was used |
|---|---|
| **ponytail** (active every session) | "Laziest solution that works": reuse before writing, native before dependencies, minimal diffs. Deliberate shortcuts are marked with `ponytail:` comments. Run `/ponytail-debt` to list them |
| **impeccable** (design hook) | Scanned every UI file as it was written for design-quality issues. None were flagged |
| **frontend-design** | Available for visual design passes (not invoked yet) |
| **code-review / security-review** | Available for reviewing diffs (not run yet; worth a `/security-review` before launch) |

## Tools & CLIs used
| Tool | Used for |
|---|---|
| `gh` (GitHub CLI) | Creating the repo, pushing, fetching Payload's blank template files |
| `vercel` CLI | Linking the project, setting environment variables, inspecting deployments |
| `payload` CLI | `migrate`, `migrate:create`, `generate:types`, `generate:importmap`, `run` (seed) |
| `shadcn` CLI | Setting up shadcn/ui and adding components |
| `next typegen` | Generating `PageProps` / `RouteContext` route types |

Skipped on purpose: the Neon CLI, and its MCP server and skills (the owner chose to connect to the database by URL only).
