import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { API_ROOT } from '../../config/api'
import StaffShell, { StaffBadge, StaffError } from './StaffShell'

/** Reads the restaurant list out of the selection ticket. The server re-checks
 *  everything when a restaurant is picked; this is only for display. */
function readTicket(ticket) {
  try {
    const payload = JSON.parse(atob(ticket.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

/**
 * /admin/choose: shown after Google sign-in when the account is staff at more
 * than one restaurant.
 */
export default function StaffChooseRestaurant() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const ticket = params.get('ticket') || ''
  const payload = useMemo(() => readTicket(ticket), [ticket])
  const [busySlug, setBusySlug] = useState(null)
  const [error, setError] = useState('')

  async function choose(slug) {
    setBusySlug(slug)
    setError('')
    try {
      const res = await fetch(`${API_ROOT}/auth/staff/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, slug }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.message || 'Could not open that restaurant')
      // Hand the token to that restaurant's own callback, which stores it under
      // its slug, exactly as a direct Google sign-in there would.
      navigate(`/r/${body.slug}/auth/callback?token=${encodeURIComponent(body.token)}`, { replace: true })
    } catch (e) {
      setError(e.message)
      setBusySlug(null)
    }
  }

  if (!payload) {
    return (
      <StaffShell>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-semibold">Sign-in expired</h1>
          <p className="mt-2 text-sm text-zinc-400">Please sign in again to choose your restaurant.</p>
          <Link
            to="/admin"
            className="mt-6 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
          >
            Back to sign-in
          </Link>
        </div>
      </StaffShell>
    )
  }

  return (
    <StaffShell>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 sm:p-10">
        <StaffBadge>{payload.email}</StaffBadge>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Choose a restaurant</h1>
        <p className="mt-2 text-[15px] text-zinc-400">You have access to more than one.</p>

        {error && (
          <div className="mt-6">
            <StaffError>{error}</StaffError>
          </div>
        )}

        <ul className="mt-6 space-y-3">
          {payload.choices.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => choose(c.slug)}
                disabled={busySlug !== null}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-[#ff5c1a]/50 hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-60"
              >
                <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#ff5c1a]/15 text-lg font-semibold text-[#ff5c1a]">
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-white">{c.name}</span>
                  <span className="block truncate text-xs text-zinc-500">/r/{c.slug}</span>
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs ${
                    c.role === 'ADMIN' ? 'bg-purple-500/15 text-purple-300' : 'bg-sky-500/15 text-sky-300'
                  }`}
                >
                  {c.role}
                </span>
                <span className="text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true">
                  {busySlug === c.slug ? '…' : '→'}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <Link to="/admin" className="mt-6 inline-block text-sm text-zinc-500 hover:text-zinc-300">
          Use a different account
        </Link>
      </div>
    </StaffShell>
  )
}
