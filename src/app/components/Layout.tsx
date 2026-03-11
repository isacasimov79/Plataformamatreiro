import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Mail,
  FileText,
  Globe,
  BarChart3,
  GraduationCap,
  Award,
  Target,
  FolderTree,
  Zap,
  UserCog,
  Shield,
  Plug,
  Bell,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  Bug,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import logoMatreiro from 'figma:asset/a30d3ade4a75c608bfa9c14ebe020b7e956f0655.png';
import logoUnderProtection from '../../imports/Logo_Positiva_-_Vetor-01.svg';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { getTenants } from '../lib/supabaseApi';

const navigation = [
  { nameKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
  { nameKey: 'nav.analytics', href: '/analytics', icon: TrendingUp },
  { nameKey: 'Analytics Avançado', href: '/enhanced-analytics', icon: BarChart3, badge: 'NEW' },
  { nameKey: 'Biblioteca Templates', href: '/template-library', icon: FileText, badge: 'NEW' },
  { nameKey: 'Gamificação', href: '/gamification', icon: Award, badge: 'NEW' },
  { nameKey: 'Gerador IA', href: '/ai-generator', icon: Zap, badge: 'NEW' },
  { nameKey: 'nav.tenants', href: '/tenants', icon: Building2, requiresSuperAdmin: true },
  { nameKey: 'nav.campaigns', href: '/campaigns', icon: Mail },
  { nameKey: 'nav.templates', href: '/templates', icon: FileText },
  { nameKey: 'nav.landingPages', href: '/landing-pages', icon: Globe },
  { nameKey: 'nav.reports', href: '/reports', icon: BarChart3 },
  { nameKey: 'nav.trainings', href: '/trainings', icon: GraduationCap },
  { nameKey: 'nav.certificates', href: '/certificates', icon: Award },
  { nameKey: 'nav.targets', href: '/targets', icon: Target },
  { nameKey: 'nav.targetGroups', href: '/target-groups', icon: FolderTree },
  { nameKey: 'nav.automations', href: '/automations', icon: Zap },
  { nameKey: 'nav.systemUsers', href: '/system-users', icon: UserCog },
  { nameKey: 'nav.permissions', href: '/permissions', icon: Shield, requiresSuperAdmin: true },
  { nameKey: 'nav.integrations', href: '/integrations', icon: Plug },
  { nameKey: 'nav.notifications', href: '/notifications', icon: Bell },
  { nameKey: 'nav.auditLogs', href: '/audit-logs', icon: FileTextIcon },
  { nameKey: 'nav.settings', href: '/settings', icon: SettingsIcon },
  { nameKey: 'Mock Data', href: '/mock-data', icon: Bug, badge: 'DEV' },
  { nameKey: 'nav.debug', href: '/debug', icon: Bug, requiresSuperAdmin: true },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, impersonatedTenant, logout, impersonateTenant } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<any[]>([]);

  // Carregar tenants para o select de impersonação
  useEffect(() => {
    if (user?.isSuperadmin) {
      loadTenants();
    }
  }, [user]);

  const loadTenants = async () => {
    try {
      const tenantsData = await getTenants();
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-purple-50/20">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#242545] to-[#834a8b] border-b border-[#3a3a5e] flex items-center justify-between px-4 z-50 shadow-lg">
        <div className="bg-white px-3 py-2 rounded-lg flex items-center gap-3 shadow-md">
          <img src={logoMatreiro} alt="Matreiro" className="h-7" />
          <span className="text-xl font-bold text-[#242545]">Matreiro</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-white/20"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar com gradiente */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gradient-to-b from-[#242545] via-[#2d2d51] to-[#242545] border-r border-[#3a3a5e] flex flex-col shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-[#3a3a5e] bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <img src={logoMatreiro} alt="Matreiro" className="h-8" />
            <span className="text-2xl font-bold text-[#242545]">Matreiro</span>
          </div>
        </div>

        {/* User Info & Impersonation */}
        <div className="p-4 border-b border-[#3a3a5e]">
          <div className="mb-3">
            <div className="text-sm font-medium text-white">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            {user?.isSuperadmin && (
              <Badge className="mt-2 text-xs bg-[#834a8b] hover:bg-[#9a5ba1] border-0">
                Superadmin
              </Badge>
            )}
          </div>

          {user?.isSuperadmin && (
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1 block">
                {t('nav.viewingAs')}:
              </label>
              <Select
                value={impersonatedTenant?.id || 'master'}
                onValueChange={(value) =>
                  impersonateTenant(value === 'master' ? null : value)
                }
              >
                <SelectTrigger className="h-8 text-xs bg-[#2d2d51] border-[#3a3a5e] text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d51] border-[#3a3a5e]">
                  <SelectItem value="master" className="text-white hover:bg-[#3a3a5e]">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#834a8b] mr-2" />
                      {t('nav.viewAsMaster')}
                    </div>
                  </SelectItem>
                  {tenants
                    .filter((t) => t.status === 'active')
                    .map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id} className="text-white hover:bg-[#3a3a5e]">
                        <div className="flex items-center">
                          <Building2 className="w-3 h-3 mr-2" />
                          {tenant.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {impersonatedTenant && (
            <div className="mt-2 p-2 bg-[#834a8b]/20 border border-[#834a8b]/30 rounded text-xs">
              <div className="flex items-center text-[#c18ac9]">
                <ChevronRight className="w-3 h-3 mr-1" />
                {t('nav.viewingAs')}: {impersonatedTenant.name}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.href);
              return (
                <li key={item.nameKey}>
                  <Link
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-[#834a8b] text-white font-medium'
                        : 'text-gray-300 hover:bg-[#2d2d51] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {t(item.nameKey)}
                    </div>
                    {(item as any).badge && (
                      <Badge className="text-[10px] px-1.5 py-0.5 bg-green-500 hover:bg-green-600 border-0">
                        {(item as any).badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#3a3a5e]">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-[#2d2d51] hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 relative">
        {/* Top Right Actions - Fixed position */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <NotificationCenter />
          <ThemeToggle />
          <LanguageSelector />
        </div>
        <Outlet />
      </main>
    </div>
  );
}