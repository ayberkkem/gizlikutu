'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Tags,
    LogOut,
    ExternalLink
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Siparişler', icon: ShoppingBag, href: '/orders' },
    { name: 'Ürünler', icon: Package, href: '/products' },
    { name: 'Kategoriler', icon: Tags, href: '/categories' },
];

export default function Sidebar() {
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                        <span className="font-bold">GK</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Admin Panel</span>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = typeof item.icon === 'string' ? Package : item.icon;
                        const href = item.href || '#';
                        const isActive = pathname === href;

                        return (
                            <Link
                                key={item.name}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-purple-400")} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 space-y-4">
                <a
                    href="http://localhost:3000"
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                    <ExternalLink className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-sm">Mağazayı Gör</span>
                </a>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Çıkış Yap</span>
                </button>
            </div>
        </aside>
    );
}
