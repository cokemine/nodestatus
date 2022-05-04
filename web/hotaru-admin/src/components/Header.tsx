import React, { FC } from 'react';
import { Avatar, Dropdown, Menu } from 'antd';
import {
  UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Props {
  collapsed: {
    isCollapsed: boolean;
    toggleCollapsed: () => void;
  }
}

const Header: FC<Props> = props => {
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapsed } = props.collapsed;

  const menu = (
    <Menu
      items={[
        {
          key: 'logout',
          label: 'Logout',
          icon: <LogoutOutlined className="mr-2 align-middle" />,
          className: 'align-middle'
        }
      ]}
      onClick={({ key }) => {
        if (key === 'logout') {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }}
    />
  );

  return (
    <div className="h-full flex items-center justify-between">
      {React.createElement(isCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'text-2xl',
        onClick: toggleCollapsed
      })}
      <Dropdown overlay={menu} placement="bottom">
        <Avatar size={40} icon={<UserOutlined />} />
      </Dropdown>
    </div>
  );
};

export default Header;
