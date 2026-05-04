"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Clock,
  CircleDollarSign,
  ShoppingCart,
  ArrowUpRight,
  Zap,
  Activity,
  Banknote,
  CreditCard,
  TrendingDown
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-36 shimmer rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map(i => <div key={i} className="h-48 shimmer rounded-3xl" />)}
      </div>
    </div>
  );

  const statCards = [
    {
      label: 'Today\'s Revenue',
      value: `Rs. ${(stats?.todayRevenue || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`,
      icon: Banknote,
      gradient: 'gradient-primary', glow: 'glow-primary',
      description: 'Cash + Udhar sales today',
    },
    {
      label: 'Today\'s Profit',
      value: `Rs. ${(stats?.todayProfit || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      gradient: 'gradient-emerald', glow: 'glow-emerald',
      description: 'Net profit after cost of goods',
    },
    {
      label: 'Outstanding Udhar',
      value: `Rs. ${(stats?.totalUdhar || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`,
      icon: Users,
      gradient: 'gradient-rose', glow: 'glow-rose',
      description: 'Total pending credit balance',
    },
    {
      label: 'Stock Value',
      value: `Rs. ${(stats?.totalStockValue || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`,
      icon: CircleDollarSign,
      gradient: 'gradient-amber', glow: '',
      description: 'Buy cost at retail unit level',
      href: '/admin/inventory-value'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 glow-primary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">System Online</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back, Admin 👋</h1>
            <p className="text-white/70 mt-1 font-medium">
              {stats?.lowStock > 0
                ? `⚠️ ${stats.lowStock} items need restocking. Today's profit: Rs. ${(stats?.todayProfit || 0).toFixed(0)}`
                : `Stock is healthy. Today's profit so far: Rs. ${(stats?.todayProfit || 0).toFixed(0)}`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/sales" className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-3 rounded-2xl font-bold text-sm backdrop-blur-sm transition-all border border-white/20">
              <ShoppingCart className="w-4 h-4" /> New Sale
            </Link>
            <Link href="/admin/stock" className="flex items-center gap-2 bg-white text-primary px-5 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-white/90">
              <Zap className="w-4 h-4" /> Stock Update
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Content = (
            <div className="relative overflow-hidden bg-card border border-border/50 rounded-3xl p-6 hover:border-primary/30 transition-all duration-300 group cursor-default h-full">
              <div className="flex items-start justify-between mb-5">
                <div className={`p-3 ${card.gradient} rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <Activity className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-1 text-foreground">{card.value}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">{card.description}</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );

          return card.href ? (
            <Link key={i} href={card.href} className="block transition-transform hover:scale-[1.02] active:scale-95">
              {Content}
            </Link>
          ) : (
            <div key={i}>{Content}</div>
          );
        })}
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', val: stats?.totalProducts || 0, color: 'text-primary', bg: 'bg-primary/10', href: '/admin/products' },
          { label: 'Out of Stock', val: stats?.outOfStock || 0, color: 'text-rose-400', bg: 'bg-rose-500/10', href: '/admin/products/out-of-stock' },
          { label: 'Low Stock Alerts', val: stats?.lowStock || 0, color: 'text-amber-400', bg: 'bg-amber-500/10', href: '/admin/products/low-stock' },
          { label: 'Udhar Customers', val: stats?.recentActivity?.filter((a: any) => a.type === 'UDHAR').length || '—', color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/admin/customers' },
        ].map((s, i) => (
          <Link key={i} href={s.href} className={`${s.bg} border border-border/30 rounded-2xl p-4 hover:scale-105 transition-all cursor-pointer block`}>
            <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Combined Activity */}
        <div className="xl:col-span-2 bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="text-lg font-black tracking-tight">Recent Sales Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Cash & Udhar sales — latest first</p>
            </div>
            <Link href="/admin/customers" className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {stats?.recentActivity?.map((t: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-5 hover:bg-muted/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg group-hover:scale-105 transition-transform ${t.type === 'CASH' ? 'bg-emerald-600' : 'gradient-rose'}`}>
                    {t.type === 'CASH' ? <Banknote className="w-5 h-5" /> : t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(t.createdAt).toLocaleDateString()} · {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-black ${t.type === 'CASH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Rs. {t.amount.toFixed(0)}
                  </p>
                  <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 ${t.type === 'CASH' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                    {t.type === 'CASH' ? <span className="flex items-center gap-1"><CreditCard className="w-2 h-2 inline" /> Cash</span> : 'Udhar'}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <div className="text-center py-16">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground font-medium text-sm">No activity yet today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-5">
          <div className="relative overflow-hidden gradient-primary rounded-3xl p-6 glow-primary">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <TrendingUp className="w-8 h-8 text-white/30 mb-3" />
            <h3 className="text-base font-black text-white mb-1">Today&apos;s Performance</h3>
            <p className="text-2xl font-black text-white mb-0.5">Rs. {(stats?.todayProfit || 0).toFixed(0)}</p>
            <p className="text-xs text-white/70 mb-5 font-medium">Net profit today</p>
            {stats?.todayRevenue > 0 && (
              <div className="bg-white/10 rounded-2xl p-3 mb-4">
                <p className="text-[10px] text-white/70 uppercase font-bold tracking-widest">Revenue</p>
                <p className="text-white font-black">Rs. {(stats?.todayRevenue || 0).toFixed(0)}</p>
              </div>
            )}
            <Link href="/admin/reports" className="block w-full py-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-bold text-xs text-center uppercase tracking-widest backdrop-blur-sm transition-all border border-white/20">
              Download Report →
            </Link>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h3>
            {[
              { label: 'Add New Product', href: '/admin/products', icon: Package, color: 'text-primary' },
              { label: 'Bulk Product Import', href: '/admin/products?bulk=true', icon: Zap, color: 'text-emerald-400' },
              { label: 'Record a Sale', href: '/admin/sales', icon: ShoppingCart, color: 'text-amber-400' },
              { label: 'Udhar Customers', href: '/admin/customers', icon: Users, color: 'text-rose-400' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-muted/50 transition-all group">
                <div className="p-2 rounded-xl bg-muted group-hover:scale-110 transition-transform">
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <span className="text-sm font-bold">{action.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
