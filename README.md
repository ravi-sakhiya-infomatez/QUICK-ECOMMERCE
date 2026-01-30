# ⚡ Quick Ecommerce

A high-performance, modern ecommerce application built with **Next.js**, **Redux Toolkit**, and **Tailwind CSS**. This project features a robust "nth order" discount system and a persistent in-memory data store.

## 🚀 Features

- **Dynamic Product Catalog**: Browse curated high-quality products.
- **Advanced Cart Management**: Real-time cart updates with Redux synchronization.
- **Intelligent Discount System**: Automatically generates codes for every Nth order.
- **Admin Dashboard & History**: Real-time statistics and detailed global order history tracking.
- **Custom Toast System**: Professional top-left notification system for orders, rewards, and system feedback.
- **Premium UI/UX**: Responsive design with liquid transitions, glassmorphism, and a modern slate-aesthetic.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QUICK-ECOMMERCE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🧠 Core Logic

### In-Memory Store (`src/lib/db.ts`)
Since this application uses an "In-memory" store, state is maintained in a singleton instance of the `InMemoryStore` class. 
- **Persistence**: In development, we use `globalThis` to ensure the store survives Hot Module Replacement (HMR).
- **Structure**: Uses a `Map` for cart management to ensure O(1) access and arrays for products, orders, and discount codes.

### The "Nth" Discount Logic
The system is designed to reward loyalty by generating a discount code for every Nth order placed globally.
- **Assumption for Testing**: For this demonstration, **N is set to 3** (`store.n = 3`).
- **Trigger**: Every time the `POST /api/checkout` endpoint is called and the order count reaches a multiple of 3, a new `DISCOUNT-XXXX` code (10% off) is generated and returned in the response.

---

## 📡 API Documentation

### Products
- **`GET /api/products`**
  - Returns a list of all available products.
  ```bash
  curl http://localhost:3000/api/products
  ```

### Cart
- **`GET /api/cart?userId=test-user`**
  - Retrieves the cart for a specific user.
- **`POST /api/cart`**
  - Adds/Updates items in the cart.
  ```bash
  curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "productId": "p1", "quantity": 2}'
  ```

### Checkout & Discounts
- **`POST /api/checkout`**
  - Processes the order and clears the cart. Returns a reward code if it's the Nth order.
  ```bash
  curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "discountCode": "OPTIONAL_CODE"}'
  ```
- **`POST /api/validate-code`**
  - Validates a discount code before checkout.
  ```bash
  curl -X POST http://localhost:3000/api/validate-code \
  -H "Content-Type: application/json" \
  -d '{"code": "DISCOUNT-ABCD"}'
  ```

### Admin
- **`GET /api/admin/stats`**
  - Returns total items purchased, total revenue, and discount usage.
  ```bash
  curl http://localhost:3000/api/admin/stats
  ```

---

## 🧪 Testing

The project includes unit tests for the core logic and component tests for the UI.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

---

## 📝 License

This project is licensed under the MIT License.
