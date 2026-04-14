import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo123456', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@tenderkz.kz' },
    update: {},
    create: {
      email: 'demo@tenderkz.kz',
      passwordHash,
      bin: '123456789012',
      name: 'ТОО ДемоПоставщик',
      role: 'user',
    },
  });

  await prisma.companyProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      bin: '123456789012',
      name: 'ТОО ДемоПоставщик',
      directorName: 'Иванов Иван Иванович',
      region: 'Астана',
      oked: '46.21',
      categories: ['43.32', '43.31', '43.33'],
      licenses: [
        { type: 'Строительная лицензия 1-категория', number: 'KZ-L-00123', validTo: '2027-12-31' },
      ],
      certificates: [
        { type: 'ISO 9001:2015', number: 'CERT-001', validTo: '2026-06-30' },
      ],
      experience: [
        { tenderId: 'exp-001', title: 'Ремонт школы №12', customerName: 'ГУ Школа №12', amount: 15000000, year: 2024, categoryKpgz: '43.32' },
        { tenderId: 'exp-002', title: 'Отделка больницы', customerName: 'ГУ Больница №5', amount: 28000000, year: 2023, categoryKpgz: '43.33' },
        { tenderId: 'exp-003', title: 'Ремонт детского сада', customerName: 'ГУ Детсад №8', amount: 8500000, year: 2024, categoryKpgz: '43.31' },
      ],
    },
  });

  const demoTenders = [
    {
      externalId: 'TRD-2026-001',
      title: 'Закупка отделочных материалов для ремонта школ г. Астаны',
      description: 'Закупка отделочных материалов для ремонта 5 школ Астаны в рамках программы модернизации',
      customerName: 'ГУ Управление образования г. Астаны',
      customerBin: '987654321098',
      categoryKpgz: '43.32',
      categoryKtru: '43.32.10',
      region: 'Астана',
      amount: 8000000,
      currency: 'KZT',
      type: 'PRICE_OFFER',
      status: 'RECEIVING',
      publishedAt: new Date('2026-04-10'),
      deadlineAt: new Date('2026-04-20'),
      openingAt: new Date('2026-04-21'),
      guaranteeAmount: 400000,
      requirements: 'Наличие лицензии на строительные работы. Опыт не менее 3 аналогичных контрактов за последние 3 года.',
      documents: [],
      competitorCount: 4,
    },
    {
      externalId: 'TRD-2026-002',
      title: 'Оказание услуг по техническому обслуживанию серверного оборудования',
      description: 'ТО серверного оборудования министерства на 2026 год',
      customerName: 'ГУ Министерство цифрового развития РК',
      customerBin: '111222333444',
      categoryKpgz: '62.01',
      categoryKtru: '62.01.11',
      region: 'Астана',
      amount: 15000000,
      currency: 'KZT',
      type: 'TWO_STAGE',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-04-12'),
      deadlineAt: new Date('2026-04-25'),
      openingAt: new Date('2026-04-26'),
      guaranteeAmount: 750000,
      requirements: 'Наличие сертификатов Cisco/Microsoft. ISO 27001. Опыт обслуживания серверов госорганов.',
      documents: [],
      competitorCount: 7,
    },
    {
      externalId: 'TRD-2026-003',
      title: 'Поставка кормов для нужд государственного предприятия',
      description: 'Поставка комбикормов на 2026 год',
      customerName: 'ГКП КазАгроПрод',
      customerBin: '555666777888',
      categoryKpgz: '10.91',
      categoryKtru: '10.91.10',
      region: 'Карагандинская обл.',
      amount: 25000000,
      currency: 'KZT',
      type: 'ONE_STAGE',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-04-08'),
      deadlineAt: new Date('2026-04-18'),
      openingAt: new Date('2026-04-19'),
      guaranteeAmount: 1250000,
      requirements: 'Опыт поставки кормов не менее 2 лет. Наличие складских помещений.',
      documents: [],
      competitorCount: 2,
    },
    {
      externalId: 'TRD-2026-004',
      title: 'Запрос ценовых предложений на закупку канцелярских товаров',
      description: 'Закупка канцелярских товаров для аппарата акима Алматы',
      customerName: 'ГУ Аппарат акима г. Алматы',
      customerBin: '999888777666',
      categoryKpgz: '47.62',
      categoryKtru: '47.62.10',
      region: 'Алматы',
      amount: 3000000,
      currency: 'KZT',
      type: 'PRICE_QUOTATION',
      status: 'RECEIVING',
      publishedAt: new Date('2026-04-13'),
      deadlineAt: new Date('2026-04-16'),
      openingAt: null,
      guaranteeAmount: 0,
      requirements: 'Своевременная поставка в течение 10 рабочих дней.',
      documents: [],
      competitorCount: 12,
    },
    {
      externalId: 'TRD-2026-005',
      title: 'Капитальный ремонт кровли здания КГУ',
      description: 'Капитальный ремонт кровли здания КГУ Университет',
      customerName: 'КГУ им. Шакарима',
      customerBin: '444333222111',
      categoryKpgz: '43.31',
      categoryKtru: '43.31.10',
      region: 'Семей',
      amount: 42000000,
      currency: 'KZT',
      type: 'ONE_STAGE',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-04-09'),
      deadlineAt: new Date('2026-04-28'),
      openingAt: new Date('2026-04-29'),
      guaranteeAmount: 2100000,
      requirements: 'Лицензия 1-й категории. Опыт кровельных работ от 5 объектов. ISO 9001.',
      documents: [],
      competitorCount: 3,
    },
  ];

  for (const t of demoTenders) {
    await prisma.tender.upsert({
      where: { externalId: t.externalId },
      update: {},
      create: t,
    });
  }

  console.log('Seed data created successfully');
  console.log(`Demo user: demo@tenderkz.kz / demo123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
