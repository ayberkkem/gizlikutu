'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { money, cn } from '@/lib/utils';
import { Search, Plus, Edit2, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (user && isAdmin) {
            fetchProducts();
        }
    }, [user, isAdmin]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(data);
        } catch (error) {
            console.error('Ürünler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        try {
            await deleteDoc(doc(db, 'products', id));
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            alert('Silme işlemi başarısız oldu.');
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ürün Yönetimi</h1>
                        <p className="text-slate-500 mt-1">Stoktaki tüm ürünleri yönetin ve yenilerini ekleyin.</p>
                    </div>
                    <Link
                        href="/products/new"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Ürün Ekle
                    </Link>
                </header>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Ürün adı, ID veya kategori ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-slate-900 font-medium"
                        />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-20 text-slate-400">Yükleniyor...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-purple-500/10 transition-shadow duration-300">
                                {/* Image Placeholder with Blur Logic */}
                                <div className="aspect-square bg-slate-50 relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className={cn(
                                                "w-full h-full object-cover transition-all duration-700 ease-in-out",
                                                product.isAdult ? "blur-2xl group-hover:blur-none" : ""
                                            )}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <ImageIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                    {product.isAdult && (
                                        <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                                            +18
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">
                                        {product.category || 'Kategorisiz'}
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1 mb-2">
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-xl font-extrabold text-slate-900">{money(product.price)}</span>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/products/edit/${product.id}`}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
