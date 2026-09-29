import type { Access, FieldAccess, PayloadRequest } from 'payload'

type Role = 'admin' | 'editor' | 'reporter'
const hasRole = (req: PayloadRequest, ...roles: Role[]) =>
  Boolean(req.user && 'role' in req.user && roles.includes(req.user.role as Role))

export const isStaff: Access = ({ req }) => Boolean(req.user)
export const isEditor: Access = ({ req }) => hasRole(req, 'admin', 'editor')
export const isAdmin: Access = ({ req }) => hasRole(req, 'admin')
export const isAdminField: FieldAccess = ({ req }) => hasRole(req, 'admin')
export const isReporter = (req: PayloadRequest) => hasRole(req, 'reporter')
export const nobody: Access = () => false
export const anyone: Access = () => true

/** Public sees published docs only; staff see drafts too. */
export const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
