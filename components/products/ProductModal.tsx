'use client';

import { useState, useEffect } from 'react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  product?: any;
  onSave?: (product: any) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  mode,
  product,
  onSave
}) => {

  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    subCategory: product?.subCategory || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    status: product?.status || 'active',
    stock: product?.stock || 0,
    description: product?.description || '',
    about: product?.about || '',
    images: product?.images || ['', '', ''],
    videos: product?.videos || ['', ''],
    specifications: product?.specifications || {}
  });

  useEffect(() => {
    // API call (replace later)
    setSubCategories([
      'Kitchen Cabinets',
      'LED Lights',
      'Marble Countertops',
      'Steel Sinks'
    ]);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value }
    }));
  };

  const handleImageChange = (index: number, file: File) => {
    const images = [...formData.images];
    images[index] = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, images }));
  };

  const handleVideoChange = (index: number, file: File) => {
    const videos = [...formData.videos];
    videos[index] = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, videos }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = 'Product title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.subCategory) {
      newErrors.subCategory = 'Sub category is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Discounted price must be greater than 0';
    }

    if (!formData.originalPrice || formData.originalPrice <= 0) {
      newErrors.originalPrice = 'Original price must be greater than 0';
    }

    if (!formData.about.trim()) {
      newErrors.about = 'Product description is required';
    }

    // Price comparison validation
    if (formData.price && formData.originalPrice && parseFloat(formData.price) > parseFloat(formData.originalPrice)) {
      newErrors.price = 'Discounted price cannot be greater than original price';
    }

    // Specifications validation
    if (!formData.specifications['Product Code']?.trim()) {
      newErrors['Product Code'] = 'Product code is required';
    }

    if (!formData.specifications['Material']?.trim()) {
      newErrors['Material'] = 'Material is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    onSave?.(formData);
    onClose();
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // Helper function for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // For view mode, show a completely different interface
  if (isViewMode) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Product Header */}
            <div className="flex items-start gap-6">
              {/* Product Image */}
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border">
                {formData.images[0] ? (
                  <img src={formData.images[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{formData.name || 'Unnamed Product'}</h1>
                
                <div className="flex items-center gap-4 mb-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(formData.status)}`}>
                    {formData.status || 'Unknown'}
                  </span>
                  <span className="text-lg font-semibold text-orange-500">
                    PKR {formData.price ? parseInt(formData.price).toLocaleString() : '0'}
                  </span>
                  {formData.originalPrice && formData.price && (
                    <span className="text-gray-500 line-through">
                      PKR {parseInt(formData.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>Category: {formData.category || 'Not specified'}</span>
                  <span>Sub Category: {formData.subCategory || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Media</h3>
              
              <div className="space-y-4">
                {/* Images */}
                {formData.images.filter((img: string) => img).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2">Product Images</h4>
                    <div className="flex gap-3 flex-wrap">
                      {formData.images.filter((img: string) => img).map((img: string, i: number) => (
                        <div key={i} className="w-24 h-24 rounded overflow-hidden border">
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {formData.videos.filter((vid: string) => vid).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2">Product Videos</h4>
                    <div className="flex gap-3 flex-wrap">
                      {formData.videos.filter((vid: string) => vid).map((vid: string, i: number) => (
                        <div key={i} className="w-24 h-24 rounded bg-gray-100 border flex items-center justify-center">
                          <span className="text-2xl">🎥</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {formData.about || 'No description available for this product.'}
              </p>
            </div>

            {/* Specifications */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Technical Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(formData.specifications || {}).map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded-lg border">
                    <label className="text-xs font-medium text-gray-600 block mb-1">{key}</label>
                    <p className="text-gray-900 font-medium">{String(value || 'Not specified')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Pricing Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-medium">PKR {formData.originalPrice ? parseInt(formData.originalPrice).toLocaleString() : 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discounted Price:</span>
                    <span className="font-medium text-orange-500">PKR {formData.price ? parseInt(formData.price).toLocaleString() : 'Not specified'}</span>
                  </div>
                  {formData.originalPrice && formData.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">You Save:</span>
                      <span className="font-medium text-green-600">
                        PKR {(parseInt(formData.originalPrice) - parseInt(formData.price)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(formData.status)}`}>
                      {formData.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{formData.category || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sub Category:</span>
                    <span className="font-medium">{formData.subCategory || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'add' && 'Add New Product'}
            {mode === 'edit' && 'Edit Product'}
          </h2>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Media Upload - Moved to Top */}
          {!isViewMode && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Media Upload</h3>

              <div className="flex gap-6">
                {/* Images Upload */}
                <div className="flex-1">
                  <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors bg-white">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newImages = [...formData.images];
                        files.forEach((file, index) => {
                          const imageIndex = newImages.findIndex(img => img === '');
                          if (imageIndex !== -1 && imageIndex < 3) {
                            newImages[imageIndex] = URL.createObjectURL(file);
                          }
                        });
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0l4.586 4.586a2 2 0 012.828 0L16 16m-4-4L4 16m12 0l4 4m4-4l4 4" />
                      </svg>
                      <span className="text-xs text-gray-600">+ Add Images</span>
                      <span className="text-xs text-gray-400 mt-1">(Max 3)</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {formData.images.filter((img: string) => img).map((img: string, i: number) => (
                      <div key={i} className="relative w-16 h-16 rounded overflow-hidden border">
                        <img src={img} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            const newImages = [...formData.images];
                            const originalIndex = formData.images.indexOf(img);
                            newImages[originalIndex] = '';
                            setFormData(prev => ({ ...prev, images: newImages }));
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Videos Upload */}
                <div className="flex-1">
                  <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors bg-white">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newVideos = [...formData.videos];
                        files.forEach((file, index) => {
                          const videoIndex = newVideos.findIndex(vid => vid === '');
                          if (videoIndex !== -1 && videoIndex < 2) {
                            newVideos[videoIndex] = URL.createObjectURL(file);
                          }
                        });
                        setFormData(prev => ({ ...prev, videos: newVideos }));
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A8 8 0 00-21.055-5.998L5.578 6.414a1 1 0 00-.763-.355L.5 9.5a1 1 0 001.055.895v6.191a1 1 0 01-.055.895l4.315 4.437A8 8 0 0021.055 5.998L19.422 17.586a1 1 0 00.763.355l.5-9.5a1 1 0 01-1.055-.895V-6.191z" />
                      </svg>
                      <span className="text-xs text-gray-600">+ Add Videos</span>
                      <span className="text-xs text-gray-400 mt-1">(Max 2)</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {formData.videos.filter((vid: string) => vid).map((vid: string, i: number) => (
                      <div key={i} className="relative w-16 h-16 rounded bg-gray-100 border flex items-center justify-center">
                        <span className="text-2xl">🎥</span>
                        <button
                          onClick={() => {
                            const newVideos = [...formData.videos];
                            const originalIndex = formData.videos.indexOf(vid);
                            newVideos[originalIndex] = '';
                            setFormData(prev => ({ ...prev, videos: newVideos }));
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isViewMode}
                  placeholder="Product Title"
                  className={`input-style ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={isViewMode}
                  className={`input-style ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Category</option>
                  <option value="Cabinets">Cabinets</option>
                  <option value="Countertops">Countertops</option>
                  <option value="Sinks">Sinks</option>
                  <option value="Lighting">Lighting</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              {/* SubCategory from API */}
              <div>
                <select
                  value={formData.subCategory}
                  onChange={(e) => handleInputChange('subCategory', e.target.value)}
                  disabled={isViewMode}
                  className={`input-style ${errors.subCategory ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((sub: string, i: number) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">{errors.subCategory}</p>
                )}
              </div>

            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Pricing & Stock</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  placeholder="Original Price"
                  className={`input-style ${errors.originalPrice ? 'border-red-500' : ''}`}
                />
                {errors.originalPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Discount Price"
                  className={`input-style ${errors.price ? 'border-red-500' : ''}`}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="Enter stock quantity"
                className="input-style"
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Description</h3>

            <textarea
              rows={4}
              value={formData.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              placeholder="About Product"
              className={`input-style ${errors.about ? 'border-red-500' : ''}`}
            />
            {errors.about && (
              <p className="text-red-500 text-xs mt-1">{errors.about}</p>
            )}
          </div>

          {/* Specifications */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Specifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={formData.specifications['Product Code'] || ''}
                  onChange={(e) => handleSpecificationChange('Product Code', e.target.value)}
                  placeholder="Product Code"
                  className={`input-style ${errors['Product Code'] ? 'border-red-500' : ''}`}
                />
                {errors['Product Code'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['Product Code']}</p>
                )}
              </div>

              <input
                type="text"
                value={formData.specifications['Burners'] || ''}
                onChange={(e) => handleSpecificationChange('Burners', e.target.value)}
                placeholder="Burners"
                className="input-style"
              />

              <input
                type="text"
                value={formData.specifications['Energy Type'] || ''}
                onChange={(e) => handleSpecificationChange('Energy Type', e.target.value)}
                placeholder="Energy Type"
                className="input-style"
              />

              <input
                type="text"
                value={formData.specifications['BTU (Power)'] || ''}
                onChange={(e) => handleSpecificationChange('BTU (Power)', e.target.value)}
                placeholder="BTU (Power)"
                className="input-style"
              />

              <input
                type="text"
                value={formData.specifications['Size'] || ''}
                onChange={(e) => handleSpecificationChange('Size', e.target.value)}
                placeholder="Size"
                className="input-style"
              />

              <input
                type="text"
                value={formData.specifications['Capacity (Ltr)'] || ''}
                onChange={(e) => handleSpecificationChange('Capacity (Ltr)', e.target.value)}
                placeholder="Capacity (Ltr)"
                className="input-style"
              />

              <div>
                <input
                  type="text"
                  value={formData.specifications['Material'] || ''}
                  onChange={(e) => handleSpecificationChange('Material', e.target.value)}
                  placeholder="Material"
                  className={`input-style ${errors['Material'] ? 'border-red-500' : ''}`}
                />
                {errors['Material'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['Material']}</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>

          {!isViewMode && (
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md"
            >
              {mode === 'add' ? 'Add Product' : 'Update Product'}
            </button>
          )}
        </div>

      </div>

      {/* Tailwind Reusable Input Style */}
      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
          color: #111827;
        }
        .input-style::placeholder {
          color: #9ca3af;
        }
        .input-style:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
        }
      `}</style>

    </div>
  );
};

export default ProductModal;