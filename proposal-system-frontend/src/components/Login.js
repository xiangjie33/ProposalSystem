import { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { authService } from '../services/auth';
import Captcha from './Captcha';

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [captchaCode, setCaptchaCode] = useState('');
  const [registerCaptchaCode, setRegisterCaptchaCode] = useState('');

  const onLogin = async (values) => {
    // 验证码检查
    if (values.captcha.toLowerCase() !== captchaCode.toLowerCase()) {
      message.error('验证码错误');
      return;
    }

    setLoading(true);
    try {
      await authService.login(values.email, values.password);
      message.success('登录成功');
      onLoginSuccess();
    } catch (error) {
      message.error('登录失败：' + (error.response?.data?.message || '请检查邮箱和密码'));
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values) => {
    // 验证码检查
    if (values.captcha.toLowerCase() !== registerCaptchaCode.toLowerCase()) {
      message.error('验证码错误');
      return;
    }

    setLoading(true);
    try {
      await authService.register(values.name, values.email, values.password, values.password_confirmation);
      message.success('注册成功！请等待管理员审核后登录');
      registerForm.resetFields();
    } catch (error) {
      const errorMsg = error.response?.data?.message || '注册失败';
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach(err => message.error(err));
      } else {
        message.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginTab = (
    <Form form={loginForm} onFinish={onLogin}>
      <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}>
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item name="captcha" rules={[{ required: true, message: '请输入验证码' }]}>
        <Space.Compact style={{ width: '100%' }}>
          <Input prefix={<SafetyOutlined />} placeholder="验证码" style={{ flex: 1 }} />
          <Captcha onChange={setCaptchaCode} />
        </Space.Compact>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  const registerTab = (
    <Form form={registerForm} onFinish={onRegister}>
      <Alert
        message="注册须知"
        description="注册后需要等待管理员审核通过才能登录使用"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
        <Input prefix={<UserOutlined />} placeholder="姓名" />
      </Form.Item>
      <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}>
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, min: 8, message: '密码至少8个字符' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="密码（至少8个字符）" />
      </Form.Item>
      <Form.Item 
        name="password_confirmation" 
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
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
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
      </Form.Item>
      <Form.Item name="captcha" rules={[{ required: true, message: '请输入验证码' }]}>
        <Space.Compact style={{ width: '100%' }}>
          <Input prefix={<SafetyOutlined />} placeholder="验证码" style={{ flex: 1 }} />
          <Captcha onChange={setRegisterCaptchaCode} />
        </Space.Compact>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          注册
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card title="提案系统" style={{ width: 400 }}>
        <Tabs
          defaultActiveKey="login"
          items={[
            { key: 'login', label: '登录', children: loginTab },
            { key: 'register', label: '注册', children: registerTab },
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;
