import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any
    // @ts-expect-error Pending prisma client regeneration for Notification model
    const count = await prisma.notification.count({ where: { userId: user.id, read: false } })
    return Response.json({ count })
  } catch (e) {
    console.error('GET /api/notification/unread-count error', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}