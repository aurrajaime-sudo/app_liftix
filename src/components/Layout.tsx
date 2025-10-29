import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationCenter } from './NotificationCenter';
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  AlertTriangle,
  ClipboardList,
  Package,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  Map,
  BookOpen,
  QrCode,
  BarChart3,
  Building,
  User as UserIcon,
  ShieldCheck,
  FolderOpen,
  TrendingUp,
  Shield,
  Activity,
  CalendarRange,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onNavigate?: (path: string) => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: string[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard', roles: ['developer', 'admin', 'technician', 'client'] },
  { label: 'Mi Perfil', icon: UserIcon, path: 'profile', roles: ['developer', 'admin', 'technician', 'client'] },
  { label: 'Checklist Mantenimiento', icon: ClipboardList, path: 'maintenance-checklist', roles: ['developer', 'admin', 'technician'] },
  { label: 'Certificaciones', icon: ShieldCheck, path: 'certifications', roles: ['developer', 'admin'] },
  { label: 'Histórico PDFs', icon: FolderOpen, path: 'pdf-history', roles: ['developer', 'admin'] },
  { label: 'Estadísticas', icon: TrendingUp, path: 'statistics', roles: ['developer', 'admin'] },
  { label: 'Operaciones Masivas', icon: CalendarRange, path: 'bulk-operations', roles: ['developer', 'admin'] },
  { label: 'Registro de Auditoría', icon: Shield, path: 'audit-logs', roles: ['developer', 'admin'] },
  { label: 'Historial de Actividad', icon: Activity, path: 'activity-history', roles: ['developer', 'admin', 'technician', 'client'] },
  { label: 'Usuarios', icon: Users, path: 'users', roles: ['developer', 'admin'] },
  { label: 'Clientes', icon: Building, path: 'clients', roles: ['developer', 'admin'] },
  { label: 'Ascensores', icon: Wrench, path: 'elevators', roles: ['developer', 'admin', 'technician', 'client'] },
  { label: 'Mantenimientos', icon: Calendar, path: 'maintenance', roles: ['developer', 'admin', 'technician'] },
  { label: 'Emergencias', icon: AlertTriangle, path: 'emergencies', roles: ['developer', 'admin', 'technician', 'client'] },
  { label: 'Órdenes de Trabajo', icon: FileText, path: 'work-orders', roles: ['developer', 'admin', 'technician'] },
  { label: 'Rutas', icon: Map, path: 'routes', roles: ['developer', 'admin', 'technician'] },
  { label: 'Cotizaciones', icon: BarChart3, path: 'quotations', roles: ['developer', 'admin', 'client'] },
  { label: 'Inventario', icon: Package, path: 'inventory', roles: ['developer', 'admin'] },
  { label: 'Manuales Técnicos', icon: BookOpen, path: 'manuals', roles: ['developer', 'admin', 'technician'] },
  { label: 'Códigos QR', icon: QrCode, path: 'qr-codes', roles: ['developer', 'admin'] },
  { label: 'Notificaciones', icon: Bell, path: 'notifications', roles: ['developer', 'admin', 'technician', 'client'] },
  { label: 'Configuración', icon: Settings, path: 'settings', roles: ['developer', 'admin'] },
];

export function Layout({ children, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const filteredNavigation = navigation.filter(item =>
    profile && item.roles.includes(profile.role)
  );

  const handleNavigation = (path: string) => {
    setCurrentView(path);
    setSidebarOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-circular (2).png"
              alt="MIREGA"
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">MIREGA</h1>
              <p className="text-xs text-gray-600">Ascensores</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter onNavigate={handleNavigation} />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 hidden lg:block">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-circular (2).png"
                  alt="MIREGA Ascensores"
                  className="h-12 w-auto"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MIREGA</h1>
                  <p className="text-sm text-gray-600">Ascensores</p>
                </div>
              </div>
              <NotificationCenter onNavigate={handleNavigation} />
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 lg:mt-0 mt-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {profile?.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{profile?.full_name}</p>
                <p className="text-xs text-gray-600 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.path === 'notifications' && notificationCount > 0 && (
                    <span className="ml-auto bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
