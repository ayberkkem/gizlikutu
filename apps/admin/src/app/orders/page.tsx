'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { money, cn } from '@/lib/utils';
import { Search, Filter, Eye, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && isAdmin) {
            fetchOrders();
        }
    }, [user, isAdmin]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(data);
        } catch (error) {
            console.error('Siparişler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;
    if (!user || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Sidebar />

            <main className="ml-64 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-slate-900">Sipariş Yönetimi</h1>
                        <p className="text-slate-500 mt-1">Tüm müşteri siparişlerini buradan izleyebilirsiniz.</p>
                    </div>
                </header>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Sipariş ID veya Müşteri ara..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-slate-900 font-medium"
                        />
                    </div>
                    <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                        <Filter className="w-5 h-5" />
                        Filtrele
                    </button>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sipariş ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Müşteri</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400">Yükleniyor...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400">Henüz sipariş bulunmuyor.</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-purple-600">#{order.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{order.customerName || 'Anonim Müşteri'}</div>
                                            <div className="text-xs text-slate-400">{order.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase",
                                                order.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                            )}>
                                                {order.status === 'paid' ? 'Ödendi' : 'Beklemede'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{money(order.totalPrice || 0)}</td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
