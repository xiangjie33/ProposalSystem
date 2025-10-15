import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../services/api';
import { usePermission } from '../hooks/usePermission';
import DirectoryTreeSelect from './DirectoryTreeSelect';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const { isSuperAdmin } = usePermission();

  useEffect(() => {
    loadUsers();
    loadGroups();
    loadDirectories();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || '加载用户失败';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || '加载工作组失败';
      message.error(errorMsg);
    }
  };

  const loadDirectories = async () => {
    try {
      const response = await api.get('/directories/tree');
      setDirectories(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || '加载目录失败';
      message.error(errorMsg);
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
      role: user.roles?.[0]?.name || 'member',
      status: user.status || 'active',
      groups: user.groups?.map(g => g.id) || [],
      directories: user.directories?.map(d => d.id) || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      message.success(response.data.message || '删除成功');
      loadUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || '删除失败';
      message.error(errorMsg);
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
          const response = await api.post(`/users/${user.id}/reset-password`);
          message.success(response.data.message || '密码重置成功，新密码：password123');
        } catch (error) {
          const errorMsg = error.response?.data?.message || '密码重置失败';
          message.error(errorMsg);
        }
      },
    });
  };

  const handleApprove = async (user) => {
    try {
      const response = await api.post(`/users/${user.id}/approve`);
      message.success(response.data.message || '用户已审核通过');
      loadUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || '审核失败';
      message.error(errorMsg);
    }
  };

  const handleReject = async (user) => {
    try {
      const response = await api.post(`/users/${user.id}/reject`);
      message.success(response.data.message || '用户已被拒绝');
      loadUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || '操作失败';
      message.error(errorMsg);
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
      render: (roles) => {
        const roleMap = {
          super_admin: { color: 'red', text: '超级管理员' },
          admin: { color: 'orange', text: '管理员' },
          senior_member: { color: 'blue', text: '首席会员' },
          member: { color: 'default', text: '普通会员' },
        };
        return (
          <>
            {roles?.map(role => {
              const config = roleMap[role.name] || { color: 'default', text: role.name };
              return (
                <Tag color={config.color} key={role.id}>
                  {config.text}
                </Tag>
              );
            })}
          </>
        );
      },
    },
    {
      title: '工作组',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups) => (
        <>
          {groups?.map(group => (
            <Tag color="cyan" key={group.id}>
              {group.name}
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
            <Input placeholder="请输入姓名" disabled={!!editingUser} />
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
          {editingUser && (
            <div style={{ color: '#999', fontSize: '12px', marginTop: '-16px', marginBottom: '16px' }}>
              注：姓名和邮箱不可修改
            </div>
          )}
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="member"
          >
            <Select>
              {isSuperAdmin && <Select.Option value="admin">管理员</Select.Option>}
              <Select.Option value="senior_member">首席会员</Select.Option>
              <Select.Option value="member">普通会员</Select.Option>
            </Select>
          </Form.Item>
          {editingUser && (
            <Form.Item
              name="status"
              label="账户状态"
              rules={[{ required: true, message: '请选择账户状态' }]}
            >
              <Select>
                <Select.Option value="active">正常</Select.Option>
                <Select.Option value="pending">待审核</Select.Option>
                <Select.Option value="inactive">已禁用</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item
            name="groups"
            label="工作组"
          >
            <Select
              mode="multiple"
              placeholder="请选择工作组"
              allowClear
            >
              {groups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.display_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="directories"
            label="可访问目录"
            extra="不选择则无法访问任何目录，管理员可访问所有目录"
          >
            <DirectoryTreeSelect
              directories={directories}
              placeholder="请选择可访问的目录（支持多级选择）"
            />
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
