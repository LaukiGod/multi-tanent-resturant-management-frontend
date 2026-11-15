/** Dark, ember-accented frame shared by the /admin sign-in pages (matches the root landing page). */
export default function StaffShell({ children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070809] px-4 py-12 text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-48 h-[520px] w-[520px] rounded-full bg-[#ff5c1a]/20 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-36 h-[420px] w-[420px] rounded-full bg-[#00e5cc]/10 blur-[90px]"
      />
      <div className="relative w-full max-w-md">{children}</div>
    </main>
  )
}

export function StaffBadge({ children }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs tracking-wide text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00e5cc] shadow-[0_0_0_4px_rgba(0,229,204,0.15)]" />
      {children}
    </p>
  )
}

export function StaffError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {children}
    </p>
  )
}
