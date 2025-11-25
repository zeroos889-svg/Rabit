// Simple CAPTCHA generator: returns a 6-character alphanumeric code and sets httpOnly cookie.
// NOTE: Replace with robust service (hCaptcha/Cloudflare Turnstile) in production.
import { randomBytes } from 'crypto'

function generateCode() {
  return randomBytes(4).toString('hex').slice(0, 6).toUpperCase()
}

export async function GET() {
  const code = generateCode()
  const headers = new Headers({ 'Content-Type': 'application/json' })
  headers.append('Set-Cookie', `CAPTCHA_CODE=${code}; Path=/; HttpOnly; SameSite=Strict; Max-Age=300`)
  return new Response(JSON.stringify({ code: code.replace(/./g, '*') }), { status: 200, headers })
}