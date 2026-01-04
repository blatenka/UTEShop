import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    // Người mua hàng
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // Danh sách sản phẩm mua (Snapshot dữ liệu tại thời điểm mua)
    orderItems: [{
        title: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true }, // Giá lúc mua
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            required: true, 
            ref: 'Book' 
        },
    }],
    // Địa chỉ giao hàng
    shippingAddress: {
        fullName: { type: String, required: true }, // Tên người nhận
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, default: 'COD' },

    // Các loại phí
    itemsPrice: { type: Number, required: true, default: 0.0 }, // Tiền hàng
    shippingPrice: { type: Number, required: true, default: 0.0 }, // Phí ship
    totalPrice: { type: Number, required: true, default: 0.0 }, // Tổng thanh toán
    
    // TRẠNG THÁI ĐƠN HÀNG (Quan trọng)
    // 1: Chờ xác nhận (Mới)
    // 2: Đã xác nhận (Admin duyệt)
    // 3: Đang chuẩn bị hàng
    // 4: Đang giao hàng
    // 5: Giao thành công
    // 6: Đã hủy
    status: { type: Number, required: true, default: 1 },

    // Trạng thái thanh toán
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    // Các mốc thời gian xử lý
    confirmedAt: { type: Date }, // Lúc admin bấm xác nhận
    deliveredAt: { type: Date }, // Lúc giao xong

    // Yêu cầu hủy đơn
    cancelRequest: { type: Boolean, default: false },
    cancelReason: { type: String },

}, { timestamps: true });

export default mongoose.model('Order', orderSchema);