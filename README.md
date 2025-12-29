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
- Order totals are automatically calculated based on item quantities and prices.
- When creating an order, you can add multiple items at once.
- **Order Total Calculation**: The logic for computing order totals is implemented in the **API/backend** (`server/index.js`), not in the frontend. The calculation happens server-side in the `POST /api/orders` and `PUT /api/orders/:id` endpoints (lines 169-186 and 220-237 respectively). The frontend only sends requests and displays the calculated total returned by the API.

