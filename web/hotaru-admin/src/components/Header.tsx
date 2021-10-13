import React, { FC } from 'react';
import { Avatar } from 'antd';
import { UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

interface Props {
  collapsed: {
    isCollapsed: boolean;
    toggleCollapsed: () => void;
  }
}

const Header: FC<Props> = props => {
  const { isCollapsed, toggleCollapsed } = props.collapsed;
  return (
    <div className="h-full flex items-center justify-between">
      {React.createElement(isCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'text-2xl',
        onClick: toggleCollapsed
      })}
      <Avatar size={40} icon={<UserOutlined />} />
    </div>
  );
};

export default Header;
