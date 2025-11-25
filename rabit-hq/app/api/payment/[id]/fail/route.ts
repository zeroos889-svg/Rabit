import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/rbac'
import { log } from '@/lib/logging'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any
    if (!can({ id: user.id, role: user.role }, 'finance:write')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { id } = params
    // @ts-expect-error Pending prisma client regeneration for Payment model
    const payment = await prisma.payment.update({
      where: { id },
      data: { status: 'FAILED' }
    })
    log.warn('Payment marked failed', { paymentId: payment.id })
    await prisma.auditLog.create({
      data: { action: 'PAYMENT_FAILED', actorId: user.id, resource: 'Payment', resourceId: payment.id, details: `Marked failed payment ${payment.id}` }
    })
    return Response.json(payment)
  } catch (e: any) {
    if (e.code === 'P2025') return Response.json({ error: 'Not found' }, { status: 404 })
    console.error('POST /api/payment/:id/fail error', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}