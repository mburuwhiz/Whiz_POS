# WHIZ POS Back-Office Integration Specifications

This document outlines the API endpoints, data models, and aggregation strategies required to build a compatible Back-Office Dashboard for WHIZ POS. The Desktop POS application synchronizes data to a backend server (e.g., built with Node.js/Express and MongoDB) using specific routes and structures.

## 1. Authentication & Security

The back-office backend must secure API endpoints. The Desktop POS uses an `API_KEY` (configured in Developer settings) and basic authentication.

**Headers required from POS:**
- `x-api-key`: `API_KEY` configured in the Desktop app.
- `Authorization`: Optional Basic/Bearer token.

## 2. API Endpoints

The back office should expose the following endpoints for the POS to synchronize data.

### 2.1 Synchronization Endpoint
**`POST /api/sync`**

This is the primary endpoint for pushing data from the Desktop POS to the Back Office. The POS sends a payload containing arrays of transactions, expenses, items (products), and users.

**Request Body (`SyncPayload`):**
```json
{
  "transactions": [
    {
      "id": "txn_123456789",
      "cart": [
        {
          "id": "prod_1",
          "name": "Coca Cola 500ml",
          "price": 100,
          "quantity": 2,
          "category": "Drinks"
        }
      ],
      "total": 200,
      "tendered": 500,
      "change": 300,
      "paymentMethod": "cash",
      "timestamp": "2023-10-27T10:00:00Z",
      "cashier": "John Doe",
      "status": "completed"
    }
  ],
  "expenses": [
    {
      "id": "exp_1",
      "amount": 500,
      "description": "Transport",
      "category": "Logistics",
      "date": "2023-10-27T10:00:00Z",
      "cashier": "Admin"
    }
  ],
  "items": [
    {
      "id": "prod_1",
      "name": "Coca Cola 500ml",
      "price": 100,
      "costPrice": 80,
      "stock": 48,
      "category": "Drinks"
    }
  ],
  "users": [
    {
      "id": "user_1",
      "username": "johndoe",
      "role": "cashier",
      "isActive": true
    }
  ]
}
```

**Note:** The Desktop POS uses upsert operations (insert or update based on `id`) to ensure data consistency without duplication. The back office must handle these arrays by updating existing records or creating new ones.

### 2.2 Backup Endpoint (Optional but Recommended)
**`POST /api/backups`**

The POS can trigger a full state backup. This endpoint should accept a comprehensive JSON blob containing the entire POS state (business setup, daily summaries, etc.) and store it securely.

## 3. Data Models (MongoDB / Mongoose Example)

The back office database should reflect the following schemas to ingest the synced data.

### 3.1 Transaction Model
```javascript
const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  cart: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    category: String
  }],
  total: { type: Number, required: true },
  tendered: { type: Number },
  change: { type: Number },
  paymentMethod: { type: String, enum: ['cash', 'mpesa', 'credit'], required: true },
  timestamp: { type: Date, required: true },
  cashier: { type: String, required: true },
  status: { type: String, default: 'completed' },
  mpesaCode: { type: String } // Optional, for M-Pesa tracking
});
```

### 3.2 Product (Item) Model
```javascript
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  costPrice: { type: Number }, // Essential for profit calculations
  stock: { type: Number, default: 0 },
  category: { type: String },
  barcode: { type: String }
});
```

### 3.3 Expense Model
```javascript
const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String },
  date: { type: Date, required: true },
  cashier: { type: String, required: true }
});
```

## 4. Aggregation Strategies for Dashboards

The Back Office Dashboard should use MongoDB Aggregation pipelines (or equivalent SQL queries) to process the raw synced data into meaningful insights.

### 4.1 Daily Revenue
Group transactions by the date part of the `timestamp`.
```javascript
// MongoDB Aggregation Example
[
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      totalRevenue: { $sum: "$total" },
      transactionCount: { $sum: 1 }
    }
  },
  { $sort: { "_id": 1 } } // Sort by date ascending
]
```

### 4.2 Top Selling Items
Unwind the `cart` array and aggregate by item name/id.
```javascript
[
  { $unwind: "$cart" },
  {
    $group: {
      _id: "$cart.name",
      totalQuantitySold: { $sum: "$cart.quantity" },
      totalRevenueGenerated: { $sum: { $multiply: ["$cart.price", "$cart.quantity"] } }
    }
  },
  { $sort: { totalQuantitySold: -1 } },
  { $limit: 10 }
]
```

### 4.3 Payment Method Breakdown
Group by `paymentMethod` to see the split between Cash, M-Pesa, and Credit.
```javascript
[
  {
    $group: {
      _id: "$paymentMethod",
      totalAmount: { $sum: "$total" },
      count: { $sum: 1 }
    }
  }
]
```

### 4.4 Hourly Sales Heatmap
Extract the hour from the `timestamp` to identify peak operating times.
```javascript
[
  {
    $group: {
      _id: { $hour: "$timestamp" },
      totalRevenue: { $sum: "$total" },
      averageOrderValue: { $avg: "$total" }
    }
  },
  { $sort: { "_id": 1 } }
]
```

## 5. Handling Deletions

When a receipt is deleted on the Desktop POS, it is removed from the local `transactions.json` and its financial values are rolled into `daily-summaries.json`.

**Strategy for Back Office:**
The sync process typically uses `upsert`. If true hard deletes are required in the back office, the POS sync payload must include a `deletedTransactionIds` array, which the back office endpoint reads to execute `$in` deletes. Currently, the POS does not explicitly push delete commands, so the back office will retain all historical transactions (which is often preferable for audit logs).