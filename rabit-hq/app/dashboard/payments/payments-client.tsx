'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

interface PaymentItem {
  id: string
  amount: string
  currency: string
  status: string
  provider: string
  description?: string
  createdAt: string
}

export default function PaymentsClient() {
  const [items, setItems] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formState, setFormState] = useState({ amount: '', currency: 'SAR', provider: 'MOCK', description: '' })
  const t = useTranslations('payment')
  const locale = useLocale()

  async function fetchPayments() {
    setLoading(true)
    try {
      const res = await fetch(`/${locale}/api/payment`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } finally {
      setLoading(false)
    }
  }

  async function createPayment(e: React.FormEvent) {
    e.preventDefault()
    const payload = { amount: parseFloat(formState.amount), currency: formState.currency, provider: formState.provider, description: formState.description || undefined }
    const res = await fetch(`/${locale}/api/payment`, { method: 'POST', body: JSON.stringify(payload) })
    if (res.ok) {
      setFormState({ amount: '', currency: 'SAR', provider: 'MOCK', description: '' })
      fetchPayments()
    }
  }

  async function mutate(id: string, action: 'confirm' | 'fail' | 'refund') {
    await fetch(`/${locale}/api/payment/${id}/${action}`, { method: 'POST' })
    fetchPayments()
  }

  useEffect(() => { fetchPayments() }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <form onSubmit={createPayment} className="grid gap-3 max-w-md">
        <div>
          <label className="block text-sm mb-1">{t('amount')}</label>
          <input required type="number" step="0.01" className="input" value={formState.amount} onChange={e => setFormState(s => ({ ...s, amount: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('currency')}</label>
          <input className="input" value={formState.currency} onChange={e => setFormState(s => ({ ...s, currency: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('provider')}</label>
          <select className="input" value={formState.provider} onChange={e => setFormState(s => ({ ...s, provider: e.target.value }))}>
            <option value="MOYASAR">{t('providers.MOYASAR')}</option>
            <option value="TAP">{t('providers.TAP')}</option>
            <option value="MOCK">{t('providers.MOCK')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">{t('description')}</label>
            <input className="input" value={formState.description} onChange={e => setFormState(s => ({ ...s, description: e.target.value }))} />
        </div>
        <button type="submit" className="btn-primary">{t('create')}</button>
      </form>
      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-100 dark:bg-neutral-700">
              <th className="p-2 text-left">{t('amount')}</th>
              <th className="p-2 text-left">{t('currency')}</th>
              <th className="p-2 text-left">{t('provider')}</th>
              <th className="p-2 text-left">{t('status')}</th>
              <th className="p-2 text-left">{t('description')}</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.amount}</td>
                <td className="p-2">{p.currency}</td>
                <td className="p-2">{p.provider}</td>
                <td className="p-2">
                  <span>{t(`statuses.${p.status}`)}</span>
                </td>
                <td className="p-2 max-w-[180px] truncate" title={p.description}>{p.description || '—'}</td>
                <td className="p-2 space-x-1">
                  {p.status === 'PENDING' && (
                    <>
                      <button className="text-xs underline" onClick={() => mutate(p.id, 'confirm')}>{t('actions.confirm')}</button>
                      <button className="text-xs underline" onClick={() => mutate(p.id, 'fail')}>{t('actions.fail')}</button>
                    </>
                  )}
                  {p.status === 'PAID' && (
                    <button className="text-xs underline" onClick={() => mutate(p.id, 'refund')}>{t('actions.refund')}</button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-neutral-500">No payments yet.</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="p-4 text-center">Loading…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}