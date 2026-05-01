"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Wallet,
  Package,
  Search,
  ArrowUpDown,
  Filter,
  Download,
  Info,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function InventoryValuePage() {
  const [data, setData] = useState<any>({ products: [], grandTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/inventory-value');
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch inventory value");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = data.products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Inventory Valuation</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Detailed breakdown of your current stock assets.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white gradient-primary glow-primary hover:opacity-90 transition-all"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card border border-border/50 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Inventory Value</p>
            <h3 className="text-4xl font-black text-white tracking-tight">
              ₨ {data.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Info className="w-3 h-3" />
              Calculated based on Buy Price
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-muted/20 border border-border/50 rounded-3xl p-8 flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Valuation Method</p>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">
                        This report uses the <span className="text-primary font-bold">Cost-Based Valuation</span> method. It multiplies the current physical stock of each item by its recorded purchase cost (Buy Price).
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Data Freshness</p>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">
                        The values shown are generated in real-time from your current database state. Changes in stock or buy prices will be reflected immediately.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-6 border-b border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, SKU or category..." 
              className="w-full bg-background border border-border/50 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Details</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Cost</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 w-40 bg-muted/50 rounded-lg" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-muted/50 rounded-lg" /></td>
                    <td className="px-6 py-5 text-right"><div className="h-4 w-20 bg-muted/50 rounded-lg ml-auto" /></td>
                    <td className="px-6 py-5 text-right"><div className="h-4 w-16 bg-muted/50 rounded-lg ml-auto" /></td>
                    <td className="px-6 py-5 text-right"><div className="h-4 w-24 bg-muted/50 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-bold">No products found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{p.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{p.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 rounded-full bg-muted text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-foreground">₨ {p.costPerUnit.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-foreground">{p.stock} <span className="text-[10px] text-muted-foreground uppercase">{p.unit}</span></p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-black text-primary">₨ {p.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && filteredProducts.length > 0 && (
              <tfoot>
                <tr className="bg-muted/10">
                  <td colSpan={4} className="px-6 py-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Subtotal for filtered items
                  </td>
                  <td className="px-6 py-6 text-right">
                    <p className="text-lg font-black text-white">
                      ₨ {filteredProducts.reduce((sum: number, p: any) => sum + p.value, 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
