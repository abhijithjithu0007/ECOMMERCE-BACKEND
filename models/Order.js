const mongoose = require('mongoose');

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

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pendingOrders: {
    type: [OrderDetailSchema],
    default: []
  },
  completedOrders: {
    type: [OrderDetailSchema],
    default: [],
  },
});

module.exports = mongoose.model('Order', orderSchema);
