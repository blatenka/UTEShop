import express from 'express';
import { 
    createOrder, 
    updateOrderStatus, 
    cancelOrderUser,
    userConfirmReceived,
    getOrderById,
    getAllOrders,
    getMyOrders
} from '../controllers/orderController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 1. Tạo đơn hàng (User đã login)
router.post('/', verifyToken, createOrder);

// 2. Lấy danh sách đơn hàng của user hiện tại
router.get('/my-orders', verifyToken, getMyOrders);

// 3. Lấy chi tiết đơn hàng (User xem đơn của mình, Admin xem đơn bất kỳ)
router.get('/:id', verifyToken, getOrderById);

// 4. User hủy đơn
router.put('/:id/cancel', verifyToken, cancelOrderUser);

// 5. User xác nhận đã nhận hàng
router.put('/:id/received', verifyToken, userConfirmReceived);

// 6. Admin cập nhật trạng thái (Duyệt đơn, Đang giao...)
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

// 7. Admin lấy danh sách tất cả hoá đơn
router.get('/', verifyToken, isAdmin, getAllOrders);

export default router;
