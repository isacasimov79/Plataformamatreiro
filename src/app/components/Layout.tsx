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
} from 'lucide-react';
import logoMatreiro from '../../assets/a30d3ade4a75c608bfa9c14ebe020b7e956f0655.png';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { getTenants } from '../lib/supabaseApi';

const navigationSections = [
  {
    title: 'Monitoramento',
    items: [
      { nameKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
      { nameKey: 'nav.analytics', href: '/analytics', icon: TrendingUp },
      { nameKey: 'Analytics Avançado', href: '/enhanced-analytics', icon: BarChart3, badge: 'NEW' },
      { nameKey: 'nav.reports', href: '/reports', icon: BarChart3 },
    ]
  },
  {
    title: 'Conscientização',
    items: [
      { nameKey: 'nav.campaigns', href: '/campaigns', icon: Mail },
      { nameKey: 'nav.templates', href: '/templates', icon: FileText },
      { nameKey: 'Biblioteca Templates', href: '/template-library', icon: FileText, badge: 'NEW' },
      { nameKey: 'Gerador IA', href: '/ai-generator', icon: Zap, badge: 'NEW' },
      { nameKey: 'nav.trainings', href: '/trainings', icon: GraduationCap },
      { nameKey: 'Gamificação', href: '/gamification', icon: Award, badge: 'NEW' },
      { nameKey: 'nav.certificates', href: '/certificates', icon: Award },
    ]
  },
  {
    title: 'Gestão de Alvos',
    items: [
      { nameKey: 'nav.tenants', href: '/tenants', icon: Building2, requiresSuperAdmin: true },
      { nameKey: 'nav.targets', href: '/targets', icon: Target },
      { nameKey: 'nav.targetGroups', href: '/target-groups', icon: FolderTree },
      { nameKey: 'nav.automations', href: '/automations', icon: Zap },
    ]
  },
  {
    title: 'Configuração',
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
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<any[]>([]);

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
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-[#242545] border-r border-[#3a3a5e] flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-center px-6 border-b border-[#3a3a5e] bg-white">
          <div className="flex items-center gap-2">
            <img src={logoMatreiro} alt="Matreiro" className="h-7" />
            <span className="text-xl font-bold text-[#242545]">Matreiro</span>
          </div>
        </div>

        <div className="p-4 border-b border-[#3a3a5e] bg-[#2d2d51]/50">
          <div className="mb-3">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[11px] text-gray-400 truncate opacity-80">{user?.email}</div>
            {user?.isSuperadmin && (
              <Badge className="mt-2 text-[10px] bg-[#9D4B97] hover:bg-[#b058aa] text-white border-0 py-0 h-4">
                Administrador
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
                  <SelectValue placeholder="Visão do Cliente" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a35] border-[#3a3a5e] text-white">
                  <SelectItem value="master">📊 Visão Master</SelectItem>
                  {tenants.filter(t => t.status === 'active').map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id}>🏢 {tenant.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {impersonatedTenant && (
            <div className="mt-2 p-2 bg-[#9D4B97]/20 border border-[#9D4B97]/30 rounded text-[10px] text-[#e0c7e6] flex items-center">
              <ChevronRight className="w-3 h-3 mr-1" /> Cliente: {impersonatedTenant.name}
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 opacity-50">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  if (item.requiresSuperAdmin && !user?.isSuperadmin) return null;
                  const isActive = item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);
                  return (
                    <li key={item.nameKey}>
                      <Link
                        to={item.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-[#9D4B97]/15 text-[#e0c7e6] font-medium border-l-2 border-[#9D4B97]'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#9D4B97]' : 'text-gray-400 group-hover:text-white'}`} />
                          <span>{item.nameKey.startsWith('nav.') ? t(item.nameKey) : item.nameKey}</span>
                        </div>
                        {item.badge && (
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

        <div className="p-4 border-t border-[#3a3a5e] bg-[#1a1a35]">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:bg-red-500/10 hover:text-red-400 text-xs h-9 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {t('nav.logout')}
          </Button>
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