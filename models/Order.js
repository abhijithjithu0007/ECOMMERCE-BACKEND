const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalprice: { type: Number, required: true },
  orderId: { type: String, required: true }, // Added
  paymentStatus: { type: String, default: 'Pending' }, // Added
  purchaseDate: { type: Date }, // Added
});

module.exports = mongoose.model('Order', orderSchema);
