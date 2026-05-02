"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBasket, 
  Layers, 
  Package, 
  Users, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Bell,
  ShoppingCart,
  ChevronRight,
  Wallet
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, hydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
    if (user) fetchNotifications();
  }, [user, router, hydrated]);

  const markRead = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  if (!hydrated || !user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/sales', label: 'POS / Sales', icon: ShoppingCart },
    { href: '/admin/inventory-value', label: 'Inventory Value', icon: Wallet },
    { href: '/admin/products', label: 'Products', icon: ShoppingBasket },
    { href: '/admin/categories', label: 'Categories', icon: Layers },
    { href: '/admin/stock', label: 'Stock Logs', icon: Package },
    { href: '/admin/customers', label: 'Udhar Customers', icon: Users },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isActive = (item: any) => item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
        style={{ background: 'oklch(0.10 0.015 265)', borderRight: '1px solid oklch(0.20 0.02 265)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border/40">
          <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-lg glow-primary">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white">FreshMart</span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 hover:bg-muted rounded-xl text-muted-foreground lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-3 mb-3">Main Menu</p>
          {menuItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group relative ${
                  active 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
                style={active ? { boxShadow: '0 4px 20px oklch(0.65 0.22 262 / 0.35)' } : {}}
              >
                <item.icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${active ? 'text-white' : ''}`} style={{width: '18px', height: '18px'}} />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="px-4 py-5 border-t border-border/40">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 mb-3">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center font-black text-white text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Administrator</p>
            </div>
          </div>
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-40 glass border-b border-border/40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-medium">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground">
                {menuItems.find(i => isActive(i))?.label || 'Panel'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`relative p-2.5 rounded-xl transition-all ${showNotifDropdown ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-[9px] font-black text-white flex items-center justify-center rounded-full border-2 border-background animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-background border border-border/40 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border/40 bg-muted/30 flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-widest text-foreground">Notifications</span>
                      {unreadCount > 0 && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                          <p className="text-xs font-bold text-muted-foreground">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.isRead && markRead(n.id)}
                            className={`p-4 border-b border-border/10 cursor-pointer transition-colors hover:bg-muted/30 ${!n.isRead ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                n.type === 'LOW_STOCK' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'
                              }`}>
                                {n.type === 'LOW_STOCK' ? <Package className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.isRead ? 'font-black' : 'font-bold'} text-foreground`}>{n.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] font-bold text-muted-foreground/40 mt-2 flex items-center gap-1.5 uppercase tracking-tighter">
                                  {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {!n.isRead && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-muted/20 border-t border-border/40 text-center">
                      <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All Notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center font-black text-white text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none">{user.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-0.5">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
