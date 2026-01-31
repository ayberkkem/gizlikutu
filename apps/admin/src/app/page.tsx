'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Clock,
  Pencil
} from 'lucide-react';
import { money, cn } from '@/lib/utils';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    activeProducts: 0,
    totalUsers: 0
  });
  const [lastOrders, setLastOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Siparişleri Çek (Toplam Satış ve Bekleyenler için)
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalSales = orders.reduce((acc, curr: any) => acc + (curr.totalPrice || 0), 0);
      const pendingOrders = orders.filter((o: any) => o.status === 'pending' || !o.status).length;

      // 2. Ürünleri Çek
      const productsSnap = await getDocs(collection(db, 'products'));
      const activeProducts = productsSnap.size;
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 3. Kullanıcıları Çek
      const usersSnap = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnap.size;

      // 4. Son Siparişler (Limit 5)
      const lastOrdersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
      const lastOrdersSnap = await getDocs(lastOrdersQuery);
      const lastOrdersData = lastOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setStats({
        totalSales,
        pendingOrders,
        activeProducts,
        totalUsers
      });
      setLastOrders(lastOrdersData);
      setTopProducts(products.slice(0, 5)); // Şimdilik ilk 5 ürün popüler olarak gösterilsin

    } catch (error) {
      console.error('Dashboard verisi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const statsDisplay = [
    { name: 'Toplam Satış', value: money(stats.totalSales), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Bekleyen Siparişler', value: stats.pendingOrders.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Aktif Ürünler', value: stats.activeProducts.toString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Yeni Müşteriler', value: stats.totalUsers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <main className="ml-64 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-slate-900">Hoş Geldiniz, {user.displayName || 'Admin'}</h1>
          <p className="text-slate-500 mt-1">İşte bugün mağazanızda olup bitenler.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statsDisplay.map((stat) => (
            <div key={stat.name} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-slate-400">Genel</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{loading ? '...' : stat.value}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">{stat.name}</div>
            </div>
          ))}
        </div>

        {/* Content Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Son Siparişler */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Son Siparişler</h3>
              <Link href="/orders" className="text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors">Tümünü Gör</Link>
            </div>
            <div className="flex-1">
              {loading ? (
                <div className="p-6 text-center py-20 text-slate-400">Yükleniyor...</div>
              ) : lastOrders.length === 0 ? (
                <div className="p-6 text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">Henüz sipariş verisi bulunmuyor.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {lastOrders.map((order) => (
                    <div key={order.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 font-mono text-sm leading-none mb-1">#{order.id.slice(0, 8)}</div>
                          <div className="text-xs text-slate-500">{order.customerName || 'Anonim'} • {money(order.totalPrice || 0)}</div>
                        </div>
                      </div>
                      <div className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                        order.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {order.status === 'paid' ? 'Ödendi' : 'Beklemede'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popüler Ürünler */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Mevcut Ürünler</h3>
              <Link href="/products" className="text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors">Tümünü Gör</Link>
            </div>
            <div className="flex-1">
              {loading ? (
                <div className="p-6 text-center py-20 text-slate-400">Yükleniyor...</div>
              ) : topProducts.length === 0 ? (
                <div className="p-6 text-center py-20">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">Ürün bulunmuyor.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {topProducts.map((product) => (
                    <div key={product.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm leading-none mb-1 line-clamp-1">{product.title}</div>
                          <div className="text-xs text-slate-500">{product.category || 'Genel'} • {money(product.price)}</div>
                        </div>
                      </div>
                      <Link href={`/products/edit/${product.id}`} className="p-2 text-slate-400 hover:text-purple-600 transition-colors">
                        <Pencil className="w-5 h-5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
