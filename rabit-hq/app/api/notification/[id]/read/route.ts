import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any
    const { id } = params
    // @ts-expect-error Pending prisma client regeneration for Notification model
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    })
    if (updated.userId && updated.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    return Response.json({ success: true })
  } catch (e: any) {
    if (e.code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('PATCH /api/notification/:id/read error', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}