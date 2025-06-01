import React, { useState, useRef } from 'react';
import * as Icons from 'lucide-react';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 4, 
  disabled = false 
}) => {
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize previews when images prop changes
  React.useEffect(() => {
    const formattedImages = images.map((image, index) => {
      if (typeof image === 'string') {
        // Existing URL
        return {
          id: `existing-${index}`,
          url: image,
          isNew: false
        };
      } else if (image instanceof File) {
        // New file - create preview URL
        return {
          id: `file-${index}-${Date.now()}`,
          url: URL.createObjectURL(image),
          file: image,
          isNew: true
        };
      } else if (image.url) {
        // Already formatted object
        return image;
      }
      return null;
    }).filter(Boolean);
    
    setPreviews(formattedImages);
  }, [images]);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - previews.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (filesToProcess.length > 0) {
      const newPreviews = [...previews];
      const newFiles = [];

      filesToProcess.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push({
              id: Date.now() + Math.random(),
              url: e.target.result,
              file: file,
              isNew: true
            });
            
            if (newPreviews.length <= maxImages) {
              setPreviews([...newPreviews]);
              newFiles.push(file);
            }
            
            if (newFiles.length === filesToProcess.length) {
              // Return all images: existing URLs + new files
              const allImages = getAllImages([...newPreviews]);
              onImagesChange(allImages);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const getAllImages = (previewList = previews) => {
    return previewList.map(preview => {
      if (preview.isNew && preview.file) {
        return preview.file; // New file objects
      } else {
        return preview.url || preview; // Existing URLs
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  const removeImage = (index) => {
    if (disabled) return;
    
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    
    // Return all remaining images: existing URLs + new files
    const allImages = getAllImages(newPreviews);
    onImagesChange(allImages);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Hình ảnh sản phẩm (tối đa {maxImages} ảnh)
      </label>
      
      {/* Image Previews */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div key={preview.id || index} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={preview.url || preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Icons.X size={16} />
              </button>
            )}
          </div>
        ))}
        
        {/* Add More Images */}
        {previews.length < maxImages && !disabled && (
          <div
            onClick={openFileDialog}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
              ${dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <Icons.Plus size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 text-center px-2">
              Thêm ảnh
            </span>
          </div>
        )}
      </div>

      {/* Drop Zone */}
      {previews.length === 0 && !disabled && (
        <div
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex flex-col items-center">
            <Icons.Upload size={48} className="text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Thêm hình ảnh sản phẩm
            </p>
            <p className="text-gray-500 mb-4">
              Kéo thả hoặc click để chọn ảnh
            </p>
            <p className="text-sm text-gray-400">
              PNG, JPG, JPEG tối đa 5MB mỗi ảnh
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Helper Text */}
      <p className="text-sm text-gray-500">
        Ảnh đầu tiên sẽ được sử dụng làm ảnh chính của sản phẩm
      </p>
    </div>
  );
};

export default ImageUpload;
