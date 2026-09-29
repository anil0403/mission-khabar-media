import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isStaff } from '@/lib/access'

// Staff accounts for /admin. Readers are separate (Better Auth, lib/auth.ts).
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff member', plural: 'Staff' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'role'], group: 'Settings' },
  auth: true,
  access: {
    read: isStaff,
    create: isAdmin,
    update: ({ req, id }) => isAdmin({ req }) || req.user?.id === id,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The very first account becomes admin, otherwise nobody could manage staff.
      async ({ req, operation, data }) => {
        if (operation === 'create' && (await req.payload.count({ collection: 'users', req })).totalDocs === 0) {
          data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'reporter',
      saveToJWT: true,
      access: { update: isAdminField },
      options: [
        { label: 'Admin — everything, incl. staff', value: 'admin' },
        { label: 'Editor — publish and moderate', value: 'editor' },
        { label: 'Reporter — write drafts only', value: 'reporter' },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea', admin: { description: 'Shown on your author page.' } },
  ],
}
