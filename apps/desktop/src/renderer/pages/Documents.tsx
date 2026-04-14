import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Typography, Space, Tag, Row, Col, Progress, Statistic,
} from 'antd';
import {
  FileTextOutlined, DownloadOutlined, SafetyCertificateOutlined,
  EditOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SendOutlined, FileProtectOutlined,
} from '@ant-design/icons';
import { documentService } from '../services/services';
import type { ApplicationDocument } from '../types';

const { Title, Text } = Typography;

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Черновик', color: 'default', icon: <EditOutlined /> },
  ready: { label: 'Готов', color: 'blue', icon: <CheckCircleOutlined /> },
  signed: { label: 'Подписан ЭЦП', color: 'green', icon: <SafetyCertificateOutlined /> },
  submitted: { label: 'Подана', color: 'gold', icon: <SendOutlined /> },
};

export default function Documents() {
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    try {
      const { data } = await documentService.getAll();
      setDocuments(data || []);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const columns = [
    { title: 'Тип документа', dataIndex: 'type', key: 'type', width: 200,
      render: (v: string) => <Text strong>{v}</Text> },
    { title: 'ID тендера', dataIndex: 'tenderId', key: 'tenderId', width: 120 },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 160,
      render: (status: string) => {
        const s = statusConfig[status] || { label: status, color: 'default', icon: null };
        return <Tag icon={s.icon} color={s.color} style={{ borderRadius: 4 }}>{s.label}</Tag>;
      },
    },
    {
      title: 'Готовность', dataIndex: 'readinessScore', key: 'readinessScore', width: 180,
      render: (score: number) => (
        <Progress percent={score} size="small" strokeColor={score >= 90 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'} />
      ),
    },
    {
      title: 'Дата', dataIndex: 'createdAt', key: 'createdAt', width: 120,
      render: (v: string) => new Date(v).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия', key: 'actions', width: 120,
      render: (_: unknown, record: ApplicationDocument) => (
        <Space>
          <Button icon={<DownloadOutlined />} size="small" type="primary" style={{ borderRadius: 6 }}
            onClick={() => documentService.download(record.id)} />
          {record.status === 'ready' && (
            <Button icon={<SafetyCertificateOutlined />} size="small" style={{ borderRadius: 6, borderColor: '#10b981', color: '#10b981' }} />
          )}
        </Space>
      ),
    },
  ];

  const drafts = documents.filter((d) => d.status === 'draft').length;
  const signed = documents.filter((d) => d.status === 'signed').length;
  const submitted = documents.filter((d) => d.status === 'submitted').length;

  return (
    <div>
      <Title level={3} style={{ color: '#1e293b', marginBottom: 4 }}>
        <FileTextOutlined style={{ color: '#1976d2', marginRight: 8 }} /> Документы
      </Title>
      <Text style={{ color: '#64748b', display: 'block', marginBottom: 20 }}>Генерация и управление тендерными заявками</Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #1976d2' }}>
            <Statistic title="Всего" value={documents.length} prefix={<FileTextOutlined style={{ color: '#1976d2' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #94a3b8' }}>
            <Statistic title="Черновиков" value={drafts} prefix={<EditOutlined style={{ color: '#94a3b8' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #10b981' }}>
            <Statistic title="Подписано ЭЦП" value={signed} prefix={<SafetyCertificateOutlined style={{ color: '#10b981' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
            <Statistic title="Подано" value={submitted} prefix={<SendOutlined style={{ color: '#f59e0b' }} />} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 14 }}>
        <Table dataSource={documents} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>
    </div>
  );
}
