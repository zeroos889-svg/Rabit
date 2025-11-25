'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

export default function SignInPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('authPage')
  const tAuth = useTranslations('auth')

  const [email, setEmail] = useState('founder@rabit.test')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [captchaDisplay, setCaptchaDisplay] = useState<string>('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaValid, setCaptchaValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  async function refreshCaptcha() {
    try {
      const res = await fetch(`/${locale}/api/captcha`)
      if (res.ok) {
        const data = await res.json()
        setCaptchaDisplay(data.code) // masked
        setCaptchaValid(null)
        setCaptchaInput('')
      }
    } catch {}
  }

  useEffect(() => {
    refreshCaptcha()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

     // Basic captcha check: server stored code in httpOnly cookie; we re-fetch cookie via opaque request?
     // Since we cannot read httpOnly cookie from JS, we simulate by requiring non-empty input for now.
     if (!captchaInput.trim()) {
       setError('Captcha required')
       setLoading(false)
       return
     }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(tAuth('invalidCredentials'))
    } else if (result?.ok) {
      router.push(`/${locale}/dashboard`)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1 style={{ margin: 0 }}>{t('title')}</h1>
          <p className="page-header__meta">{t('subtitle')}</p>
        </div>
      </header>

      <div className="auth-shell">
        <section className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            <div className="form-field">
              <label htmlFor="email">{tAuth('email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">{tAuth('password')}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="form-field">
              <label>CAPTCHA</label>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700 text-sm tracking-widest font-mono">
                  {captchaDisplay || '••••••'}
                </span>
                <button type="button" className="text-xs underline" onClick={refreshCaptcha}>Refresh</button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                required
              />
            </div>

            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? t('signingIn') : tAuth('signIn')}
            </button>
          </form>
        </section>

        <aside className="auth-aside">
          <h3 style={{ marginTop: 0 }}>{t('demo.title')}</h3>
          <p className="page-header__meta">{t('demo.subtitle')}</p>
          <ul className="demo-list">
            <li>{t('demo.founder')}</li>
            <li>{t('demo.finance')}</li>
            <li>{t('demo.investor')}</li>
          </ul>

          <p className="note" style={{ marginTop: '1rem' }}>
            {t('demo.note')}
          </p>
        </aside>
      </div>
    </div>
  )
}
