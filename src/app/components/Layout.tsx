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
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import logoMatreiro from '../../assets/a30d3ade4a75c608bfa9c14ebe020b7e956f0655.png';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { getTenants } from '../lib/apiLocal';

const navigationSections = [
  {
    titleKey: 'nav.sections.monitoring',
    items: [
      { nameKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
      { nameKey: 'nav.analytics', href: '/analytics', icon: TrendingUp },
      { nameKey: 'nav.advancedAnalytics', href: '/enhanced-analytics', icon: BarChart3, badge: 'NEW' },
      { nameKey: 'nav.reports', href: '/reports', icon: BarChart3 },
    ]
  },
  {
    titleKey: 'nav.sections.awareness',
    items: [
      { nameKey: 'nav.campaigns', href: '/campaigns', icon: Mail },
      { nameKey: 'nav.templates', href: '/templates', icon: FileText },
      { nameKey: 'nav.templateLibrary', href: '/template-library', icon: FileText, badge: 'NEW' },
      { nameKey: 'nav.aiGenerator', href: '/ai-generator', icon: Zap, badge: 'NEW' },
      { nameKey: 'nav.trainings', href: '/trainings', icon: GraduationCap },
      { nameKey: 'nav.gamification', href: '/gamification', icon: Award, badge: 'NEW' },
      { nameKey: 'nav.certificates', href: '/certificates', icon: Award },
    ]
  },
  {
    titleKey: 'nav.sections.targetManagement',
    items: [
      { nameKey: 'nav.tenants', href: '/tenants', icon: Building2, requiresSuperAdmin: true },
      { nameKey: 'nav.targets', href: '/targets', icon: Target },
      { nameKey: 'nav.targetGroups', href: '/target-groups', icon: FolderTree },
      { nameKey: 'nav.automations', href: '/automations', icon: Zap },
    ]
  },
  {
    titleKey: 'nav.sections.configuration',
    items: [
      { nameKey: 'nav.systemUsers', href: '/system-users', icon: UserCog },
      { nameKey: 'nav.permissions', href: '/permissions', icon: Shield, requiresSuperAdmin: true },
      { nameKey: 'nav.integrations', href: '/integrations', icon: Plug },
      { nameKey: 'nav.notifications', href: '/notifications', icon: Bell },
      { nameKey: 'nav.auditLogs', href: '/audit-logs', icon: FileTextIcon },
      { nameKey: 'nav.settings', href: '/settings', icon: SettingsIcon },
      { nameKey: 'nav.debug', href: '/debug', icon: Bug, requiresSuperAdmin: true },
    ]
  }
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, impersonatedTenant, logout, impersonateTenant } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('matreiro-sidebar-collapsed') === 'true';
  });
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    if (user?.isSuperadmin) {
      loadTenants();
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('matreiro-sidebar-collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-purple-50/20 dark:from-slate-950 dark:to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#242545] border-b border-[#3a3a5e] flex items-center justify-between px-4 z-50 shadow-lg">
        <div className="bg-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
          <img src={logoMatreiro} alt="Matreiro" className="h-6" />
          <span className="text-lg font-bold text-[#242545]">Matreiro</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <aside
        data-sidebar
        className={`
          text-[#b0b1d0]
          fixed lg:static inset-y-0 left-0 z-40
          ${isSidebarCollapsed ? 'w-[68px]' : 'w-64'} 
          bg-[#242545] border-r border-[#3a3a5e] flex flex-col shadow-2xl
          transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#3a3a5e] bg-white flex-shrink-0">
          <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <img src={logoMatreiro} alt="Matreiro" className="h-7 flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold text-[#242545] whitespace-nowrap">Matreiro</span>
            )}
          </div>
        </div>

        {/* User Info - hidden when collapsed */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-b border-[#3a3a5e] bg-[#2d2d51]/50 flex-shrink-0">
            <div className="mb-3">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-[#7C7EAA] truncate">{user?.email}</div>
              {user?.isSuperadmin && (
                <Badge className="mt-2 text-[10px] bg-[#9D4B97] hover:bg-[#b058aa] text-white border-0 py-0 h-4">
                  {t('nav.admin')}
                </Badge>
              )}
            </div>

            {user?.isSuperadmin && (
              <div className="mt-3">
                <Select
                  value={impersonatedTenant?.id || 'master'}
                  onValueChange={(value) => impersonateTenant(value === 'master' ? null : value)}
                >
                  <SelectTrigger className="h-8 text-[11px] bg-[#1a1a35] border-[#3a3a5e] text-white focus:ring-0">
                    <SelectValue placeholder={t('nav.clientView')} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a35] border-[#3a3a5e] text-white">
                    <SelectItem value="master">📊 {t('nav.masterView')}</SelectItem>
                    {tenants.filter(t => t.status === 'active').map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>🏢 {tenant.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {impersonatedTenant && (
              <div className="mt-2 p-2 bg-[#9D4B97]/20 border border-[#9D4B97]/30 rounded text-[10px] text-[#e0c7e6] flex items-center">
                <ChevronRight className="w-3 h-3 mr-1 flex-shrink-0" /> {t('common.client', 'Cliente')}: {impersonatedTenant.name}
              </div>
            )}
          </div>
        )}

        {/* Collapsed User Avatar */}
        {isSidebarCollapsed && (
          <div className="p-2 border-b border-[#3a3a5e] bg-[#2d2d51]/50 flex-shrink-0 flex justify-center">
            <div className="w-9 h-9 rounded-full bg-[#9D4B97] flex items-center justify-center text-white text-sm font-bold" title={user?.name || ''}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto custom-scrollbar space-y-4">
          {navigationSections.map((section) => (
            <div key={section.titleKey}>
              {!isSidebarCollapsed && (
                <h3 className="px-3 text-[10px] font-bold text-[#7C7EAA] uppercase tracking-[0.15em] mb-2">
                  {t(section.titleKey)}
                </h3>
              )}
              {isSidebarCollapsed && (
                <div className="h-px bg-[#3a3a5e] mx-2 mb-2" />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  if (item.requiresSuperAdmin && !user?.isSuperadmin) return null;
                  const isActive = item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);
                  const label = item.nameKey.startsWith('nav.') ? t(item.nameKey) : item.nameKey;
                  return (
                    <li key={item.nameKey}>
                      <Link
                        to={item.href}
                        onClick={closeMobileMenu}
                        title={isSidebarCollapsed ? label : undefined}
                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-[#9D4B97]/15 text-[#e0c7e6] font-medium border-l-2 border-[#9D4B97]'
                            : 'text-[#b0b1d0] hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className={`flex items-center ${isSidebarCollapsed ? '' : 'gap-3'}`}>
                          <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#9D4B97]' : 'text-[#7C7EAA] group-hover:text-white'}`} />
                          {!isSidebarCollapsed && (
                            <span className="text-inherit">{label}</span>
                          )}
                        </div>
                        {!isSidebarCollapsed && item.badge && (
                          <span className="text-[9px] bg-[#9D4B97] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom: Collapse toggle + Logout */}
        <div className="border-t border-[#3a3a5e] bg-[#1a1a35] flex-shrink-0 p-2 space-y-1">
          {/* Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} w-full py-2 rounded-lg text-xs transition-all duration-200 hover:bg-white/10 cursor-pointer text-[#7C7EAA]`}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
                <span className="text-inherit">{t('nav.collapseMenu')}</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={isSidebarCollapsed ? t('nav.logout') : undefined}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} w-full py-2 rounded-lg text-xs transition-all duration-200 hover:bg-red-500/10 cursor-pointer text-[#7C7EAA]`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="text-inherit">{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 relative bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <NotificationCenter />
          <ThemeToggle />
          <LanguageSelector />
        </div>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}