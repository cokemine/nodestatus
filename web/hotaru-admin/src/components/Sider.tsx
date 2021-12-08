import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'antd';
import {
  DashboardOutlined, ProfileFilled, AlertFilled
} from '@ant-design/icons';
import logo from '../assets/img/logo.png';
import smallLogo from '../assets/img/logo.svg';

const menus = [
  {
    title: 'Dashboard',
    icon: <DashboardOutlined />,
    link: '/dashboard'
  },
  {
    title: 'Management',
    icon: <ProfileFilled />,
    link: '/management'
  },
  {
    title: 'Incidents',
    icon: <AlertFilled />,
    link: '/incidents'
  }
];

interface Props {
  isCollapsed: boolean;
}

const Sider: FC<Props> = ({ isCollapsed }) => (
  <>
    <img src={logo} alt="" className="m-auto p-4 lg:hidden" draggable="false" />
    <img
      src={isCollapsed ? smallLogo : logo}
      alt=""
      className="hidden lg:inline-block  m-auto p-4"
      draggable="false"
    />
    <Menu theme="dark" mode="inline">
      {
          menus.map((item, i) => (
            <Menu.Item key={i} icon={item.icon} className="h-12" style={{ lineHeight: '3rem' }}>
              <NavLink to={item.link}>{item.title}</NavLink>
            </Menu.Item>
          ))
        }
    </Menu>
  </>
);

export default Sider;
