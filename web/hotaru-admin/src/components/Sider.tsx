import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import {
  DashboardOutlined, ProfileFilled, AlertFilled
} from '@ant-design/icons';
import logo from '../assets/img/logo.png';
import smallLogo from '../assets/img/logo.svg';

const menus = [
  {
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    key: '/dashboard'
  },
  {
    label: 'Management',
    icon: <ProfileFilled />,
    key: '/management'
  },
  {
    label: 'Incidents',
    icon: <AlertFilled />,
    key: '/incidents'
  }
].map(menu => ({
  ...menu,
  className: 'h-12',
  style: { lineHeight: '3rem' }
}));

interface Props {
  isCollapsed: boolean;
}

const Sider: FC<Props> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  return (
    <>
      <img src={logo} alt="" className="m-auto p-4 lg:hidden" draggable="false" />
      <img
        src={isCollapsed ? smallLogo : logo}
        alt=""
        className="hidden lg:inline-block  m-auto p-4"
        draggable="false"
      />
      <Menu
        theme="dark"
        mode="inline"
        items={menus}
        onClick={({ key }) => navigate(key)}
      />
    </>
  );
};

export default Sider;
