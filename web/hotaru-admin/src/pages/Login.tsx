import React, { FC, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { useSWRConfig } from 'swr';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { notify } from '../utils';

/* https://unsplash.com/photos/McsNra2VRQQ */
import cherry from '../assets/img/cherry.jpg';
/* https://www.tbs.co.jp/anime/adashima/ */
import loginBackground from '../assets/img/bg_howatama.png';

import type { IResp } from '../types';

const Login: FC = () => {
  const history = useHistory();
  const { mutate } = useSWRConfig();

  const onFinish = useCallback(async (values: { username: string, password: string }) => {
    const { username, password } = values;
    const res = await axios.post<IResp<string>>('/api/session', { username, password });
    const { data } = res;
    if (!data.code) {
      notify('Success', undefined, 'success');
      localStorage.setItem('token', data.data);
      mutate('/api/session', { code: 0, msg: 'OK', data: null }, false).then(() => history.push('/dashboard'));
    }
  }, [history, mutate]);

  return (
    <div
      className="flex items-center min-h-screen p-6 bg-violet-50"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="flex-1 h-full max-w-xl md:max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="h-60 md:h-auto md:w-1/2">
            <img
              aria-hidden="true"
              className="object-cover w-full h-full"
              src={cherry}
              alt="Office"
            />
          </div>
          <div className="flex flex-col items-center justify-center p-6 sm:p-16 md:w-1/2">
            <h1 className="text-2xl font-semibold text-gray-700 mb-6">NodeStatus</h1>
            <Form
              className="w-full"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your Username!' }]}
              >
                <Input size="large" prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your Password!' }]}
              >
                <Input
                  size="large"
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" size="large" htmlType="submit" block>
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
