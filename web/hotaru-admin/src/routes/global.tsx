import { lazy } from 'react';

const routes = [
  {
    path: '/login',
    component: lazy(() => import('../pages/Login'))
  },
  {
    path: '/',
    exact: false,
    component: lazy(() => import('../containers/LayoutHandler'))
  }
];

export default routes;
