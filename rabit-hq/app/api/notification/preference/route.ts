import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const PreferenceSchema = z.object({
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  push: z.boolean().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any
    // @ts-expect-error Pending prisma client regeneration for NotificationPreference model
    const pref = await prisma.notificationPreference.findUnique({ where: { userId: user.id } })
    return Response.json(pref || { email: true, sms: false, push: true })
  } catch (e) {
    console.error('GET /api/notification/preference error', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any
    const body = await req.json()
    const data = PreferenceSchema.parse(body)
    // @ts-expect-error Pending prisma client regeneration for NotificationPreference model
    const updated = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: { ...data },
      create: { userId: user.id, email: data.email ?? true, sms: data.sms ?? false, push: data.push ?? true }
    })
    return Response.json(updated)
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return Response.json({ error: 'Validation error', details: e.errors }, { status: 400 })
    }
    console.error('PUT /api/notification/preference error', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}