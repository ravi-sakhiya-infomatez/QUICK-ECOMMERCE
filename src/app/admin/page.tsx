'use client';

import { useGetAdminStatsQuery, useGenerateDiscountCodeMutation } from '@/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, ShoppingBag, Tag, Calculator } from 'lucide-react';
import Navbar from '@/components/Navbar';

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

    // Let's assume n=3 as per the initial task description.
    const N = 3;

    const handleGenerate = async () => {
        try {
            const res = await generateCode().unwrap();
            if (res.success) {
                alert(`Code Generated: ${res.code}`);
            } else {
                alert(`Failed: ${res.message}`);
            }
        } catch {
            alert('Error generating code');
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
            <main className="container mx-auto py-10 px-6">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalItemsPurchased}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Purchase Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Discount Amount</CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">${stats.totalDiscountGiven.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next Discount In</CardTitle>
                            <Calculator className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {canGenerate ? 'Available Now!' : `${ordersUntilNext} orders`}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                (Every {N}rd order)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col items-start gap-4">
                    <h2 className="text-xl font-semibold">Actions</h2>
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        disabled={!canGenerate || isGenerating}
                    >
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Discount Code
                    </Button>
                    {!canGenerate && (
                        <p className="text-sm text-muted-foreground">
                            Waiting for more orders before a new code can be generated.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
