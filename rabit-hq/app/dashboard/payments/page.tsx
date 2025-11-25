import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PaymentsClient from './payments-client'

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/auth/signin')
  return <PaymentsClient />
}