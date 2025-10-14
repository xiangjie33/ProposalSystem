import { Modal, Form, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import api from '../services/api';

const ChangePassword = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await api.put('/change-password', {
        current_password: values.current_password,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      message.success('密码修改成功');
      form.resetFields();
      onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.message || '密码修改失败';
      message.error(errorMsg);
    }
  };

  return (
    <Modal
      title="修改密码"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="current_password"
          label="当前密码"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
        </Form.Item>
        <Form.Item
          name="password"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码至少8个字符' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码（至少8个字符）" />
        </Form.Item>
        <Form.Item
          name="password_confirmation"
          label="确认新密码"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePassword;
