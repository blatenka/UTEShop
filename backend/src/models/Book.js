import mongoose from 'mongoose';

// 1. Schema cho Review
const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
}, { timestamps: true });

// 2. Schema chính cho Book
const bookSchema = mongoose.Schema({
    // Người tạo sách (Admin)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    
    // Giá bán và Giá gốc
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number, required: true, default: 0 },
    
    // Quản lý kho
    countInStock: { type: Number, required: true, default: 0 },
    
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    reviews: [reviewSchema],
    sold: { type: Number, required: true, default: 0 },
    views: { type: Number, required: true, default: 0 },

}, { timestamps: true });

export default mongoose.model('Book', bookSchema);