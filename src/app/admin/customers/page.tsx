"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { 
  Plus, 
  Search, 
  UserPlus, 
  Phone, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownLeft,
  X,
  Calendar,
  MessageCircle,
  DollarSign,
  TrendingDown,
  Users,
  AlertCircle,
  CheckCircle2,
  Package,
  Trash2
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showUdharModal, setShowUdharModal] = useState<{show: boolean, customer?: any}>({show: false});
  const [showPayModal, setShowPayModal] = useState<{show: boolean, customer?: any}>({show: false});
  const [search, setSearch] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState<{show: boolean, customer?: any}>({show: false});
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [productSearch, setProductSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, customer?: any}>({show: false});
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '' });
  const [udharForm, setUdharForm] = useState({ 
    items: [{ productId: '', quantity: 1, priceAtTime: 0, unit: 'pcs' }],
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, prodRes] = await Promise.all([api.get('/customers'), api.get('/products')]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = api.post('/customers', customerForm);
    toast.promise(promise, {
      loading: 'Creating customer...',
      success: () => {
        setShowCustomerModal(false); 
        fetchData();
        setCustomerForm({ name: '', phone: '', address: '' });
        return "Customer created successfully";
      },
      error: (err) => err.response?.data?.message || "Failed to create customer"
    });
  };

  const loadCustomerHistory = async (customer: any) => {
    try {
      const res = await api.get(`/customers/${customer.id}`);
      setCustomerHistory(res.data);
      setShowHistoryModal({ show: true, customer });
    } catch { 
      toast.error("Failed to load payment history"); 
    }
  };

  const handleAddUdhar = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = api.post('/customers/transaction', {
      customerId: showUdharModal.customer.id,
      items: udharForm.items, description: udharForm.description
    });
    
    toast.promise(promise, {
      loading: 'Adding udhar entry...',
      success: () => {
        setShowUdharModal({show: false}); 
        fetchData();
        setUdharForm({ items: [{ productId: '', quantity: 1, priceAtTime: 0, unit: 'pcs' }], description: '' });
        return "Udhar entry added successfully";
      },
      error: (err) => err.response?.data?.message || "Failed to add udhar entry"
    });
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = api.post('/customers/pay', {
      customerId: showPayModal.customer.id,
      amount: parseFloat(payAmount),
      note: payNote
    });

    toast.promise(promise, {
      loading: 'Recording payment...',
      success: () => {
        setShowPayModal({show: false}); 
        setPayAmount(''); 
        setPayNote(''); 
        fetchData();
        return "Payment recorded successfully";
      },
      error: (err) => err.response?.data?.message || "Failed to record payment"
    });
  };

  const handlePaySpecificTransaction = async (tx: any) => {
    const promise = api.post(`/customers/pay-transaction/${tx.id}`);

    toast.promise(promise, {
      loading: 'Processing payment...',
      success: () => {
        // Refresh customer history
        api.get(`/customers/${showHistoryModal.customer.id}`).then(res => setCustomerHistory(res.data));
        fetchData(); // Refresh main list balance
        return "Transaction marked as paid!";
      },
      error: (err) => err.response?.data?.message || "Failed to process payment"
    });
  };

  const handleRevertTransaction = async (tx: any) => {
    if (!confirm(`Are you sure you want to revert this transaction? Stock will be restored and balance will be reduced by Rs. ${tx.totalAmount}.`)) return;
    
    const promise = api.delete(`/customers/transaction/${tx.id}`);
    toast.promise(promise, {
      loading: 'Reverting transaction...',
      success: () => {
        // Refresh customer history
        api.get(`/customers/${showHistoryModal.customer.id}`).then(res => setCustomerHistory(res.data));
        fetchData();
        return "Transaction reverted successfully!";
      },
      error: (err: any) => err.response?.data?.message || "Failed to revert transaction"
    });
  };

  const handleDeleteCustomer = async () => {
    if (deleteConfirmName !== showDeleteModal.customer?.name) {
      return toast.error("Customer name does not match!");
    }

    const promise = api.delete(`/customers/${showDeleteModal.customer.id}`);
    toast.promise(promise, {
      loading: 'Deleting customer...',
      success: () => {
        setShowDeleteModal({show: false});
        setDeleteConfirmName('');
        fetchData();
        return "Customer deleted successfully";
      },
      error: (err: any) => err.response?.data?.message || "Failed to delete customer"
    });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalOutstanding = customers.reduce((acc, c) => acc + c.currentBalance, 0);

  const inputCls = "w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all";
  const labelCls = "text-[10px] font-black uppercase tracking-widest text-muted-foreground";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Udhar Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track customer credit, transactions, and reminders.</p>
        </div>
        <button 
          onClick={() => setShowCustomerModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white gradient-primary glow-primary hover:opacity-90 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-black">{customers.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Customers</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <TrendingDown className="w-5 h-5 text-rose-400 mb-2" />
          <p className="text-2xl font-black text-rose-400">Rs. {totalOutstanding.toFixed(0)}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Outstanding</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <AlertCircle className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-black text-amber-400">{customers.filter(c => c.currentBalance > 0).length}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Debtors</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" placeholder="Search by name or phone..."
          className="w-full bg-card border border-border/50 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 shimmer rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-card border border-border/50 rounded-3xl p-6 hover:border-primary/30 transition-all duration-300 group">
              {/* Customer Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-base tracking-tight">{customer.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3" />{customer.phone}
                    </span>
                    {customer.address && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" />{customer.address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-xl bg-muted text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(customer.updatedAt).toLocaleDateString('en-PK')}
                  </span>
                  <button 
                    onClick={() => setShowDeleteModal({show: true, customer})}
                    className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-all rounded-xl ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className={`rounded-2xl p-4 mb-5 ${customer.currentBalance > 0 ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Outstanding Balance</p>
                    <p className={`text-2xl font-black ${customer.currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      Rs. {customer.currentBalance.toFixed(0)}
                    </p>
                  </div>
                  {customer.currentBalance === 0 ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-50" />
                  ) : (
                    <DollarSign className="w-8 h-8 text-rose-400 opacity-30" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowUdharModal({show: true, customer})}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-black uppercase tracking-wide hover:bg-rose-500/20 transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Add Udhar
                </button>
                <button 
                  onClick={() => setShowPayModal({show: true, customer})}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-black uppercase tracking-wide hover:bg-emerald-500/20 transition-all"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Mark Paid
                </button>
                <button 
                  onClick={() => loadCustomerHistory(customer)}
                  className="p-3 bg-primary/10 rounded-2xl hover:bg-primary/20 transition-all text-primary"
                  title="Payment History"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && !loading && (
            <div className="col-span-2 text-center py-20">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No customers found.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">New Customer</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add a new Udhar customer.</p>
              </div>
              <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Customer Name</label>
                <input className={inputCls} placeholder="e.g. Ahmed Khan" value={customerForm.name}
                  onChange={e => setCustomerForm({...customerForm, name: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Phone (WhatsApp)</label>
                <input className={inputCls} placeholder="+92 300 1234567" value={customerForm.phone}
                  onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Address (Optional)</label>
                <textarea className={inputCls} placeholder="Customer address..." rows={2} value={customerForm.address}
                  onChange={e => setCustomerForm({...customerForm, address: e.target.value})} />
              </div>
              <button className="w-full gradient-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all glow-primary">
                Create Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {showPayModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">Record Payment</h2>
                <p className="text-xs text-muted-foreground mt-0.5">For: {showPayModal.customer?.name}</p>
              </div>
              <button onClick={() => setShowPayModal({show: false})} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleMarkPaid} className="p-6 space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Outstanding</p>
                <p className="text-2xl font-black text-rose-400">Rs. {showPayModal.customer?.currentBalance?.toFixed(0)}</p>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Payment Amount (Rs.)</label>
                <input type="number" step="0.01" className={inputCls} placeholder="Enter amount paid"
                  value={payAmount} onChange={e => setPayAmount(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Payment Note (Optional)</label>
                <input type="text" className={inputCls} placeholder="e.g. Cash in hand, partial payment..."
                  value={payNote} onChange={e => setPayNote(e.target.value)} />
              </div>
              <button className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all hover:opacity-90" style={{background: 'linear-gradient(135deg, oklch(0.65 0.18 145), oklch(0.60 0.18 180))'}}>
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Confirm Payment
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Udhar Modal */}
      {showUdharModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">Add Udhar Entry</h2>
                <p className="text-xs text-muted-foreground mt-0.5">For: <span className="text-foreground font-bold">{showUdharModal.customer?.name}</span></p>
              </div>
              <button onClick={() => { setShowUdharModal({show: false}); setProductSearch(''); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUdhar} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {udharForm.items.map((item, idx) => (
                <div key={idx} className="p-4 bg-background border border-border/50 rounded-2xl space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Item {idx + 1}</p>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 space-y-1.5">
                      <label className={labelCls}>Product</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input 
                            type="text" 
                            placeholder="Filter products..." 
                            className="w-full bg-background border border-border/50 rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-1 focus:ring-primary text-xs mb-2"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                          />
                          <select className={inputCls} value={item.productId}
                            onChange={e => {
                              const prod = products.find(p => p.id === e.target.value);
                              const newItems = [...udharForm.items];
                              newItems[idx] = { 
                                ...newItems[idx], 
                                productId: e.target.value, 
                                priceAtTime: prod?.salePrice || 0,
                                unit: prod?.unit || 'pcs'
                              };
                              setUdharForm({...udharForm, items: newItems});
                            }} required>
                            <option value="">Select...</option>
                            {products
                              .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase()))
                              .map(p => <option key={p.id} value={p.id}>{p.name} — Rs. {p.salePrice} / {p.unit}</option>)
                            }
                          </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Qty ({udharForm.items[idx]?.unit || 'pcs'})</label>
                      <input type="number" step="0.01" className={inputCls} value={item.quantity}
                        onChange={e => {
                          const newItems = [...udharForm.items];
                          newItems[idx].quantity = parseFloat(e.target.value);
                          setUdharForm({...udharForm, items: newItems});
                        }} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Subtotal</label>
                      <div className="py-3 px-4 bg-primary/10 border border-primary/20 rounded-2xl text-sm font-black text-primary text-center">
                        {(item.quantity * item.priceAtTime).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button type="button"
                onClick={() => setUdharForm({...udharForm, items: [...udharForm.items, { productId: '', quantity: 1, priceAtTime: 0, unit: 'pcs' }]})}
                className="w-full py-3 border border-dashed border-primary/30 rounded-2xl text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
              >
                + Add Another Item
              </button>

              <div className="space-y-1.5">
                <label className={labelCls}>Note (Optional)</label>
                <textarea className={inputCls} placeholder="Description..." rows={2}
                  value={udharForm.description} onChange={e => setUdharForm({...udharForm, description: e.target.value})} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grand Total</p>
                  <p className="text-3xl font-black text-rose-400">
                    Rs. {udharForm.items.reduce((acc, i) => acc + (i.quantity * i.priceAtTime), 0).toFixed(0)}
                  </p>
                </div>
                <button className="px-8 py-4 rounded-2xl font-black text-sm text-white uppercase tracking-widest hover:opacity-90 transition-all glow-rose"
                  style={{background: 'linear-gradient(135deg, oklch(0.62 0.22 25), oklch(0.60 0.22 350))'}}>
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Payment History Modal */}
      {showHistoryModal.show && customerHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">Payment History</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{showHistoryModal.customer?.name} — {customerHistory.paymentLogs?.length || 0} payments recorded</p>
              </div>
              <button onClick={() => setShowHistoryModal({show: false})} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/30">
              {/* Transactions Section */}
              <div className="bg-muted/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Udhar Transactions</p>
                {customerHistory.udharTransactions?.length === 0 && (
                  <p className="text-center py-4 text-xs text-muted-foreground">No transactions found.</p>
                )}
                {customerHistory.udharTransactions?.map((tx: any) => (
                  <div key={tx.id} className={`mb-4 last:mb-0 p-4 bg-background border rounded-2xl ${tx.isPaid ? 'border-emerald-500/20' : 'border-border/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${tx.isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {tx.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {new Date(tx.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <p className="font-bold text-sm text-foreground">
                          {tx.items?.map((i: any) => i.product?.name).join(', ') || tx.description || 'Udhar Purchase'}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className={`font-black text-sm ${tx.isPaid ? 'text-emerald-400' : 'text-rose-400'}`}>Rs. {tx.totalAmount.toFixed(0)}</p>
                        <div className="flex items-center gap-3">
                          {!tx.isPaid && (
                            <button 
                              onClick={() => handlePaySpecificTransaction(tx)}
                              className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button 
                            onClick={() => handleRevertTransaction(tx)}
                            className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            Revert / Return
                          </button>
                        </div>
                      </div>
                    </div>
                    {tx.items?.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-border/20 mt-3">
                        {tx.items.map((i: any, idx: number) => (
                          <div key={idx} className="text-[11px] text-muted-foreground flex justify-between items-center bg-muted/5 p-2 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Package className="w-3 h-3 text-primary/50" />
                              <span className="font-bold text-foreground/80">{i.product?.name}</span>
                            </div>
                            <span>{i.quantity} {i.product?.unit || 'pcs'} × Rs. {i.priceAtTime} = <span className="font-bold text-foreground/70">Rs. {(i.quantity * i.priceAtTime).toFixed(0)}</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                    {tx.description && <p className="text-[11px] text-muted-foreground italic mt-2 border-t border-border/20 pt-2">Note: {tx.description}</p>}
                  </div>
                ))}
              </div>

              {/* Payments Section */}
              <div className="p-4 border-t border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Payment Logs</p>
                {customerHistory.paymentLogs?.length === 0 && (
                  <p className="text-center py-4 text-xs text-muted-foreground">No payments recorded yet.</p>
                )}
                {customerHistory.paymentLogs?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mb-3 last:mb-0">
                    <div>
                      <p className="font-bold text-sm text-emerald-400">+Rs. {log.amount.toFixed(0)}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {' · '}{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {log.note && <p className="text-[11px] text-muted-foreground italic mt-1">"{log.note}"</p>}
                    </div>
                    <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-border/50 bg-muted/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Paid</p>
              <p className="text-lg font-black text-emerald-400">
                Rs. {(customerHistory.paymentLogs?.reduce((s: number, l: any) => s + l.amount, 0) || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-rose-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-rose-500/5">
              <div>
                <h2 className="text-xl font-black tracking-tight text-rose-400">Delete Customer?</h2>
                <p className="text-xs text-muted-foreground mt-0.5">This action is irreversible and will delete all their history.</p>
              </div>
              <button onClick={() => { setShowDeleteModal({show: false}); setDeleteConfirmName(''); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <p className="text-xs font-bold text-rose-300">To confirm, please type the customer name: <span className="text-white font-black">{showDeleteModal.customer?.name}</span></p>
              </div>
              <input 
                type="text" 
                className={inputCls} 
                placeholder="Enter customer name..." 
                value={deleteConfirmName} 
                onChange={e => setDeleteConfirmName(e.target.value)} 
              />
              <button 
                onClick={handleDeleteCustomer}
                disabled={deleteConfirmName !== showDeleteModal.customer?.name}
                className="w-full py-4 rounded-2xl font-black text-sm text-white uppercase tracking-widest transition-all glow-rose disabled:opacity-50 disabled:grayscale"
                style={{background: 'linear-gradient(135deg, oklch(0.62 0.22 25), oklch(0.60 0.22 350))'}}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
