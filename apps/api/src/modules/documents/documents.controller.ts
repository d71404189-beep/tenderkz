import { Controller, Get, Post, Param, Body, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import DocumentsService from './documents.service';
import JwtAuthGuard from '../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export default class DocumentsController {
  constructor(private readonly docsService: DocumentsService) {}

  @Get()
  async getAll(@Request() req: any) {
    return this.docsService.getUserDocuments(req.user.userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.docsService.getDocument(id);
  }

  @Post('generate')
  async generate(@Request() req: any, @Body() body: { tenderId: string; type: string }) {
    return this.docsService.generateDocument(req.user.userId, body.tenderId, body.type);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.docsService.downloadDocument(id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="tender_application_${id}.docx"`);
    res.send(buffer);
  }
}
