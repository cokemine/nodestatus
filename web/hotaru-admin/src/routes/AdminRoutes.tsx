import React, { FC } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Management from '../pages/Management';
import Incidents from '../pages/Incidents';
import type { RouteObject } from 'react-router-dom';

const AdminRoutes: FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/dashboard',
      element: <Dashboard />
    },
    {
      path: '/management',
      element: <Management />
    },
    {
      path: '/incidents',
      element: <Incidents />
    },
    {
      path: '/',
      element: <Navigate to="/dashboard" />
    }
  ];

  return useRoutes(routes);
};

export default AdminRoutes;
