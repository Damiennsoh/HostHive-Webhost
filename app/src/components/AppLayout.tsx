import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  BarChart3,
  Globe,
  Settings,
  Rocket,
  Github,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { currentUser, notifications } from '@/data/mockData';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: FolderGit2, label: 'Projects', path: '/projects' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Globe, label: 'Domains', path: '/domains' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-[hsl(240_14%_4%)] overflow-hidden">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[260px] bg-[hsl(240_14%_5%)] border-r border-[hsl(240_6%_14%)] p-0"
        >
          <MobileSidebar currentPath={location.pathname} onNavigate={(path) => { navigate(path); setSidebarOpen(false); }} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-[hsl(240_6%_14%)] bg-[hsl(240_14%_5%)] transition-all duration-300 relative ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[hsl(240_6%_14%)]">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo-icon.png"
              alt="HostDesk"
              className="w-8 h-8 min-w-[32px]"
            />
            {!collapsed && (
              <span className="font-semibold text-lg text-white whitespace-nowrap">
                HostDesk
              </span>
            )}
          </div>
        </div>

        {/* Deploy Button */}
        <div className="p-3">
          <Button
            onClick={() => navigate('/deploy')}
            className={`gradient-primary hover:opacity-90 text-white font-medium border-0 ${
              collapsed ? 'w-12 h-12 p-0' : 'w-full'
            }`}
          >
            <Rocket className="h-4 w-4 min-w-[16px]" />
            {!collapsed && <span className="ml-2">Deploy</span>}
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[hsl(25_95%_53%/0.15)] text-[hsl(25_95%_53%)] border border-[hsl(25_95%_53%/0.2)]'
                    : 'text-[hsl(240_5%_65%)] hover:text-white hover:bg-[hsl(240_8%_12%)]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4.5 w-4.5 min-w-[18px]" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* GitHub Connection */}
        <div className="px-3 py-2">
          <button
            onClick={() => navigate('/github-connect')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/github-connect'
                ? 'bg-[hsl(25_95%_53%/0.15)] text-[hsl(25_95%_53%)]'
                : 'text-[hsl(240_5%_65%)] hover:text-white hover:bg-[hsl(240_8%_12%)]'
            }`}
            title={collapsed ? 'GitHub' : undefined}
          >
            <Github className="h-4.5 w-4.5 min-w-[18px]" />
            {!collapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="whitespace-nowrap">GitHub</span>
                {currentUser.githubConnected && (
                  <span className="status-dot status-dot-success" />
                )}
              </div>
            )}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-2 border-t border-[hsl(240_6%_14%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-[hsl(240_6%_14%)] bg-[hsl(240_14%_4%)]">
          <div className="flex items-center gap-4">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 ml-10">
              <img src="/logo-icon.png" alt="HostDesk" className="w-7 h-7" />
              <span className="font-semibold text-white">HostDesk</span>
            </div>
            {/* Page title */}
            <h1 className="hidden lg:block text-lg font-semibold text-white">
              {navItems.find((n) => n.path === location.pathname)?.label ||
                (location.pathname.startsWith('/projects/') ? 'Project' : '') ||
                (location.pathname.startsWith('/env-vars') ? 'Environment Variables' : '') ||
                (location.pathname === '/github-connect' ? 'GitHub' : '') ||
                (location.pathname === '/deploy' ? 'New Deployment' : '') ||
                'Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-[hsl(240_5%_65%)] hover:text-white hover:bg-[hsl(240_8%_12%)] transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[hsl(25_95%_53%)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[hsl(240_12%_8%)] border border-[hsl(240_6%_18%)] rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[hsl(240_6%_14%)]">
                      <h3 className="font-semibold text-white text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-[hsl(240_6%_14%)] last:border-0 ${
                            !n.read ? 'bg-[hsl(25_95%_53%/0.05)]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                n.type === 'deploy_success'
                                  ? 'bg-emerald-500'
                                  : n.type === 'deploy_fail'
                                  ? 'bg-red-500'
                                  : n.type === 'uptime_alert'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{n.title}</p>
                              <p className="text-xs text-[hsl(240_5%_55%)] mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-[hsl(240_5%_45%)] mt-1">
                                {new Date(n.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-2 pl-3 border-l border-[hsl(240_6%_18%)]">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                {currentUser.avatar}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white leading-tight">{currentUser.name}</p>
                <p className="text-xs text-[hsl(240_5%_55%)] leading-tight">{currentUser.plan}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function MobileSidebar({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(240_6%_14%)]">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="HostDesk" className="w-8 h-8" />
          <span className="font-semibold text-lg text-white">HostDesk</span>
        </div>
      </div>
      <div className="p-3">
        <Button
          onClick={() => onNavigate('/deploy')}
          className="w-full gradient-primary hover:opacity-90 text-white font-medium border-0"
        >
          <Rocket className="h-4 w-4 mr-2" />
          Deploy
        </Button>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[hsl(25_95%_53%/0.15)] text-[hsl(25_95%_53%)]'
                  : 'text-[hsl(240_5%_65%)] hover:text-white hover:bg-[hsl(240_8%_12%)]'
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onNavigate('/github-connect')}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentPath === '/github-connect'
              ? 'bg-[hsl(25_95%_53%/0.15)] text-[hsl(25_95%_53%)]'
              : 'text-[hsl(240_5%_65%)] hover:text-white hover:bg-[hsl(240_8%_12%)]'
          }`}
        >
          <Github className="h-4.5 w-4.5" />
          <span>GitHub</span>
        </button>
      </nav>
    </div>
  );
}
