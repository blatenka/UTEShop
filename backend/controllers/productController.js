const Product = require('../models/Product');

// Lấy 8 sản phẩm mới nhất
exports.getNewProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy 6 sản phẩm bán chạy nhất
exports.getBestSellingProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ sold: -1 })
      .limit(6);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy 8 sản phẩm được xem nhiều nhất
exports.getMostViewedProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ views: -1 })
      .limit(8);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy 4 sản phẩm khuyến mãi cao nhất
exports.getTopDiscountProducts = async (req, res) => {
  try {
    const products = await Product.find({ discount: { $gt: 0 } })
      .sort({ discount: -1 })
      .limit(4);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
