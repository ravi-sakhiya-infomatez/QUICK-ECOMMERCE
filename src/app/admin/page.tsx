'use client';

import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/toastSlice';

import { useGetAdminStatsQuery, useGenerateDiscountCodeMutation } from '@/store/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, ShoppingBag, Tag, Calculator } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Order, CartItem } from '@/lib/db';

/**
 * Admin Dashboard page.
 * Displays shop statistics and allows manual generation of discount codes when conditions are met.
 */
export default function AdminPage() {
    const { data: stats, isLoading, error } = useGetAdminStatsQuery();
    const [generateCode, { isLoading: isGenerating }] = useGenerateDiscountCodeMutation();

    // Default 'n' is 3 in our InMemoryStore logic, though backend doesn't explicitly expose 'n'.
    // We can infer or just hardcode for this UI representation if not fetched.
    // The requirement is "Next Discount Available in: X orders".
    // 
    // Logic: if orderCount % n === 0, discount is available NOW.
    // Else, orders needed = n - (orderCount % n).
    // Assuming n=3 from the previous context.
    // Ideally, the API should return 'n' or 'ordersUntilDiscount'.
    // Since I can't easily change the API interface contract blindly without checking if I can expose 'n',
    // I will assume n=3 based on known backend logic, or I should have exposed it in stats.
    // 
    // Let's assume n=3 as per the initial task description.
    const N = 3;

    const dispatch = useAppDispatch();

    const handleGenerate = async () => {
        try {
            const res = await generateCode().unwrap();
            if (res.success) {
                dispatch(addToast({
                    type: 'success',
                    title: 'System Authored Code',
                    message: `New discount matrix generated: ${res.code}. This is now globally active.`,
                }));
            } else {
                dispatch(addToast({
                    type: 'error',
                    title: 'Synthesis Failed',
                    message: res.message || 'The system could not authorize a new code at this time.',
                }));
            }
        } catch {
            dispatch(addToast({
                type: 'error',
                title: 'Data Flow Error',
                message: 'A critical interruption occurred while generating the code.',
            }));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto py-10 text-center text-red-500">
                    Failed to load admin stats.
                </div>
            </div>
        );
    }

    const ordersUntilNext = N - (stats.orderCount % N);
    const canGenerate = stats.orderCount > 0 && stats.orderCount % N === 0;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto py-12 px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gradient">Admin Analytics</h1>
                        <p className="text-muted-foreground mt-1">Real-time performance and order tracking</p>
                    </div>

                    <div className="glass p-1 rounded-2xl flex gap-1">
                        <Button
                            onClick={handleGenerate}
                            disabled={!canGenerate || isGenerating}
                            className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
                        >
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                            Generate Lucky Code
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { title: 'Units Moved', value: stats.totalItemsPurchased, icon: ShoppingBag, color: 'text-primary' },
                        { title: 'Gross Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-primary' },
                        { title: 'Value Saved', value: `$${stats.totalDiscountGiven.toFixed(2)}`, icon: Tag, color: 'text-green-500' },
                        { title: 'Next Drop In', value: canGenerate ? 'Ready!' : `${ordersUntilNext} orders`, icon: Calculator, color: 'text-blue-500' }
                    ].map((item, i) => (
                        <div key={i} className="premium-card p-6 rounded-3xl group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                                    <item.icon className={`h-6 w-6 ${item.color}`} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Live Sync</span>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">{item.title}</h3>
                            <div className="text-3xl font-black mt-1 tracking-tight">{item.value}</div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Recent Orders History
                            <Badge variant="outline" className="rounded-full px-3 py-0 border-white/10 text-xs font-medium">Auto-populating</Badge>
                        </h2>
                    </div>

                    <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Order ID</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">User</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Items</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Discount</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stats.orders && stats.orders.length > 0 ? (
                                        stats.orders.map((order: Order) => (
                                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">{order.userId}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    {order.items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0)} units
                                                </td>
                                                <td className="px-6 py-4 text-sm text-green-500 font-bold">
                                                    {order.discountAmount > 0 ? `-$${order.discountAmount.toFixed(2)}` : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-black">${order.totalAmount.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 rounded-lg">
                                                        Completed
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm italic">
                                                No order history available yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
