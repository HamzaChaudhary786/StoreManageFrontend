"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { 
  Package, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.admin, res.data.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 gradient-primary relative overflow-hidden flex-col items-center justify-center p-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/30">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">FreshMart</h1>
          <p className="text-xl font-bold text-white/80 mb-8">Admin Control Center</p>
          <div className="space-y-4 text-left">
            {[
              'Complete inventory management',
              'Udhar & credit tracking',
              'Real-time stock monitoring',
              'Profit & margin analytics',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-sm font-medium text-white/90">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 gradient-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 glow-primary">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">FreshMart Admin</h1>
            <p className="text-muted-foreground mt-1">Inventory & Udhar Management</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight">Sign In</h2>
            <p className="text-muted-foreground mt-1 font-medium">Access your admin dashboard securely.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" style={{width: '18px', height: '18px'}} />
                <input 
                  type="email" 
                  required
                  className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-sm"
                  placeholder="admin@freshmart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" style={{width: '18px', height: '18px'}} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-card border border-border rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff style={{width: '18px', height: '18px'}} /> : <Eye style={{width: '18px', height: '18px'}} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all glow-primary hover:opacity-90 disabled:opacity-50 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-2 mt-8 p-4 bg-card border border-border/50 rounded-2xl">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground font-medium">Access restricted to authorized administrators only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
