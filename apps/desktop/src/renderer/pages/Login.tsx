import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import { authService } from '../services/services';

const { Title, Text } = Typography;

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (values: { email: string; password: string; bin?: string; name?: string }) => {
    setLoading(true);
    try {
      if (isRegister) {
        const { data } = await authService.register({
          email: values.email,
          password: values.password,
          bin: values.bin || '',
          name: values.name || '',
        });
        localStorage.setItem('token', data.token);
        message.success('Регистрация успешна!');
      } else {
        const { data } = await authService.login(values.email, values.password);
        localStorage.setItem('token', data.token);
        message.success('Вход выполнен!');
      }
      onLogin();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 40%, #415a77 100%)',
    }}>
      <div style={{ width: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontSize: 52, fontWeight: 800, color: '#fff',
            letterSpacing: -2, marginBottom: 8,
          }}>
            Tender<span style={{ color: '#4fc3f7' }}>KZ</span>
          </div>
          <Text style={{ color: '#90a4ae', fontSize: 16 }}>
            Платформа для победы в госзакупках Казахстана
          </Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: 'none',
          }}
          styles={{ body: { padding: '32px 28px' } }}
        >
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24, color: '#1e293b' }}>
            {isRegister ? 'Создать аккаунт' : 'Вход в систему'}
          </Title>

          <Form
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            initialValues={{ email: 'demo@tenderkz.kz', password: 'demo123456' }}
          >
            <Form.Item name="email" rules={[{ required: true, message: 'Введите email' }]}>
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="Email" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Пароль" />
            </Form.Item>

            {isRegister && (
              <>
                <Form.Item name="name">
                  <Input prefix={<BankOutlined style={{ color: '#94a3b8' }} />} placeholder="Название компании" />
                </Form.Item>
                <Form.Item name="bin">
                  <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="БИН компании" />
                </Form.Item>
              </>
            )}

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{
                  height: 48,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {isRegister ? 'Зарегистрироваться' : 'Войти'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            </Text>
            <Button
              type="link"
              onClick={() => setIsRegister(!isRegister)}
              style={{ paddingLeft: 4, fontWeight: 600 }}
            >
              {isRegister ? 'Войти' : 'Регистрация'}
            </Button>
          </div>

          {!isRegister && (
            <div style={{
              marginTop: 16, padding: '10px 14px',
              background: 'linear-gradient(135deg, #eff6ff, #f0f7ff)',
              borderRadius: 10, textAlign: 'center',
              border: '1px solid #bfdbfe',
            }}>
              <Text style={{ fontSize: 13, color: '#3b82f6' }}>
                Демо-доступ: <strong>demo@tenderkz.kz</strong> / <strong>demo123456</strong>
              </Text>
            </div>
          )}
        </Card>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            © 2026 TenderKZ — легальная аналитика госзакупок РК
          </Text>
        </div>
      </div>
    </div>
  );
}
