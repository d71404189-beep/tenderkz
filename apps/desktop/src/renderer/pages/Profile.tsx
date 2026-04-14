import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, Select, DatePicker, Upload, Space, Divider, Table, Tag } from 'antd';
import { UserOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { profileService } from '../services/services';
import type { CompanyProfile, License, Certificate, ExperienceEntry } from '../types';

const { Title } = Typography;

export default function Profile() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    profileService.get().then(({ data }) => {
      setProfile(data);
      form.setFieldsValue(data);
    }).catch(() => {});
  }, [form]);

  const handleSave = async (values: Partial<CompanyProfile>) => {
    try {
      const { data } = await profileService.update(values);
      setProfile(data);
    } catch {
      // handle error
    }
  };

  const licenseColumns = [
    { title: 'Тип', dataIndex: 'type', key: 'type' },
    { title: 'Номер', dataIndex: 'number', key: 'number' },
    { title: 'Действует до', dataIndex: 'validTo', key: 'validTo' },
  ];

  const experienceColumns = [
    { title: 'Год', dataIndex: 'year', key: 'year' },
    { title: 'Наименование', dataIndex: 'title', key: 'title' },
    { title: 'Заказчик', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Сумма', dataIndex: 'amount', key: 'amount', render: (v: number) => `${v.toLocaleString('ru-RU')} ₸` },
    { title: 'КПГЗ', dataIndex: 'categoryKpgz', key: 'categoryKpgz' },
  ];

  return (
    <div>
      <Title level={3}><UserOutlined /> Профиль компании</Title>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Реквизиты">
              <Form.Item label="Наименование" name="name"><Input /></Form.Item>
              <Form.Item label="БИН" name="bin"><Input disabled /></Form.Item>
              <Form.Item label="Руководитель" name="directorName"><Input /></Form.Item>
              <Form.Item label="Регион" name="region">
                <Select placeholder="Выберите регион" options={[
                  { value: 'Астана', label: 'Астана' },
                  { value: 'Алматы', label: 'Алматы' },
                  { value: 'Шымкент', label: 'Шымкент' },
                ]} />
              </Form.Item>
              <Form.Item label="ОКЭД" name="oked"><Input /></Form.Item>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Категории деятельности">
              <Form.Item name="categories">
                <Select mode="tags" placeholder="Введите коды КПГЗ" />
              </Form.Item>
            </Card>

            <Card title="Лицензии" style={{ marginTop: 16 }}>
              <Table
                dataSource={profile?.licenses || []}
                columns={licenseColumns}
                rowKey="number"
                size="small"
                pagination={false}
              />
              <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 8 }}>Добавить лицензию</Button>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Card title="Опыт выполнения работ">
          <Table
            dataSource={profile?.experience || []}
            columns={experienceColumns}
            rowKey="tenderId"
            size="small"
            pagination={{ pageSize: 5 }}
          />
          <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 8 }}>Добавить опыт</Button>
        </Card>

        <Divider />

        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
          Сохранить профиль
        </Button>
      </Form>
    </div>
  );
}
