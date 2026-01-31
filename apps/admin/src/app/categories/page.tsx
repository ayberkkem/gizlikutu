'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import {
    collection,
    query,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Plus,
    Trash2,
    Tags,
    Layers,
    Edit2,
    Check,
    X,
    ChevronRight,
    ChevronDown,
    Loader2,
    PackagePlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
    id: string;
    name: string;
    parentId?: string;
    createdAt?: any;
}

export default function CategoriesPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCat, setNewCat] = useState('');
    const [parentSelect, setParentSelect] = useState('');
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        if (user && isAdmin) {
            fetchCategories();
        }
    }, [user, isAdmin]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'categories'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
            // Client-side sorting to avoid index requirements
            const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
            setCategories(sortedData);
        } catch (error) {
            console.error('Kategoriler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        setCreating(true);
        try {
            await addDoc(collection(db, 'categories'), {
                name: newCat,
                parentId: parentSelect || null,
                createdAt: serverTimestamp()
            });
            setNewCat('');
            setParentSelect('');
            fetchCategories();
        } catch (error) {
            alert('Kategori eklenemedi.');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editValue.trim()) return;
        try {
            const docRef = doc(db, 'categories', id);
            await updateDoc(docRef, { name: editValue });
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            alert('Güncelleme başarısız oldu.');
        }
    };

    const handleQuickAddSub = async (parentId: string) => {
        if (!editValue.trim()) return;
        try {
            await addDoc(collection(db, 'categories'), {
                name: editValue,
                parentId: parentId,
                createdAt: serverTimestamp()
            });
            setEditingId(null);
            setEditValue('');
            fetchCategories();
        } catch (error) {
            alert('Alt kategori eklenemedi.');
        }
    };

    const handleDelete = async (id: string) => {
        const hasChildren = categories.some(cat => cat.parentId === id);
        if (hasChildren) {
            alert('Bu kategoriye bağlı alt kategoriler var. Önce onları silmelisiniz.');
            return;
        }

        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
        try {
            await deleteDoc(doc(db, 'categories', id));
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            alert('Silme işlemi başarısız oldu.');
        }
    };

    const startEditing = (cat: Category) => {
        setEditingId(cat.id);
        setEditValue(cat.name);
    };

    // Organize categories into hierarchy
    const mainCategories = categories.filter(cat => !cat.parentId);
    const getSubcategories = (parentId: string) => categories.filter(cat => cat.parentId === parentId);

    if (authLoading) return null;
    if (!user || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Sidebar />

            <main className="ml-64 p-8">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kategori Yönetimi</h1>
                    <p className="text-slate-500 mt-1 font-medium">Hiyerarşik kategori ve alt kategori yapısını buradan yönetin.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Create Form */}
                    <div className="lg:col-span-4">
                        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-purple-500/5 sticky top-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Hızlı Kategori Ekle</h2>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Kategori Adı</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCat}
                                        onChange={e => setNewCat(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all font-medium text-slate-900"
                                        placeholder="Örn: Masaj Yağları"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Üst Kategori (Opsiyonel)</label>
                                    <div className="relative">
                                        <select
                                            value={parentSelect}
                                            onChange={e => setParentSelect(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all font-medium appearance-none text-slate-900"
                                        >
                                            <option value="" className="text-slate-900">-- Ana Kategori Yap --</option>
                                            {mainCategories.map(cat => (
                                                <option key={cat.id} value={cat.id} className="text-slate-900">{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 px-1 font-bold uppercase tracking-wider">Alt kategori oluşturmak için bir ana kategori seçin.</p>
                                </div>

                                <button
                                    disabled={creating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'OLUŞTUR VE YAYINLA'}
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Right: Hierarchical List */}
                    <div className="lg:col-span-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 italic text-slate-400">
                                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                                <span>Kategoriler listeleniyor...</span>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Tags className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Henüz Kategori Yok</h3>
                                <p className="text-slate-400">Soldaki formu kullanarak ilk kategorinizi oluşturun.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {mainCategories.map(cat => (
                                    <div key={cat.id} className="space-y-3">
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-purple-300 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                                                        <Layers className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        {editingId === cat.id ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    autoFocus
                                                                    value={editValue}
                                                                    onChange={e => setEditValue(e.target.value)}
                                                                    className="flex-1 bg-slate-50 border border-purple-200 rounded-xl px-3 py-1 font-bold text-slate-900 focus:outline-none"
                                                                    onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                                                                />
                                                                <button onClick={() => handleUpdate(cat.id)} className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><Check className="w-4 h-4" /></button>
                                                                <button onClick={() => setEditingId(null)} className="p-1 bg-slate-200 text-slate-500 rounded-lg"><X className="w-4 h-4" /></button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                                                                    {cat.name}
                                                                    <button onClick={() => startEditing(cat)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-purple-600 transition-all">
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ANA KATEGORİ</span>
                                                                    <span className="text-slate-200">•</span>
                                                                    <span className="text-[10px] font-mono text-slate-300">{cat.id}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <a
                                                        href={`/products/new?category=${encodeURIComponent(cat.name)}`}
                                                        className="flex items-center gap-2 px-4 py-2 text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                    >
                                                        <PackagePlus className="w-4 h-4" />
                                                        ÜRÜN EKLE
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(`new-sub-${cat.id}`);
                                                            setEditValue('');
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 text-xs font-black text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        ALT KATEGORİ EKLE
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Inline Add Subcat UI */}
                                            {editingId === `new-sub-${cat.id}` && (
                                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <Plus className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        autoFocus
                                                        placeholder="Yeni Alt Kategori Adı"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        className="flex-1 bg-slate-50 border border-purple-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:outline-none placeholder:font-medium"
                                                        onKeyDown={e => e.key === 'Enter' && handleQuickAddSub(cat.id)}
                                                    />
                                                    <button
                                                        onClick={() => handleQuickAddSub(cat.id)}
                                                        className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Nested Subcategories List */}
                                        <div className="ml-12 border-l-2 border-slate-100 pl-6 space-y-3">
                                            {getSubcategories(cat.id).map(sub => (
                                                <div key={sub.id} className="bg-white p-4 px-6 rounded-2xl border border-slate-50 flex items-center justify-between group hover:border-pink-200 transition-all">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            {editingId === sub.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        autoFocus
                                                                        value={editValue}
                                                                        onChange={e => setEditValue(e.target.value)}
                                                                        className="flex-1 bg-slate-50 border border-pink-200 rounded-lg px-3 py-1 font-bold text-slate-900 focus:outline-none"
                                                                        onKeyDown={e => e.key === 'Enter' && handleUpdate(sub.id)}
                                                                    />
                                                                    <button onClick={() => handleUpdate(sub.id)} className="p-1 bg-emerald-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                                                                    <button onClick={() => setEditingId(null)} className="p-1 bg-slate-200 text-slate-500 rounded-lg"><X className="w-4 h-4" /></button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                                                        {sub.name}
                                                                        <button onClick={() => startEditing(sub)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-pink-600 transition-all">
                                                                            <Edit2 className="w-3 h-3" />
                                                                        </button>
                                                                    </h4>
                                                                    <span className="text-[9px] font-mono text-slate-300">ID: {sub.id}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={`/products/new?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                                                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                                                        >
                                                            <PackagePlus className="w-3.5 h-3.5" />
                                                            ÜRÜN EKLE
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(sub.id)}
                                                            className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
