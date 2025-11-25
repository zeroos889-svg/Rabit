import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt'
import { rateLimit, formatRetryAfter } from './lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ar',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  // Handle i18n first
  const response = intlMiddleware(request);
  
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Basic rate limiting (per IP + path). Adjust matcher scope as needed.
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const rateKey = `${ip}:${request.nextUrl.pathname}`
  const rl = rateLimit(rateKey)
  if (!rl.ok) {
    const retrySecs = formatRetryAfter(rl.resetMs)
    return new NextResponse(JSON.stringify({ error: 'Too Many Requests', retryAfter: retrySecs }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retrySecs)
      }
    })
  }

  // Protected routes (without locale prefix)
  const protectedPaths = ['/dashboard', '/investor', '/api/capital']
  const pathname = request.nextUrl.pathname.replace(/^\/(ar|en)/, ''); // Remove locale prefix

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!token) {
      const locale = request.nextUrl.pathname.split('/')[1];
      return NextResponse.redirect(new URL(`/${locale}/auth/signin`, request.url))
    }
  }

  // Optional: role-based redirect placeholders
  // If user is authenticated and hits the signin page or bare locale root,
  // redirect them to a role-specific landing. Adjust mapping as pages expand.
  if (token) {
    const [_, maybeLocale, maybeAuth] = request.nextUrl.pathname.split('/');
    const locale = locales.includes(maybeLocale as any) ? maybeLocale : 'ar';
    const role = (token as any)?.role as string | undefined;

    const roleDest: Record<string, string> = {
      INVESTOR: `/${locale}/investor`,
      FOUNDER: `/${locale}/dashboard`,
      FINANCE: `/${locale}/dashboard`,
      TECH: `/${locale}/dashboard`,
      OPERATIONS: `/${locale}/dashboard`,
    };

    const isSignin = locales.includes(maybeLocale as any) && maybeAuth === 'auth' && request.nextUrl.pathname.endsWith('/signin');
    const isBareLocale = locales.includes(maybeLocale as any) && request.nextUrl.pathname === `/${maybeLocale}`;

    const destination = (role && roleDest[role]) || `/${locale}/dashboard`;

    if (isSignin || isBareLocale) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/dashboard/:path*', '/investor/:path*', '/api/:path*'],
}
