import { useEffect, useState } from 'react';
import { Card, Table, Typography, Input, Tag, Space, Row, Col, Progress, Statistic } from 'antd';
import { TeamOutlined, SearchOutlined, TrophyOutlined, RiseOutlined } from '@ant-design/icons';
import { competitorService } from '../services/services';
import type { Competitor } from '../types';

const { Title, Text } = Typography;

export default function Competitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchBin, setSearchBin] = useState('');

  useEffect(() => {
    competitorService.getByCategory('').then(({ data }) => {
      setCompetitors(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'Наименование', dataIndex: 'name', key: 'name', width: 220,
      render: (v: string) => <Text strong style={{ color: '#1e293b' }}>{v}</Text> },
    { title: 'БИН', dataIndex: 'bin', key: 'bin', width: 130 },
    { title: 'Регион', dataIndex: 'region', key: 'region', width: 130 },
    {
      title: 'Участие / Победы', key: 'participation', width: 140,
      render: (_: unknown, r: Competitor) => <Text>{r.totalParticipated} / <Text strong style={{ color: '#10b981' }}>{r.totalWon}</Text></Text>,
    },
    {
      title: 'Вероятность победы', dataIndex: 'winRate', key: 'winRate', width: 180,
      render: (v: number) => (
        <Progress percent={Math.round(v * 100)} size="small" strokeColor={v > 0.5 ? '#10b981' : v > 0.3 ? '#f59e0b' : '#ef4444'} />
      ),
    },
    {
      title: 'Ср. скидка', dataIndex: 'avgDiscount', key: 'avgDiscount', width: 110,
      render: (v: number) => <Text style={{ color: '#7c3aed', fontWeight: 600 }}>{v.toFixed(1)}%</Text>,
    },
    {
      title: 'Категории', dataIndex: 'categories', key: 'categories',
      render: (cats: string[]) => (
        <Space size={4} wrap>{cats.slice(0, 2).map((c) => <Tag key={c} style={{ borderRadius: 4 }}>{c}</Tag>)}{cats.length > 2 && <Tag>+{cats.length - 2}</Tag>}</Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ color: '#1e293b', marginBottom: 4 }}>
        <TeamOutlined style={{ color: '#1976d2', marginRight: 8 }} /> Анализ конкурентов
      </Title>
      <Text style={{ color: '#64748b', marginBottom: 20, display: 'block' }}>Изучите своих конкурентов и найдите слабые места</Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 14, borderTop: '3px solid #1976d2' }}>
            <Input.Search
              placeholder="Введите БИН конкурента"
              prefix={<SearchOutlined />}
              enterButton="Найти"
              value={searchBin}
              onChange={(e) => setSearchBin(e.target.value)}
              onSearch={async (bin) => {
                if (!bin) return;
                const { data } = await competitorService.getByBin(bin);
                if (data) setCompetitors([data]);
              }}
              style={{ borderRadius: 8 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 14, borderTop: '3px solid #10b981' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Низкая конкуренция</Text>
              <Space><Tag color="green">Мало участников</Tag><Tag color="orange">Средне</Tag><Tag color="red">Много</Tag></Space>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 14, borderTop: '3px solid #7c3aed' }}>
            <Statistic title="Конкурентов в базе" value={competitors.length} prefix={<TeamOutlined />} valueStyle={{ fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 14 }}>
        <Table
          dataSource={competitors}
          columns={columns}
          rowKey="bin"
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="middle"
          style={{ borderRadius: 14 }}
        />
      </Card>
    </div>
  );
}
