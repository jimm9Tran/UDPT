import express, { type Request, type Response } from 'express';
import { adminUser, requireAuth } from '@jimm9tran/common';
import { Product } from '../models/product';

const router = express.Router();

const sampleProducts = [
  {
    title: "iPhone 15 Pro Max 256GB",
    price: 30990000,
    originalPrice: 33990000,
    brand: "Apple",
    category: "smartphone",
    description: "iPhone 15 Pro Max với chip A17 Pro, camera 48MP và thiết kế Titanium cao cấp",
    countInStock: 10,
    specifications: {
      processor: "Apple A17 Pro",
      ram: "8GB",
      storage: "256GB",
      display: "6.7 inch Super Retina XDR",
      camera: "48MP + 12MP + 12MP",
      battery: "4441mAh",
      os: "iOS 17"
    },
    features: [
      "Chip A17 Pro 3nm",
      "Camera 48MP với telephoto 5x",
      "Thiết kế Titanium bền bỉ",
      "USB-C với USB 3",
      "Action Button có thể tùy chỉnh"
    ],
    images: {
      image1: "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg"
    },
    tags: ["flagship", "pro", "titanium"]
  },
  {
    title: "Samsung Galaxy S24 Ultra 512GB",
    price: 32990000,
    originalPrice: 35990000,
    brand: "Samsung",
    category: "smartphone",
    description: "Galaxy S24 Ultra với S Pen, camera 200MP và AI tích hợp",
    countInStock: 8,
    specifications: {
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "512GB",
      display: "6.8 inch Dynamic AMOLED 2X",
      camera: "200MP + 50MP + 12MP + 10MP",
      battery: "5000mAh",
      os: "Android 14"
    },
    features: [
      "Camera 200MP với AI zoom",
      "S Pen tích hợp",
      "Màn hình 120Hz adaptive",
      "Khung Titanium",
      "Galaxy AI"
    ],
    images: {
      image1: "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg"
    },
    tags: ["ultra", "s-pen", "ai"]
  },
  {
    title: "MacBook Pro 14 M3 Pro 512GB",
    price: 52990000,
    originalPrice: 55990000,
    brand: "Apple",
    category: "laptop",
    description: "MacBook Pro 14 inch với chip M3 Pro, hiệu năng mạnh mẽ cho công việc chuyên nghiệp",
    countInStock: 5,
    specifications: {
      processor: "Apple M3 Pro 11-core CPU",
      ram: "18GB",
      storage: "512GB SSD",
      display: "14.2 inch Liquid Retina XDR",
      gpu: "14-core GPU",
      battery: "70Wh",
      os: "macOS Sonoma"
    },
    features: [
      "Chip M3 Pro 3nm",
      "Màn hình Liquid Retina XDR",
      "Thời lượng pin 18 giờ",
      "6 cổng Thunderbolt 4",
      "Camera 1080p FaceTime HD"
    ],
    images: {
      image1: "https://cdn.tgdd.vn/Products/Images/44/309020/macbook-pro-14-m3-pro-2023-xam-1-2-600x600.jpg"
    },
    tags: ["pro", "m3", "creator"]
  },
  {
    title: "Dell XPS 13 Plus Intel Core i7",
    price: 45990000,
    originalPrice: 48990000,
    brand: "Dell",
    category: "laptop",
    description: "Dell XPS 13 Plus với thiết kế siêu mỏng, hiệu năng cao và màn hình InfinityEdge",
    countInStock: 7,
    specifications: {
      processor: "Intel Core i7-1360P",
      ram: "16GB LPDDR5",
      storage: "512GB SSD",
      display: "13.4 inch FHD+ InfinityEdge",
      gpu: "Intel Iris Xe",
      battery: "55Wh",
      os: "Windows 11"
    },
    features: [
      "Thiết kế siêu mỏng 15.28mm",
      "Màn hình InfinityEdge",
      "Bàn phím cảm ứng",
      "Sạc nhanh ExpressCharge",
      "Wifi 6E"
    ],
    images: {
      image1: "https://cdn.tgdd.vn/Products/Images/44/309845/dell-xps-13-plus-9320-i7-1360p-600x600.jpg"
    },
    tags: ["ultrabook", "business", "premium"]
  },
  {
    title: "iPad Pro 12.9 M2 256GB WiFi",
    price: 28990000,
    originalPrice: 31990000,
    brand: "Apple",
    category: "tablet",
    description: "iPad Pro 12.9 với chip M2, màn hình Liquid Retina XDR và hỗ trợ Apple Pencil",
    countInStock: 12,
    specifications: {
      processor: "Apple M2",
      ram: "8GB",
      storage: "256GB",
      display: "12.9 inch Liquid Retina XDR",
      camera: "12MP + 10MP",
      battery: "10758mAh",
      os: "iPadOS 16"
    },
    features: [
      "Chip M2 8-core",
      "Màn hình mini-LED",
      "Hỗ trợ Apple Pencil gen 2",
      "Camera TrueDepth",
      "Thunderbolt/USB 4"
    ],
    images: {
      image1: "https://cdn.tgdd.vn/Products/Images/522/247508/ipad-pro-12-9-m2-wifi-xam-600x600.jpg"
    },
    tags: ["pro", "tablet", "creative"]
  },
  {
    title: "AirPods Pro 2nd Generation",
    price: 6490000,
    originalPrice: 6990000,
    brand: "Apple",
    category: "headphone",
    description: "AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động và chất lượng âm thanh tuyệt vời",
    countInStock: 20,
    specifications: {
      driver: "Dynamic driver",
      connectivity: "Bluetooth 5.3",
      battery: "6 giờ + 24 giờ với case",
      charging: "MagSafe, Lightning, Wireless",
      waterproof: "IPX4",
      features: "ANC, Transparency mode"
    },
    features: [
      "Chip H2 thế hệ mới",
      "Chống ồn chủ động 2x tốt hơn",
      "Spatial Audio cá nhân hóa",
      "Touch control trên thân tai nghe",
      "Case MagSafe"
    ],
    images: {
      image1: "https://cdn.tgdd.vn/Products/Images/54/289780/tai-nghe-bluetooth-airpods-pro-2nd-gen-usb-c-apple-600x600.jpg"
    },
    tags: ["wireless", "anc", "premium"]
  },
  {
    title: "Sony WH-1000XM5 Wireless",
    price: 8990000,
    originalPrice: 9990000,
    brand: "Sony",
    category: "headphone",
    description: "Tai nghe Sony WH-1000XM5 với công nghệ chống ồn hàng đầu và chất lượng âm thanh Hi-Res",
    countInStock: 15,
    specifications: {
      driver: "30mm dynamic",
      connectivity: "Bluetooth 5.2",
      battery: "30 giờ",
      charging: "USB-C, Quick charge",
      waterproof: "Không",
      features: "ANC, LDAC, Hi-Res Audio"
    },
    features: [
      "Chống ồn V1 processor",
      "30 giờ pin liên tục",
      "LDAC & Hi-Res Audio",
      "Multipoint connection",
      "Speak-to-chat"
    ],
    images: {
      image1: "https://cdn.tgdd.vn/Products/Images/54/289063/tai-nghe-chup-tai-khong-day-sony-wh-1000xm5-den-600x600.jpg"
    },
    tags: ["wireless", "anc", "audiophile"]
  },
  {
    title: "Apple Watch Series 9 GPS 45mm",
    price: 10990000,
    originalPrice: 11990000,
    brand: "Apple",
    category: "smartwatch",
    description: "Apple Watch Series 9 với chip S9, màn hình Retina luôn bật và tính năng sức khỏe toàn diện",
    countInStock: 18,
    specifications: {
      processor: "Apple S9 SiP",
      display: "45mm Retina LTPO OLED",
      storage: "64GB",
      connectivity: "Wi-Fi, Bluetooth 5.3",
      sensors: "Heart rate, ECG, Blood Oxygen",
      battery: "18 giờ",
      waterproof: "50 mét"
    },
    features: [
      "Chip S9 với Neural Engine",
      "Double Tap gesture",
      "Màn hình 2000 nits",
      "watchOS 10",
      "Carbon neutral"
    ],
    images: {
      image1: "https://cdn.tgdd.vn/Products/Images/7077/309023/apple-watch-s9-gps-45mm-den-600x600.jpg"
    },
    tags: ["smartwatch", "health", "fitness"]
  }
];

router.post(
  '/api/products/seed',
  requireAuth,
  adminUser,
  async (req: Request, res: Response) => {
    try {
      // Clear existing products (only for demo)
      await Product.deleteMany({});
      
      // Insert sample products
      const createdProducts = await Product.insertMany(sampleProducts);
      
      res.status(201).send({
        message: `Đã tạo ${createdProducts.length} sản phẩm mẫu`,
        products: createdProducts
      });
    } catch (error) {
      console.error('Error seeding products:', error);
      res.status(400).send({ error: 'Lỗi khi tạo dữ liệu mẫu' });
    }
  }
);

export { router as seedProductsRouter };
