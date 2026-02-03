'use client';

import { useState, useEffect, use } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { collection, doc, getDoc, getDocs, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { money, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
    Upload,
    X,
    ChevronLeft,
    Save,
    Image as ImageIcon,
    AlertTriangle,
    Eye,
    Type,
    Tag,
    Hash,
    Loader2,
    ChevronDown
} from 'lucide-react';


interface PageProps {
    params: Promise<{ id: string }>;
}

interface Category {
    id: string;
    name: string;
    parentId?: string;
}

export default function EditProductPage({ params }: PageProps) {
    const { id } = use(params);
    const { user, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        isAdult: false,
        active: true,
    });

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>([]);

    useEffect(() => {
        if (user && isAdmin && id) {
            initPage();
        }
    }, [user, isAdmin, id]);

    const initPage = async () => {
        setLoading(true);
        try {
            // 1. Fetch Product
            const docRef = doc(db, 'products', id);
            const docSnap = await getDoc(docRef);

            // 2. Fetch Categories
            const catSnap = await getDocs(collection(db, 'categories'));
            const catData: Category[] = catSnap.docs.map(d => ({ id: d.id, name: d.data().name || '', parentId: d.data().parentId }));
            setCategories(catData);

            // 3. Set subcategories filtered by current product's category if possible
            const productData = docSnap.data();
            const currentCat = catData.find(c => c.name === productData?.category);
            if (currentCat) {
                const subs = catData.filter(c => c.parentId === currentCat.id).map(c => c.name);
                setSubcategories(subs);
            }

            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price?.toString() || '',
                    category: data.category || '',
                    subcategory: data.subcategory || '',
                    isAdult: data.isAdult || false,
                    active: data.active !== false,
                });
                setExistingImages(data.images || []);
            } else {
                alert('Ürün bulunamadı.');
                router.push('/products');
            }
        } catch (error) {
            console.error('Başlatma hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...files]);

            const previews = files.map(file => URL.createObjectURL(file));
            setNewPreviews(prev => [...prev, ...previews]);
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;

        setSaving(true);
        try {
            // 1. Upload New Images
            const uploadedUrls = await Promise.all(
                newImages.map(async (file) => {
                    const fileRef = ref(storage, `products/${Date.now()}-${file.name}`);
                    await uploadBytes(fileRef, file);
                    return getDownloadURL(fileRef);
                })
            );

            // 2. Update Firestore
            const docRef = doc(db, 'products', id);
            await updateDoc(docRef, {
                ...formData,
                price: parseFloat(formData.price),
                images: [...existingImages, ...uploadedUrls],
                updatedAt: serverTimestamp(),
            });

            router.push('/products');
        } catch (error) {
            console.error('Güncellenemedi:', error);
            alert('Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                    <span className="text-slate-500 font-medium font-medium">Veriler yükleniyor...</span>
                </div>
            </div>
        );
    }

    if (!user || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Sidebar />

            <main className="ml-64 p-8">
                <header className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ürünü Düzenle</h1>
                            <p className="text-slate-500 mt-1">"{formData.title}" bilgilerini güncelliyorsun.</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="xl:col-span-2 space-y-8">
                        <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Info */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Type className="w-5 h-5 text-purple-600" />
                                    <h2 className="text-lg font-bold text-slate-900">Temel Bilgiler</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Ürün Adı</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-slate-900 font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Açıklama</label>
                                        <textarea
                                            rows={6}
                                            required
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-slate-900 leading-relaxed font-medium"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Pricing & Categories */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Hash className="w-5 h-5 text-purple-600" />
                                            <label className="text-sm font-semibold text-slate-700">Fiyat (TL)</label>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-slate-900 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="w-5 h-5 text-purple-600" />
                                            <label className="text-sm font-semibold text-slate-700">Kategori</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.category}
                                                onChange={e => {
                                                    const newCatName = e.target.value;
                                                    setFormData({ ...formData, category: newCatName, subcategory: '' });
                                                    const selectedCat = categories.find(c => c.name === newCatName);
                                                    if (selectedCat) {
                                                        const subs = categories.filter(c => c.parentId === selectedCat.id).map(c => c.name);
                                                        setSubcategories(subs);
                                                    } else {
                                                        setSubcategories([]);
                                                    }
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-slate-900 font-medium appearance-none"
                                            >
                                                <option value="" className="text-slate-900">Kategori Seçin</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name} className="text-slate-900">{cat.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="w-5 h-5 text-purple-600 opacity-50" />
                                            <label className="text-sm font-semibold text-slate-700">Alt Kategori</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={formData.subcategory}
                                                onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-slate-900 font-medium appearance-none"
                                            >
                                                <option value="" className="text-slate-900">Alt Kategori Seçin (Opsiyonel)</option>
                                                {subcategories.map(sub => (
                                                    <option key={sub} value={sub} className="text-slate-900">{sub}</option>
                                                ))}
                                                <option value="manual" className="text-slate-900">+ Elle Giriş Yap</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                        {formData.subcategory === 'manual' && (
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Yeni Alt Kategori Adı"
                                                className="w-full mt-2 bg-purple-50 border border-purple-200 rounded-xl py-2 px-4 focus:outline-none text-purple-700 font-medium"
                                                onBlur={(e) => {
                                                    if (e.target.value) {
                                                        setFormData({ ...formData, subcategory: e.target.value });
                                                        setSubcategories(prev => [...prev, e.target.value]);
                                                    } else {
                                                        setFormData({ ...formData, subcategory: '' });
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Media */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-purple-600" />
                                        <h2 className="text-lg font-bold text-slate-900">Medya</h2>
                                    </div>
                                    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                        <span className="text-xs font-bold text-amber-700 uppercase">+18 İçerik</span>
                                        <input
                                            type="checkbox"
                                            checked={formData.isAdult}
                                            onChange={e => setFormData({ ...formData, isAdult: e.target.checked })}
                                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Existing Images */}
                                    {existingImages.map((url, i) => (
                                        <div key={`exist-${i}`} className="aspect-square rounded-2xl bg-slate-100 relative group overflow-hidden border border-slate-200">
                                            <img src={url} className={cn("w-full h-full object-cover transition-all duration-700", formData.isAdult ? "blur-2xl group-hover:blur-none" : "")} />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(i)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New Images Previews */}
                                    {newPreviews.map((url, i) => (
                                        <div key={`new-${i}`} className="aspect-square rounded-2xl bg-slate-100 relative group overflow-hidden border border-purple-200 ring-2 ring-purple-500/20">
                                            <img src={url} className={cn("w-full h-full object-cover transition-all duration-700", formData.isAdult ? "blur-2xl group-hover:blur-none" : "")} />
                                            <div className="absolute top-2 left-2 bg-purple-600 text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Yeni</div>
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(i)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-slate-400 hover:text-purple-600">
                                        <Upload className="w-8 h-8" />
                                        <span className="text-xs font-bold">EKLE</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                            </section>
                        </form>
                    </div>

                    {/* Preview (Simplified) */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Eye className="w-5 h-5 text-slate-400" />
                            Önizleme
                        </h2>

                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-purple-500/10 max-w-[320px] mx-auto group">
                            <div className="aspect-square bg-slate-100 rounded-[2rem] mb-6 overflow-hidden relative">
                                {(existingImages.length > 0 || newPreviews.length > 0) ? (
                                    <img src={newPreviews[0] || existingImages[0]} className={cn("w-full h-full object-cover transition-all duration-700 ease-in-out", formData.isAdult ? "blur-2xl group-hover:blur-none" : "")} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">{formData.category || 'Kategori'}</span>
                                <h4 className="font-extrabold text-slate-900 text-lg leading-tight line-clamp-1">{formData.title || 'Başlık'}</h4>
                                <div className="text-xl font-black text-slate-900">{formData.price ? money(parseFloat(formData.price)) : '0 TL'}</div>
                            </div>
                        </div>

                        <button
                            form="productForm"
                            type="submit"
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] active:scale-[0.98] text-white font-black py-4 rounded-3xl shadow-xl shadow-purple-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    DEĞİŞİKLİKLERİ KAYDET
                                </>
                            )}
                        </button>

                        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm font-bold text-slate-700">Satışa Açık / Aktif</span>
                            </label>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
