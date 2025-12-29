# CRUD Application

A full-stack CRUD application for managing Customers, Products, Orders, and Items.

## Features

- **Customers**: Create, read, update, and delete customer records
- **Products**: Manage product catalog with pricing and stock information
- **Orders**: Create and manage orders with multiple items
- **Items**: Manage order items with product relationships

## Tech Stack

- **Backend**: Node.js, Express.js, Prisma ORM, SQLite
- **Frontend**: React.js, React Router, Axios
- **Database**: SQLite (can be easily switched to PostgreSQL)

## Project Structure

```
crud-app/
├── server/          # Backend Express server
│   ├── prisma/      # Database schema and migrations
│   ├── index.js     # Express server and API routes
│   └── .env         # Environment variables
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── api.js       # API client functions
│   │   └── App.js       # Main app component
│   └── public/
└── package.json     # Root package.json
```

## Setup Instructions

### 1. Install Dependencies

From the root directory, run:

```bash
npm run install-all
```

Or install manually:

```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Set Up Database

Navigate to the server directory and initialize the database:

```bash
cd server

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

This will create a SQLite database file at `server/prisma/dev.db`.

### 3. Start the Application

From the root directory, you can start both the server and client simultaneously:

```bash
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Start backend server (runs on port 5000)
npm run server

# Terminal 2 - Start frontend (runs on port 3000)
npm run client
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item

## API Features & Limitations

The current API implementation is a basic CRUD API. The following features are **not currently implemented**:

- **Swagger/OpenAPI Documentation**: No API documentation is available
- **Pagination**: All list endpoints return all records without pagination support
- **Optimistic Locking**: No version field or conflict detection for concurrent updates
- **Filtering**: No query parameter support for filtering results (e.g., `?name=John`)
- **Sorting**: No support for sorting results by field (e.g., `?sort=name&order=asc`)

## Database Schema

- **Customer**: id, name, email, phone, address
- **Product**: id, name, description, price, stock
- **Order**: id, customerId, status, total
- **Item**: id, orderId, productId, quantity, price

## Development

### Prisma Studio

To view and edit the database using Prisma Studio:

```bash
cd server
npm run prisma:studio
```

This will open a web interface at http://localhost:5555 where you can view and edit your database records.

### Environment Variables

The server uses a `.env` file located in the `server/` directory:

```
DATABASE_URL="file:./dev.db"
PORT=5000
```

## Notes

- The application uses SQLite for simplicity, but can be easily switched to PostgreSQL or MySQL by updating the Prisma schema and DATABASE_URL.
- When creating an order, you can add multiple items at once.

### Order Total Calculation

The Order Total is calculated server-side in the backend (`server/index.js`), not in the frontend. The total represents the sum of all item subtotals (item price × quantity) for all items in an order.

#### How It Works

The calculation iterates through all items provided in the request, fetches the corresponding product from the database to get the current product price (unless a specific price is provided in the item data), and sums up `itemPrice × quantity` for each item. The calculated total is stored in the `Order.total` field in the database.

**Implementation Details:**
- Calculation happens in `POST /api/orders` (lines 169-186) and `PUT /api/orders/:id` when items are included (lines 220-237)
- For each item, the system fetches the product to retrieve its current price (unless overridden by `item.price`)
- The total is computed before creating/updating the order record
- All items from the request body are processed to calculate the total

#### CRUD Operation Coverage

The Order Total is **automatically calculated and updated** for the following operations:

- ✅ **POST /api/orders**: Total is calculated from all items provided in the request
- ✅ **PUT /api/orders/:id** (when `items` array is included): Total is recalculated from the new items array (existing items are deleted first, then new items are created)

**Important Limitations:**

The Order Total is **NOT automatically updated** for the following operations:

- ❌ **PUT /api/orders/:id** (when only `customerId` or `status` are updated without `items`): Total remains unchanged
- ❌ **POST /api/items**: Creating a new item does not update the parent order's total
- ❌ **PUT /api/items/:id**: Updating an item (quantity, price, etc.) does not update the parent order's total
- ❌ **DELETE /api/items/:id**: Deleting an item does not update the parent order's total

**Note:** To keep the order total accurate when using individual Item CRUD endpoints, you would need to manually recalculate and update the order total separately, or use the `PUT /api/orders/:id` endpoint with the complete items array instead.

#### Performance Considerations

Yes, **updates to Order Total require reading/processing all items** that will be associated with the order:

- When calculating the total in `POST /api/orders` or `PUT /api/orders/:id`, the system processes all items from the request body and performs a database query to fetch each product's price (one query per unique product in the items array)
- For `PUT /api/orders/:id` with items, the system does not read existing items from the database - it deletes all existing items first, then calculates the total from the new items array provided in the request
- The calculation is O(n) where n is the number of items, with additional O(m) database queries where m is the number of unique products

