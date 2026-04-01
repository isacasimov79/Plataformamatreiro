import { createHashRouter } from 'react-router';
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
import { LandingPages } from './pages/LandingPages';
import { Notifications } from './pages/Notifications';
import { AuditLogs } from './pages/AuditLogs';
import { AdvancedDashboard } from './pages/AdvancedDashboard';
import { Settings } from './pages/Settings';
import { Certificates } from './pages/Certificates';
import { AuthBoundary } from './components/AuthBoundary';
import { EnhancedAnalyticsPage } from './pages/EnhancedAnalyticsPage';
import { TemplateLibraryPage } from './pages/TemplateLibraryPage';
import { GamificationPage } from './pages/GamificationPage';
import { AIGeneratorPage } from './pages/AIGeneratorPage';
import { MockDataPage } from './pages/MockDataPage';

// createHashRouter usa window.location.hash para rotas (suporta URLs como /#/gamification)
export const router = createHashRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: AuthBoundary,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'analytics', Component: AdvancedDashboard },
          { path: 'enhanced-analytics', Component: EnhancedAnalyticsPage },
          { path: 'template-library', Component: TemplateLibraryPage },
          { path: 'gamification', Component: GamificationPage },
          { path: 'ai-generator', Component: AIGeneratorPage },
          { path: 'mock-data', Component: MockDataPage },
          { path: 'tenants', Component: Tenants },
          { path: 'campaigns', Component: Campaigns },
          { path: 'templates', Component: Templates },
          { path: 'landing-pages', Component: LandingPages },
          { path: 'reports', Component: Reports },
          { path: 'trainings', Component: Trainings },
          { path: 'certificates', Component: Certificates },
          { path: 'targets', Component: Targets },
          { path: 'targets/import', Component: TargetsImport },
          { path: 'target-groups', Component: TargetGroups },
          { path: 'automations', Component: Automations },
          { path: 'system-users', Component: SystemUsers },
          { path: 'permissions', Component: Permissions },
          { path: 'integrations', Component: Integrations },
          { path: 'notifications', Component: Notifications },
          { path: 'audit-logs', Component: AuditLogs },
          { path: 'settings', Component: Settings },
          { path: 'debug', Component: Debug },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);