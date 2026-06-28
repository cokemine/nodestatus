import type { FC } from 'react';
import { Layout as AntdLayout, Drawer } from 'antd';
import React, { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Sider from '../components/Sider';
import { StatusContextProvider } from '../context/StatusContext';
import AdminRoutes from '../routes/AdminRoutes';

const Layout: FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed(state => !state);
  return (
    <AntdLayout className="min-h-screen">
      {/* Desktop SideBar */}
      <AntdLayout.Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        trigger={null}
        className="hidden lg:block"
      >
        <Sider isCollapsed={collapsed} />
      </AntdLayout.Sider>
      {/* Mobile SideBar */}
      <Drawer
        placement="left"
        className="block lg:hidden"
        visible={collapsed}
        onClose={() => setCollapsed(false)}
        width={208}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
        closeIcon={null}
      >
        <Sider isCollapsed={collapsed} />
      </Drawer>
      <AntdLayout>
        <AntdLayout.Header className="bg-white py-2 pl-6 shadow">
          <Header collapsed={{ isCollapsed: collapsed, toggleCollapsed }} />
        </AntdLayout.Header>
        <AntdLayout.Content>
          <div className="container mx-auto px-6 max-w-screen-xl">
            <StatusContextProvider>
              <AdminRoutes />
            </StatusContextProvider>
          </div>
        </AntdLayout.Content>
        <AntdLayout.Footer>
          <Footer />
        </AntdLayout.Footer>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;
