import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType,
} from 'docx';
import * as dayjs from 'dayjs';

@Injectable()
export default class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaClient) {}

  async getUserDocuments(userId: string) {
    return this.prisma.applicationDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocument(id: string) {
    return this.prisma.applicationDocument.findUnique({ where: { id } });
  }

  async generateDocument(userId: string, tenderId: string, type: string) {
    const [profile, tender] = await Promise.all([
      this.prisma.companyProfile.findUnique({ where: { userId } }),
      this.prisma.tender.findUnique({ where: { id: tenderId } }),
    ]);

    if (!tender) throw new Error('Tender not found');

    const docRecord = await this.prisma.applicationDocument.create({
      data: {
        userId,
        tenderId,
        type,
        status: 'draft',
        readinessScore: 0,
        content: {},
      },
    });

    const readinessScore = this.calculateReadiness(profile, tender);

    await this.prisma.applicationDocument.update({
      where: { id: docRecord.id },
      data: { readinessScore },
    });

    const docBuffer = await this.buildDocx(profile, tender, type);

    return {
      ...docRecord,
      readinessScore,
      downloadReady: true,
    };
  }

  async downloadDocument(id: string): Promise<Buffer> {
    const doc = await this.prisma.applicationDocument.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');

    const [profile, tender] = await Promise.all([
      this.prisma.companyProfile.findUnique({
        where: { userId: doc.userId },
      }),
      this.prisma.tender.findUnique({ where: { id: doc.tenderId } }),
    ]);

    return this.buildDocx(profile, tender, doc.type);
  }

  private calculateReadiness(profile: any, tender: any): number {
    let score = 0;

    if (profile?.bin) score += 15;
    if (profile?.name) score += 10;
    if (profile?.directorName) score += 10;
    if (profile?.region) score += 5;
    if (profile?.licenses && (profile.licenses as any[]).length > 0) score += 15;
    if (profile?.certificates && (profile.certificates as any[]).length > 0) score += 10;
    if (profile?.experience && (profile.experience as any[]).length > 0) score += 20;
    if (profile?.categories && (profile.categories as string[]).length > 0) score += 10;

    return Math.min(score, 100);
  }

  private async buildDocx(profile: any, tender: any, type: string): Promise<Buffer> {
    const today = dayjs().format('DD.MM.YYYY');

    const sections: any[] = [];

    sections.push({
      properties: {},
      children: [
        new Paragraph({
          text: 'ЗАЯВКА НА УЧАСТИЕ В ЗАКУПКЕ',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: `Дата: ${today}`, size: 24 }),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: `Закупка: `, bold: true, size: 24 }),
            new TextRun({ text: tender.title, size: 24 }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Заказчик: `, bold: true, size: 24 }),
            new TextRun({ text: tender.customerName, size: 24 }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `БИН заказчика: `, bold: true, size: 24 }),
            new TextRun({ text: tender.customerBin, size: 24 }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Сумма закупки: `, bold: true, size: 24 }),
            new TextRun({ text: `${Number(tender.amount).toLocaleString('ru-RU')} ₸`, size: 24 }),
          ],
          spacing: { after: 400 },
        }),

        new Paragraph({
          text: 'ИНФОРМАЦИЯ О ПОСТАВЩИКЕ',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        }),

        this.buildInfoTable(profile),

        new Paragraph({
          text: 'КВАЛИФИКАЦИЯ И ОПЫТ',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),

        ...this.buildExperienceSection(profile),

        new Paragraph({
          text: 'ЛИЦЕНЗИИ И СЕРТИФИКАТЫ',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),

        ...this.buildLicensesSection(profile),

        new Paragraph({
          text: 'Подпись поставщика',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 600, after: 200 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Руководитель: ', bold: true, size: 24 }),
            new TextRun({ text: profile?.directorName || '________________', size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'М.П.', size: 24 }),
          ],
          spacing: { before: 400 },
        }),
      ],
    });

    const doc = new Document({
      sections,
      styles: {
        default: {
          document: {
            run: { font: 'Times New Roman', size: 24 },
          },
        },
      },
    });

    return Packer.toBuffer(doc);
  }

  private buildInfoTable(profile: any): Table {
    const rows = [
      ['Наименование', profile?.name || ''],
      ['БИН', profile?.bin || ''],
      ['Руководитель', profile?.directorName || ''],
      ['Регион', profile?.region || ''],
      ['ОКЭД', profile?.oked || ''],
    ];

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22 })] })],
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' },
            }),
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: value, size: 22 })] })],
            }),
          ],
        }),
      ),
    });
  }

  private buildExperienceSection(profile: any): Paragraph[] {
    if (!profile?.experience || (profile.experience as any[]).length === 0) {
      return [new Paragraph({ children: [new TextRun({ text: 'Опыт не указан', italics: true, size: 22 })] })];
    }

    const paragraphs: Paragraph[] = [];
    for (const exp of profile.experience as any[]) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.year} — ${exp.title}`, size: 22 }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Заказчик: ${exp.customerName}, Сумма: ${Number(exp.amount).toLocaleString('ru-RU')} ₸`, size: 20, color: '666666' }),
          ],
          spacing: { after: 150 },
        }),
      );
    }
    return paragraphs;
  }

  private buildLicensesSection(profile: any): Paragraph[] {
    if (!profile?.licenses || (profile.licenses as any[]).length === 0) {
      return [new Paragraph({ children: [new TextRun({ text: 'Лицензии не указаны', italics: true, size: 22 })] })];
    }

    return (profile.licenses as any[]).map((lic: any) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${lic.type}: №${lic.number}, действительна до ${lic.validTo}`, size: 22 }),
        ],
        spacing: { after: 80 },
      }),
    );
  }
}
