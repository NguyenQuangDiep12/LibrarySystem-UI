export const ROLES = {
  READER: 'READER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
}

export const isStaffOrAdmin = (role) => role === ROLES.STAFF || role === ROLES.ADMIN
export const isAdmin = (role) => role === ROLES.ADMIN
