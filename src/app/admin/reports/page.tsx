"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { 
  FileSpreadsheet, 
  Calendar, 
  Download, 
  Clock, 
  BarChart3,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Filter,
  Search,
  FileText,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  
  // Filter States
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSalesData = async () => {
    setFetching(true);
    try {
      const bounds = getApiBounds();
      const response = await api.get(`/admin/sales-report-data`, {
        params: bounds
      });
      setSalesData(response.data);
    } catch (err) {
      console.error("Failed to fetch sales data", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate]);

  const setQuickPeriod = (p: string) => {
    setPeriod(p);
    const today = new Date();
    let start = new Date();
    
    if (p === 'today') {
      start = today;
    } else if (p === 'week') {
      start.setDate(today.getDate() - 7);
    } else if (p === 'month') {
      start.setMonth(today.getMonth() - 1);
    }
    
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    
    setStartDate(formatDate(start));
    setEndDate(formatDate(today));
  };

  const getApiBounds = () => {
    const [sy, sm, sd] = startDate.split('-');
    const [ey, em, ed] = endDate.split('-');
    const localStart = new Date(Number(sy), Number(sm) - 1, Number(sd), 0, 0, 0, 0);
    const localEnd = new Date(Number(ey), Number(em) - 1, Number(ed), 23, 59, 59, 999);
    return {
      startDate: localStart.toISOString(),
      endDate: localEnd.toISOString()
    };
  };

  const downloadReport = async (format: 'xlsx' | 'csv') => {
    setLoading(format);
    try {
      const bounds = getApiBounds();
      const response = await api.get(`/admin/export-sales`, {
        params: { ...bounds, format },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sales_Report_${startDate}_to_${endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded successfully");
    } catch (err) {
      toast.error("Failed to download report");
    } finally {
      setLoading(null);
    }
  };

  const handleReturn = async (sale: any) => {
    if (!confirm(`Are you sure you want to return this ${sale.type} sale? This will restore stock and ${sale.type === 'UDHAR' ? 'revert customer balance' : 'delete the record'}.`)) return;
    
    const promise = sale.type === 'UDHAR' 
      ? api.delete(`/customers/transaction/${sale.id}`)
      : api.delete(`/orders/${sale.id}`);

    toast.promise(promise, {
      loading: 'Reverting sale...',
      success: () => {
        fetchSalesData();
        return "Sale returned successfully! Stock restored.";
      },
      error: (err: any) => err.response?.data?.message || "Failed to return sale"
    });
  };

  const filteredSales = salesData.filter(sale => 
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  const productSummary = filteredSales.reduce((acc: any, sale: any) => {
    sale.itemDetails?.forEach((item: any) => {
      const key = `${item.name}-${item.unit}`;
      if (!acc[key]) {
        acc[key] = { name: item.name, quantity: 0, unit: item.unit, total: 0 };
      }
      acc[key].quantity += item.quantity;
      acc[key].total += item.total;
    });
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Sales Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">Analyze your business performance and export detailed records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => downloadReport('csv')}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all font-bold text-xs uppercase tracking-wider"
          >
            {loading === 'csv' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText className="w-4 h-4" />}
            Export CSV
          </button>
          <button 
            onClick={() => downloadReport('xlsx')}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10"
          >
            {loading === 'xlsx' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-3xl font-black text-foreground">₨ {filteredSales.reduce((acc: number, s: any) => acc + s.total, 0).toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Profit</p>
          <p className="text-3xl font-black text-emerald-500">₨ {filteredSales.reduce((acc: number, s: any) => acc + s.profit, 0).toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Transactions</p>
          <p className="text-3xl font-black text-primary">{filteredSales.length}</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-2xl border border-border/50">
            {['today', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setQuickPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPeriod('custom'); }}
                className="pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full"
              />
            </div>
            <span className="text-muted-foreground font-bold">to</span>
            <div className="relative flex-1 lg:flex-none">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPeriod('custom'); }}
                className="pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full"
              />
            </div>
          </div>

          <div className="relative flex-1 w-full lg:w-auto lg:ml-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by customer or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Section */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 self-start">
          <div className="p-6 border-bottom border-border/50 bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TableIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Transactions</h3>
              </div>
            </div>
            <button 
              onClick={fetchSalesData}
              className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              <Clock className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30 border-y border-border/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sale Details</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profit</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {fetching ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-8">
                        <div className="h-4 bg-muted rounded-full w-full opacity-20" />
                      </td>
                    </tr>
                  ))
                ) : filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <React.Fragment key={sale.id}>
                      <tr 
                        className={`hover:bg-muted/20 transition-colors cursor-pointer ${expandedSale === sale.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{sale.customer}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            sale.type === 'CASH' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {sale.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-emerald-500">₨ {sale.profit.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-primary">₨ {sale.total.toLocaleString()}</span>
                        </td>
                      </tr>
                      {expandedSale === sale.id && (
                        <tr className="bg-muted/10 border-l-2 border-primary">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Itemized Breakdown</p>
                              <div className="grid grid-cols-1 gap-2">
                                {sale.itemDetails?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between bg-background p-3 rounded-xl border border-border/50">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center font-bold text-xs text-primary">
                                        {idx + 1}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold">{item.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.quantity} {item.unit} × ₨ {item.price}</p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-black text-foreground">₨ {item.total.toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end gap-3 pt-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleReturn(sale); }}
                                  className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline"
                                >
                                  Return Transaction
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <p className="text-sm font-bold text-muted-foreground">No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Summary Section */}
        <div className="bg-card border border-border/50 rounded-[2.5rem] p-6 shadow-xl shadow-black/5 flex flex-col h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black tracking-tight">Items Sold Summary</h3>
          </div>
          
          <div className="space-y-4">
            {Object.keys(productSummary).length > 0 ? (
              Object.values(productSummary).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                      Total Sold: {item.quantity} {item.unit}
                    </p>
                  </div>
                  <p className="text-sm font-black text-foreground">₨ {item.total.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-xs text-muted-foreground font-bold">No sales data available</p>
            )}
          </div>
        </div>
      </div>
        
      {/* Data Insight Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 flex items-center gap-5 hover:border-emerald-500/30 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Automated Auditing</p>
            <p className="text-sm font-bold text-foreground mt-0.5">Real-time synchronization between sales and reports.</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 flex items-center gap-5 hover:border-amber-500/30 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Universal Format</p>
            <p className="text-sm font-bold text-foreground mt-0.5">Fully compatible with Excel, Google Sheets, and Numbers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
