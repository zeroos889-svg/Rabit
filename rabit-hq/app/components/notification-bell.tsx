'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

interface NotificationItem {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const t = useTranslations('notification')
  const locale = useLocale()

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await fetch(`/${locale}/api/notification`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await fetch(`/${locale}/api/notification/unread-count`)
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count)
      }
    } catch {}
  }

  async function markAllRead() {
    await Promise.all(
      items.filter(i => !i.read).map(i => fetch(`/${locale}/api/notification/${i.id}/read`, { method: 'PATCH' }))
    )
    await fetchNotifications()
    await fetchUnreadCount()
  }

  useEffect(() => {
    fetchUnreadCount()
    if (open) fetchNotifications()
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('title')}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700"
        onClick={() => setOpen(o => !o)}
      >
        <span className="material-icons text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
            <span className="font-medium">{t('title')}</span>
            <button
              className="text-xs underline"
              onClick={markAllRead}
              disabled={items.every(i => i.read)}
            >
              {t('markAllRead')}
            </button>
          </div>
          {loading && <div className="p-3 text-sm">Loading…</div>}
          {!loading && items.length === 0 && (
            <div className="p-3 text-sm text-neutral-500">{t('empty')}</div>
          )}
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {items.map(item => (
              <li key={item.id} className={`p-3 text-sm ${item.read ? 'opacity-70' : ''}`}> 
                <div className="font-semibold mb-0.5">{item.title}</div>
                <div className="text-xs leading-snug">{item.message}</div>
                <div className="mt-1 flex gap-2 text-xs">
                  <span>{new Date(item.createdAt).toLocaleString(locale)}</span>
                  {!item.read && <span className="text-blue-600">{t('actions.unread')}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}