const mongoose = require('mongoose');

// Define the structure for individual order details
const OrderDetailSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalprice: { type: Number, required: true },
  orderId: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed'], required: true, default: 'Pending' },
  purchaseDate: { type: Date, default: Date.now },
});

// Main order schema that includes arrays for pending and completed orders
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pendingOrders: {
    type: [OrderDetailSchema], // Array of pending orders
    default: [], // Initialize as an empty array
  },
  completedOrders: {
    type: [OrderDetailSchema], // Array of completed orders
    default: [], // Initialize as an empty array
  },
});

// Create and export the Order model
module.exports = mongoose.model('Order', orderSchema);
