import { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Space, ConfigProvider, message } from 'antd';
import { LogoutOutlined, FolderOutlined, FileOutlined, FormOutlined, UserOutlined, LockOutlined, GlobalOutlined, DownOutlined, TeamOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import Login from './components/Login';
import DirectoryTree from './components/DirectoryTree';
import FileList from './components/FileList';
import ProposalList from './components/ProposalList';
import UserManagement from './components/UserManagement';
import ChangePassword from './components/ChangePassword';
import { authService } from './services/auth';
import { t, setLocale, getLocale } from './locales';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || 'files';
  });
  const [selectedDirectory, setSelectedDirectory] = useState(() => {
    const saved = localStorage.getItem('selectedDirectory');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [locale, setLocaleState] = useState(getLocale());
  const [, forceUpdate] = useState();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedDirectory) {
      localStorage.setItem('selectedDirectory', JSON.stringify(selectedDirectory));
    }
  }, [selectedDirectory]);

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleChangeLanguage = (lang) => {
    setLocale(lang);
    setLocaleState(lang);
    forceUpdate({});
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'changePassword') {
      setPasswordModalVisible(true);
    } else if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      message.info('个人信息功能开发中...');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('user.profile'),
    },
    {
      key: 'changePassword',
      icon: <LockOutlined />,
      label: t('user.changePassword'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
    },
  ];

  const languageMenuItems = [
    {
      key: 'zh-CN',
      label: '简体中文',
      onClick: () => handleChangeLanguage('zh-CN'),
    },
    {
      key: 'en-US',
      label: 'English',
      onClick: () => handleChangeLanguage('en-US'),
    },
  ];

  if (!isLoggedIn) {
    return (
      <ConfigProvider locale={locale === 'zh-CN' ? zhCN : enUS}>
        <Login onLoginSuccess={() => {
          const user = authService.getCurrentUser();
          setCurrentUser(user);
          setIsLoggedIn(true);
        }} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={locale === 'zh-CN' ? zhCN : enUS}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529', padding: '0 24px' }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>{t('login.title')}</div>
          <Space size="large">
            <Dropdown menu={{ items: languageMenuItems }} trigger={['click']}>
              <Space style={{ color: 'white', cursor: 'pointer' }}>
                <GlobalOutlined />
                <span>{locale === 'zh-CN' ? '简体中文' : 'English'}</span>
                <DownOutlined />
              </Space>
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} trigger={['click']}>
              <Space style={{ color: 'white', cursor: 'pointer' }}>
                <UserOutlined />
                <span>{currentUser?.name || 'User'}</span>
                <DownOutlined />
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Layout>
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              selectedKeys={[currentView]}
              onClick={({ key }) => setCurrentView(key)}
              style={{ height: '100%', borderRight: 0 }}
              items={[
                { key: 'files', icon: <FileOutlined />, label: t('menu.fileManagement') },
                { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
                { key: 'proposals', icon: <FormOutlined />, label: t('menu.proposalManagement') },
              ]}
            />
          </Sider>
          <Layout>
            <Content style={{ margin: 0, height: 'calc(100vh - 64px)' }}>
              {currentView === 'files' && (
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{
                    width: '350px',
                    minWidth: '250px',
                    maxWidth: '500px',
                    borderRight: '1px solid #f0f0f0',
                    background: '#fafafa',
                    padding: '16px',
                    overflow: 'auto',
                    resize: 'horizontal'
                  }}>
                    <DirectoryTree
                      onSelectDirectory={setSelectedDirectory}
                      selectedDirectoryId={selectedDirectory?.id}
                    />
                  </div>
                  <div style={{ flex: 1, padding: '16px', background: '#fff', overflow: 'auto' }}>
                    {selectedDirectory ? (
                      <>
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px 16px',
                          background: '#fafafa',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FolderOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                          <span style={{ fontSize: '16px', fontWeight: 500 }}>{selectedDirectory.name}</span>
                          <span style={{ color: '#999', fontSize: '14px' }}>({selectedDirectory.path})</span>
                        </div>
                        <FileList directoryId={selectedDirectory.id} key={selectedDirectory.id} />
                      </>
                    ) : (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#999'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <FolderOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
                          <p style={{ fontSize: '16px' }}>{t('directory.selectDirectory')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {currentView === 'users' && (
                <div style={{ padding: '16px', background: '#fff', height: '100%', overflow: 'auto' }}>
                  <UserManagement />
                </div>
              )}
              {currentView === 'proposals' && (
                <div style={{ padding: '16px', background: '#fff', height: '100%', overflow: 'auto' }}>
                  <ProposalList />
                </div>
              )}
            </Content>
          </Layout>
        </Layout>
      </Layout>
      <ChangePassword
        visible={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onSuccess={() => setPasswordModalVisible(false)}
      />
    </ConfigProvider>
  );
}

export default App;
