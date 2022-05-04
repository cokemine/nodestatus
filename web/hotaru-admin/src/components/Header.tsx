import React, { FC } from 'react';
import { Avatar, Dropdown, Menu } from 'antd';
import {
  UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

interface Props {
  collapsed: {
    isCollapsed: boolean;
    toggleCollapsed: () => void;
  }
}

const Header: FC<Props> = props => {
  const history = useHistory();
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
          history.push('/login');
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
