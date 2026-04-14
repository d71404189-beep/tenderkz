import { useEffect, useState } from 'react';
import { Input, Select, Row, Col, Card, List, Tag, Space, Slider, Button, Typography, Badge } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, ThunderboltOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { TenderType } from '../types';

const { Title, Text } = Typography;

const typeOptions = [
  { value: 'ONE_STAGE', label: 'Одноэтапная' },
  { value: 'TWO_STAGE', label: 'Двухэтапная' },
  { value: 'PRICE_OFFER', label: 'Ценовое предложение' },
  { value: 'PRICE_QUOTATION', label: 'Запрос ценовых предложений' },
  { value: 'SINGLE_SOURCE', label: 'Из одного источника' },
];

const regionOptions = [
  { value: 'Астана', label: 'Астана' },
  { value: 'Алматы', label: 'Алматы' },
  { value: 'Шымкент', label: 'Шымкент' },
  { value: 'Карагандинская обл.', label: 'Карагандинская обл.' },
  { value: 'Алматинская обл.', label: 'Алматинская обл.' },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  PUBLISHED: { color: 'blue', label: 'Опубликована' },
  RECEIVING: { color: 'green', label: 'Приём заявок' },
  OPENING: { color: 'orange', label: 'Вскрытие' },
  AWARDED: { color: 'gold', label: 'Победитель' },
  CANCELLED: { color: 'red', label: 'Отменена' },
  FAILED: { color: 'volcano', label: 'Не состоялась' },
};

const probColor = (p: number) => p > 60 ? '#10b981' : p > 40 ? '#f59e0b' : '#ef4444';

export default function Tenders() {
  const { tenders, loading, fetchTenders } = useAppStore();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>
            <SearchOutlined style={{ color: '#1976d2', marginRight: 8 }} />
            Тендеры
          </Title>
          <Text style={{ color: '#64748b' }}>Найдите тендер, который вы выиграете</Text>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              style={{ borderRadius: 8, fontWeight: 500 }}
              type={showFilters ? 'primary' : 'default'}
            >
              Фильтры
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchTenders()}
              loading={loading}
              style={{ borderRadius: 8 }}
            >
              Обновить
            </Button>
          </Space>
        </Col>
      </Row>

      <Input.Search
        placeholder="Поиск по названию, заказчику, КПГЗ, КТРУ..."
        allowClear
        enterButton={
          <Button type="primary" style={{ borderRadius: '0 8px 8px 0', fontWeight: 600 }}>
            <SearchOutlined /> Найти
          </Button>
        }
        size="large"
        onSearch={(v) => { useAppStore.getState().setTenderFilter({ search: v }); fetchTenders(); }}
        style={{ marginBottom: 16 }}
      />

      {showFilters && (
        <Card style={{ marginBottom: 16, borderRadius: 14, border: '1px solid #e5e7eb' }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Тип закупки</Text>
              <Select mode="multiple" placeholder="Все типы" options={typeOptions} style={{ width: '100%' }} onChange={(v: TenderType[]) => { useAppStore.getState().setTenderFilter({ type: v }); }} />
            </Col>
            <Col span={8}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>
                <EnvironmentOutlined /> Регион
              </Text>
              <Select mode="multiple" placeholder="Все регионы" options={regionOptions} style={{ width: '100%' }} onChange={(v: string[]) => { useAppStore.getState().setTenderFilter({ region: v }); }} />
            </Col>
            <Col span={8}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>
                <DollarOutlined /> Сумма (млн ₸)
              </Text>
              <Slider range min={0} max={1000} step={1} defaultValue={[0, 1000]} />
            </Col>
            <Col span={16} />
            <Col span={8}>
              <Button type="primary" block onClick={() => fetchTenders()} style={{ borderRadius: 8, fontWeight: 600, height: 40 }}>
                Применить фильтры
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      <List
        loading={loading}
        dataSource={tenders}
        locale={{ emptyText: 'Тендеры не найдены' }}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Найдено: ${t}` }}
        renderItem={(tender) => (
          <List.Item
            className="tender-row"
            style={{ padding: '14px 18px', borderRadius: 10, marginBottom: 6, background: '#fff', border: '1px solid #f0f0f0' }}
            onClick={() => navigate(`/tenders/${tender.id}`)}
            actions={[
              <Button type="primary" size="small" style={{ borderRadius: 6 }}>Открыть</Button>,
            ]}
          >
            <List.Item.Meta
              title={<Text strong style={{ color: '#1e293b', fontSize: 15 }}>{tender.title}</Text>}
              description={
                <Space size={4} wrap style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>{tender.customerName}</Text>
                  <Text style={{ color: '#cbd5e1' }}>•</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>БИН: {tender.customerBin}</Text>
                  <Text style={{ color: '#cbd5e1' }}>•</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>{tender.categoryKpgz}</Text>
                  <Text style={{ color: '#cbd5e1' }}>•</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>{tender.region}</Text>
                </Space>
              }
            />
            <Space direction="vertical" align="end" size={4}>
              <Text strong style={{ color: '#1976d2', fontSize: 15 }}>
                {Number(tender.amount).toLocaleString('ru-RU')} ₸
              </Text>
              <Space size={4}>
                {statusConfig[tender.status] && (
                  <Tag color={statusConfig[tender.status].color} style={{ borderRadius: 4 }}>
                    {statusConfig[tender.status].label}
                  </Tag>
                )}
                {tender.winProbability !== undefined && (
                  <Tag style={{
                    background: probColor(tender.winProbability) + '15',
                    color: probColor(tender.winProbability),
                    borderColor: probColor(tender.winProbability) + '30',
                    fontWeight: 600, borderRadius: 4,
                  }}>
                    Шанс: {tender.winProbability}%
                  </Tag>
                )}
              </Space>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Дедлайн: {new Date(tender.deadlineAt).toLocaleDateString('ru-RU')}
              </Text>
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
}
