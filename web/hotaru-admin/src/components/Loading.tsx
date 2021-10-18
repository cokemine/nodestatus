import { Spin } from 'antd';
import React, { FC } from 'react';

const Loading: FC = () => (
  <div
    className="flex items-center justify-center w-full h-screen text-lg font-medium text-gray-600"
    style={{ backgroundColor: '#f0f2f5' }}
  >
    <Spin size="large" tip="Loading..." />
  </div>
);

export default Loading;
