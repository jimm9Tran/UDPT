// Sample electronics data for seeding the database
const electronicsProducts = [
  {
    title: "iPhone 15 Pro",
    price: 999,
    originalPrice: 1099,
    brand: "Apple",
    category: "smartphone",
    description: "Latest iPhone with titanium design and advanced A17 Pro chip",
    images: {
      image1: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image2: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image3: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image4: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    },
    specifications: {
      processor: "A17 Pro",
      ram: "8GB",
      storage: "128GB",
      display: "6.1-inch Super Retina XDR",
      battery: "3274mAh",
      camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      operatingSystem: "iOS 17",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3",
      weight: "187g",
      dimensions: "146.6 × 70.6 × 8.25 mm"
    },
    variants: [
      {
        color: "Natural Titanium",
        storage: "128GB",
        price: 999,
        countInStock: 25
      },
      {
        color: "Blue Titanium",
        storage: "256GB",
        price: 1099,
        countInStock: 20
      }
    ],
    features: [
      "Titanium design",
      "Action Button",
      "Dynamic Island",
      "Face ID",
      "Wireless charging",
      "Water resistant (IP68)"
    ],
    inTheBox: [
      "iPhone 15 Pro",
      "USB-C to USB-C Cable",
      "Documentation"
    ],
    countInStock: 45,
    rating: 4.8,
    numReviews: 0,
    tags: ["flagship", "premium", "5g"],
    isActive: true,
    isFeatured: true,
    userId: "507f1f77bcf86cd799439011"
  },
  {
    title: "Samsung Galaxy S24 Ultra",
    price: 1199,
    originalPrice: 1299,
    brand: "Samsung",
    category: "smartphone",
    description: "Premium Android flagship with S Pen and advanced AI features",
    images: {
      image1: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image2: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image3: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image4: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    },
    specifications: {
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "256GB",
      display: "6.8-inch Dynamic AMOLED 2X",
      battery: "5000mAh",
      camera: "200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultra Wide",
      operatingSystem: "Android 14, One UI 6.1",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3",
      weight: "232g",
      dimensions: "162.3 × 79.0 × 8.6 mm"
    },
    variants: [
      {
        color: "Titanium Black",
        storage: "256GB",
        price: 1199,
        countInStock: 30
      },
      {
        color: "Titanium Violet",
        storage: "512GB",
        price: 1399,
        countInStock: 15
      }
    ],
    features: [
      "S Pen included",
      "AI photo editing",
      "120Hz display",
      "Wireless charging",
      "Water resistant (IP68)",
      "DeX support"
    ],
    inTheBox: [
      "Galaxy S24 Ultra",
      "S Pen",
      "USB-C Cable",
      "Documentation"
    ],
    countInStock: 45,
    rating: 4.7,
    numReviews: 0,
    tags: ["android", "premium", "s-pen"],
    isActive: true,
    isFeatured: true,
    userId: "507f1f77bcf86cd799439011"
  },
  {
    title: "MacBook Pro 14-inch M3",
    price: 1599,
    originalPrice: 1699,
    brand: "Apple",
    category: "laptop",
    description: "Professional laptop with M3 chip for ultimate performance",
    images: {
      image1: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image2: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image3: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image4: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    },
    specifications: {
      processor: "Apple M3",
      ram: "8GB",
      storage: "512GB SSD",
      display: "14.2-inch Liquid Retina XDR",
      battery: "70Wh",
      camera: "1080p FaceTime HD",
      operatingSystem: "macOS Sonoma",
      connectivity: "Wi-Fi 6E, Bluetooth 5.3",
      weight: "1.55kg",
      dimensions: "31.26 × 22.12 × 1.55 cm"
    },
    variants: [
      {
        color: "Space Gray",
        storage: "512GB",
        price: 1599,
        countInStock: 15
      },
      {
        color: "Silver",
        storage: "1TB",
        price: 1999,
        countInStock: 10
      }
    ],
    features: [
      "M3 chip",
      "Liquid Retina XDR display",
      "Magic Keyboard",
      "Touch ID",
      "Force Touch trackpad",
      "MagSafe 3 charging"
    ],
    inTheBox: [
      "MacBook Pro",
      "70W USB-C Power Adapter",
      "USB-C to MagSafe 3 Cable",
      "Documentation"
    ],
    countInStock: 25,
    rating: 4.9,
    numReviews: 0,
    tags: ["professional", "laptop", "m3"],
    isActive: true,
    isFeatured: true,
    userId: "507f1f77bcf86cd799439011"
  },
  {
    title: "Sony WH-1000XM5",
    price: 399,
    originalPrice: 449,
    brand: "Sony",
    category: "headphones",
    description: "Industry-leading noise canceling wireless headphones",
    images: {
      image1: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image2: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image3: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      image4: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    },
    specifications: {
      driver: "30mm",
      battery: "30 hours",
      connectivity: "Bluetooth 5.2, NFC",
      weight: "250g",
      frequency: "4Hz-40kHz"
    },
    variants: [
      {
        color: "Black",
        price: 399,
        countInStock: 50
      },
      {
        color: "Silver",
        price: 399,
        countInStock: 30
      }
    ],
    features: [
      "Industry-leading noise canceling",
      "30-hour battery life",
      "Quick charge (3 min = 3 hours)",
      "Multipoint connection",
      "Speak-to-chat technology",
      "LDAC audio"
    ],
    inTheBox: [
      "WH-1000XM5 headphones",
      "Carrying case",
      "USB-C cable",
      "Audio cable",
      "Documentation"
    ],
    countInStock: 80,
    rating: 4.6,
    numReviews: 0,
    tags: ["wireless", "noise-canceling", "premium"],
    isActive: true,
    isFeatured: false,
    userId: "507f1f77bcf86cd799439011"
  }
];

console.log('Sample electronics products:');
console.log(JSON.stringify(electronicsProducts, null, 2));
