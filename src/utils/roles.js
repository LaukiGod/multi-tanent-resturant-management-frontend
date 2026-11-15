/**
 * ADMIN-level access inside a restaurant panel. SUPER_ADMIN (the platform
 * administrator) gets everything a restaurant ADMIN gets, matching the backend's
 * `authorize()`, which lets SUPER_ADMIN through every tenant role check.
 */
export const isAdminRole = (role) => role === 'ADMIN' || role === 'SUPER_ADMIN'
