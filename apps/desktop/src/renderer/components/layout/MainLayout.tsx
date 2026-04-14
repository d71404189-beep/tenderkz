import { Layout, Menu, Avatar, Dropdown, Typography, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  SearchOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CalendarOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { notificationService } from '../../services/services';
import { useEffect, useState } from 'react';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/tenders', icon: <SearchOutlined />, label: 'Тендеры' },
  { key: '/competitors', icon: <TeamOutlined />, label: 'Конкуренты' },
  { key: '/documents', icon: <FileTextOutlined />, label: 'Документы' },
  { key: '/analytics', icon: <BarChartOutlined />, label: 'Аналитика' },
  { key: '/calendar', icon: <CalendarOutlined />, label: 'Календарь' },
  { key: '/profile', icon: <UserOutlined />, label: 'Профиль' },
];

interface MainLayoutProps {
  onLogout: () => void;
}

export default function MainLayout({ onLogout }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getAll().then(({ data }) => {
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }).catch(() => {});
  }, []);

  const userMenu = [
    { key: 'profile', icon: <UserOutlined />, label: 'Профиль', onClick: () => navigate('/profile') },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true, onClick: onLogout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        theme="light"
        style={{
          borderRight: '1px solid #e5e7eb',
          boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 8,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 18,
          }}>
            T
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              TenderKZ
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Госзакупки РК</div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            border: 'none',
            padding: '4px 8px',
            fontWeight: 500,
          }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: '1px solid #f0f0f0',
          height: 56,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}>
          <Space size={20}>
            <Badge count={unreadCount} size="small">
              <BellOutlined style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size={32} style={{ background: '#1976d2' }} icon={<UserOutlined />} />
                <Text strong style={{ color: '#334155' }}>Мой аккаунт</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          padding: 24,
          overflow: 'auto',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 56px)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
