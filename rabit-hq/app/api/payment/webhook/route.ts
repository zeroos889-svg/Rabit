// Placeholder webhook endpoint for payment provider callbacks.
// In production: verify signature header & map provider status -> internal PaymentStatus.
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const providerRef = body.providerRef as string | undefined
    const status = body.status as string | undefined // e.g. 'PAID' | 'FAILED'
    if (!providerRef || !status) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 })
    }
    // @ts-expect-error Pending prisma client regeneration for Payment model
    const payment = await prisma.payment.findUnique({ where: { providerRef } })
    if (!payment) return Response.json({ error: 'Payment not found' }, { status: 404 })
    // @ts-expect-error Pending prisma client regeneration for Payment model
    const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status } })
    await prisma.auditLog.create({
      data: { action: 'PAYMENT_WEBHOOK', resource: 'Payment', resourceId: payment.id, details: `Webhook status -> ${status}` }
    })
    return Response.json({ success: true })
  } catch (e) {
    console.error('POST /api/payment/webhook error', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}