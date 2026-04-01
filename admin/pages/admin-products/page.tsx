'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import ProductModal from '@/components/products/ProductModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleSaveProduct = (productData: any) => {
    // Add new product logic
    const newProduct = { ...productData, id: Date.now() };
    setProducts([...products, newProduct]);
    
    // Update existing product logic (for edit modal)
    if (selectedProduct) {
      setProducts(products.map(p => 
        p.id === selectedProduct?.id ? { ...p, ...productData } : p
      ));
    }
    
    // Close all modals
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedProduct(null);
  };

  const handleToggleProductStatus = (product: any) => {
    const updatedProducts = products.map(p => 
      p.id === product.id 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    );
    setProducts(updatedProducts);
  };

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  useEffect(() => {
    // Simulate API call for products
    const fetchProducts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProducts = [
        {
          id: 1,
          name: 'Pakistani Steel Kitchen Cabinet Set',
          category: 'Cabinets',
          subCategory: 'Kitchen Cabinets',
          price: 45000,
          originalPrice: 55000,
          stock: 45,
          status: 'active',
          image: '/api/placeholder/80/80',
          images: [
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif',
            '/Images/home/restaurent.jpg',
            '/Images/home/bakeries.webp',
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif'
          ],
          videos: [
            '/images/3054022 how to setup a commercial kitchen.mp4',
            '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
          ],
          description: 'Premium quality Pakistani steel kitchen cabinets with modern design and durable finish.',
          about: 'Professional-grade kitchen cabinets perfect for commercial kitchens. Features durable stainless steel construction, precise temperature control, and large capacity for high-volume frying. Ideal for restaurants, fast food chains, and food service establishments.',
          specifications: {
            'Product Code': 'PK-001',
            'Material': 'Stainless Steel',
            'Size': '24"D x 36"W x 84"H',
            'Color': 'Silver',
            'Weight': '45 kg',
            'Warranty': '5 Years'
          },
          delivery: {
            'Delivery Time': '5-7 business days',
            'Shipping Cost': 'Free shipping on orders over ₹20,000'
          },
          sku: 'PK-001',
          createdAt: '2024-03-15',
          rating: 4.5,
          reviews: 234
        },
        {
          id: 2,
          name: 'Lahori Marble Countertop',
          category: 'Countertops',
          subCategory: 'Marble Countertops',
          price: 75000,
          originalPrice: 85000,
          stock: 12,
          status: 'active',
          image: '/api/placeholder/80/80',
          images: [
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif',
            '/Images/home/restaurent.jpg',
            '/Images/home/bakeries.webp',
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif'
          ],
          videos: [
            '/images/3054022 how to setup a commercial kitchen.mp4',
            '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
          ],
          description: 'High-quality Lahore marble countertop with traditional Pakistani patterns and polished finish.',
          about: 'Premium marble countertops with traditional Pakistani craftsmanship. Features elegant veining patterns and polished finish that adds luxury to any kitchen.',
          specifications: {
            'Product Code': 'LM-002',
            'Material': 'Marble',
            'Size': '96"L x 24"W x 1.5"H',
            'Color': 'White with Grey Veins',
            'Weight': '120 kg',
            'Warranty': '10 Years'
          },
          delivery: {
            'Delivery Time': '7-10 business days',
            'Shipping Cost': 'Free shipping on orders over ₹30,000'
          },
          sku: 'LM-002',
          createdAt: '2024-03-18',
          rating: 4.8,
          reviews: 189
        },
        {
          id: 3,
          name: 'Karachi Stainless Steel Sink',
          category: 'Sinks',
          subCategory: 'Kitchen Sinks',
          price: 12000,
          originalPrice: 15000,
          stock: 0,
          status: 'out-of-stock',
          image: '/api/placeholder/80/80',
          images: [
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif',
            '/Images/home/restaurent.jpg',
            '/Images/home/bakeries.webp',
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif'
          ],
          videos: [
            '/images/3054022 how to setup a commercial kitchen.mp4',
            '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
          ],
          description: 'Durable Karachi-made stainless steel sink with modern Pakistani kitchen design.',
          about: 'Professional-grade stainless steel sink perfect for commercial kitchens. Features durable construction and modern design.',
          specifications: {
            'Product Code': 'KS-003',
            'Material': 'Stainless Steel',
            'Size': '30"L x 18"W x 10"D',
            'Color': 'Silver',
            'Weight': '15 kg',
            'Warranty': '3 Years'
          },
          delivery: {
            'Delivery Time': '3-5 business days',
            'Shipping Cost': 'Free shipping on orders over ₹10,000'
          },
          sku: 'KS-003',
          createdAt: '2024-03-20',
          rating: 4.2,
          reviews: 156
        },
        {
          id: 4,
          name: 'Islamabad LED Kitchen Lighting',
          category: 'Lighting',
          subCategory: 'LED Lights',
          price: 8000,
          originalPrice: 10000,
          stock: 78,
          status: 'active',
          image: '/api/placeholder/80/80',
          images: [
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif',
            '/Images/home/restaurent.jpg',
            '/Images/home/bakeries.webp',
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif'
          ],
          videos: [
            '/images/3054022 how to setup a commercial kitchen.mp4',
            '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
          ],
          description: 'Energy-efficient LED lighting system designed for Pakistani homes with adjustable brightness.',
          about: 'Energy-efficient LED lighting system with adjustable brightness and color temperature. Perfect for modern Pakistani homes.',
          specifications: {
            'Product Code': 'IL-004',
            'Material': 'Aluminum + LED',
            'Size': '24"L x 4"W x 2.5"H',
            'Color': 'White',
            'Weight': '2 kg',
            'Warranty': '2 Years'
          },
          delivery: {
            'Delivery Time': '2-3 business days',
            'Shipping Cost': 'Free shipping on orders over ₹5,000'
          },
          sku: 'IL-004',
          createdAt: '2024-03-22',
          rating: 4.6,
          reviews: 142
        },
        {
          id: 5,
          name: 'Peshawari Wooden Kitchen Island',
          category: 'Islands',
          subCategory: 'Kitchen Islands',
          price: 35000,
          originalPrice: 42000,
          stock: 8,
          status: 'active',
          image: '/api/placeholder/80/80',
          images: [
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif',
            '/Images/home/restaurent.jpg',
            '/Images/home/bakeries.webp',
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif'
          ],
          videos: [
            '/images/3054022 how to setup a commercial kitchen.mp4',
            '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
          ],
          description: 'Traditional Peshawari wood kitchen island with Pakistani craftsmanship and built-in storage.',
          about: 'Traditional Peshawari wood kitchen island with authentic Pakistani craftsmanship and built-in storage solutions.',
          specifications: {
            'Product Code': 'PW-005',
            'Material': 'Solid Wood',
            'Size': '48"L x 24"W x 36"H',
            'Color': 'Natural Wood',
            'Weight': '35 kg',
            'Warranty': '5 Years'
          },
          delivery: {
            'Delivery Time': '7-10 business days',
            'Shipping Cost': 'Free shipping on orders over ₹25,000'
          },
          sku: 'PW-005',
          createdAt: '2024-03-25',
          rating: 4.7,
          reviews: 98
        },
        {
          id: 6,
          name: 'Multan Clay Kitchen Utensil Set',
          category: 'Utensils',
          subCategory: 'Clay Utensils',
          price: 5000,
          originalPrice: 6000,
          stock: 25,
          status: 'active',
          image: '/api/placeholder/80/80',
          images: [
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif',
            '/Images/home/restaurent.jpg',
            '/Images/home/bakeries.webp',
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif'
          ],
          videos: [
            '/images/3054022 how to setup a commercial kitchen.mp4',
            '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
          ],
          description: 'Handcrafted Multan clay utensil set with traditional Pakistani blue pottery designs.',
          about: 'Handcrafted Multan clay utensil set featuring traditional Pakistani blue pottery designs and authentic craftsmanship.',
          specifications: {
            'Product Code': 'MC-006',
            'Material': 'Clay + Ceramic',
            'Size': 'Various Sizes',
            'Color': 'Blue & White',
            'Weight': '3 kg',
            'Warranty': '1 Year'
          },
          delivery: {
            'Delivery Time': '3-5 business days',
            'Shipping Cost': 'Free shipping on orders over ₹3,000'
          },
          sku: 'MC-006',
          createdAt: '2024-03-26',
          rating: 4.4,
          reviews: 87
        },
        {
          id: 7,
          name: 'Quetta Brass Cookware Collection',
          category: 'Cookware',
          subCategory: 'Brass Cookware',
          price: 18000,
          originalPrice: 22000,
          stock: 15,
          status: 'active',
          image: '/api/placeholder/80/80',
          images: [
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif',
            '/Images/home/restaurent.jpg',
            '/Images/home/bakeries.webp',
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif'
          ],
          videos: [
            '/images/3054022 how to setup a commercial kitchen.mp4',
            '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
          ],
          description: 'Premium Quetta brass cookware collection with traditional Pakistani cooking vessels.',
          about: 'Premium Quetta brass cookware collection with traditional Pakistani cooking vessels and authentic designs.',
          specifications: {
            'Product Code': 'QB-007',
            'Material': 'Brass',
            'Size': 'Various Sizes',
            'Color': 'Gold',
            'Weight': '8 kg',
            'Warranty': '3 Years'
          },
          delivery: {
            'Delivery Time': '5-7 business days',
            'Shipping Cost': 'Free shipping on orders over ₹15,000'
          },
          sku: 'QB-007',
          createdAt: '2024-03-27',
          rating: 4.9,
          reviews: 76
        },
        {
          id: 8,
          name: 'Sialkot Cutlery Set',
          category: 'Cutlery',
          subCategory: 'Stainless Steel Cutlery',
          price: 9000,
          originalPrice: 11000,
          stock: 32,
          status: 'active',
          image: '/api/placeholder/80/80',
          images: [
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif',
            '/Images/home/restaurent.jpg',
            '/Images/home/bakeries.webp',
            '/Images/home/fast food.avif',
            '/Images/home/hotel.avif'
          ],
          videos: [
            '/images/3054022 how to setup a commercial kitchen.mp4',
            '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
          ],
          description: 'High-quality Sialkot stainless steel cutlery set with Pakistani design patterns.',
          about: 'High-quality Sialkot stainless steel cutlery set featuring Pakistani design patterns and premium craftsmanship.',
          specifications: {
            'Product Code': 'SC-008',
            'Material': 'Stainless Steel',
            'Size': '24-Piece Set',
            'Color': 'Silver',
            'Weight': '1.5 kg',
            'Warranty': '2 Years'
          },
          delivery: {
            'Delivery Time': '3-5 business days',
            'Shipping Cost': 'Free shipping on orders over ₹8,000'
          },
          sku: 'SC-008',
          createdAt: '2024-03-28',
          rating: 4.3,
          reviews: 65
        }
      ];

      setProducts(mockProducts);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cabinets': return 'bg-blue-100 text-blue-800';
      case 'Countertops': return 'bg-purple-100 text-purple-800';
      case 'Sinks': return 'bg-orange-100 text-orange-800';
      case 'Lighting': return 'bg-yellow-100 text-yellow-800';
      case 'Islands': return 'bg-pink-100 text-pink-800';
      case 'Utensils': return 'bg-green-100 text-green-800';
      case 'Cookware': return 'bg-red-100 text-red-800';
      case 'Cutlery': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">Manage your kitchen products inventory</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddProduct}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-gray-900 pl-10 pr-4 py-2 border text-gray outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 011 14 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 text-gray-900 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Cabinets">Cabinets</option>
                <option value="Countertops">Countertops</option>
                <option value="Sinks">Sinks</option>
                <option value="Lighting">Lighting</option>
                <option value="Islands">Islands</option>
                <option value="Utensils">Utensils</option>
                <option value="Cookware">Cookware</option>
                <option value="Cutlery">Cutlery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toggle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">

                      {/* Product */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l8 4" />
                            </svg>
                          </div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      </td>

                      {/* Sub Category */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.subCategory}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">
                          PKR{product.price.toLocaleString()}
                        </p>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock} units
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                        ⭐ {product.rating}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(product.status)}`}>
                          {product.status}
                        </span>
                      </td>

                      {/* Toggle */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleToggleProductStatus(product)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            product.status === 'active' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          title={product.status === 'active' ? 'Deactivate Product' : 'Activate Product'}
                        >
                          <span className="sr-only">{product.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                          <span 
                            className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                              product.status === 'active' ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-800 mr-2" 
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-orange-600 hover:text-orange-800 mr-2" 
                          title="Edit Product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800" 
                          title="Delete Product"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Modals */}
        <ProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          mode="add"
          onSave={handleSaveProduct}
        />

        <ProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          mode="edit"
          product={selectedProduct}
          onSave={handleSaveProduct}
        />

        <ProductModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          mode="view"
          product={selectedProduct}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
          onConfirm={confirmDeleteProduct}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete?.name || 'this product'}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
