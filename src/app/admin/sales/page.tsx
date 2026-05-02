"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Search,
  Trash2,
  ShoppingCart,
  Package,
  ChevronRight,
  CreditCard,
  Banknote,
  Minus,
  Plus,
  Scale,
  Milk,
  Box,
  Hash,
  ShoppingBag,
  Sparkles,
  Tag
} from 'lucide-react';

export default function SalesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isUdhar, setIsUdhar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

  const fetchData = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers')
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (isUdhar && !selectedCustomerId) return alert("Please select a customer for Udhar");

    setLoading(true);
    try {
      if (isUdhar) {
        await api.post('/customers/transaction', {
          customerId: selectedCustomerId,
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            priceAtTime: item.salePrice
          })),
          description: `POS Udhar Sale: ${cart.map(i => i.name).join(', ')}`
        });
      } else {
        await api.post('/orders', {
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            priceAtTime: item.salePrice
          })),
          isUdhar: false
        });
      }
      alert("Sale recorded successfully! 🎉");
      setCart([]);
      setSelectedCustomerId('');
      setIsUdhar(false);
      setDiscount(0);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record sale");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        .pos-root {
          font-family: 'DM Sans', sans-serif;
        }
        .pos-root * { box-sizing: border-box; }

        .syne { font-family: 'Syne', sans-serif; }

        /* Scrollbar hide */
        .no-sb::-webkit-scrollbar { display: none; }
        .no-sb { -ms-overflow-style: none; scrollbar-width: none; }

        /* Glass card */
        .glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .glass-hover:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(251,191,36,0.25);
          transform: translateY(-2px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(251,191,36,0.1);
        }

        /* Amber glow button */
        .btn-amber {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 4px 24px rgba(245,158,11,0.35), 0 0 0 1px rgba(245,158,11,0.2);
          color: #0a0a0f;
          transition: all 0.2s ease;
        }
        .btn-amber:hover:not(:disabled) {
          box-shadow: 0 8px 36px rgba(245,158,11,0.5), 0 0 0 1px rgba(245,158,11,0.3);
          transform: translateY(-1px);
        }
        .btn-amber:active:not(:disabled) { transform: translateY(0); }

        /* Rose glow button */
        .btn-rose {
          background: linear-gradient(135deg, #f43f5e, #e11d48);
          box-shadow: 0 4px 24px rgba(244,63,94,0.35), 0 0 0 1px rgba(244,63,94,0.2);
          color: #fff;
          transition: all 0.2s ease;
        }
        .btn-rose:hover:not(:disabled) {
          box-shadow: 0 8px 36px rgba(244,63,94,0.5);
          transform: translateY(-1px);
        }

        /* Product card animation */
        .prod-card {
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .prod-card:hover { transform: translateY(-4px) scale(1.01); }

        /* Pill badge */
        .pill-amber {
          background: rgba(245,158,11,0.12);
          color: #fbbf24;
          border: 1px solid rgba(245,158,11,0.2);
        }
        .pill-rose {
          background: rgba(244,63,94,0.12);
          color: #fb7185;
          border: 1px solid rgba(244,63,94,0.2);
        }
        .pill-muted {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Icon container */
        .icon-amber {
          background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.15));
          border: 1px solid rgba(245,158,11,0.2);
          color: #fbbf24;
        }
        .icon-rose {
          background: linear-gradient(135deg, rgba(244,63,94,0.2), rgba(225,29,72,0.15));
          border: 1px solid rgba(244,63,94,0.2);
          color: #fb7185;
        }

        /* Cart item */
        .cart-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s ease;
        }
        .cart-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(245,158,11,0.15);
        }

        /* Quick chip */
        .qty-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .qty-chip:hover {
          background: rgba(245,158,11,0.12);
          border-color: rgba(245,158,11,0.3);
          color: #fbbf24;
        }

        /* Divider */
        .divider { border-color: rgba(255,255,255,0.06); }

        /* Stepper */
        .stepper-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.15s ease;
          color: rgba(255,255,255,0.6);
        }
        .stepper-btn:hover {
          background: rgba(245,158,11,0.12);
          border-color: rgba(245,158,11,0.3);
          color: #fbbf24;
        }

        /* Payment toggle */
        .pay-toggle {
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4);
          transition: all 0.2s ease;
        }
        .pay-toggle:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); }
        .pay-toggle.active-cash {
          background: rgba(245,158,11,0.08);
          border-color: rgba(245,158,11,0.4);
          color: #fbbf24;
          box-shadow: 0 0 20px rgba(245,158,11,0.1);
        }
        .pay-toggle.active-udhar {
          background: rgba(244,63,94,0.08);
          border-color: rgba(244,63,94,0.4);
          color: #fb7185;
          box-shadow: 0 0 20px rgba(244,63,94,0.1);
        }

        /* Search bar */
        .search-bar {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          color: #fff;
          transition: all 0.2s ease;
        }
        .search-bar::placeholder { color: rgba(255,255,255,0.25); }
        .search-bar:focus {
          outline: none;
          border-color: rgba(245,158,11,0.4);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
        }

        /* Select */
        .cust-select {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          color: #fff;
          appearance: none;
          transition: all 0.2s ease;
        }
        .cust-select:focus {
          outline: none;
          border-color: rgba(244,63,94,0.5);
          box-shadow: 0 0 0 3px rgba(244,63,94,0.08);
        }
        .cust-select option { background: #1a1a2e; color: #fff; }

        /* Fade in */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; }

        /* Cart badge */
        .in-cart-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #0a0a0f;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.03em;
        }

        /* Number input */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }

        /* Total amount shine */
        .total-amount {
          background: linear-gradient(135deg, #fbbf24, #f59e0b, #fcd34d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .total-amount-rose {
          background: linear-gradient(135deg, #fb7185, #f43f5e, #fda4af);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background noise texture */
        .bg-noise {
          background-color: #0c0c14;
          background-image: 
            radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.03) 0%, transparent 50%);
        }
      `}</style>

      <div className="pos-root bg-noise" style={{ minHeight: '100%', padding: '0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '20px',
            height: 'calc(100vh - 120px)',
          }}
          className="fade-up"
        >
          {/* ═══════════════════════════════════════
              LEFT — Product Catalog
          ═══════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search
                style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)', width: '18px', height: '18px',
                  color: 'rgba(255,255,255,0.3)', pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search products by name or SKU…"
                className="search-bar syne"
                style={{
                  width: '100%', borderRadius: '16px',
                  padding: '14px 18px 14px 48px',
                  fontSize: '14px', fontWeight: 600,
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Grid */}
            <div
              className="no-sb"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
                gap: '12px',
                overflowY: 'auto',
                paddingBottom: '8px',
                paddingRight: '4px',
                flex: 1,
                alignContent: 'start',
              }}
            >
              {filteredProducts.map((p, i) => {
                const cartItem = cart.find(item => item.id === p.id);
                const inCart = !!cartItem;
                const isWeight = ['kg', 'liter', 'gram'].includes(p.unit);

                return (
                  <div
                    key={p.id}
                    className={`glass prod-card ${p.stock <= 0 ? '' : ''}`}
                    style={{
                      borderRadius: '20px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '280px',
                      justifyContent: 'space-between',
                      gap: '12px',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: p.stock <= 0 ? 0.4 : 1,
                      cursor: p.stock <= 0 ? 'not-allowed' : 'default',
                      animationDelay: `${i * 0.03}s`,
                    }}
                  >
                    {/* In-cart badge */}
                    {inCart && (
                      <div
                        className="in-cart-badge syne"
                        style={{
                          position: 'absolute', top: 0, right: 0,
                          padding: '3px 10px',
                          borderRadius: '0 20px 0 12px',
                        }}
                      >
                        {cartItem.quantity} in cart
                      </div>
                    )}
                    {/* Top Content Group */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Icon */}
                      <div
                        className="icon-amber"
                        style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Package style={{ width: '18px', height: '18px' }} />
                      </div>

                      {/* Name & category */}
                    <div>
                      <p
                        className="syne"
                        style={{
                          fontSize: '13px', fontWeight: 700,
                          color: '#fff', lineHeight: 1.3,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          marginBottom: '4px',
                        }}
                      >
                        {p.name}
                      </p>
                      <span
                        className="pill-muted"
                        style={{
                          fontSize: '9px', fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '2px 7px', borderRadius: '20px',
                        }}
                      >
                        {p.category?.name || 'General'}
                      </span>
                    </div>

                    {/* Price & stock */}
                    <div
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '10px',
                      }}
                    >
                      <p
                        className="syne"
                        style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24' }}
                      >
                        ₨{p.salePrice}
                      </p>
                      <span
                        className={p.stock <= 5 ? 'pill-rose' : 'pill-muted'}
                        style={{
                          fontSize: '9px', fontWeight: 700,
                          letterSpacing: '0.05em',
                          padding: '2px 7px', borderRadius: '20px',
                        }}
                      >
                        {p.stock.toFixed(1)} {p.unit}
                      </span>
                    </div>
                  </div>

                    {/* Add / quantity */}
                    {!inCart ? (
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                        className="syne"
                        style={{
                          width: '100%', padding: '9px 0',
                          borderRadius: '12px',
                          background: 'rgba(245,158,11,0.1)',
                          border: '1px solid rgba(245,158,11,0.2)',
                          color: '#fbbf24',
                          fontSize: '10px', fontWeight: 800,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          (e.target as HTMLElement).style.background = 'rgba(245,158,11,0.2)';
                          (e.target as HTMLElement).style.borderColor = 'rgba(245,158,11,0.4)';
                        }}
                        onMouseLeave={e => {
                          (e.target as HTMLElement).style.background = 'rgba(245,158,11,0.1)';
                          (e.target as HTMLElement).style.borderColor = 'rgba(245,158,11,0.2)';
                        }}
                      >
                        + Add to Cart
                      </button>
                    ) : (
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(255,255,255,0.04)',
                          borderRadius: '12px', padding: '4px',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(p.id, cartItem.quantity - (isWeight ? 0.25 : 1))}
                          className="stepper-btn"
                          style={{
                            flex: 1, padding: '7px 0', borderRadius: '9px',
                            cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Minus style={{ width: '11px', height: '11px' }} />
                        </button>
                        <span
                          className="syne"
                          style={{ flex: 1, textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}
                        >
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(p)}
                          className="stepper-btn"
                          style={{
                            flex: 1, padding: '7px 0', borderRadius: '9px',
                            cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Plus style={{ width: '11px', height: '11px' }} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div
                  style={{
                    gridColumn: '1/-1', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '60px 20px', gap: '12px',
                  }}
                >
                  <div
                    className="icon-amber"
                    style={{
                      width: '56px', height: '56px', borderRadius: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <ShoppingBag style={{ width: '24px', height: '24px' }} />
                  </div>
                  <p className="syne" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: 600 }}>
                    No products found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════
              RIGHT — Cart & Checkout
          ═══════════════════════════════════════ */}
          <div
            className="glass"
            style={{
              borderRadius: '28px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 22px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  className="icon-amber"
                  style={{
                    width: '42px', height: '42px', borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ShoppingCart style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3
                    className="syne"
                    style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}
                  >
                    Current Sale
                  </h3>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
                    {cart.length} item{cart.length !== 1 ? 's' : ''} · ₨{subtotal.toFixed(0)}
                  </p>
                </div>
                {cart.length > 0 && (
                  <div
                    className="syne in-cart-badge"
                    style={{
                      marginLeft: 'auto', padding: '4px 12px',
                      borderRadius: '20px', fontSize: '11px', fontWeight: 800,
                    }}
                  >
                    {cart.reduce((acc, i) => acc + i.quantity, 0).toFixed(1)} qty
                  </div>
                )}
              </div>
            </div>

            {/* Cart items */}
            <div
              className="no-sb"
              style={{
                flex: 1, overflowY: 'auto',
                padding: '14px 14px 8px',
                display: 'flex', flexDirection: 'column', gap: '10px',
              }}
            >
              {cart.length === 0 ? (
                <div
                  style={{
                    height: '100%', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '14px', padding: '40px 20px',
                  }}
                >
                  <div
                    style={{
                      width: '64px', height: '64px', borderRadius: '22px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <ShoppingCart style={{ width: '26px', height: '26px', color: 'rgba(255,255,255,0.1)' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p className="syne" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 700 }}>
                      Cart is empty
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px', marginTop: '4px', letterSpacing: '0.05em' }}>
                      Select products to begin
                    </p>
                  </div>
                </div>
              ) : (
                cart.map(item => {
                  const isWeight = ['kg', 'liter', 'gram'].includes(item.unit);

                  return (
                    <div key={item.id} className="cart-item" style={{ borderRadius: '18px', padding: '14px' }}>
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div
                          className="icon-amber"
                          style={{
                            width: '36px', height: '36px', borderRadius: '11px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {item.unit === 'kg' ? <Scale style={{ width: '15px', height: '15px' }} /> :
                            item.unit === 'liter' ? <Milk style={{ width: '15px', height: '15px' }} /> :
                              item.unit === 'packet' ? <Box style={{ width: '15px', height: '15px' }} /> :
                                <Hash style={{ width: '15px', height: '15px' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            className="syne"
                            style={{
                              fontSize: '12px', fontWeight: 700, color: '#fff',
                              lineHeight: 1.4, marginBottom: '2px',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                          </p>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                            ₨{item.salePrice} / {item.unit}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p className="syne" style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>
                            ₨{(item.salePrice * item.quantity).toFixed(0)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            padding: '4px', borderRadius: '8px', cursor: 'pointer',
                            background: 'transparent', border: 'none',
                            color: 'rgba(255,255,255,0.2)', transition: 'all 0.15s ease',
                            flexShrink: 0,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fb7185')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                        >
                          <Trash2 style={{ width: '13px', height: '13px' }} />
                        </button>
                      </div>

                      {/* Quick presets */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                        {isWeight
                          ? [0.25, 0.5, 1, 2, 5].map(v => (
                            <button
                              key={v}
                              onClick={() => updateQuantity(item.id, v)}
                              className="qty-chip syne"
                              style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.05em' }}
                            >
                              {v >= 1 ? `${v}kg` : `${v * 1000}g`}
                            </button>
                          ))
                          : [1, 2, 5, 10, 12, 24].map(v => (
                            <button
                              key={v}
                              onClick={() => updateQuantity(item.id, v)}
                              className="qty-chip syne"
                              style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.05em' }}
                            >
                              {v} {item.unit === 'packet' ? 'pkt' : 'pcs'}
                            </button>
                          ))
                        }
                      </div>

                      {/* Stepper */}
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginTop: '10px', paddingTop: '10px',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: '2px',
                            background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '3px',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - (isWeight ? 0.1 : 1))}
                            className="stepper-btn"
                            style={{ width: '30px', height: '30px', borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Minus style={{ width: '12px', height: '12px' }} />
                          </button>
                          <input
                            type="number"
                            step={isWeight ? '0.01' : '1'}
                            className="syne"
                            style={{
                              width: '52px', textAlign: 'center', background: 'transparent',
                              border: 'none', outline: 'none', fontSize: '12px', fontWeight: 800,
                              color: '#fbbf24',
                            }}
                            value={item.quantity}
                            onChange={e => updateQuantity(item.id, parseFloat(e.target.value))}
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + (isWeight ? 0.1 : 1))}
                            className="stepper-btn"
                            style={{ width: '30px', height: '30px', borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Plus style={{ width: '12px', height: '12px' }} />
                          </button>
                        </div>
                        <span
                          className="pill-amber syne"
                          style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}
                        >
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer — Checkout */}
            <div
              style={{
                padding: '16px 18px 20px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', gap: '14px',
              }}
            >
              {/* Payment type toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => setIsUdhar(false)}
                  className={`pay-toggle syne ${!isUdhar ? 'active-cash' : ''}`}
                  style={{
                    padding: '10px 8px', borderRadius: '14px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  }}
                >
                  <Banknote style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cash Sale</span>
                </button>
                <button
                  onClick={() => setIsUdhar(true)}
                  className={`pay-toggle syne ${isUdhar ? 'active-udhar' : ''}`}
                  style={{
                    padding: '10px 8px', borderRadius: '14px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  }}
                >
                  <CreditCard style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Udhar Entry</span>
                </button>
              </div>

              {/* Customer select (Udhar) */}
              {isUdhar && (
                <div style={{ animation: 'fadeUp 0.2s ease' }}>
                  <p className="syne" style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
                    Select Customer
                  </p>
                  <select
                    className="cust-select syne"
                    style={{ width: '100%', borderRadius: '14px', padding: '11px 14px', fontSize: '13px', fontWeight: 600 }}
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="">Choose Customer…</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Discount */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.3)' }} />
                  <div>
                    <p className="syne" style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                      Discount (₨)
                    </p>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      className="syne"
                      style={{
                        background: 'transparent', border: 'none', outline: 'none',
                        fontSize: '14px', fontWeight: 800,
                        color: '#fcd34d', width: '80px', marginTop: '1px',
                      }}
                      value={discount || ''}
                      onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>
                {discount > 0 && (
                  <span className="pill-amber syne" style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                    −₨{discount.toFixed(0)}
                  </span>
                )}
              </div>

              {/* Total */}
              <div
                style={{
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                  padding: '4px 2px',
                }}
              >
                <div>
                  <p className="syne" style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
                    Total Amount
                  </p>
                  {discount > 0 && (
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through', marginBottom: '2px', fontWeight: 600 }}>
                      ₨{subtotal.toFixed(0)}
                    </p>
                  )}
                  <p className={`syne ${isUdhar ? 'total-amount-rose' : 'total-amount'}`} style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
                    ₨{total.toFixed(0)}
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginBottom: '4px' }}>
                  <p className="syne" style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
                    Items
                  </p>
                  <p className="syne" style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
                    {cart.reduce((acc, i) => acc + i.quantity, 0).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Checkout button */}
              <button
                disabled={loading || cart.length === 0}
                onClick={handleCheckout}
                className={`syne ${isUdhar ? 'btn-rose' : 'btn-amber'}`}
                style={{
                  width: '100%', padding: '15px',
                  borderRadius: '16px', border: 'none', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '12px', fontWeight: 800,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: cart.length === 0 ? 0.4 : 1,
                }}
              >
                {loading ? (
                  'Processing…'
                ) : (
                  <>
                    {isUdhar ? 'Confirm Udhar' : 'Finish Sale'}
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}