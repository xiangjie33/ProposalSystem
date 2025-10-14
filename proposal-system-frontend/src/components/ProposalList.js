import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { proposalService } from '../services/proposal';

const ProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await proposalService.getAll();
      setProposals(data);
    } catch (error) {
      message.error('加载提案失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProposal(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (proposal) => {
    setEditingProposal(proposal);
    form.setFieldsValue(proposal);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await proposalService.delete(id);
      message.success('删除成功');
      loadProposals();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProposal) {
        await proposalService.update(editingProposal.id, values);
        message.success('更新成功');
      } else {
        await proposalService.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadProposals();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        新建提案
      </Button>
      <Table dataSource={proposals} columns={columns} rowKey="id" loading={loading} />
      <Modal
        title={editingProposal ? '编辑提案' : '新建提案'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select>
              <Select.Option value="draft">草稿</Select.Option>
              <Select.Option value="active">活动中</Select.Option>
              <Select.Option value="expired">已过期</Select.Option>
              <Select.Option value="closed">已关闭</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProposalList;
