import { useEffect, useState } from 'react';
import { Card, Calendar, Badge, Typography, List, Tag, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import type { Notification } from '../types';
import { notificationService } from '../services/services';

const { Title, Text } = Typography;

export default function CalendarPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationService.getAll().then(({ data }) => setNotifications(data)).catch(() => {});
  }, []);

  const dateCellRender = (date: any) => {
    const dayNotifs = notifications.filter((n) => {
      const d = new Date(n.createdAt);
      return d.toDateString() === date.toDate().toDateString();
    });
    return (
      <List size="small" dataSource={dayNotifs} renderItem={(n) => (
        <li><Badge status="warning" text={<span style={{ fontSize: 11 }}>{n.title}</span>} /></li>
      )} />
    );
  };

  return (
    <div>
      <Title level={3}><CalendarOutlined /> Календарь</Title>
      <Card>
        <Calendar cellRender={(current, info) => {
          if (info.type === 'date') return dateCellRender(current);
          return info.originNode;
        }} />
      </Card>
    </div>
  );
}
