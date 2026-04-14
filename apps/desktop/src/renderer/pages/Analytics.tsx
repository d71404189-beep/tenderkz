import { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Select, Statistic, Table, Tag } from 'antd';
import { BarChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { analyticsService } from '../services/services';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

export default function Analytics() {
  const [history, setHistory] = useState([]);
  const [roi, setRoi] = useState<any>(null);
  const [period, setPeriod] = useState('12m');

  useEffect(() => {
    analyticsService.getHistory(period).then(({ data }) => setHistory(data)).catch(() => {});
    analyticsService.getRoi().then(({ data }) => setRoi(data)).catch(() => {});
  }, [period]);

  const columns = [
    { title: 'Период', dataIndex: 'period', key: 'period' },
    { title: 'Подано', dataIndex: 'submitted', key: 'submitted' },
    { title: 'Выиграно', dataIndex: 'won', key: 'won' },
    { title: 'Сумма выигрышей', dataIndex: 'totalWon', key: 'totalWon', render: (v: number) => `${(v / 1000000).toFixed(1)} млн ₸` },
    { title: 'Ср. скидка', dataIndex: 'avgDiscount', key: 'avgDiscount', render: (v: number) => `${v}%` },
  ];

  return (
    <div>
      <Title level={3}><BarChartOutlined /> Аналитика</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="ROI тендерной деятельности"
              value={roi?.percent || 0}
              suffix="%"
              valueStyle={{ color: (roi?.percent || 0) > 0 ? '#3f8600' : '#cf1322' }}
              prefix={((roi?.percent || 0) > 0) ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Затраты на участие" value={roi?.totalCost || 0} suffix="₸" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Выиграно суммарно" value={roi?.totalRevenue || 0} suffix="₸" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Конверсия (заявка→победа)" value={roi?.conversion || 0} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={14}>
          <Card title="История участия">
            <Select value={period} onChange={setPeriod} style={{ marginBottom: 16 }}
              options={[
                { value: '3m', label: '3 месяца' },
                { value: '6m', label: '6 месяцев' },
                { value: '12m', label: '12 месяцев' },
                { value: '24m', label: '24 месяца' },
              ]}
            />
            <Table dataSource={history} columns={columns} rowKey="period" size="small" pagination={false} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Распределение по категориям">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={roi?.byCategory || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {(roi?.byCategory || []).map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
