'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Save,
    Settings,
    Gift,
    Truck,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_CAMPAIGN_ID = 'VALENTINE_2026';

interface Reward {
    type: string;
    value?: number;
    weight: number;
    coupon: string;
    enabled: boolean;
    label: string;
}

interface Campaign {
    id: string;
    active: boolean;
    name: string;
    startAt: any;
    endAt: any;
    maxSpins: number;
    rewards: Reward[];
}

const defaultRewards: Reward[] = [
    { type: "free_shipping", weight: 40, coupon: "BEDAVA_KARGO", enabled: true, label: "Ücretsiz Kargo" },
    { type: "discount", value: 10, weight: 25, coupon: "GIZLI10", enabled: true, label: "%10 İndirim" },
    { type: "discount", value: 15, weight: 20, coupon: "GIZLI15", enabled: true, label: "%15 İndirim" },
    { type: "discount", value: 20, weight: 10, coupon: "GIZLI20", enabled: true, label: "%20 İndirim" },
    { type: "retry", weight: 30, enabled: true, label: "Tekrar Dene", coupon: "" }
];

export default function CampaignsPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user && isAdmin) {
            fetchCampaign();
        }
    }, [user, isAdmin]);

    const fetchCampaign = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'campaigns', DEFAULT_CAMPAIGN_ID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setCampaign(docSnap.data() as Campaign);
            } else {
                // Create initial campaign if doesn't exist
                const initialCampaign: Campaign = {
                    id: DEFAULT_CAMPAIGN_ID,
                    name: 'Sevgililer Günü Çarkı 2026',
                    active: true,
                    startAt: Timestamp.now(),
                    endAt: Timestamp.fromDate(new Date('2026-02-15')),
                    maxSpins: 2,
                    rewards: defaultRewards
                };
                await setDoc(docRef, initialCampaign);
                setCampaign(initialCampaign);
            }
        } catch (error) {
            console.error('Kampanya yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!campaign) return;
        setSaving(true);
        setMessage(null);
        try {
            const docRef = doc(db, 'campaigns', DEFAULT_CAMPAIGN_ID);
            await updateDoc(docRef, { ...campaign });
            setMessage({ type: 'success', text: 'Kampanya başarıyla kaydedildi.' });
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const updateReward = (index: number, field: keyof Reward, value: any) => {
        if (!campaign) return;
        const newRewards = [...campaign.rewards];
        newRewards[index] = { ...newRewards[index], [field]: value };

        // Suistimal kontrolü: %20'yi geçemez
        if (field === 'value' && value > 20) {
            return;
        }

        setCampaign({ ...campaign, rewards: newRewards });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || !isAdmin || !campaign) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Sidebar />

            <main className="ml-64 p-8">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">İndirim Çarkı Yönetimi</h1>
                        <p className="text-slate-500 mt-1">Spin-to-Win kampanyalarını yerel olarak yönetin ve test edin.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-200 disabled:opacity-50"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                        DEĞİŞİKLİKLERİ KAYDET
                    </button>
                </header>

                {message && (
                    <div className={cn(
                        "mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4",
                        message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                    )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-semibold">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Genel Ayarlar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <Settings className="w-5 h-5 text-purple-600" />
                                <h2 className="font-bold text-slate-900">Genel Ayarlar</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Kampanya Adı</label>
                                    <input
                                        type="text"
                                        value={campaign.name}
                                        onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div>
                                        <div className="font-bold text-slate-900">Kampanya Durumu</div>
                                        <div className="text-xs text-slate-500">Müşteriler çarkı görsün mü?</div>
                                    </div>
                                    <button
                                        onClick={() => setCampaign({ ...campaign, active: !campaign.active })}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            campaign.active ? "bg-purple-600" : "bg-slate-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            campaign.active ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bitiş Tarihi</label>
                                    <input
                                        type="datetime-local"
                                        value={campaign.endAt instanceof Timestamp ? new Date(campaign.endAt.seconds * 1000).toISOString().slice(0, 16) : campaign.endAt}
                                        onChange={(e) => setCampaign({ ...campaign, endAt: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    />
                                </div>

                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 italic text-purple-700 text-sm">
                                    <p><b>Not:</b> Çark sistemi suistimal korumalıdır. Bir kullanıcı maksimum 2 kez çevirebilir (sadece Retry durumunda).</p>
                                </div>
                            </div>
                        </div>

                        {/* Önizleme Butonu (Mock) */}
                        <div className="bg-slate-900 p-6 rounded-3xl text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <Eye className="w-5 h-5 text-purple-400" />
                                <h2 className="font-bold">Çark Önizleme</h2>
                            </div>
                            <p className="text-xs text-slate-400 mb-6">Mağazada görünecek çarkın canlı önizlemesi (Localhost üzerinden test edin).</p>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                MAĞAZADA TEST ET
                            </button>
                        </div>
                    </div>

                    {/* Ödüller Yönetimi */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <Gift className="w-5 h-5 text-purple-600" />
                                <h2 className="font-bold text-slate-900">Ödül Havuzu ve Ağırlıklar</h2>
                            </div>

                            <div className="space-y-4">
                                {campaign.rewards.map((reward, index) => (
                                    <div key={index} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {reward.type === 'free_shipping' && <Truck className="w-4 h-4 text-blue-600" />}
                                                    {reward.type === 'discount' && <Gift className="w-4 h-4 text-emerald-600" />}
                                                    {reward.type === 'retry' && <RefreshCcw className="w-4 h-4 text-amber-600" />}
                                                    <span className="font-bold text-slate-900 uppercase text-xs tracking-wider">{reward.label}</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={reward.enabled}
                                                    onChange={(e) => updateReward(index, 'enabled', e.target.checked)}
                                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Ağırlık (Olasılık)</label>
                                                    <input
                                                        type="number"
                                                        value={reward.weight}
                                                        onChange={(e) => updateReward(index, 'weight', parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold"
                                                        placeholder="Ağırlık"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Kupon Kodu</label>
                                                    <input
                                                        type="text"
                                                        value={reward.coupon}
                                                        disabled={reward.type === 'retry'}
                                                        onChange={(e) => updateReward(index, 'coupon', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                                                        placeholder="Kupon"
                                                    />
                                                </div>
                                            </div>

                                            {reward.type === 'discount' && (
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">İndirim Oranı (%)</label>
                                                    <input
                                                        type="number"
                                                        max="20"
                                                        value={reward.value}
                                                        onChange={(e) => updateReward(index, 'value', parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-purple-600 bg-purple-50"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
