import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation - Punjab Sweets',
  description: 'REST API documentation for mobile app integration',
};

export default function APIDocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">API Documentation</h1>
          <p className="text-lg text-gray-300">Punjab Sweets REST API for Mobile Apps</p>
          <div className="mt-4 inline-block px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/30">
            <p className="text-sm font-mono text-amber-200">v1.0</p>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="mb-12 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">📖 Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#introduction" className="text-amber-400 hover:text-amber-300">
                Introduction
              </a>
            </li>
            <li>
              <a href="#base-url" className="text-amber-400 hover:text-amber-300">
                Base URL & Authentication
              </a>
            </li>
            <li>
              <a href="#products" className="text-amber-400 hover:text-amber-300">
                Products API
              </a>
            </li>
            <li>
              <a href="#orders" className="text-amber-400 hover:text-amber-300">
                Orders API
              </a>
            </li>
            <li>
              <a href="#error-codes" className="text-amber-400 hover:text-amber-300">
                Error Codes & Responses
              </a>
            </li>
            <li>
              <a href="#examples" className="text-amber-400 hover:text-amber-300">
                Code Examples
              </a>
            </li>
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-8">
          {/* Introduction */}
          <section id="introduction" className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 mb-4">
              The Punjab Sweets API allows mobile applications to browse products, create orders, and track deliveries in real-time.
            </p>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-sm text-gray-400">
              <p>
                <strong className="text-gray-200">Environment:</strong> Production-ready REST API with JSON responses
              </p>
              <p className="mt-2">
                <strong className="text-gray-200">Rate Limit:</strong> 100 requests per minute per IP
              </p>
            </div>
          </section>

          {/* Base URL & Authentication */}
          <section id="base-url" className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Base URL & Authentication</h2>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
              <p className="text-amber-200 font-mono text-sm mb-2">Base URL:</p>
              <p className="text-gray-300 font-mono">https://punjab-sweets.com/api</p>
            </div>
            <p className="text-gray-300 mb-4">
              All API requests should include standard HTTP headers and accept JSON responses.
            </p>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-sm">
              <p className="text-gray-300">
                <strong className="text-gray-200">Headers:</strong>
              </p>
              <pre className="text-gray-400 mt-2 overflow-auto">
                {`Content-Type: application/json
Accept: application/json`}
              </pre>
            </div>
          </section>

          {/* Products API */}
          <section id="products" className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">🍬 Products API</h2>

            {/* GET /api/products */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">GET</span>
                <span className="text-gray-300 font-mono text-sm">/api/products</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">Fetch all available products</p>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-4">
                <p className="text-gray-300 font-mono text-sm">
                  curl -X GET https://punjab-sweets.com/api/products
                </p>
              </div>
              <p className="text-gray-300 text-sm font-semibold mb-2">Response:</p>
              <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-xs text-gray-400 overflow-auto">
                {`{
  "success": true,
  "products": [
    {
      "id": "PROD-123456",
      "name": "Gulab Jamun",
      "price": 280,
      "category": "Traditional",
      "description": "Soft and sweet milk solids dumplings",
      "imageUrl": "/uploads/gulab-jamun.webp",
      "isAvailable": true
    }
  ],
  "count": 15
}`}
              </pre>
            </div>

            {/* GET /api/products/:id */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">GET</span>
                <span className="text-gray-300 font-mono text-sm">/api/products/:id</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">Fetch a specific product by ID</p>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 font-mono text-sm">
                  curl -X GET https://punjab-sweets.com/api/products/PROD-123456
                </p>
              </div>
            </div>
          </section>

          {/* Orders API */}
          <section id="orders" className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">📦 Orders API</h2>

            {/* POST /api/orders */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">POST</span>
                <span className="text-gray-300 font-mono text-sm">/api/orders</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">Create a new order</p>
              <p className="text-gray-300 text-sm font-semibold mb-2">Request Body:</p>
              <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-xs text-gray-400 overflow-auto mb-4">
                {`{
  "items": [
    {
      "productId": "PROD-123456",
      "quantity": 2
    }
  ],
  "customerName": "Raj Kumar",
  "phone": "+91-9876543210",
  "addressLine1": "123 Main Street",
  "addressLine2": "Near City Park",
  "landmark": "Next to Bank",
  "pincode": "12345",
  "latitude": 31.5204,
  "longitude": 74.3587,
  "notes": "Ring bell twice",
  "approxDistanceKm": 2.5
}`}
              </pre>
              <p className="text-gray-300 text-sm font-semibold mb-2">Response:</p>
              <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-xs text-gray-400 overflow-auto">
                {`{
  "success": true,
  "order": {
    "id": "ORD-1703167200000-abc123def",
    "totalAmount": 560,
    "status": "new",
    "paymentStatus": "pending",
    "createdAt": "2024-12-22T10:00:00Z",
    "upiAddress": "yourshop@upi"
  }
}`}
              </pre>
            </div>

            {/* GET /api/orders/:id */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">GET</span>
                <span className="text-gray-300 font-mono text-sm">/api/orders/:id</span>
              </div>
              <p className="text-gray-400 text-sm">Track order status by ID</p>
            </div>
          </section>

          {/* Error Codes */}
          <section id="error-codes" className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">⚠️ Error Codes & Responses</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-red-500/30">
                <p className="text-red-400 font-semibold">400 Bad Request</p>
                <p className="text-gray-400">Invalid request parameters or missing required fields</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-red-500/30">
                <p className="text-red-400 font-semibold">401 Unauthorized</p>
                <p className="text-gray-400">Invalid or missing authentication credentials</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-red-500/30">
                <p className="text-red-400 font-semibold">404 Not Found</p>
                <p className="text-gray-400">Requested resource not found</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-red-500/30">
                <p className="text-red-400 font-semibold">500 Internal Server Error</p>
                <p className="text-gray-400">Server error occurred while processing request</p>
              </div>
            </div>
          </section>

          {/* Code Examples */}
          <section id="examples" className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">💻 Code Examples</h2>

            {/* JavaScript Example */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">JavaScript / React Native</h3>
              <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-xs text-gray-400 overflow-auto">
                {`// Fetch products
const response = await fetch('https://punjab-sweets.com/api/products');
const data = await response.json();
console.log(data.products);

// Create order
const orderResponse = await fetch('https://punjab-sweets.com/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ productId: 'PROD-123', quantity: 2 }],
    customerName: 'John',
    phone: '+91-9876543210',
    addressLine1: '123 Main St',
    pincode: '12345',
    latitude: 31.5204,
    longitude: 74.3587,
    approxDistanceKm: 2.5
  })
});
const order = await orderResponse.json();`}
              </pre>
            </div>

            {/* Python Example */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Python</h3>
              <pre className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-xs text-gray-400 overflow-auto">
                {`import requests

# Fetch products
response = requests.get('https://punjab-sweets.com/api/products')
products = response.json()['products']

# Create order
order_data = {
    'items': [{'productId': 'PROD-123', 'quantity': 2}],
    'customerName': 'John',
    'phone': '+91-9876543210',
    'addressLine1': '123 Main St',
    'pincode': '12345',
    'latitude': 31.5204,
    'longitude': 74.3587
}
order_response = requests.post(
    'https://punjab-sweets.com/api/orders',
    json=order_data
)`}
              </pre>
            </div>
          </section>

          {/* Support */}
          <section className="rounded-xl bg-amber-500/20 border border-amber-500/30 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">🤝 Support & Webhook Notifications</h2>
            <p className="text-gray-300 mb-4">
              For webhook notifications about order updates, payment confirmations, and delivery status changes, 
              contact our development team.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-gray-900/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-white mb-1">📧 Email</p>
                <p className="text-sm text-gray-300">dev@punjab-sweets.com</p>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-white mb-1">📱 WhatsApp</p>
                <p className="text-sm text-gray-300">+91-XXXXXXXXXX</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>Punjab Sweets API Documentation • v1.0 • Last Updated December 2024</p>
        </div>
      </div>
    </div>
  );
}
