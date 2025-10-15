import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Select, Transfer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import groupService from '../services/group';
import api from '../services/api';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [targetKeys, setTargetKeys] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (error) {
      message.error('加载工作组失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      message.error('加载用户失败');
    }
  };

  const handleAdd = () => {
    setEditingGroup(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    form.setFieldsValue({
      name: group.name,
      description: group.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await groupService.delete(id);
      message.success('删除成功');
      loadGroups();
    } catch (error) {
      const errorMsg = error.response?.data?.message || '删除失败';
      message.error(errorMsg);
    }
  };

  const handleManageMembers = (group) => {
    setSelectedGroup(group);
    const memberIds = group.users?.map(u => u.id) || [];
    setTargetKeys(memberIds);
    setMemberModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingGroup) {
        await groupService.update(editingGroup.id, values);
        message.success('更新成功');
      } else {
        await groupService.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      loadGroups();
    } catch (error) {
      const errorMsg = error.response?.data?.message || '操作失败';
      message.error(errorMsg);
    }
  };

  const handleMemberChange = async (newTargetKeys) => {
    const oldKeys = targetKeys;
    const added = newTargetKeys.filter(key => !oldKeys.includes(key));
    const removed = oldKeys.filter(key => !newTargetKeys.includes(key));

    try {
      // 添加新成员
      for (const userId of added) {
        await groupService.addUser(selectedGroup.id, userId);
      }

      // 移除成员
      for (const userId of removed) {
        await groupService.removeUser(selectedGroup.id, userId);
      }

      setTargetKeys(newTargetKeys);
      message.success('成员更新成功');
      loadGroups();
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
      title: '工作组名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '成员数',
      dataIndex: 'users',
      key: 'users_count',
      render: (users) => (
        <Tag color="blue">{users?.length || 0} 人</Tag>
      ),
    },
    {
      title: '是否默认组',
      dataIndex: 'is_default',
      key: 'is_default',
      render: (isDefault) => (
        <Tag color={isDefault ? 'green' : 'default'}>
          {isDefault ? '是' : '否'}
        </Tag>
      ),
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<TeamOutlined />}
            onClick={() => handleManageMembers(record)}
            title="管理成员"
          >
            成员
          </Button>
          {!record.is_default && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                title="编辑"
              />
              <Popconfirm
                title="确定删除此工作组吗？"
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
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建工作组
        </Button>
      </div>
      <Table
        dataSource={groups}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个工作组`,
        }}
      />
      <Modal
        title={editingGroup ? '编辑工作组' : '新建工作组'}
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
            label="工作组名称"
            rules={[{ required: true, message: '请输入工作组名称' }]}
          >
            <Input placeholder="请输入工作组名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea 
              placeholder="请输入工作组描述" 
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={`管理工作组成员 - ${selectedGroup?.name}`}
        open={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setMemberModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        <Transfer
          dataSource={users.map(user => ({
            key: user.id,
            title: `${user.name} (${user.email})`,
            description: user.roles?.map(r => r.name).join(', '),
          }))}
          titles={['可用用户', '工作组成员']}
          targetKeys={targetKeys}
          onChange={handleMemberChange}
          render={item => item.title}
          listStyle={{
            width: 300,
            height: 400,
          }}
          showSearch
          filterOption={(inputValue, item) =>
            item.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
          }
        />
      </Modal>
    </div>
  );
};

export default GroupManagement;
