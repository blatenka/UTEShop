const express = require('express');
const router = express.Router();
const {
  getNewProducts,
  getBestSellingProducts,
  getMostViewedProducts,
  getTopDiscountProducts
} = require('../controllers/productController');

// Định nghĩa các route API
router.get('/new', getNewProducts);
router.get('/bestselling', getBestSellingProducts);
router.get('/mostviewed', getMostViewedProducts);
router.get('/topdiscount', getTopDiscountProducts);

module.exports = router;
