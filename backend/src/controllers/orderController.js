import Order from '../models/Order.js';
import Book from '../models/Book.js';

// 1. TẠO ĐƠN HÀNG (User đặt hàng)
// Logic: Kiểm tra tồn kho -> Trừ tồn kho -> Tạo đơn
export const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng rỗng" });
        }

        // BƯỚC 1: KIỂM TRA TỒN KHO (Quan trọng)
        // Duyệt qua từng sách user mua để check xem còn đủ hàng không
        for (const item of orderItems) {
            const book = await Book.findById(item.product);
            if (!book) {
                return res.status(404).json({ message: `Sách ${item.title} không tồn tại` });
            }
            if (book.countInStock < item.qty) {
                return res.status(400).json({ message: `Sách ${item.title} chỉ còn ${book.countInStock} quyển, không đủ để bán.` });
            }
        }

        // BƯỚC 2: TRỪ TỒN KHO & TĂNG SỐ LƯỢNG ĐÃ BÁN
        // Nếu đã đủ hàng, tiến hành trừ kho
        for (const item of orderItems) {
            await Book.findByIdAndUpdate(item.product, {
                $inc: { 
                    countInStock: -item.qty, // Trừ tồn kho
                    sold: +item.qty          // Cộng số lượng đã bán
                }
            });
        }

        // BƯỚC 3: TẠO ORDER
        const order = new Order({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            status: 1 // Mặc định là đơn mới
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);

    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo đơn hàng: " + error.message });
    }
};

// 2. ADMIN CẬP NHẬT TRẠNG THÁI (Xác nhận, Giao hàng...)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        // Logic cập nhật
        order.status = status;

        if (status === 2) {
            order.confirmedAt = Date.now();
        }
        
        // Admin chuyển sang trạng thái "Đang giao hàng" (4)
        // Lưu ý: Admin KHÔNG set deliveredAt ở đây nữa
        
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);

    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
    }
};

// 3. NGƯỜI DÙNG HỦY ĐƠN (Hoặc Yêu cầu hủy)
export const cancelOrderUser = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Bạn không có quyền hủy đơn này" });
        }

        const currentTime = new Date();
        const orderTime = new Date(order.createdAt);
        const diffInMinutes = (currentTime - orderTime) / (1000 * 60);

        // -- TRƯỜNG HỢP 1: HỦY TRỰC TIẾP (Status 1 hoặc Status 2 < 30p) --
        if (order.status === 1 || (order.status === 2 && diffInMinutes <= 30)) {
            
            // QUAN TRỌNG: Hoàn lại số lượng sách vào kho
            for (const item of order.orderItems) {
                await Book.findByIdAndUpdate(item.product, {
                    $inc: { 
                        countInStock: +item.qty, // Cộng lại kho
                        sold: -item.qty          // Trừ đi số đã bán
                    }
                });
            }

            order.status = 6; // Đã hủy
            order.cancelReason = req.body.reason || "Khách hàng hủy";
            await order.save();
            
            return res.status(200).json({ message: "Đã hủy đơn hàng thành công" });
        } 
        
        // -- TRƯỜNG HỢP 2: GỬI YÊU CẦU HỦY (Status >= 3 hoặc > 30p) --
        if (order.status >= 3 || (order.status === 2 && diffInMinutes > 30)) {
            // Không được hủy nếu đơn đã giao xong (5) hoặc đã hủy (6)
            if (order.status === 5 || order.status === 6) {
                 return res.status(400).json({ message: "Đơn hàng đã hoàn tất hoặc đã hủy, không thể thao tác." });
            }

            order.cancelRequest = true;
            order.cancelReason = req.body.reason || "Yêu cầu hủy từ khách";
            await order.save();
            
            return res.status(200).json({ message: "Đã gửi yêu cầu hủy đơn. Shop sẽ xem xét." });
        }

    } catch (error) {
        res.status(500).json({ message: "Lỗi hủy đơn hàng" });
    }
};

// 4. LẤY CHI TIẾT ĐƠN HÀNG
export const getOrderById = async (req, res) => {
    try {
        // populate để lấy thông tin user (tên, email) hiển thị
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy đơn hàng" });
    }
};

export const userConfirmReceived = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // 1. Check quyền: Phải đúng là chủ đơn hàng
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Bạn không có quyền xác nhận đơn này" });
        }

        // 2. Check trạng thái hợp lệ
        // Chỉ được xác nhận khi đơn đang ở trạng thái "Đang giao" (Status 4)
        // (Tùy logic shop, có thể cho phép từ status 3 nếu ship nội bộ nhanh)
        if (order.status !== 4) {
            return res.status(400).json({ message: "Đơn hàng chưa ở trạng thái đang giao, không thể xác nhận." });
        }

        // 3. Cập nhật trạng thái thành công
        order.status = 5; // Đã giao thành công
        order.deliveredAt = Date.now();

        // 4. Xử lý thanh toán (Nếu là COD thì giờ mới tính là đã trả tiền)
        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.status(200).json({ 
            message: "Cảm ơn bạn đã mua hàng! Đơn hàng đã hoàn tất.", 
            order: updatedOrder 
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi xác nhận đơn hàng" });
    }
};
// Admin Only
export const getAllOrders = async (req, res) => {
    try {
        // Lấy tất cả đơn, kèm thông tin user (id và name)
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách hóa đơn" });
    }
};
// Lấy danh sách đơn hàng của người dùng đang đăng nhập
export const getMyOrders = async (req, res) => {
    try {
        // Tìm các đơn hàng có trường 'user' khớp với ID người dùng từ token
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        
        // Trả về danh sách (có thể là mảng rỗng nếu chưa mua gì)
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng của bạn" });
    }
};