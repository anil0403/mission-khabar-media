import type { Field, GlobalConfig } from 'payload'

import { anyone, isAdmin } from '@/lib/access'
import { revalidateContent } from '@/lib/revalidate'

const adSlot = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'link', type: 'text', admin: { description: 'Where the ad goes when clicked (https://…)' } },
  ],
})

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [() => revalidateContent()] },
  fields: [
    { name: 'tagline', type: 'text', defaultValue: 'सत्य तथ्य निष्पक्ष समाचार र मनोरञ्जन' },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text', defaultValue: 'https://www.facebook.com/profile.php?id=61557781723797' },
        { name: 'youtube', type: 'text', defaultValue: 'https://www.youtube.com/@MissionKhabarMedia' },
        { name: 'tiktok', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'x', type: 'text', label: 'X (Twitter)' },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'email', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'text' },
      ],
    },
    {
      name: 'registration',
      type: 'group',
      fields: [
        { name: 'pressCouncil', type: 'text', label: 'Press Council Nepal reg. no.' },
        { name: 'company', type: 'text', label: 'Company reg. no.' },
      ],
    },
    {
      name: 'team',
      type: 'array',
      admin: { description: 'Shown in the footer (Chairman, Editor-in-chief, …).' },
      fields: [
        { name: 'role', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
      ],
    },
    {
      name: 'ads',
      type: 'group',
      fields: [adSlot('header', 'Header banner'), adSlot('sidebar', 'Sidebar'), adSlot('inArticle', 'Inside article')],
    },
  ],
}
