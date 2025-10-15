import { useState, useEffect } from 'react';
import { Modal, Button, message, Descriptions, Tag } from 'antd';
import api from '../services/api';

const UserProfile = ({ visible, onCancel }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (visible) {
      loadUserInfo();
    }
  }, [visible]);

  const loadUserInfo = async () => {
    try {
      const response = await api.get('/me');
      const user = response.data.user;
      setUserInfo(user);
    } catch (error) {
      message.error('加载用户信息失败');
    }
  };
  
  const getRoleDisplay = (roleName) => {
    const roleMap = {
      super_admin: { color: 'red', text: '超级管理员' },
      admin: { color: 'orange', text: '管理员' },
      senior_member: { color: 'blue', text: '首席会员' },
      member: { color: 'default', text: '普通会员' },
    };
    return roleMap[roleName] || { color: 'default', text: roleName };
  };

  return (
    <Modal
      title="个人信息"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>
      ]}
      width={600}
    >
      {userInfo && (
        <>
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="姓名">
              {userInfo.name}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {userInfo.email}
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              {userInfo.roles?.map(role => {
                const config = getRoleDisplay(role.name);
                return (
                  <Tag color={config.color} key={role.id}>
                    {config.text}
                  </Tag>
                );
              })}
            </Descriptions.Item>
            <Descriptions.Item label="工作组">
              {userInfo.groups?.length > 0 ? (
                userInfo.groups.map(group => (
                  <Tag color="cyan" key={group.id}>
                    {group.display_name}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#999' }}>未加入任何工作组</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="账户状态">
              {userInfo.status === 'active' ? (
                <Tag color="green">正常</Tag>
              ) : userInfo.status === 'pending' ? (
                <Tag color="orange">待审核</Tag>
              ) : (
                <Tag color="red">已禁用</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">
              {new Date(userInfo.created_at).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
          
          <div style={{ color: '#999', fontSize: '12px', marginBottom: 16 }}>
            注：以上信息仅供查看，如需修改角色、工作组等信息，请联系管理员
          </div>
        </>
      )}
      
      <div style={{ color: '#999', fontSize: '12px', marginBottom: 8, marginTop: -8 }}>
        提示：个人信息仅供查看，暂不支持修改
      </div>
    </Modal>
  );
};

export default UserProfile;
