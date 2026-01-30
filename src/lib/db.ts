export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    discountAmount: number;
    discountCode?: string;
    createdAt: Date;
}

export interface DiscountCode {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    value: number;
    isUsed: boolean;
}

export class InMemoryStore {
    private static instance: InMemoryStore;

    public products: Product[] = [];
    public cart: Map<string, CartItem[]> = new Map(); // Keyed by userId/sessionId
    public orders: Order[] = [];
    public discountCodes: DiscountCode[] = [];
    public orderCount: number = 0;
    public n: number = 3; // Every nth order gets a discount code

    private constructor() {
        this.seedProducts();
    }

    public static getInstance(): InMemoryStore {
        if (!InMemoryStore.instance) {
            InMemoryStore.instance = new InMemoryStore();
        }
        return InMemoryStore.instance;
    }

    private seedProducts() {
        this.products = [
            {
                id: 'p1',
                name: 'Wireless Noise-Canceling Headphones',
                description: 'Immerse yourself in music with industry-leading noise cancellation.',
                price: 299.99,
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            },
            {
                id: 'p2',
                name: 'Smart Fitness Watch',
                description: 'Track your health, workouts, and sleep with precision.',
                price: 149.50,
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
            },
            {
                id: 'p3',
                name: 'Portable Bluetooth Speaker',
                description: 'Powerful sound in a compact, waterproof design.',
                price: 79.99,
                imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
            },
            {
                id: 'p4',
                name: '4K Ultra HD Action Camera',
                description: 'Capture your adventures in stunning detail.',
                price: 199.00,
                imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
            },
            {
                id: 'p5',
                name: 'Ergonomic Mechanical Keyboard',
                description: 'Typing perfection with customizable RGB lighting.',
                price: 129.99,
                imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=800&q=80',
            },
            {
                id: 'p6',
                name: 'Minimalist Leather Backpack',
                description: 'Stylish and durable, perfect for daily commute.',
                price: 89.95,
                imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
            },
        ];
    }
}

// Ensure singleton persists across hot reloads in development
const globalForStore = globalThis as unknown as { store: InMemoryStore };

export const store = globalForStore.store || InMemoryStore.getInstance();

if (process.env.NODE_ENV !== 'production') globalForStore.store = store;
