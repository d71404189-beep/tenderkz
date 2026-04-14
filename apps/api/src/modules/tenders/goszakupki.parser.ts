import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export default class GoszakupkiParser {
  private readonly logger = new Logger(GoszakupkiParser.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaClient,
  ) {}

  async fetchPublishedTenders(page: number = 0, perPage: number = 50) {
    this.logger.log(`Fetching tenders page=${page}, perPage=${perPage}`);

    try {
      const axios = (await import('axios')).default;
      const url = 'https://goszakupki.gov.kz/ru/api/v3/trd/search';
      const { data } = await axios.get(url, {
        params: { page, per_page: perPage, status: 'PUBLISHED' },
        timeout: 30000,
        headers: {
          'User-Agent': 'TenderKZ/0.1.0 (legitimate monitoring service)',
          'Accept': 'application/json',
        },
      });
      return this.normalizeApiData(data);
    } catch (error: any) {
      this.logger.warn(`API fetch failed: ${error.message} — using demo data`);
      return this.getDemoTenders();
    }
  }

  async fetchTenderDetail(externalId: string) {
    try {
      const axios = (await import('axios')).default;
      const url = `https://goszakupki.gov.kz/ru/api/v3/trd/${externalId}`;
      const { data } = await axios.get(url, { timeout: 30000 });
      return data;
    } catch (error: any) {
      this.logger.warn(`Detail fetch failed for ${externalId}: ${error.message}`);
      return null;
    }
  }

  async fetchTenderResults(externalId: string) {
    try {
      const axios = (await import('axios')).default;
      const url = `https://goszakupki.gov.kz/ru/api/v3/trd/${externalId}/results`;
      const { data } = await axios.get(url, { timeout: 30000 });
      return data;
    } catch (error: any) {
      this.logger.warn(`Results fetch failed: ${error.message}`);
      return [];
    }
  }

  private normalizeApiData(raw: any): any[] {
    if (!raw?.data?.items) return [];

    return raw.data.items.map((item: any) => ({
      externalId: String(item.id || item.trd_id || ''),
      title: item.name_ru || item.name_kz || '',
      description: item.description_ru || '',
      customerName: item.customer_name_ru || item.org_name || '',
      customerBin: String(item.customer_bin || item.org_bin || ''),
      categoryKpgz: item.kpgz_code || '',
      categoryKtru: item.ktru_code || '',
      region: item.region_name || '',
      amount: parseFloat(item.total_sum || item.amount || 0),
      currency: item.currency || 'KZT',
      type: this.mapTenderType(item.purchase_type || item.type),
      status: this.mapStatus(item.status),
      publishedAt: item.publish_date || item.date_publish || new Date().toISOString(),
      deadlineAt: item.end_date || item.deadline || new Date().toISOString(),
      openingAt: item.opening_date || null,
      guaranteeAmount: parseFloat(item.guarantee_amount || 0),
      requirements: item.requirements_ru || '',
      documents: item.documents || [],
      competitorCount: item.participant_count || 0,
    }));
  }

  private getDemoTenders(): any[] {
    const now = new Date();
    return [
      {
        externalId: 'TRD-2026-1001',
        title: 'Закупка строительных материалов для ремонта социальных объектов г. Астаны',
        description: 'Закупка отделочных и строительных материалов для ремонта 8 социальных объектов',
        customerName: 'ГУ Управление строительства г. Астаны',
        customerBin: '050140012345',
        categoryKpgz: '43.32',
        categoryKtru: '43.32.10',
        region: 'Астана',
        amount: 12500000,
        currency: 'KZT',
        type: 'PRICE_OFFER',
        status: 'RECEIVING',
        publishedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
        deadlineAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
        openingAt: new Date(now.getTime() + 8 * 86400000).toISOString(),
        guaranteeAmount: 625000,
        requirements: 'Наличие лицензии на строительные работы 1-й категории. Опыт не менее 3 аналогичных контрактов за последние 3 года. Наличие складских помещений в г. Астана.',
        documents: [{ name: 'Техническая спецификация', url: '#', size: 245000 }, { name: 'Проект договора', url: '#', size: 180000 }],
        competitorCount: 5,
      },
      {
        externalId: 'TRD-2026-1002',
        title: 'Оказание услуг по техническому обслуживанию серверного оборудования Минцифры РК',
        description: 'Техническое обслуживание и ремонт серверного оборудования на 2026 год',
        customerName: 'ГУ Министерство цифровых инноваций и аэрокосмической промышленности РК',
        customerBin: '060140013456',
        categoryKpgz: '62.01',
        categoryKtru: '62.01.11',
        region: 'Астана',
        amount: 22000000,
        currency: 'KZT',
        type: 'TWO_STAGE',
        status: 'PUBLISHED',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
        deadlineAt: new Date(now.getTime() + 14 * 86400000).toISOString(),
        openingAt: new Date(now.getTime() + 15 * 86400000).toISOString(),
        guaranteeAmount: 1100000,
        requirements: 'Наличие сертификатов Cisco Certified Network Professional или Microsoft Certified. Сертификат ISO 27001 обязателен. Опыт обслуживания серверной инфраструктуры госорганов не менее 2 лет.',
        documents: [{ name: 'Техническое задание', url: '#', size: 320000 }],
        competitorCount: 8,
      },
      {
        externalId: 'TRD-2026-1003',
        title: 'Поставка компьютерной техники для школ Карагандинской области',
        description: 'Поставка 120 ноутбуков и 30 принтеров для общеобразовательных школ',
        customerName: 'ГУ Управление образования Карагандинской области',
        customerBin: '070140015678',
        categoryKpgz: '47.41',
        categoryKtru: '47.41.10',
        region: 'Карагандинская обл.',
        amount: 35000000,
        currency: 'KZT',
        type: 'ONE_STAGE',
        status: 'RECEIVING',
        publishedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
        deadlineAt: new Date(now.getTime() + 5 * 86400000).toISOString(),
        openingAt: new Date(now.getTime() + 6 * 86400000).toISOString(),
        guaranteeAmount: 1750000,
        requirements: 'Наличие сервисного центра в Карагандинской области. Гарантия не менее 36 месяцев. Поставка в течение 20 рабочих дней.',
        documents: [{ name: 'Спецификация оборудования', url: '#', size: 156000 }],
        competitorCount: 10,
      },
      {
        externalId: 'TRD-2026-1004',
        title: 'Капитальный ремонт кровли здания государственного университета',
        description: 'Капитальный ремонт кровли 4-этажного здания учебного корпуса',
        customerName: 'КГУ Университет им. Шакарима г. Семей',
        customerBin: '080140018901',
        categoryKpgz: '43.31',
        categoryKtru: '43.31.10',
        region: 'Абайская обл.',
        amount: 56000000,
        currency: 'KZT',
        type: 'ONE_STAGE',
        status: 'PUBLISHED',
        publishedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
        deadlineAt: new Date(now.getTime() + 21 * 86400000).toISOString(),
        openingAt: new Date(now.getTime() + 22 * 86400000).toISOString(),
        guaranteeAmount: 2800000,
        requirements: 'Лицензия 1-й категории на строительно-монтажные работы. Опыт выполнения кровельных работ не менее 5 объектов. Сертификат ISO 9001. Гарантия на работы 5 лет.',
        documents: [{ name: 'Проектно-сметная документация', url: '#', size: 890000 }],
        competitorCount: 3,
      },
      {
        externalId: 'TRD-2026-1005',
        title: 'Запрос ценовых предложений на закупку канцелярских товаров',
        description: 'Закупка канцелярских товаров и расходных материалов для аппарата акима г. Алматы',
        customerName: 'ГУ Аппарат акима г. Алматы',
        customerBin: '020140012345',
        categoryKpgz: '47.62',
        categoryKtru: '47.62.10',
        region: 'Алматы',
        amount: 4500000,
        currency: 'KZT',
        type: 'PRICE_QUOTATION',
        status: 'RECEIVING',
        publishedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
        deadlineAt: new Date(now.getTime() + 3 * 86400000).toISOString(),
        openingAt: null,
        guaranteeAmount: 0,
        requirements: 'Своевременная поставка в течение 7 рабочих дней. Наличие склада в г. Алматы.',
        documents: [],
        competitorCount: 15,
      },
      {
        externalId: 'TRD-2026-1006',
        title: 'Поставка медицинского оборудования для городской больницы Шымкента',
        description: 'Поставка медицинского диагностического оборудования для отделения функциональной диагностики',
        customerName: 'ГУ Городская больница №1 г. Шымкент',
        customerBin: '030140016789',
        categoryKpgz: '46.46',
        categoryKtru: '46.46.20',
        region: 'Шымкент',
        amount: 78000000,
        currency: 'KZT',
        type: 'TWO_STAGE',
        status: 'PUBLISHED',
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
        deadlineAt: new Date(now.getTime() + 18 * 86400000).toISOString(),
        openingAt: new Date(now.getTime() + 19 * 86400000).toISOString(),
        guaranteeAmount: 3900000,
        requirements: 'Регистрационное удостоверение МЗ РК на оборудование. Сервисный центр в Шымкентской области. Обучение персонала заказчика. Гарантия 24 месяца.',
        documents: [{ name: 'Техническая спецификация мед. оборудования', url: '#', size: 445000 }],
        competitorCount: 4,
      },
      {
        externalId: 'TRD-2026-1007',
        title: 'Закупка горюче-смазочных материалов для нужд автопарка акимата',
        description: 'Поставка бензина АИ-92 и дизельного топлива на 2026 год',
        customerName: 'ГУ Акимат Павлодарской области',
        customerBin: '110140011111',
        categoryKpgz: '47.30',
        categoryKtru: '47.30.10',
        region: 'Павлодарская обл.',
        amount: 42000000,
        currency: 'KZT',
        type: 'PRICE_OFFER',
        status: 'RECEIVING',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
        deadlineAt: new Date(now.getTime() + 4 * 86400000).toISOString(),
        openingAt: new Date(now.getTime() + 5 * 86400000).toISOString(),
        guaranteeAmount: 2100000,
        requirements: 'Наличие нефтебазы в Павлодарской области. Лицензия на хранение и реализацию нефтепродуктов.',
        documents: [],
        competitorCount: 6,
      },
      {
        externalId: 'TRD-2026-1008',
        title: 'Оказание услуг по клинингу и уборке здания министерства',
        description: 'Ежедневная профессиональная уборка помещений министерства на 2026 год',
        customerName: 'ГУ Министерство труда и социальной защиты населения РК',
        customerBin: '060140015555',
        categoryKpgz: '81.21',
        categoryKtru: '81.21.10',
        region: 'Астана',
        amount: 8500000,
        currency: 'KZT',
        type: 'PRICE_QUOTATION',
        status: 'RECEIVING',
        publishedAt: now.toISOString(),
        deadlineAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
        openingAt: null,
        guaranteeAmount: 0,
        requirements: 'Опыт оказания клининговых услуг госорганам. Наличие профессионального оборудования и моющих средств.',
        documents: [],
        competitorCount: 9,
      },
    ];
  }

  private mapTenderType(type: string): string {
    const map: Record<string, string> = {
      '1': 'ONE_STAGE', '2': 'TWO_STAGE', '3': 'PRICE_OFFER',
      '4': 'PRICE_QUOTATION', '5': 'SINGLE_SOURCE',
    };
    return map[type] || type || 'ONE_STAGE';
  }

  private mapStatus(status: string): string {
    const map: Record<string, string> = {
      '1': 'PUBLISHED', '2': 'CLARIFICATION', '3': 'RECEIVING',
      '4': 'OPENING', '5': 'EVALUATION', '6': 'AWARDED',
      '7': 'CANCELLED', '8': 'FAILED',
    };
    return map[status] || status || 'PUBLISHED';
  }
}
