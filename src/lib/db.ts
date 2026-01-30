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

/**
 * In-memory data store for the application.
 * Uses a Singleton pattern to maintain state across the application lifecycle.
 */
export class InMemoryStore {
    private static instance: InMemoryStore;

    /** List of available products in the shop */
    public products: Product[] = [];

    /** Active shopping carts, keyed by userId or sessionId */
    public cart: Map<string, CartItem[]> = new Map();

    /** History of all placed orders */
    public orders: Order[] = [];

    /** Generated discount codes available for use */
    public discountCodes: DiscountCode[] = [];

    /** Global counter for completed orders */
    public orderCount: number = 0;

    /** 
     * Threshold for discount code generation.
     * Every nth order generates a new discount code.
     */
    public n: number = 3;

    private constructor() {
        this.seedProducts();
    }

    /**
     * Retrieves the singleton instance of the store.
     * @returns The InMemoryStore instance.
     */
    public static getInstance(): InMemoryStore {
        if (!InMemoryStore.instance) {
            InMemoryStore.instance = new InMemoryStore();
        }
        return InMemoryStore.instance;
    }

    /**
     * Seeds the store with initial product data.
     */
    public seedProducts() {
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
                name: 'Professional USB Microphone',
                description: 'Studio-quality audio for podcasting, streaming, and recording.',
                price: 159.00,
                imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80',
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

// Force a re-seed if we are in development and the products list needs updating
export const store = globalForStore.store || InMemoryStore.getInstance();

if (process.env.NODE_ENV !== 'production') {
    globalForStore.store = store;
    store.seedProducts();
}
