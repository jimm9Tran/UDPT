# Cloudinary Image Upload Integration Guide

## 📋 Tổng quan

Tích hợp Cloudinary đã được hoàn thành cho hệ thống e-commerce microservices. Người dùng admin giờ đây có thể upload và quản lý hình ảnh sản phẩm trực tiếp thông qua giao diện web.

## 🚀 Tính năng đã thêm

### Backend (Product Service)
- ✅ **Cloudinary Configuration**: Cấu hình kết nối với Cloudinary service
- ✅ **Image Upload Utilities**: Utilities để upload, xóa và quản lý hình ảnh
- ✅ **Multer Middleware**: Middleware xử lý file upload với validation
- ✅ **Updated CRUD Routes**: Cập nhật routes create/update product để hỗ trợ upload hình ảnh
- ✅ **Environment Configuration**: Thêm biến môi trường Cloudinary vào Docker

### Frontend (React)
- ✅ **ImageUpload Component**: Component drag-and-drop để upload hình ảnh
- ✅ **Updated AdminProducts**: Trang quản lý sản phẩm với tính năng upload
- ✅ **API Integration**: Cập nhật API calls để gửi FormData với hình ảnh
- ✅ **Image Preview**: Xem trước hình ảnh trước khi upload

## 🔧 Cấu hình

### 1. Biến môi trường
Thêm vào file `.env`:
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Dependencies đã cài đặt
**Product Service:**
- `cloudinary`: SDK for Cloudinary service
- `multer`: File upload middleware
- `@types/multer`: TypeScript definitions

## 📖 Cách sử dụng

### 1. Tạo sản phẩm mới với hình ảnh
1. Đăng nhập với tài khoản admin
2. Vào trang "Quản lý sản phẩm" 
3. Click "Thêm sản phẩm"
4. Điền thông tin sản phẩm
5. Kéo thả hoặc click để chọn hình ảnh (tối đa 4 ảnh)
6. Click "Thêm" để tạo sản phẩm

### 2. Cập nhật hình ảnh sản phẩm
1. Trong danh sách sản phẩm, click icon "Sửa"
2. Thêm/thay đổi hình ảnh mới
3. Click "Cập nhật"
4. Hình ảnh cũ sẽ được xóa khỏi Cloudinary tự động

### 3. Validation và giới hạn
- **Định dạng file**: PNG, JPG, JPEG
- **Kích thước tối đa**: 5MB mỗi file
- **Số lượng**: Tối đa 4 hình ảnh mỗi sản phẩm
- **Bắt buộc**: Ít nhất 1 hình ảnh cho sản phẩm mới

## 🏗️ Cấu trúc kỹ thuật

### Backend File Structure
```
product/
├── src/
│   ├── config/
│   │   └── cloudinary.ts          # Cloudinary configuration
│   ├── middleware/
│   │   └── upload.ts               # Multer middleware
│   ├── utils/
│   │   └── image-upload.ts         # Image upload utilities
│   └── routes/
│       ├── create-product.ts       # Updated with image upload
│       └── update-product.ts       # Updated with image upload
```

### Frontend Components
```
frontend/
└── src/
    └── components/
        └── ImageUpload.js          # Drag-and-drop upload component
```

## 🔄 API Endpoints

### POST /api/products
Tạo sản phẩm mới với hình ảnh
- **Content-Type**: `multipart/form-data`
- **Files**: `images` (array, max 4 files)
- **Body**: Product data (title, price, category, etc.)

### PATCH /api/products/:id  
Cập nhật sản phẩm với hình ảnh mới
- **Content-Type**: `multipart/form-data`
- **Files**: `images` (array, max 4 files)
- **Body**: Updated product data

## 🧪 Testing

Chạy script test để kiểm tra tích hợp:
```bash
./test-cloudinary-integration.sh
```

### Manual Testing
1. Khởi động hệ thống:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. Truy cập: http://localhost:3005

3. Đăng nhập admin và test upload hình ảnh

## 📝 Product Model Updates

Product model hiện hỗ trợ 4 hình ảnh:
```typescript
images: {
  image1: { type: String, required: true },  // Ảnh chính
  image2: { type: String },                  // Ảnh phụ 1
  image3: { type: String },                  // Ảnh phụ 2  
  image4: { type: String }                   // Ảnh phụ 3
}
```

## 🚨 Lưu ý quan trọng

1. **Cloudinary Credentials**: Đảm bảo có tài khoản Cloudinary và cấu hình đúng credentials
2. **Network Access**: Đảm bảo product service có thể kết nối internet để upload lên Cloudinary
3. **Storage Cleanup**: Khi xóa/cập nhật sản phẩm, hình ảnh cũ sẽ được tự động xóa khỏi Cloudinary
4. **Error Handling**: Nếu upload thất bại, sản phẩm sẽ không được tạo/cập nhật

## 🎯 Next Steps

- [ ] Thêm tính năng crop/resize hình ảnh
- [ ] Tối ưu hóa loading với progressive images
- [ ] Thêm watermark cho hình ảnh sản phẩm
- [ ] Bulk upload cho nhiều sản phẩm
- [ ] Image compression để tối ưu performance
