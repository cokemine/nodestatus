import Dashboard from '../pages/Dashboard';
import Management from '../pages/Management';
import Incidents from '../pages/Incidents';

const routes = [
  {
    path: '/dashboard',
    component: Dashboard
  },
  {
    path: '/management',
    component: Management
  },
  {
    path: '/incidents',
    component: Incidents
  }
];

export default routes;
