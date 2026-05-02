"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { 
  Package, 
  ArrowUp, 
  ArrowDown, 
  RefreshCcw, 
  Search, 
  AlertTriangle,
  TrendingUp,
  Plus,
  Minus
} from 'lucide-react';

export default function StockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustModal, setAdjustModal] = useState<{show: boolean, product?: any}>({show: false});
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustReason, setAdjustReason] = useState('MANUAL_ADD');
  const [adjustDir, setAdjustDir] = useState<'add' | 'remove'>('add');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.minStockLevel);
  const outOfStockItems = products.filter(p => p.stock === 0);
  const healthyItems = products.filter(p => p.stock > p.minStockLevel);

  const handleQuickUpdate = async (id: string, change: number, reason: string) => {
    try {
      await api.patch(`/products/${id}/stock`, { change, reason });
      toast.success("Stock updated successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const change = adjustDir === 'add' ? adjustQty : -adjustQty;
    const reason = adjustDir === 'add' ? 'REPLENISHMENT' : 'MANUAL_REMOVE';
    await handleQuickUpdate(adjustModal.product.id, change, reason);
    setAdjustModal({show: false});
    setAdjustQty(1);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight">Stock & Inventory Health</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor stock levels, alerts, and perform adjustments.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative overflow-hidden rounded-3xl p-6 text-white glow-rose" style={{background: 'linear-gradient(135deg, oklch(0.62 0.22 25), oklch(0.55 0.22 350))'}}>
          <div className="absolute -right-6 -bottom-6 opacity-15">
            <AlertTriangle className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black mb-1">{outOfStockItems.length}</p>
            <p className="text-sm font-black uppercase tracking-widest opacity-80">Out of Stock</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Immediate action required</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl p-6 text-white" style={{background: 'linear-gradient(135deg, oklch(0.75 0.18 70), oklch(0.65 0.20 45))'}}>
          <div className="absolute -right-6 -bottom-6 opacity-15">
            <RefreshCcw className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black mb-1">{lowStockItems.length}</p>
            <p className="text-sm font-black uppercase tracking-widest opacity-80">Low Stock Alerts</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Replenishment needed</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl p-6 text-white glow-emerald" style={{background: 'linear-gradient(135deg, oklch(0.65 0.18 145), oklch(0.58 0.18 180))'}}>
          <div className="absolute -right-6 -bottom-6 opacity-15">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black mb-1">{healthyItems.length}</p>
            <p className="text-sm font-black uppercase tracking-widest opacity-80">Healthy Levels</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Operating at capacity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="bg-card border border-border/50 rounded-3xl p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Critical Replenishment Needed
          </h3>
          <div className="space-y-3">
            {[...outOfStockItems, ...lowStockItems].map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${p.stock === 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {p.stock.toFixed(1)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Min required: {p.minStockLevel.toFixed(2)} {p.unit}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickUpdate(p.id, 10, 'REPLENISHMENT')}
                  className="flex items-center gap-1.5 px-4 py-2.5 gradient-primary text-white rounded-xl text-xs font-black uppercase tracking-wide hover:opacity-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> +10 {p.unit}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Inventory */}
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Inventory Stock Control
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search products..."
              className="w-full bg-background border border-border/50 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <div>{[1,2,3,4,5,6].map(i => <div key={i} className="h-16 shimmer border-b border-border/30" />)}</div>
        ) : (
          <div className="divide-y divide-border/30">
            {filtered.map(p => {
              const pct = Math.min((p.stock / Math.max(p.minStockLevel * 3, 20)) * 100, 100);
              const statusColor = p.stock === 0 ? 'bg-rose-500' : p.stock <= p.minStockLevel ? 'bg-amber-500' : 'bg-emerald-500';
              const textColor = p.stock === 0 ? 'text-rose-400' : p.stock <= p.minStockLevel ? 'text-amber-400' : 'text-emerald-400';
              return (
                <div key={p.id} className="flex items-center gap-5 px-6 py-4 hover:bg-muted/10 transition-all group">
                  <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                        <div className={`h-full rounded-full transition-all duration-500 ${statusColor}`} style={{width: `${pct}%`}} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">Min: {p.minStockLevel.toFixed(2)} {p.unit}</span>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className={`text-lg font-black ${textColor}`}>{p.stock.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{p.unit}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleQuickUpdate(p.id, 1, 'MANUAL_ADD')}
                      className="p-2.5 hover:bg-emerald-500/10 text-emerald-400 rounded-xl transition-all">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleQuickUpdate(p.id, -1, 'MANUAL_REMOVE')}
                      className="p-2.5 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setAdjustModal({show: true, product: p}); setAdjustQty(10); setAdjustDir('add'); }}
                      className="px-3 py-2 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-wide transition-all">
                      Adjust
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {adjustModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">Adjust Stock</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{adjustModal.product?.name}</p>
              </div>
              <button onClick={() => setAdjustModal({show: false})} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                <Package className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setAdjustDir('add')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${adjustDir === 'add' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-border/50 text-muted-foreground hover:bg-muted/50'}`}>
                  <Plus className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Add Stock</span>
                </button>
                <button type="button" onClick={() => setAdjustDir('remove')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${adjustDir === 'remove' ? 'border-rose-500 bg-rose-500/10 text-rose-400' : 'border-border/50 text-muted-foreground hover:bg-muted/50'}`}>
                  <Minus className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Remove Stock</span>
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity ({adjustModal.product?.unit})</label>
                <input type="number" step="0.01"
                  className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                  value={adjustQty} onChange={e => setAdjustQty(parseFloat(e.target.value))} required />
              </div>
              <button className={`w-full py-4 rounded-2xl font-black text-sm text-white uppercase tracking-widest transition-all ${adjustDir === 'add' ? 'hover:opacity-90' : 'hover:opacity-90'}`}
                style={{background: adjustDir === 'add' ? 'linear-gradient(135deg, oklch(0.65 0.18 145), oklch(0.60 0.18 180))' : 'linear-gradient(135deg, oklch(0.62 0.22 25), oklch(0.60 0.22 350))'}}>
                {adjustDir === 'add' ? `Add ${adjustQty} ${adjustModal.product?.unit}` : `Remove ${adjustQty} ${adjustModal.product?.unit}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
