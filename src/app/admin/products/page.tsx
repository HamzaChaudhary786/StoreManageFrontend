"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  X,
  BarChart2,
  Tag,
  Filter,
  ChevronDown,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';


export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('bulk') === 'true') {
      setShowBulkModal(true);
    }
  }, [searchParams]);

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  const [udharForm, setUdharForm] = useState({ 
    items: [{ productId: '', quantity: 1, priceAtTime: 0, unit: 'pcs' }],
    description: ''
  });
  const [priceEntryMode, setPriceEntryMode] = useState<'single' | 'box'>('single');
  const [stockEntry, setStockEntry] = useState({ boxes: 0, pieces: 0 });
  
  const handlePriceModeChange = (mode: 'single' | 'box') => {
    setPriceEntryMode(mode);
    if (mode === 'single') {
      setFormData(prev => ({ ...prev, piecesPerUnit: 1 }));
      setStockEntry(prev => ({ ...prev, boxes: 0 }));
    }
  };

  const [formData, setFormData] = useState({
    name: '', sku: '', description: '', buyPrice: 0, salePrice: 0, stock: 0, minStockLevel: 5, categoryId: '', unit: 'pcs', piecesPerUnit: 1
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddModal = () => {
    setIsEditing(false); setEditId(null);
    setFormData({ name: '', sku: '', description: '', buyPrice: 0, salePrice: 0, stock: 0, minStockLevel: 5, categoryId: '', unit: 'pcs', piecesPerUnit: 1 });
    setStockEntry({ boxes: 0, pieces: 0 });
    setShowModal(true);
  };

  const openEditModal = (product: any) => {
    setIsEditing(true); setEditId(product.id);
    setFormData({ 
      name: product.name, 
      sku: product.sku || '', 
      description: product.description || '', 
      buyPrice: product.buyPrice, 
      salePrice: product.salePrice, 
      stock: product.stock, 
      minStockLevel: product.minStockLevel, 
      categoryId: product.categoryId,
      unit: product.unit || 'pcs',
      piecesPerUnit: product.piecesPerUnit || 1
    });
    setStockEntry({ boxes: 0, pieces: product.stock });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (priceEntryMode === 'single') {
      finalData.buyPrice = formData.buyPrice * formData.piecesPerUnit;
    }
    
    finalData.stock = (stockEntry.boxes * formData.piecesPerUnit) + stockEntry.pieces;
    
    const promise = (isEditing && editId) 
      ? api.put(`/products/${editId}`, finalData)
      : api.post('/products', finalData);

    toast.promise(promise, {
      loading: isEditing ? 'Updating product...' : 'Adding product...',
      success: () => {
        setShowModal(false); 
        fetchData();
        return isEditing ? "Product updated successfully" : "Product added to inventory";
      },
      error: (err) => err.response?.data?.message || "Failed to save product"
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const deletePromise = api.delete(`/products/${id}`);

    toast.promise(deletePromise, {
      loading: 'Deleting product...',
      success: () => {
        fetchData();
        return "Product deleted successfully";
      },
      error: (err) => err.response?.data?.message || "Failed to delete product"
    });
  };

  const filtered = products
    .filter(p => categoryFilter === '' || p.categoryId === categoryFilter)
    .filter(p => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      const nameLower = p.name.toLowerCase();
      const skuLower = (p.sku || '').toLowerCase();
      
      // Split search into words to allow matching fragments (e.g. "ca dy" for "candy")
      const words = searchLower.split(/\s+/).filter(w => w.length > 0);
      return words.every(word => nameLower.includes(word) || skuLower.includes(word));
    })
    .sort((a, b) => {
      if (!search) return 0;
      const searchLower = search.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aSku = (a.sku || '').toLowerCase();
      const bSku = (b.sku || '').toLowerCase();

      // Priority 1: Exact matches
      const aExact = aName === searchLower || aSku === searchLower;
      const bExact = bName === searchLower || bSku === searchLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Priority 2: Starts with search string
      const aStarts = aName.startsWith(searchLower) || aSku.startsWith(searchLower);
      const bStarts = bName.startsWith(searchLower) || bSku.startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return aName.localeCompare(bName);
    });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Inventory Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage products, pricing, and profit margins.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-muted-foreground bg-card border border-border/50 hover:bg-muted transition-all"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white gradient-primary glow-primary hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" placeholder="Search by name or SKU..."
            className="w-full bg-card border border-border/50 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select 
            className="appearance-none bg-card border border-border/50 rounded-2xl px-4 py-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary text-sm font-medium min-w-[180px] transition-all"
            value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', val: products.length, color: 'text-primary' },
          { label: 'Out of Stock', val: products.filter(p => p.stock === 0).length, color: 'text-rose-400' },
          { label: 'Low Stock', val: products.filter(p => p.stock > 0 && p.stock <= p.minStockLevel).length, color: 'text-amber-400' },
          { label: 'Categories', val: categories.length, color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-4">
            <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Products Table */}
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
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Details</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Purchase & Sale (Rs.)</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Net Profit</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Level</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                      <p className="text-sm text-muted-foreground font-medium">No products found.</p>
                    </td>
                  </tr>
                ) : filtered.map((p) => {
                  const costPrice = p.piecesPerUnit > 1 ? p.buyPrice / p.piecesPerUnit : p.buyPrice;
                  const profit = p.salePrice - costPrice;
                  const margin = (profit / costPrice) * 100;
                  
                  return (
                    <tr key={p.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-black uppercase tracking-tight text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {p.category?.name || 'Uncategorized'}
                              </span>
                              {p.sku && <span className="text-[9px] font-medium text-muted-foreground/60">#{p.sku}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Purchase:</span>
                            <span className="text-xs font-black">Rs. {costPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Sale:</span>
                            <span className="text-sm font-black text-emerald-400">Rs. {p.salePrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2 w-fit">
                          <p className="text-xs font-black text-emerald-400">Rs. {profit.toFixed(2)}</p>
                          <p className="text-[9px] font-bold text-emerald-500/60 uppercase">{margin.toFixed(1)}% Profit</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Package className={`w-3.5 h-3.5 ${p.stock <= p.minStockLevel ? 'text-rose-400' : 'text-primary'}`} />
                            <span className={`text-sm font-black ${p.stock <= p.minStockLevel ? 'text-rose-400' : 'text-foreground'}`}>
                              {p.stock.toFixed(0)} {p.unit}
                            </span>
                          </div>
                          {p.piecesPerUnit > 1 && (
                            <p className="text-[10px] font-bold text-muted-foreground/70 pl-5">
                              ≈ {(p.stock / p.piecesPerUnit).toFixed(1)} Boxes
                            </p>
                          )}
                          {p.stock <= p.minStockLevel && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-rose-400 uppercase bg-rose-400/10 px-2 py-0.5 rounded-full w-fit ml-5">
                              <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(p)} className="p-2.5 hover:bg-primary/10 text-primary rounded-xl transition-all shadow-sm border border-transparent hover:border-primary/20">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-2.5 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-400/20">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/10">
              <div>
                <h2 className="text-xl font-black tracking-tight syne">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{isEditing ? 'Modify details' : 'Stock your shelves'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              onSubmit={handleSubmit} 
              className="p-6 overflow-y-auto no-scrollbar max-h-[75vh] space-y-6"
            >
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-border/30 pb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Basic Information</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Name</label>
                    <input type="text" placeholder="e.g. Tibet Soap" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Type</label>
                    <select className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium appearance-none transition-all"
                      value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value, piecesPerUnit: ['kg','liter','gram'].includes(e.target.value) ? 1 : formData.piecesPerUnit})} required>
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="liter">Liters (ltr)</option>
                      <option value="packet">Packets (pkt)</option>
                      <option value="dozen">Dozen</option>
                      <option value="gram">Grams (g)</option>
                      <option value="box">Box</option>
                      <option value="crate">Crate</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SKU / Barcode</label>
                    <input type="text" placeholder="e.g. TBT-001" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                      value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                  </div>
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
                    <select className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium appearance-none transition-all"
                      value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing (Dynamic) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400 border-b border-border/30 pb-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pricing & Cost</span>
                </div>
                
                {!['kg', 'liter', 'gram'].includes(formData.unit) ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4 bg-muted/20 p-5 rounded-[2rem] border border-border/50">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">How do you buy this?</label>
                        <div className="flex bg-background border border-border/50 rounded-2xl p-1">
                          <button type="button" onClick={() => handlePriceModeChange('single')}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${priceEntryMode === 'single' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}>
                            By Piece
                          </button>
                          <button type="button" onClick={() => handlePriceModeChange('box')}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${priceEntryMode === 'box' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}>
                            By Box
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {priceEntryMode === 'box' ? 'Purchase Price (Full Box)' : 'Purchase Price (Single Piece)'}
                        </label>
                        <input type="number" step="0.01" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                          value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: parseFloat(e.target.value) || 0})} required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sale Price (per piece)</label>
                        <input type="number" step="0.01" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                          value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})} required />
                      </div>
                      {priceEntryMode === 'box' && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Items in 1 Box</label>
                          <input type="number" placeholder="e.g. 12" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                            value={formData.piecesPerUnit} onChange={e => setFormData({...formData, piecesPerUnit: parseInt(e.target.value) || 1})} required />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cost Price (Rs. per {formData.unit})</label>
                      <input type="number" step="0.01" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                        value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: parseFloat(e.target.value) || 0})} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sale Price (Rs. per {formData.unit})</label>
                      <input type="number" step="0.01" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                        value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})} required />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Inventory (Dynamic) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-border/30 pb-2">
                  <BarChart2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Inventory Setup</span>
                </div>
                  <div className="bg-muted/20 p-5 rounded-[2rem] border border-border/50 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {!['kg', 'liter', 'gram'].includes(formData.unit) ? (
                        <>
                          {priceEntryMode === 'box' && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Boxes</label>
                              <input type="number" placeholder="0" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                                value={stockEntry.boxes} onChange={e => setStockEntry({...stockEntry, boxes: parseFloat(e.target.value) || 0})} />
                            </div>
                          )}
                          <div className={`space-y-1.5 ${priceEntryMode === 'single' ? 'col-span-2' : ''}`}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {priceEntryMode === 'box' ? 'Loose Pieces' : (isEditing ? 'Current Stock Count' : 'Initial Piece Count')}
                            </label>
                            <input type="number" placeholder="0" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                              value={stockEntry.pieces} onChange={e => setStockEntry({...stockEntry, pieces: parseFloat(e.target.value) || 0})} />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{isEditing ? 'Current Weight' : 'Initial Weight'} ({formData.unit})</label>
                          <input type="number" step="0.01" placeholder="0.00" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                            value={stockEntry.pieces} onChange={e => setStockEntry({...stockEntry, pieces: parseFloat(e.target.value) || 0})} />
                        </div>
                      )}
                    </div>
                    {priceEntryMode === 'box' && !['kg', 'liter', 'gram'].includes(formData.unit) && (
                      <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Stock:</span>
                        <span className="text-sm font-black text-primary">{(stockEntry.boxes * formData.piecesPerUnit + stockEntry.pieces).toFixed(0)} total pieces</span>
                      </div>
                    )}
                  </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Low Stock Warning at...</label>
                  <input type="number" step="0.01" placeholder="5" className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                    value={formData.minStockLevel} onChange={e => setFormData({...formData, minStockLevel: parseFloat(e.target.value) || 5})} required />
                </div>
              </div>

              {/* Live Profit Preview */}
              {formData.buyPrice > 0 && formData.salePrice > 0 && (
                <div className="col-span-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Profit Calculation</span>
                      <p className="text-[9px] text-emerald-400/70 font-bold uppercase mt-0.5">
                        {priceEntryMode === 'box' 
                          ? `Box Price: Rs. ${formData.buyPrice} | Piece Cost: Rs. ${(formData.buyPrice / formData.piecesPerUnit).toFixed(2)}`
                          : `Cost per item: Rs. ${formData.buyPrice}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-400">
                        +Rs. {(formData.salePrice - (priceEntryMode === 'box' ? formData.buyPrice / formData.piecesPerUnit : formData.buyPrice)).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-emerald-400/70">
                        {(((formData.salePrice - (priceEntryMode === 'box' ? formData.buyPrice / formData.piecesPerUnit : formData.buyPrice)) / (priceEntryMode === 'box' ? formData.buyPrice / formData.piecesPerUnit : formData.buyPrice)) * 100).toFixed(1)}% profit margin
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <button className="w-full gradient-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all glow-primary">
                  {isEditing ? 'Update Product' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight syne">Bulk Import</h2>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Upload CSV file</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-muted/20 border border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">{bulkFile ? bulkFile.name : "Select your CSV file"}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Max size 5MB</p>
                </div>
                <input 
                  type="file" 
                  accept=".csv"
                  className="hidden" 
                  id="csv-upload"
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                />
                <label 
                  htmlFor="csv-upload"
                  className="px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold cursor-pointer hover:bg-muted transition-all"
                >
                  {bulkFile ? "Change File" : "Choose File"}
                </label>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">CSV Format Guide</p>
                  <button 
                    onClick={() => {
                      const csvContent = "Name,SKU,Description,BuyPrice,SalePrice,Stock,Category,Unit,MinStock\nSample Product,SKU123,Product Description,100,150,50,General,pcs,10";
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'sample_products.csv';
                      a.click();
                    }}
                    className="flex items-center gap-1.5 text-[9px] font-bold text-primary hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    Download Sample
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Required columns: <span className="text-foreground font-medium">Name, BuyPrice, SalePrice</span>. 
                  Optional: SKU, Description, Stock, Category, Unit, MinStock.
                </p>
              </div>

              <button
                disabled={!bulkFile || isUploading}
                onClick={async () => {
                  if (!bulkFile) return;
                  setIsUploading(true);
                  const formData = new FormData();
                  formData.append('file', bulkFile);
                  
                  try {
                    await api.post('/products/bulk-csv-upload', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    toast.success("Products imported successfully!");
                    setShowBulkModal(false);
                    setBulkFile(null);
                    fetchData();
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || "Import failed");
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className="w-full gradient-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
              >
                {isUploading ? "Importing..." : "Start Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
