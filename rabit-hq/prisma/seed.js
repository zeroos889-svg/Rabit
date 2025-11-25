const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = await bcryptjs.hash('password123', 10)

  const founder = await prisma.user.upsert({
    where: { email: 'founder@rabit.test' },
    update: {},
    create: {
      email: 'founder@rabit.test',
      name: 'Founder Demo',
      password,
      role: 'FOUNDER',
    },
  })

  const finance = await prisma.user.upsert({
    where: { email: 'finance@rabit.test' },
    update: {},
    create: {
      email: 'finance@rabit.test',
      name: 'Finance Demo',
      password,
      role: 'FINANCE',
    },
  })

  const investor = await prisma.user.upsert({
    where: { email: 'investor@rabit.test' },
    update: {},
    create: {
      email: 'investor@rabit.test',
      name: 'Investor Demo',
      password,
      role: 'INVESTOR',
    },
  })

  // Example capital
  await prisma.capitalEvent.createMany({
    data: [
      {
        type: 'FOUNDER_CONTRIBUTION',
        investorName: 'Founders',
        amount: '50000',
        currency: 'SAR',
        date: new Date('2024-01-01'),
      },
      {
        type: 'INVESTMENT_ROUND',
        investorName: 'Seed Investor',
        amount: '200000',
        currency: 'SAR',
        date: new Date('2024-06-01'),
      },
    ],
  })

  // Example phases
  const p1 = await prisma.projectPhase.create({
    data: {
      name: 'Phase 1 - Backend & Security',
      description: 'Core backend and security',
      order: 1,
      status: 'IN_PROGRESS',
      plannedStartDate: new Date('2024-01-01'),
      plannedEndDate: new Date('2024-03-01'),
    },
  })

  await prisma.milestone.create({
    data: {
      phaseId: p1.id,
      title: 'Auth & RBAC',
      description: 'Implement authentication and roles',
      status: 'COMPLETED',
      plannedDate: new Date('2024-01-20'),
      completedDate: new Date('2024-01-18'),
      ownerId: founder.id,
    },
  })

  // Notification preferences defaults
  for (const u of [founder, finance, investor]) {
    await prisma.notificationPreference.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id }
    })
  }

  // Sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: founder.id,
        type: 'SUCCESS',
        title: 'Seed data ready',
        message: 'Initial demo data loaded successfully.'
      },
      {
        userId: finance.id,
        type: 'INFO',
        title: 'Finance snapshot',
        message: 'Review monthly burn trends for accuracy.'
      },
      {
        userId: investor.id,
        type: 'INFO',
        title: 'Investor portal',
        message: 'Portal is active with fallback data.'
      }
    ]
  })

  // Sample payment (mock) for founder
  await prisma.payment.create({
    data: {
      userId: founder.id,
      amount: '999.00',
      currency: 'SAR',
      status: 'PAID',
      provider: 'MOYASAR',
      providerRef: 'MOCK-REF-001',
      description: 'Founder subscription'
    }
  })

  console.log('Seed finished')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
