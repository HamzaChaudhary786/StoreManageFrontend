"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Package, 
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function LowStockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?stockStatus=low');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch low stock products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <AlertTriangle className="text-amber-400 w-6 h-6" />
              Low Stock Alert
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Products reaching their minimum stock levels.</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[1,2,3,4,5].map(i => <div key={i} className="h-20 shimmer border-b border-border/30" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Stock</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Level</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                      <p className="text-sm text-muted-foreground font-medium">All items are sufficiently stocked.</p>
                    </td>
                  </tr>
                ) : products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 font-black text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.category?.name || 'General'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-amber-500">
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        {p.minStockLevel} {p.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/products?search=${p.name}`} className="text-xs font-black text-primary uppercase tracking-widest hover:underline">
                        Update Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
