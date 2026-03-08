import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tenants } from './pages/Tenants';
import { Campaigns } from './pages/Campaigns';
import { Templates } from './pages/Templates';
import { Reports } from './pages/Reports';
import { Trainings } from './pages/Trainings';
import { Targets } from './pages/Targets';
import TargetsImport from './pages/TargetsImport';
import { TargetGroups } from './pages/TargetGroups';
import { Automations } from './pages/Automations';
import { SystemUsers } from './pages/SystemUsers';
import Permissions from './pages/Permissions';
import Integrations from './pages/Integrations';
import { Debug } from './pages/Debug';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'tenants', Component: Tenants },
          { path: 'campaigns', Component: Campaigns },
          { path: 'templates', Component: Templates },
          { path: 'reports', Component: Reports },
          { path: 'trainings', Component: Trainings },
          { path: 'targets', Component: Targets },
          { path: 'targets/import', Component: TargetsImport },
          { path: 'target-groups', Component: TargetGroups },
          { path: 'automations', Component: Automations },
          { path: 'system-users', Component: SystemUsers },
          { path: 'permissions', Component: Permissions },
          { path: 'integrations', Component: Integrations },
          { path: 'debug', Component: Debug },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);