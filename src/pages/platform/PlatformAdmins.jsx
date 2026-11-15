import { useCallback, useEffect, useState } from 'react'
import { platformApi } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import {
  Field,
  inputClass,
  buttonPrimary,
  ErrorBox,
  SuccessBox,
  Section,
  formatDate,
} from './ui'

const EMPTY = { name: '', email: '' }

export default function PlatformAdmins() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setAdmins(await platformApi.get('/super-admins'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function add(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const res = await platformApi.post('/super-admins', {
        name: form.name.trim(),
        email: form.email.trim(),
      })
      setNotice(`${res.email} can now sign in at /platform/login with that Google account.`)
      setForm(EMPTY)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Platform admins</h2>
        <p className="mt-1 text-sm text-gray-400">
          Platform admins can create, edit, suspend and delete restaurants, and open any
          restaurant’s panel. Only add people you trust with every restaurant’s data.
        </p>
      </div>

      <ErrorBox>{error}</ErrorBox>
      <SuccessBox>{notice}</SuccessBox>

      <Section title="Add a platform admin" description="They sign in with Google using this email.">
        <form onSubmit={add} className="grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Name">
            <input required value={form.name} onChange={set('name')} className={inputClass} placeholder="Asha Rai" />
          </Field>
          <Field label="Google email">
            <input
              required
              type="email"
              value={form.email}
              onChange={set('email')}
              className={inputClass}
              placeholder="asha@example.com"
            />
          </Field>
          <button type="submit" disabled={saving} className={`${buttonPrimary} h-[42px]`}>
            {saving ? 'Adding…' : 'Add admin'}
          </button>
        </form>
      </Section>

      <Section title={`Current platform admins${loading ? '' : ` (${admins.length})`}`}>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <ul className="-my-3 divide-y divide-gray-800">
            {admins.map((a) => (
              <li key={a._id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">
                    {a.name}
                    {String(a._id) === String(user?.id) && (
                      <span className="ml-2 rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-300">you</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{a.email}</p>
                </div>
                <span className={`text-sm ${a.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                  {a.isActive ? 'Active' : 'Deactivated'}
                </span>
                <span className="w-28 text-right text-sm text-gray-500">{formatDate(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p className="text-xs text-gray-600">
        Removing a platform admin is not available yet; there is no backend endpoint for it.
      </p>
    </div>
  )
}
