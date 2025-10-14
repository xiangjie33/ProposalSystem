import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      message.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.roles?.[0]?.name || 'user',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('删除成功');
      loadUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleResetPassword = async (user) => {
    Modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 ${user.name} 的密码吗？新密码将设置为：password123`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.post(`/users/${user.id}/reset-password`);
          message.success('密码重置成功，新密码：password123');
        } catch (error) {
          message.error('密码重置失败');
        }
      },
    });
  };

  const handleApprove = async (user) => {
    try {
      await api.post(`/users/${user.id}/approve`);
      message.success('用户已审核通过');
      loadUsers();
    } catch (error) {
      message.error('审核失败');
    }
  };

  const handleReject = async (user) => {
    try {
      await api.post(`/users/${user.id}/reject`);
      message.success('用户已被拒绝');
      loadUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/users', {
          ...values,
          password: 'password123',
          password_confirmation: 'password123',
        });
        message.success('创建成功，默认密码：password123');
      }
      setModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || '操作失败';
      message.error(errorMsg);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => (
        <>
          {roles?.map(role => (
            <Tag color={role.name === 'admin' ? 'red' : 'blue'} key={role.id}>
              {role.name === 'admin' ? '管理员' : '普通用户'}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待审核' },
          active: { color: 'green', text: '正常' },
          inactive: { color: 'red', text: '已禁用' },
        };
        const config = statusMap[status] || statusMap.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                title="审核通过"
              >
                通过
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
                title="拒绝"
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'active' && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                title="编辑"
              />
              <Button
                size="small"
                icon={<KeyOutlined />}
                onClick={() => handleResetPassword(record)}
                title="重置密码"
              />
            </>
          )}
          <Popconfirm
            title="确定删除此用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              title="删除"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建用户
        </Button>
      </div>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个用户`,
        }}
      />
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="user"
          >
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <div style={{ color: '#999', fontSize: '12px', marginTop: '-8px' }}>
              默认密码：password123
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
