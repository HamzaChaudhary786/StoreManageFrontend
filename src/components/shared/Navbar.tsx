"use client";

import Link from 'next/link';
import { ShoppingCart, User, Menu, Heart, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

import { useState, useEffect } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black text-2xl tracking-tighter text-primary">
            FRESHMART
          </Link>
          
          <div className="hidden lg:flex gap-6 items-center">
            <Link href="/shop" className="text-sm font-semibold hover:text-primary transition-colors">Shop</Link>
            <Link href="/categories" className="text-sm font-semibold hover:text-primary transition-colors">Categories</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-4 border-r pr-4 border-border">
            <Link href="/wishlist" className="relative p-2 hover:bg-muted rounded-full transition-colors group">
              <Heart className="w-5 h-5 group-hover:text-rose-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors group">
              <ShoppingCart className="w-5 h-5 group-hover:text-primary transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-primary-foreground w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
          
          {mounted && (
            <div className="flex items-center gap-2 md:gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">My Account</span>
                  </Link>
                  <button 
                    onClick={logout} 
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-5 py-2 text-sm font-bold hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <button className="lg:hidden p-2 hover:bg-muted rounded-full">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};
