import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { platformApi } from '../../api/client'
import {
  Field,
  inputClass,
  buttonPrimary,
  buttonSecondary,
  StatusBadge,
  ErrorBox,
  SuccessBox,
  Section,
  formatDate,
  openRestaurantPanel,
} from './ui'

const EDITABLE = ['name', 'contactEmail', 'phone', 'address', 'currency', 'logoUrl']

const toForm = (r) => Object.fromEntries(EDITABLE.map((k) => [k, r?.[k] ?? '']))

export default function PlatformRestaurantDetail() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState(toForm(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await platformApi.get(`/restaurants/${id}`)
      setRestaurant(res.restaurant)
      setStaff(res.staff || [])
      setForm(toForm(res.restaurant))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const dirty = restaurant && EDITABLE.some((k) => (form[k] ?? '') !== (restaurant[k] ?? ''))

  async function save(e) {
    e.preventDefault()
    if (!dirty) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      // Send only what changed, so an untouched field is never overwritten.
      const changes = Object.fromEntries(
        EDITABLE.filter((k) => (form[k] ?? '') !== (restaurant[k] ?? '')).map((k) => [k, form[k]])
      )
      const res = await platformApi.patch(`/restaurants/${id}`, changes)
      setRestaurant(res.restaurant)
      setForm(toForm(res.restaurant))
      setNotice('Changes saved.')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus() {
    setStatusBusy(true)
    setError('')
    setNotice('')
    try {
      const next = restaurant.status === 'active' ? 'suspended' : 'active'
      const res = await platformApi.patch(`/restaurants/${id}/status`, { status: next })
      setRestaurant(res.restaurant)
      setNotice(res.message)
    } catch (e) {
      setError(e.message)
    } finally {
      setStatusBusy(false)
    }
  }

  function openPanel() {
    setError('')
    if (!openRestaurantPanel(restaurant.slug)) {
      setError('Your platform session has expired. Sign in again.')
    }
  }

  if (loading) return <p className="text-gray-500">Loading restaurant…</p>

  if (!restaurant) {
    return (
      <div className="space-y-4">
        <ErrorBox>{error || 'Restaurant not found'}</ErrorBox>
        <Link to="/platform/restaurants" className="text-sm text-gray-400 underline underline-offset-4">
          Back to all restaurants
        </Link>
      </div>
    )
  }

  const origin = window.location.origin
  const isActive = restaurant.status === 'active'
  const links = [
    ['Staff & admin panel', `${origin}/r/${restaurant.slug}/admin/dashboard`],
    ['Staff sign-in', `${origin}/r/${restaurant.slug}/login`],
    ['Kiosk / tablet', `${origin}/r/${restaurant.slug}`],
  ]

  return (
    <div className="space-y-6">
      <div>
        <Link to="/platform/restaurants" className="text-sm text-gray-500 hover:text-gray-300">
          ← All restaurants
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
          <h2 className="text-2xl font-semibold text-white">{restaurant.name}</h2>
          <StatusBadge status={restaurant.status} />
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              onClick={openPanel}
              disabled={!isActive}
              title={isActive ? 'Open this restaurant’s admin panel in a new tab' : 'Activate the restaurant first'}
              className={buttonPrimary}
            >
              Open panel
            </button>
            <button onClick={toggleStatus} disabled={statusBusy} className={buttonSecondary}>
              {isActive ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          /r/{restaurant.slug} · created {formatDate(restaurant.createdAt)}
        </p>
      </div>

      <ErrorBox>{error}</ErrorBox>
      <SuccessBox>{notice}</SuccessBox>

      <Section title="Details" description="Shown to staff and guests of this restaurant.">
        <form onSubmit={save} className="space-y-5">
          <Field label="Restaurant name">
            <input required value={form.name} onChange={set('name')} className={inputClass} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact email">
              <input type="email" value={form.contactEmail} onChange={set('contactEmail')} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={set('phone')} className={inputClass} />
            </Field>
          </div>
          <Field label="Address">
            <input value={form.address} onChange={set('address')} className={inputClass} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
            <Field label="Currency">
              <input value={form.currency} onChange={set('currency')} className={inputClass} />
            </Field>
            <Field label="Logo URL" hint="Optional. Shown on the kiosk and customer pages.">
              <input type="url" value={form.logoUrl} onChange={set('logoUrl')} className={inputClass} placeholder="https://…" />
            </Field>
          </div>
          <Field label="Address slug" hint="Fixed after creation: it is part of every URL and printed QR code.">
            <input value={restaurant.slug} disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
          </Field>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={!dirty || saving} className={buttonPrimary}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {dirty && (
              <button type="button" onClick={() => setForm(toForm(restaurant))} className="text-sm text-gray-400 hover:text-white">
                Discard
              </button>
            )}
          </div>
        </form>
      </Section>

      <Section
        title={`Staff (${staff.length})`}
        description="Add or remove staff from the restaurant’s own panel, under Staff."
        actions={
          <button onClick={openPanel} disabled={!isActive} className={buttonSecondary}>
            Manage in panel
          </button>
        }
      >
        {staff.length === 0 ? (
          <p className="text-sm text-gray-500">No staff yet. Open the panel to invite the first admin.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Name</th>
                  <th className="px-5 py-2 font-medium">Role</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {staff.map((s) => (
                  <tr key={s._id} className="text-gray-300">
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          s.role === 'ADMIN' ? 'bg-purple-500/15 text-purple-300' : 'bg-blue-500/15 text-blue-300'
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {s.isActive ? (
                        <span className="text-green-400">Active</span>
                      ) : (
                        <span className="text-gray-500">Deactivated</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Links" description="Share these with the restaurant.">
        <div className="space-y-3">
          {links.map(([label, url]) => (
            <div key={label} className="flex flex-wrap items-center gap-3">
              <span className="w-40 shrink-0 text-xs uppercase tracking-wide text-gray-500">{label}</span>
              <code className="min-w-0 flex-1 break-all text-sm text-gray-300">{url}</code>
              <CopyButton text={url} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked; the link is still visible to select by hand */
    }
  }
  return (
    <button type="button" onClick={copy} className={buttonSecondary}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
