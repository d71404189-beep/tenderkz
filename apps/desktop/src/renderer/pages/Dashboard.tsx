import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Tag, Space, Button, Progress } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  TrophyOutlined,
  PercentOutlined,
  BellOutlined,
  ArrowUpOutlined,
  RightOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { Tender } from '../types';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  PUBLISHED: { color: 'blue', label: 'Опубликована' },
  RECEIVING: { color: 'green', label: 'Приём заявок' },
  OPENING: { color: 'orange', label: 'Вскрытие' },
  AWARDED: { color: 'gold', label: 'Победитель' },
  CANCELLED: { color: 'red', label: 'Отменена' },
};

const probColor = (p: number) => p > 60 ? '#10b981' : p > 40 ? '#f59e0b' : '#ef4444';

export default function Dashboard() {
  const { stats, fetchStats } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Text style={{ fontSize: 16, color: '#94a3b8' }}>Загрузка дашборда...</Text>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Добро пожаловать в TenderKZ</Title>
        <Text style={{ color: '#64748b', fontSize: 15 }}>Обзор вашей тендерной активности</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #1976d2' }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>Активные тендеры</Text>}
              value={stats.activeTenders}
              prefix={<SearchOutlined style={{ color: '#1976d2' }} />}
              valueStyle={{ color: '#1e293b', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #7c3aed' }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>Подано заявок</Text>}
              value={stats.submittedApplications}
              prefix={<FileTextOutlined style={{ color: '#7c3aed' }} />}
              valueStyle={{ color: '#1e293b', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #10b981' }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>Выиграно</Text>}
              value={stats.wonTenders}
              prefix={<TrophyOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#1e293b', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>Вероятность выигрыша</Text>}
              value={stats.winRate}
              suffix="%"
              prefix={<PercentOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#1e293b', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#1976d2' }} />
                <span>Рекомендуемые тендеры</span>
              </Space>
            }
            extra={<Button type="link" onClick={() => navigate('/tenders')}>Все тендеры <RightOutlined /></Button>}
            style={{ borderRadius: 14 }}
          >
            <List
              dataSource={stats.recommendedTenders}
              locale={{ emptyText: 'Нет рекомендуемых тендеров' }}
              renderItem={(tender: Tender) => (
                <List.Item
                  className="tender-row"
                  style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 4 }}
                  onClick={() => navigate(`/tenders/${tender.id}`)}
                  actions={[
                    <Button type="primary" size="small" style={{ borderRadius: 6 }}>Подробнее</Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text strong style={{ color: '#1e293b' }}>{tender.title}</Text>}
                    description={
                      <Space size={8}>
                        <Text type="secondary">{tender.customerName}</Text>
                        <Text style={{ color: '#1976d2', fontWeight: 600 }}>
                          {Number(tender.amount).toLocaleString('ru-RU')} ₸
                        </Text>
                      </Space>
                    }
                  />
                  <Space>
                    {statusConfig[tender.status] && (
                      <Tag color={statusConfig[tender.status].color}>
                        {statusConfig[tender.status].label}
                      </Tag>
                    )}
                    {tender.winProbability !== undefined && (
                      <Tag style={{ background: probColor(tender.winProbability) + '18', color: probColor(tender.winProbability), borderColor: probColor(tender.winProbability) + '40', fontWeight: 600 }}>
                        {tender.winProbability}%
                      </Tag>
                    )}
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title={
              <Space>
                <BellOutlined style={{ color: '#f59e0b' }} />
                <span>Ближайшие дедлайны</span>
              </Space>
            }
            style={{ borderRadius: 14 }}
          >
            <List
              dataSource={stats.upcomingDeadlines}
              locale={{ emptyText: 'Нет предстоящих дедлайнов' }}
              renderItem={(n: any) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <List.Item.Meta
                    title={<Text style={{ fontSize: 13 }}>{n.title}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 12 }}>{n.message}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
