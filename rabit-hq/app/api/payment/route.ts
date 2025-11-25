import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/rbac'

const CreatePaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('SAR'),
  provider: z.enum(['MOYASAR', 'TAP', 'MOCK']).default('MOCK'),
  description: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any
    if (!can({ id: user.id, role: user.role }, 'finance:write')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()
    const data = CreatePaymentSchema.parse(body)

  // @ts-expect-error Pending prisma client regeneration for Payment model
  const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: data.amount.toString(),
        currency: data.currency,
        provider: data.provider,
        status: 'PENDING',
        description: data.description,
      }
    })

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_PAYMENT',
        resource: 'Payment',
        resourceId: payment.id,
        details: `Payment initiated: ${data.amount} ${data.currency}`
      }
    })

    return Response.json(payment, { status: 201 })
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return Response.json({ error: 'Validation error', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/payment error', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any
    if (!can({ id: user.id, role: user.role }, 'finance:read')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
  // @ts-expect-error Pending prisma client regeneration for Payment model
  const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return Response.json(payments)
  } catch (e) {
    console.error('GET /api/payment error', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}