import { useState, useEffect } from 'react';
import { Tree, Button, Modal, Form, Input, message, Dropdown } from 'antd';
import { FolderOutlined, FolderOpenOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { directoryService } from '../services/directory';
import './DirectoryTree.css';

const DirectoryTree = ({ onSelectDirectory, selectedDirectoryId }) => {
  const [treeData, setTreeData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDir, setEditingDir] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      const data = await directoryService.getTree();
      setTreeData(formatTreeData(data));
      // 默认展开所有节点
      const allKeys = getAllKeys(data);
      setExpandedKeys(allKeys);
    } catch (error) {
      message.error('加载目录失败');
    }
  };

  const getAllKeys = (dirs) => {
    let keys = [];
    dirs.forEach(dir => {
      keys.push(dir.id.toString());
      if (dir.children && dir.children.length > 0) {
        keys = keys.concat(getAllKeys(dir.children));
      }
    });
    return keys;
  };

  const getMenuItems = (dir) => [
    {
      key: 'add',
      icon: <PlusOutlined />,
      label: '新建子目录',
      onClick: () => handleAdd(dir.id),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: () => handleEdit(dir),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '确定删除此目录吗？',
          content: '删除后将无法恢复，且会删除所有子目录和文件',
          okText: '确定',
          cancelText: '取消',
          onOk: () => handleDelete(dir.id),
        });
      },
    },
  ];

  const formatTreeData = (dirs) => {
    return dirs.map(dir => ({
      title: (
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: 'calc(100% - 24px)',
          }}
        >
          <span 
            style={{ 
              flex: 1, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}
            title={dir.name}
          >
            {dir.name}
          </span>
          <Dropdown
            menu={{ items: getMenuItems(dir) }}
            trigger={['click']}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreOutlined 
              style={{ 
                padding: '4px 8px',
                cursor: 'pointer',
                opacity: 0.6,
                flexShrink: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
      key: dir.id.toString(),
      children: dir.children && dir.children.length > 0 ? formatTreeData(dir.children) : undefined,
      data: dir,
      icon: ({ expanded }) => expanded ? <FolderOpenOutlined style={{ color: '#faad14' }} /> : <FolderOutlined style={{ color: '#faad14' }} />,
    }));
  };

  const handleAdd = (parentId = null) => {
    setEditingDir({ parent_id: parentId });
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (dir) => {
    setEditingDir(dir);
    form.setFieldsValue({ name: dir.name });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await directoryService.delete(id);
      message.success('删除成功');
      loadTree();
      if (selectedDirectoryId === id) {
        onSelectDirectory(null);
      }
    } catch (error) {
      message.error('删除失败：' + (error.response?.data?.message || ''));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingDir?.id) {
        await directoryService.update(editingDir.id, values);
        message.success('更新成功');
      } else {
        await directoryService.create({ ...values, parent_id: editingDir?.parent_id });
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      loadTree();
    } catch (error) {
      message.error('操作失败：' + (error.response?.data?.message || ''));
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleAdd()} 
          block
        >
          新建根目录
        </Button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Tree 
          className="directory-tree"
          showIcon
          showLine={false}
          treeData={treeData} 
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          selectedKeys={selectedDirectoryId ? [selectedDirectoryId.toString()] : []}
          onSelect={(keys, info) => {
            if (info.node.data) {
              onSelectDirectory(info.node.data);
            }
          }}
        />
      </div>
      <Modal
        title={editingDir?.id ? '重命名目录' : '新建目录'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item 
            name="name" 
            label="目录名称" 
            rules={[
              { required: true, message: '请输入目录名称' },
              { max: 255, message: '目录名称不能超过255个字符' }
            ]}
          >
            <Input placeholder="请输入目录名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DirectoryTree;
