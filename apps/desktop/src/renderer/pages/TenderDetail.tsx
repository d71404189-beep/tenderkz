import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Space, Typography, Progress, Row, Col,
  Alert, List, Collapse, Tooltip, Divider, Badge,
} from 'antd';
import {
  TrophyOutlined, FileTextOutlined, TeamOutlined,
  CheckCircleOutlined, WarningOutlined, CalendarOutlined,
  ArrowLeftOutlined, DownloadOutlined, SafetyCertificateOutlined,
  ThunderboltOutlined, EnvironmentOutlined, DollarOutlined,
} from '@ant-design/icons';
import { tenderService, aiService, documentService } from '../services/services';
import type { Tender, WinProbabilityResult, ProbabilityFactor } from '../types';

const { Title, Text, Paragraph } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  PUBLISHED: { color: 'blue', label: 'Опубликована' },
  RECEIVING: { color: 'green', label: 'Приём заявок' },
  OPENING: { color: 'orange', label: 'Вскрытие' },
  EVALUATION: { color: 'purple', label: 'Оценка' },
  AWARDED: { color: 'gold', label: 'Определён победитель' },
  CANCELLED: { color: 'red', label: 'Отменена' },
  FAILED: { color: 'volcano', label: 'Не состоялась' },
};

const probColor = (p: number) => p > 60 ? '#10b981' : p > 40 ? '#f59e0b' : '#ef4444';

export default function TenderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tender, setTender] = useState<Tender | null>(null);
  const [probability, setProbability] = useState<WinProbabilityResult | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [tenderRes] = await Promise.all([
          tenderService.getById(id),
        ]);
        setTender(tenderRes.data);
        try {
          const [probRes, recRes] = await Promise.all([
            aiService.getWinProbability(id),
            aiService.getRecommendations(id),
          ]);
          setProbability(probRes.data);
          setRecommendations(recRes.data.recommendations || []);
        } catch {
          // AI service might not be running
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !tender) {
    return <div style={{ textAlign: 'center', padding: 60 }}><Text style={{ color: '#94a3b8' }}>Загрузка...</Text></div>;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/tenders')}
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        Назад к списку
      </Button>

      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#1e293b' }}>{tender.title}</Title>
        <Space size={16} style={{ marginTop: 8 }}>
          {statusConfig[tender.status] && (
            <Tag color={statusConfig[tender.status].color} style={{ borderRadius: 4, fontWeight: 600 }}>
              {statusConfig[tender.status].label}
            </Tag>
          )}
          <Text type="secondary">{tender.externalId}</Text>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title={<Space><FileTextOutlined style={{ color: '#1976d2' }} /> Информация о закупке</Space>} style={{ borderRadius: 14 }}>
            <Descriptions column={2} bordered size="small" labelStyle={{ background: '#f8fafc', fontWeight: 600, color: '#475569' }}>
              <Descriptions.Item label="Заказчик">{tender.customerName}</Descriptions.Item>
              <Descriptions.Item label="БИН заказчика">{tender.customerBin}</Descriptions.Item>
              <Descriptions.Item label={
                <Space><DollarOutlined /> Сумма</Space>
              }>
                <Text strong style={{ color: '#1976d2', fontSize: 15 }}>{Number(tender.amount).toLocaleString('ru-RU')} ₸</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Тип">{tender.type}</Descriptions.Item>
              <Descriptions.Item label="КПГЗ">{tender.categoryKpgz}</Descriptions.Item>
              <Descriptions.Item label="КТРУ">{tender.categoryKtru}</Descriptions.Item>
              <Descriptions.Item label={<Space><EnvironmentOutlined /> Регион</Space>}>{tender.region}</Descriptions.Item>
              <Descriptions.Item label="Обеспечение">
                {tender.guaranteeAmount ? `${Number(tender.guaranteeAmount).toLocaleString('ru-RU')} ₸` : 'Нет'}
              </Descriptions.Item>
              <Descriptions.Item label="Опубликовано">{new Date(tender.publishedAt).toLocaleDateString('ru-RU')}</Descriptions.Item>
              <Descriptions.Item label={
                <Space><WarningOutlined style={{ color: '#ef4444' }} /> Дедлайн подачи</Space>
              }>
                <Text type="danger" strong>{new Date(tender.deadlineAt).toLocaleDateString('ru-RU')}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Вскрытие">{tender.openingAt ? new Date(tender.openingAt).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
              <Descriptions.Item label="Конкурентов">{tender.competitorCount || '?'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Требования" style={{ marginTop: 16, borderRadius: 14 }}>
            <Paragraph style={{ color: '#475569', lineHeight: 1.8 }}>{tender.requirements || 'Требования не указаны в извещении'}</Paragraph>
          </Card>

          <Card title="Документы закупки" style={{ marginTop: 16, borderRadius: 14 }}>
            <List
              dataSource={tender.documents}
              locale={{ emptyText: 'Документы не прикреплены' }}
              renderItem={(doc) => (
                <List.Item actions={[<Button type="link" icon={<DownloadOutlined />}>Скачать</Button>]}>
                  <Text>{doc.name}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          {probability && (
            <Card
              title={<Space><TrophyOutlined style={{ color: '#f59e0b' }} /> Вероятность выигрыша</Space>}
              style={{ borderRadius: 14, borderTop: `3px solid ${probColor(probability.probability)}` }}
            >
              <div style={{ textAlign: 'center', marginBottom: 20 }} className="probability-circle">
                <Progress
                  type="circle"
                  percent={Math.round(probability.probability)}
                  size={130}
                  strokeColor={probColor(probability.probability)}
                  format={(p) => <span style={{ fontWeight: 700, fontSize: 28 }}>{p}%</span>}
                />
              </div>
              <Alert
                message={probability.recommendation}
                type={probability.probability > 50 ? 'success' : 'warning'}
                showIcon
                style={{ marginBottom: 12, borderRadius: 8 }}
              />
              <Collapse
                ghost
                items={[{
                  key: '1',
                  label: <Text strong style={{ color: '#475569' }}>Подробный анализ факторов</Text>,
                  children: probability.factors.map((f: ProbabilityFactor, i: number) => (
                    <div key={i} style={{ marginBottom: 10, padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                      <Space>
                        {f.impact === 'positive' ? <CheckCircleOutlined style={{ color: '#10b981' }} /> :
                         f.impact === 'negative' ? <WarningOutlined style={{ color: '#ef4444' }} /> :
                         <span style={{ color: '#94a3b8' }}>●</span>}
                        <Text strong>{f.name}:</Text>
                        <Text type="secondary">{f.value}</Text>
                      </Space>
                    </div>
                  )),
                }]}
              />
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card
              title={<Space><ThunderboltOutlined style={{ color: '#7c3aed' }} /> AI-рекомендации</Space>}
              style={{ marginTop: 16, borderRadius: 14 }}
            >
              <List
                dataSource={recommendations}
                renderItem={(rec) => (
                  <List.Item style={{ padding: '8px 0', border: 'none' }}>
                    <Space align="start">
                      <CheckCircleOutlined style={{ color: '#1976d2', marginTop: 3 }} />
                      <Text style={{ color: '#475569' }}>{rec}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Card style={{ marginTop: 16, borderRadius: 14, background: 'linear-gradient(135deg, #eff6ff, #f0f7ff)', border: '1px solid #bfdbfe' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Button type="primary" icon={<FileTextOutlined />} block size="large"
                style={{ borderRadius: 10, fontWeight: 700, height: 48 }}
                onClick={() => documentService.generate(tender.id, 'PRICE_OFFER')}>
                Сгенерировать заявку
              </Button>
              <Button icon={<CalendarOutlined />} block style={{ borderRadius: 8 }}>
                Добавить в календарь
              </Button>
              <Button icon={<TeamOutlined />} block style={{ borderRadius: 8 }}
                onClick={() => navigate('/competitors')}>
                Анализ конкурентов
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
