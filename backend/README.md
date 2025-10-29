# Trapo Backend

Express.js backend for the trapo clothing customization platform with MongoDB integration.

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Environment Variables

Create a `.env` file in the backend directory:

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/trapo
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. MongoDB Setup

#### Option A: Local MongoDB
\`\`\`bash
# Install MongoDB locally and start the service
mongod
\`\`\`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 4. Start the Backend

\`\`\`bash
npm run dev
\`\`\`

The backend will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)

### Designs
- `POST /api/designs` - Create design (requires auth)
- `GET /api/designs` - Get user's designs (requires auth)
- `GET /api/designs/:id` - Get single design
- `PUT /api/designs/:id` - Update design (requires auth)
- `DELETE /api/designs/:id` - Delete design (requires auth)

### Orders
- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get single order (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Stickers
- `GET /api/stickers` - Get all stickers (supports ?theme=street query)
- `GET /api/stickers/theme/:theme` - Get stickers by theme

## Database Models

### User
- name: String
- email: String (unique)
- password: String (hashed)
- savedDesigns: [Design]
- createdAt: Date

### Design
- userId: ObjectId (ref: User)
- name: String
- productType: String (t-shirt, hoodie, jacket)
- color: String
- size: String (XS, S, M, L, XL, XXL)
- stickers: Array
- customImages: Array
- price: Number
- previewImage: String
- shareLink: String
- createdAt: Date
- updatedAt: Date

### Order
- userId: ObjectId (ref: User)
- orderNumber: String (unique)
- items: Array
- customerInfo: Object
- subtotal: Number
- shipping: Number
- tax: Number
- total: Number
- status: String (pending, processing, shipped, delivered)
- createdAt: Date

### Product
- name: String
- description: String
- category: String
- price: Number
- image: String
- colors: [String]
- sizes: [String]
- inStock: Boolean
- createdAt: Date

### Sticker
- name: String
- image: String
- theme: String (street, minimal, anime, abstract, typography)
- isPremium: Boolean
- isLimitedEdition: Boolean
- dropDate: Date
- price: Number
- createdAt: Date

## Frontend Integration

Update your frontend `.env.local`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

The frontend will automatically use the API hooks to communicate with the backend.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your connection string in `.env`
- Verify network access if using MongoDB Atlas

### CORS Error
- Check that `FRONTEND_URL` in `.env` matches your frontend URL
- Ensure the backend is running on the correct port

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check that tokens are being sent in Authorization header
