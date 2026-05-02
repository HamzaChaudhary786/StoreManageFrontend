"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Plus, 
  Layers, 
  Edit2, 
  Trash2, 
  X,
  Package,
  Search,
  ChevronRight
} from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.patch(`/categories/${editingId}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      fetchData();
      setFormData({ name: '', description: '' });
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      alert(isEditing ? "Failed to update category" : "Failed to create category");
    }
  };

  const handleEdit = (cat: any) => {
    setFormData({ name: cat.name, description: cat.description || '' });
    setEditingId(cat.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? Products within it will prevent deletion.")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  const fetchCategoryProducts = async (cat: any) => {
    setSelectedCategory(cat);
    setLoadingProducts(true);
    try {
      const res = await api.get('/products', { params: { category: cat.id } });
      setCategoryProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch category products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, productId: string) => {
    setDraggedProductId(productId);
    e.dataTransfer.setData('productId', productId);
    // Add visual ghosting effect
    const ghost = e.currentTarget as HTMLElement;
    ghost.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const ghost = e.currentTarget as HTMLElement;
    ghost.style.opacity = '1';
    setDraggedProductId(null);
  };

  const onDragOver = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    setDragOverCategoryId(catId);
  };

  const onDrop = async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    const productId = e.dataTransfer.getData('productId') || draggedProductId;
    setDragOverCategoryId(null);

    if (!productId) return;

    try {
      await api.patch(`/products/${productId}/category`, { categoryId: targetCategoryId });
      fetchData(); // Refresh counts
      if (selectedCategory) fetchCategoryProducts(selectedCategory); // Refresh list if open
    } catch (err) {
      alert("Failed to move product");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Category Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Organize your products into logical departments.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white gradient-primary glow-primary hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search categories..." 
          className="w-full bg-card border border-border/50 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-48 shimmer rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map(cat => (
            <div 
              key={cat.id} 
              onDragOver={(e) => onDragOver(e, cat.id)}
              onDragLeave={() => setDragOverCategoryId(null)}
              onDrop={(e) => onDrop(e, cat.id)}
              className={`bg-card border rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden ${
                dragOverCategoryId === cat.id 
                  ? 'border-primary ring-4 ring-primary/10 scale-[1.02] bg-primary/5' 
                  : 'border-border/50 hover:border-primary/30'
              }`}
            >
              <div className="absolute -right-8 -bottom-8 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500 text-primary">
                <Layers className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                    dragOverCategoryId === cat.id ? 'bg-primary' : 'gradient-primary'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(cat)}
                      className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-black tracking-tight mb-2 text-foreground">{cat.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-6 font-medium leading-relaxed">
                  {cat.description || "No description provided for this department."}
                </p>
                
                <div className="pt-5 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {cat._count?.products || 0} Products
                    </span>
                  </div>
                  <button 
                    onClick={() => fetchCategoryProducts(cat)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group/btn"
                  >
                    View All <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-20">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No categories found.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">{isEditing ? 'Edit Category' : 'New Category'}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{isEditing ? 'Update department details.' : 'Create a new product department.'}</p>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setEditingId(null);
                }} 
                className="p-2 hover:bg-muted rounded-xl text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category Name</label>
                <input 
                  className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all" 
                  placeholder="e.g. Dairy & Eggs"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Optional)</label>
                <textarea 
                  className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all min-h-[100px]" 
                  placeholder="Describe this category..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <button className="w-full gradient-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all glow-primary">
                {isEditing ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Products Modal (View All) */}
      {selectedCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border-l border-border/50 w-full max-w-xl h-full shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedCategory.name}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Manage {categoryProducts.length} Products</p>
                </div>
              </div>
              <button onClick={() => setSelectedCategory(null)} className="p-3 hover:bg-rose-500/10 rounded-2xl text-muted-foreground hover:text-rose-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              {loadingProducts ? (
                <div className="space-y-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}
                </div>
              ) : categoryProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-muted-foreground opacity-20" />
                  </div>
                  <p className="text-muted-foreground font-bold">No products in this category.</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-2">Drag products here to assign them</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Drag to another category to move
                  </p>
                  {categoryProducts.map(p => (
                    <div 
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      onDragEnd={handleDragEnd}
                      className="group bg-muted/20 border border-border/50 rounded-2xl p-4 flex items-center justify-between hover:border-primary/50 hover:bg-primary/5 transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center text-primary border border-border/50 group-hover:scale-110 transition-transform">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{p.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-tight">₨ {p.salePrice} • {p.stock} {p.unit} in stock</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-border/50 bg-muted/5 space-y-6">
               {/* Quick Move Targets */}
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Quick Move to Category</p>
                 <div className="flex flex-wrap gap-2">
                   {categories.filter(c => c.id !== selectedCategory.id).map(cat => (
                     <div
                       key={cat.id}
                       onDragOver={(e) => onDragOver(e, cat.id)}
                       onDragLeave={() => setDragOverCategoryId(null)}
                       onDrop={(e) => onDrop(e, cat.id)}
                       className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-default ${
                         dragOverCategoryId === cat.id
                           ? 'bg-primary border-primary text-white scale-110 shadow-lg glow-primary'
                           : 'bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary'
                       }`}
                     >
                       {cat.name}
                     </div>
                   ))}
                 </div>
               </div>

               <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    To add more products to this category, use the <span className="text-primary font-bold">Inventory Management</span> page and select <span className="font-bold">{selectedCategory.name}</span>.
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
