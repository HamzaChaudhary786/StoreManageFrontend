"use client";

import { useState, useEffect } from 'react';
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
  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSalesData = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/admin/sales-report-data`, {
        params: { startDate, endDate }
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
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const downloadReport = async (format: 'xlsx' | 'csv') => {
    setLoading(format);
    try {
      const response = await api.get(`/admin/export-sales`, {
        params: { startDate, endDate, format },
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

  const filteredSales = salesData.filter(sale => 
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Table Section */}
      <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
        <div className="p-6 border-bottom border-border/50 bg-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Sales Transactions</h3>
              <p className="text-xs text-muted-foreground font-medium">Showing {filteredSales.length} records for the selected period</p>
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
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date & Time</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Items Summary</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profit</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {fetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8">
                      <div className="h-4 bg-muted rounded-full w-full opacity-20" />
                    </td>
                  </tr>
                ))
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">
                          {new Date(sale.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        sale.type === 'CASH' 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {sale.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-foreground">{sale.customer}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-muted-foreground font-medium max-w-xs truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                        {sale.items}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-bold text-emerald-500">₨ {sale.profit.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-primary">₨ {sale.total.toLocaleString()}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground">No transactions found for this period</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Stats */}
        <div className="p-6 bg-muted/5 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-black text-foreground">₨ {filteredSales.reduce((acc, s) => acc + s.total, 0).toLocaleString()}</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Profit</p>
              <p className="text-xl font-black text-emerald-500">₨ {filteredSales.reduce((acc, s) => acc + s.profit, 0).toLocaleString()}</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Sales</p>
              <p className="text-xl font-black text-foreground">{filteredSales.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* Simple Pagination or just visual indication */}
             <button className="p-2 rounded-xl border border-border/50 hover:bg-muted disabled:opacity-30" disabled>
                <ChevronLeft className="w-4 h-4" />
             </button>
             <button className="p-2 rounded-xl border border-border/50 hover:bg-muted disabled:opacity-30" disabled>
                <ChevronRight className="w-4 h-4" />
             </button>
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
