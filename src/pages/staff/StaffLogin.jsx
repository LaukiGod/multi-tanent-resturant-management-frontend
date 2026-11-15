import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { oauthStartUrl, STAFF_SCOPE } from '../../config/api'
import GoogleButton from './GoogleButton'
import StaffShell, { StaffBadge, StaffError } from './StaffShell'

/**
 * /admin: one sign-in page for every restaurant's staff and admins.
 *
 * The restaurant is not in the URL. The backend finds it from the Google
 * account: staff at one restaurant go straight to its dashboard, staff at
 * several are asked to pick (/admin/choose).
 */
export default function StaffLogin() {
  const [params] = useSearchParams()
  const [redirecting, setRedirecting] = useState(false)
  const error = params.get('error')

  function signIn() {
    setRedirecting(true)
    window.location.href = oauthStartUrl(STAFF_SCOPE)
  }

  return (
    <StaffShell>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 shadow-[0_30px_80px_-30px_rgba(255,92,26,0.35)] sm:p-10">
        <StaffBadge>Staff &amp; admin</StaffBadge>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Sign in to your <span className="text-[#ff5c1a]">restaurant</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
          Use the Google account your restaurant registered for you. We&apos;ll take you straight to
          your restaurant&apos;s dashboard.
        </p>

        {error && (
          <div className="mt-6">
            <StaffError>{error}</StaffError>
          </div>
        )}

        <div className="mt-8">
          <GoogleButton onClick={signIn} disabled={redirecting}>
            {redirecting ? 'Redirecting to Google…' : 'Continue with Google'}
          </GoogleButton>
        </div>

        <ul className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm text-zinc-400">
          <li className="flex gap-3">
            <Check />
            Work at more than one restaurant? You&apos;ll choose which one after signing in.
          </li>
          <li className="flex gap-3">
            <Check />
            Not registered yet? Ask your restaurant admin to add your Google email under Staff.
          </li>
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Here to eat? Scan the QR code on your table to order.
      </p>
    </StaffShell>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 flex-none text-[#ff5c1a]" fill="none" aria-hidden="true">
      <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
