const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');

const categories = [
  {
    name: 'Điện thoại',
    slug: 'dien-thoai',
    description: 'Smartphone chính hãng, bảo hành đầy đủ.'
  },
  {
    name: 'Laptop',
    slug: 'laptop',
    description: 'Laptop làm việc và gaming mới nhất.'
  },
  {
    name: 'Máy tính bảng',
    slug: 'may-tinh-bang',
    description: 'Tablet giải trí, học tập, làm việc.'
  },
  {
    name: 'Phụ kiện',
    slug: 'phu-kien',
    description: 'Âm thanh, chuột phím, phụ kiện công nghệ.'
  }
];

const products = [
  {
    name: 'iPhone 15 Pro Max 1TB',
    slug: 'iphone-15-pro-max-1tb',
    description: 'iPhone 15 Pro Max 1TB VN/A – viền titan, camera 48MP, chip A17 Pro.',
    price: 42999000,
    discount: 5,
    stock: 50,
    images: ['/images/iphone-15-pro-max-1tb.svg'],
    brand: 'Apple',
    views: 12500,
    sold: 410,
    categorySlug: 'dien-thoai'
  },
  {
    name: 'Samsung Galaxy S23 Ultra 5G',
    slug: 'samsung-galaxy-s23-ultra',
    description: 'Samsung Galaxy S23 Ultra 5G 12GB/512GB – S Pen, camera 200MP.',
    price: 30990000,
    discount: 7,
    stock: 80,
    images: ['/images/samsung-galaxy-s23-ultra.svg'],
    brand: 'Samsung',
    views: 9800,
    sold: 355,
    categorySlug: 'dien-thoai'
  },
  {
    name: 'Xiaomi Redmi Note 12',
    slug: 'xiaomi-redmi-note-12',
    description: 'Xiaomi Redmi Note 12 8GB/128GB – màn AMOLED 120Hz, pin 5000mAh.',
    price: 5490000,
    discount: 10,
    stock: 200,
    images: ['/images/xiaomi-redmi-note-12.svg'],
    brand: 'Xiaomi',
    views: 7600,
    sold: 680,
    categorySlug: 'dien-thoai'
  },
  {
    name: 'MacBook Pro M2 14 inch',
    slug: 'macbook-pro-m2-14',
    description: 'MacBook Pro 14 M2 16GB/512GB – màn mini-LED, hiệu năng vượt trội.',
    price: 42990000,
    discount: 5,
    stock: 30,
    images: ['/images/macbook-pro-m2-14.svg'],
    brand: 'Apple',
    views: 6500,
    sold: 215,
    categorySlug: 'laptop'
  },
  {
    name: 'ASUS ROG Zephyrus G16',
    slug: 'asus-rog-zephyrus-g16',
    description: 'Laptop gaming ASUS ROG Zephyrus G16 RTX 4070 – màn 240Hz.',
    price: 37990000,
    discount: 8,
    stock: 40,
    images: ['/images/asus-rog-zephyrus-g16.svg'],
    brand: 'ASUS',
    views: 5400,
    sold: 160,
    categorySlug: 'laptop'
  },
  {
    name: 'Lenovo Legion Slim 7',
    slug: 'lenovo-legion-slim-7',
    description: 'Lenovo Legion Slim 7 Ryzen 7 + RTX 4060 – thiết kế mỏng nhẹ.',
    price: 32990000,
    discount: 6,
    stock: 35,
    images: ['/images/lenovo-legion-slim-7.svg'],
    brand: 'Lenovo',
    views: 4300,
    sold: 140,
    categorySlug: 'laptop'
  },
  {
    name: 'iPad Pro 13 inch M4 Wi-Fi',
    slug: 'ipad-pro-13-m4',
    description: 'iPad Pro 13 M4 256GB – màn Ultra Retina XDR, hỗ trợ Apple Pencil Pro.',
    price: 32990000,
    discount: 4,
    stock: 60,
    images: ['/images/ipad-pro-13-m4.svg'],
    brand: 'Apple',
    views: 8700,
    sold: 295,
    categorySlug: 'may-tinh-bang'
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra',
    slug: 'samsung-galaxy-tab-s9-ultra',
    description: 'Galaxy Tab S9 Ultra 14.6 inch – Snapdragon 8 Gen 2, chống nước IP68.',
    price: 28990000,
    discount: 9,
    stock: 45,
    images: ['/images/samsung-galaxy-tab-s9-ultra.svg'],
    brand: 'Samsung',
    views: 6200,
    sold: 180,
    categorySlug: 'may-tinh-bang'
  },
  {
    name: 'AirPods Pro (Gen 2) USB-C',
    slug: 'airpods-pro-2-usbc',
    description: 'Tai nghe AirPods Pro 2 – Adaptive Audio, hộp sạc USB-C.',
    price: 6290000,
    discount: 12,
    stock: 150,
    images: ['/images/airpods-pro-2-usbc.svg'],
    brand: 'Apple',
    views: 11200,
    sold: 820,
    categorySlug: 'phu-kien'
  },
  {
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description: 'Tai nghe chống ồn Sony WH-1000XM5 – pin 30h, micro AI.',
    price: 7990000,
    discount: 15,
    stock: 90,
    images: ['/images/sony-wh-1000xm5.svg'],
    brand: 'Sony',
    views: 9200,
    sold: 510,
    categorySlug: 'phu-kien'
  },
  {
    name: 'Apple Watch Series 9 GPS 45mm',
    slug: 'apple-watch-series-9',
    description: 'Apple Watch Series 9 – màn sáng hơn, theo dõi sức khỏe nâng cao.',
    price: 11990000,
    discount: 13,
    stock: 100,
    images: ['/images/apple-watch-series-9.svg'],
    brand: 'Apple',
    views: 10100,
    sold: 460,
    categorySlug: 'phu-kien'
  },
  {
    name: 'Logitech MX Master 3S',
    slug: 'logitech-mx-master-3s',
    description: 'Chuột không dây Logitech MX Master 3S – cảm biến 8K DPI, sạc USB-C.',
    price: 2990000,
    discount: 18,
    stock: 180,
    images: ['/images/logitech-mx-master-3s.svg'],
    brand: 'Logitech',
    views: 4800,
    sold: 730,
    categorySlug: 'phu-kien'
  }
];

const computeFinalPrice = (price, discount) => {
  const discounted = price - (price * discount) / 100;
  return discounted < 0 ? 0 : Math.round(discounted);
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối MongoDB. Bắt đầu seed dữ liệu mẫu...');

    const categoryMap = {};
    for (const category of categories) {
      const doc = await Category.findOneAndUpdate(
        { slug: category.slug },
        category,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      categoryMap[category.slug] = doc._id;
    }
    console.log(`Đã seed ${Object.keys(categoryMap).length} danh mục.`);

    for (const product of products) {
      const payload = {
        ...product,
        categoryId: categoryMap[product.categorySlug],
        finalPrice: computeFinalPrice(product.price, product.discount)
      };
      delete payload.categorySlug;

      await Product.findOneAndUpdate(
        { slug: product.slug },
        payload,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    console.log(`Đã seed ${products.length} sản phẩm.`);
  } catch (error) {
    console.error('Seed dữ liệu thất bại:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB.');
  }
})();
