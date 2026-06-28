import type { FC } from 'react';
import type { RouteObject } from 'react-router-dom';
import React, { lazy } from 'react';
import { useRoutes } from 'react-router-dom';

const Login = lazy(() => import('../pages/Login'));
const LayoutHandler = lazy(() => import('../containers/LayoutHandler'));

const GlobalRoutes: FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/*',
      element: <LayoutHandler />,
    },
  ];

  return useRoutes(routes);
};

export default GlobalRoutes;
