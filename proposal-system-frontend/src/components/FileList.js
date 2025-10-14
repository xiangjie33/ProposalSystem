import { useState, useEffect } from 'react';
import { Table, Button, Upload, message, Popconfirm, Modal, Form, Input, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, FileOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileZipOutlined, FileTextOutlined } from '@ant-design/icons';
import { fileService } from '../services/file';

// 根据文件类型返回对应图标
const getFileIcon = (fileName, mimeType) => {
  const ext = fileName.split('.').pop().toLowerCase();
  const iconStyle = { fontSize: '16px', marginRight: '8px' };
  
  if (mimeType?.includes('pdf') || ext === 'pdf') {
    return <FilePdfOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
  }
  if (mimeType?.includes('word') || ['doc', 'docx'].includes(ext)) {
    return <FileWordOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
  }
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet') || ['xls', 'xlsx'].includes(ext)) {
    return <FileExcelOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
  }
  if (mimeType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) {
    return <FileImageOutlined style={{ ...iconStyle, color: '#faad14' }} />;
  }
  if (mimeType?.includes('zip') || mimeType?.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <FileZipOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
  }
  if (mimeType?.includes('text') || ['txt', 'log', 'md'].includes(ext)) {
    return <FileTextOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
  }
  return <FileOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
};

const FileList = ({ directoryId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (directoryId) {
      loadFiles();
    }
  }, [directoryId]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fileService.getFiles(directoryId);
      setFiles(data);
    } catch (error) {
      message.error('加载文件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      await fileService.upload(file, directoryId);
      message.success('上传成功');
      loadFiles();
    } catch (error) {
      message.error('上传失败');
    }
    return false;
  };

  const handleDownload = async (file) => {
    try {
      const blob = await fileService.download(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      a.click();
    } catch (error) {
      message.error('下载失败');
    }
  };

  const handleEdit = (file) => {
    setEditingFile(file);
    form.setFieldsValue({ name: file.original_name });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await fileService.delete(id);
      message.success('删除成功');
      loadFiles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await fileService.update(editingFile.id, values);
      message.success('重命名成功');
      setModalVisible(false);
      form.resetFields();
      loadFiles();
    } catch (error) {
      message.error('重命名失败');
    }
  };

  const columns = [
    { 
      title: '文件名', 
      dataIndex: 'original_name', 
      key: 'original_name',
      ellipsis: true,
      render: (name, record) => (
        <Space>
          {getFileIcon(name, record.mime_type)}
          <span>{name}</span>
        </Space>
      ),
    },
    { 
      title: '大小', 
      dataIndex: 'size', 
      key: 'size', 
      width: 120,
      render: (size) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
      }
    },
    { 
      title: '上传时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record)}
            title="下载"
          />
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            title="重命名"
          />
          <Popconfirm 
            title="确定删除此文件吗？" 
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
        <Upload 
          beforeUpload={handleUpload} 
          showUploadList={false}
          multiple
        >
          <Button type="primary" icon={<UploadOutlined />}>
            上传文件
          </Button>
        </Upload>
      </div>
      <Table 
        dataSource={files} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个文件`,
        }}
        locale={{
          emptyText: '暂无文件，请上传文件'
        }}
      />
      <Modal
        title="重命名文件"
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item 
            name="name" 
            label="文件名" 
            rules={[
              { required: true, message: '请输入文件名' },
              { max: 255, message: '文件名不能超过255个字符' }
            ]}
          >
            <Input placeholder="请输入新的文件名" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FileList;
