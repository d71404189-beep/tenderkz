import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: '#1976d2',
          borderRadius: 10,
          fontFamily: "'Inter', -apple-system, sans-serif",
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f0f2f5',
        },
        components: {
          Button: { fontWeight: 600 },
          Card: { borderRadiusLG: 14 },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
