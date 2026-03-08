import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import logoMatreiro from 'figma:asset/a30d3ade4a75c608bfa9c14ebe020b7e956f0655.png';
import {
  LayoutDashboard,
  Building2,
  Mail,
  FileText,
  BarChart3,
  GraduationCap,
  Users,
  Target,
  UserCog,
  Shield,
  Plug,
  Bug,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Zap,
  FolderTree,
  Globe,
  Bell,
  FileText as FileTextIcon,
  TrendingUp,
  Settings as SettingsIcon,
  Award,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { mockTenants } from '../lib/mockData';
import { Badge } from './ui/badge';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Clientes', href: '/tenants', icon: Building2, requiresSuperAdmin: true },
  { name: 'Campanhas', href: '/campaigns', icon: Mail },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Landing Pages', href: '/landing-pages', icon: Globe },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Treinamentos', href: '/trainings', icon: GraduationCap },
  { name: 'Certificados', href: '/certificates', icon: Award },
  { name: 'E-mails Alvo', href: '/targets', icon: Target },
  { name: 'Grupos de Alvos', href: '/target-groups', icon: FolderTree },
  { name: 'Automações', href: '/automations', icon: Zap },
  { name: 'Usuários do Sistema', href: '/system-users', icon: UserCog },
  { name: 'Permissões', href: '/permissions', icon: Shield, requiresSuperAdmin: true },
  { name: 'Integrações', href: '/integrations', icon: Plug },
  { name: 'Notificações', href: '/notifications', icon: Bell },
  { name: 'Logs de Auditoria', href: '/audit-logs', icon: FileTextIcon },
  { name: 'Configurações', href: '/settings', icon: SettingsIcon },
  { name: 'Modo Debug', href: '/debug', icon: Bug, requiresSuperAdmin: true },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, impersonatedTenant, logout, impersonateTenant } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#242545] border-b border-[#3a3a5e] flex items-center justify-between px-4 z-50">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 px-3 py-2 rounded-lg flex items-center gap-3">
          <img src={logoMatreiro} alt="Matreiro" className="h-7" />
          <span className="text-2xl font-bold text-[#242545]">Matreiro</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-[#2d2d51]"
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

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-[#242545] border-r border-[#3a3a5e] flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-[#3a3a5e] bg-gradient-to-br from-pink-50 to-purple-50">
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
                Visualizar como:
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
                      Visão Master
                    </div>
                  </SelectItem>
                  {mockTenants
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
                Visualizando: {impersonatedTenant.name}
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
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-[#834a8b] text-white font-medium'
                        : 'text-gray-300 hover:bg-[#2d2d51] hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
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
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <LanguageSelector />
        <Outlet />
      </main>
    </div>
  );
}