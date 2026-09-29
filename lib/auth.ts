import 'server-only'
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { username } from 'better-auth/plugins'
import { Pool } from 'pg'

import { payload } from './queries'
import { SITE_NAME, SITE_URL } from './site'

const env = process.env

// Reader accounts live in the same Postgres as Payload, in reader_* tables (created by migrations/).
export const db = new Pool({ connectionString: env.DATABASE_URL, max: 5 })

async function sendMail(to: string, subject: string, text: string) {
  await (await payload()).sendEmail({ to, subject, text })
}

export const auth = betterAuth({
  appName: SITE_NAME,
  baseURL: env.BETTER_AUTH_URL || SITE_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: db,
  user: {
    modelName: 'reader',
    deleteUser: {
      enabled: true,
      // Remove the reader's likes and comments with the account.
      afterDelete: async (user) => {
        const p = await payload()
        const mine = await p.find({ collection: 'comments', where: { readerId: { equals: user.id } }, pagination: false, depth: 0, select: {} })
        const ids = mine.docs.map((d) => d.id)
        await p.delete({ collection: 'likes', where: { readerId: { equals: user.id } } })
        // Replies to their comments go too (deleting the parent would only null `parent`).
        if (ids.length) await p.delete({ collection: 'comments', where: { parent: { in: ids } } })
        await p.delete({ collection: 'comments', where: { readerId: { equals: user.id } } })
      },
    },
  },
  session: { modelName: 'reader_session' },
  account: { modelName: 'reader_account' },
  verification: { modelName: 'reader_verification' },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: ({ user, url }) =>
      sendMail(user.email, `Reset your ${SITE_NAME} password`, `Hi ${user.name},\n\nReset your password here:\n${url}\n\nIf you didn't ask for this, ignore this email.`),
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: ({ user, url }) =>
      sendMail(user.email, `Confirm your ${SITE_NAME} account`, `Hi ${user.name},\n\nConfirm your email to start commenting:\n${url}`),
  },
  socialProviders:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
      : undefined,
  databaseHooks: {
    user: {
      create: {
        // Google sign-ups have no username; derive one so @mentions work. Editable on /account.
        before: async (user) => {
          const u = user as typeof user & { username?: string }
          if (u.username) return { data: user }
          const base = (user.name || user.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'reader'
          return { data: { ...user, username: `${base}${Math.floor(1000 + Math.random() * 9000)}` } }
        },
      },
    },
  },
  plugins: [username(), nextCookies()],
})

export type Session = typeof auth.$Infer.Session
