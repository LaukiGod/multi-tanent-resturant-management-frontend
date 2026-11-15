import { getToken } from '../../api/client'
import { PLATFORM_SCOPE } from '../../config/api'

/** Small building blocks shared by the platform console pages. */

export const inputClass =
  'w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none transition focus:border-gray-500'

export const buttonPrimary =
  'rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'

export const buttonSecondary =
  'rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  )
}

const STATUS_STYLES = {
  active: 'bg-green-500/10 text-green-400 ring-green-500/30',
  suspended: 'bg-amber-500/10 text-amber-400 ring-amber-500/30',
}

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${STATUS_STYLES[status] || ''}`}>
      {status}
    </span>
  )
}

export function ErrorBox({ children }) {
  if (!children) return null
  return (
    <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {children}
    </p>
  )
}

export function SuccessBox({ children }) {
  if (!children) return null
  return (
    <p className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
      {children}
    </p>
  )
}

export function Section({ title, description, actions, children }) {
  return (
    <section className="rounded-lg border border-gray-800 bg-gray-800/30">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-800 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

/**
 * Opens a restaurant's staff & admin panel as the signed-in platform admin.
 *
 * The platform token is handed to that restaurant's own auth callback, the same
 * route Google sign-in lands on. The backend already accepts a SUPER_ADMIN token
 * at every restaurant, and the callback stores it under that restaurant's slug.
 * A new tab keeps the console open alongside.
 */
export function openRestaurantPanel(slug) {
  const token = getToken(PLATFORM_SCOPE)
  if (!token) return false
  const url = `/r/${encodeURIComponent(slug)}/auth/callback?token=${encodeURIComponent(token)}`
  window.open(url, '_blank', 'noopener')
  return true
}
