import type { FC } from 'react';
import type { RouteObject } from 'react-router-dom';
import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Incidents from '../pages/Incidents';
import Management from '../pages/Management';

const AdminRoutes: FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/dashboard',
      element: <Dashboard />,
    },
    {
      path: '/management',
      element: <Management />,
    },
    {
      path: '/incidents',
      element: <Incidents />,
    },
    {
      path: '/',
      element: <Navigate to="/dashboard" />,
    },
  ];

  return useRoutes(routes);
};

export default AdminRoutes;
