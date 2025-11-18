const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  images: [{
    type: String
  }],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Tạo index để tìm kiếm nhanh
productSchema.index({ name: 'text', description: 'text' });

// Auto tính finalPrice trước khi lưu
productSchema.pre('save', function(next) {
  const discountValue = this.discount > 0 ? (this.price * this.discount) / 100 : 0;
  this.finalPrice = Math.max(this.price - discountValue, 0);
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
