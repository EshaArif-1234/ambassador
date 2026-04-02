'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Category {
  id: number;
  title: string;
  image: string;
  subcategories: SubCategory[];
  status: 'active' | 'inactive';
  createdAt: string;
}

interface SubCategory {
  id: number;
  title: string;
  image: string;
  categoryId: number;
  status: 'active' | 'inactive';
}

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'category' | 'subcategory'>('all');
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showViewCategoryModal, setShowViewCategoryModal] = useState(false);
  const [showViewSubCategoryModal, setShowViewSubCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    image: '' as string | File,
    imagePreview: '',
    status: 'active' as 'active' | 'inactive'
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    title: '',
    image: '' as string | File,
    imagePreview: '',
    categoryId: 0,
    status: 'active' as 'active' | 'inactive'
  });

  // Validation states
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({});
  const [subCategoryErrors, setSubCategoryErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | SubCategory | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchCategories = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCategories: Category[] = [
        {
          id: 1,
          title: 'Kitchen Cabinets',
          image: '/Images/home/kitchen-cabinets.jpg',
          status: 'active',
          createdAt: '2024-01-15',
          subcategories: [
            { id: 1, title: 'Wall Cabinets', image: '/Images/home/wall-cabinets.jpg', categoryId: 1, status: 'active' },
            { id: 2, title: 'Base Cabinets', image: '/Images/home/base-cabinets.jpg', categoryId: 1, status: 'active' },
            { id: 3, title: 'Tall Cabinets', image: '/Images/home/tall-cabinets.jpg', categoryId: 1, status: 'active' }
          ]
        },
        {
          id: 2,
          title: 'Countertops',
          image: '/Images/home/countertops.jpg',
          status: 'active',
          createdAt: '2024-01-16',
          subcategories: [
            { id: 4, title: 'Marble Countertops', image: '/Images/home/marble-countertops.jpg', categoryId: 2, status: 'active' },
            { id: 5, title: 'Granite Countertops', image: '/Images/home/granite-countertops.jpg', categoryId: 2, status: 'active' },
            { id: 6, title: 'Quartz Countertops', image: '/Images/home/quartz-countertops.jpg', categoryId: 2, status: 'active' }
          ]
        },
        {
          id: 3,
          title: 'Lighting',
          image: '/Images/home/lighting.jpg',
          status: 'active',
          createdAt: '2024-01-17',
          subcategories: [
            { id: 7, title: 'LED Lights', image: '/Images/home/led-lights.jpg', categoryId: 3, status: 'active' },
            { id: 8, title: 'Spot Lights', image: '/Images/home/spot-lights.jpg', categoryId: 3, status: 'active' },
            { id: 9, title: 'Pendant Lights', image: '/Images/home/pendant-lights.jpg', categoryId: 3, status: 'active' }
          ]
        }
      ];
      
      setCategories(mockCategories);
      setSubcategories(mockCategories.flatMap(cat => cat.subcategories));
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setModalMode('add');
    setSelectedCategory(null);
    setCategoryForm({ title: '', image: '', imagePreview: '', status: 'active' });
    setCategoryErrors({});
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setCategoryForm({ 
      title: category.title, 
      image: category.image, 
      imagePreview: category.image,
      status: category.status 
    });
    setCategoryErrors({});
    setShowCategoryModal(true);
  };

  const handleAddSubCategory = () => {
    setModalMode('add');
    setSelectedSubCategory(null);
    setSubCategoryForm({ title: '', image: '', imagePreview: '', categoryId: 0, status: 'active' });
    setSubCategoryErrors({});
    setShowSubCategoryModal(true);
  };

  const handleEditSubCategory = (subcategory: SubCategory) => {
    setModalMode('edit');
    setSelectedSubCategory(subcategory);
    setSubCategoryForm({ 
      title: subcategory.title, 
      image: subcategory.image, 
      imagePreview: subcategory.image,
      categoryId: subcategory.categoryId,
      status: subcategory.status 
    });
    setSubCategoryErrors({});
    setShowSubCategoryModal(true);
  };

  const handleSaveCategory = () => {
    // Validation
    const errors: Record<string, string> = {};
    if (!categoryForm.title.trim()) {
      errors.title = 'Category title is required';
    }
    if (!categoryForm.image) {
      errors.image = 'Category image is required';
    }
    
    setCategoryErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Convert File to URL if needed
    const imageUrl = typeof categoryForm.image === 'string' 
      ? categoryForm.image 
      : categoryForm.imagePreview;

    if (modalMode === 'add') {
      const newCategory: Category = {
        id: Date.now(),
        title: categoryForm.title,
        image: imageUrl,
        status: categoryForm.status,
        subcategories: [],
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCategories([...categories, newCategory]);
    } else if (modalMode === 'edit' && selectedCategory) {
      setCategories(categories.map(cat => 
        cat.id === selectedCategory.id 
          ? { ...cat, title: categoryForm.title, image: imageUrl, status: categoryForm.status }
          : cat
      ));
    }
    setShowCategoryModal(false);
  };

  const handleSaveSubCategory = () => {
    // Validation
    const errors: Record<string, string> = {};
    if (!subCategoryForm.title.trim()) {
      errors.title = 'Subcategory title is required';
    }
    if (!subCategoryForm.categoryId) {
      errors.categoryId = 'Parent category is required';
    }
    if (!subCategoryForm.image) {
      errors.image = 'Subcategory image is required';
    }
    
    setSubCategoryErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Convert File to URL if needed
    const imageUrl = typeof subCategoryForm.image === 'string' 
      ? subCategoryForm.image 
      : subCategoryForm.imagePreview;

    if (modalMode === 'add') {
      const newSubCategory: SubCategory = {
        id: Date.now(),
        title: subCategoryForm.title,
        image: imageUrl,
        categoryId: subCategoryForm.categoryId,
        status: subCategoryForm.status
      };
      setSubcategories([...subcategories, newSubCategory]);
    } else if (modalMode === 'edit' && selectedSubCategory) {
      setSubcategories(subcategories.map(sub => 
        sub.id === selectedSubCategory.id 
          ? { ...sub, title: subCategoryForm.title, image: imageUrl, categoryId: subCategoryForm.categoryId, status: subCategoryForm.status }
          : sub
      ));
    }
    setShowSubCategoryModal(false);
  };

  // Image handling functions
  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryForm({
          ...categoryForm,
          image: file,
          imagePreview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubCategoryForm({
          ...subCategoryForm,
          image: file,
          imagePreview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowViewCategoryModal(true);
  };

  const handleViewSubCategory = (subcategory: SubCategory) => {
    setSelectedSubCategory(subcategory);
    setShowViewSubCategoryModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setItemToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteSubCategory = (subcategory: SubCategory) => {
    setItemToDelete(subcategory);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      if ('subcategories' in itemToDelete) {
        // It's a category
        setCategories(categories.filter(cat => cat.id !== itemToDelete.id));
      } else {
        // It's a subcategory
        setSubcategories(subcategories.filter(sub => sub.id !== itemToDelete.id));
      }
      setItemToDelete(null);
    }
    setShowDeleteModal(false);
  };

  const handleToggleCategoryStatus = (category: Category) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    
    // Update category status
    setCategories(categories.map(cat => 
      cat.id === category.id 
        ? { ...cat, status: newStatus }
        : cat
    ));
    
    // If category is being deactivated, also deactivate all its subcategories
    if (newStatus === 'inactive') {
      setSubcategories(subcategories.map(sub => 
        sub.categoryId === category.id 
          ? { ...sub, status: 'inactive' }
          : sub
      ));
    }
  };

  const handleToggleSubCategoryStatus = (subcategory: SubCategory) => {
    setSubcategories(subcategories.map(sub => 
      sub.id === subcategory.id 
        ? { ...sub, status: sub.status === 'active' ? 'inactive' : 'active' }
        : sub
    ));
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || category.status === filterStatus;
    const matchesType = filterType === 'all' || filterType === 'category';
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredSubCategories = subcategories.filter(subcategory => {
    const matchesSearch = subcategory.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || subcategory.status === filterStatus;
    const matchesType = filterType === 'all' || filterType === 'subcategory';
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Management</h1>
          <p className="text-gray-600">Manage categories and subcategories for your kitchen products</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md"
          >
            + Add Category
          </button>
          <button
            onClick={handleAddSubCategory}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md"
          >
            + Add Subcategory
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories and subcategories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-gray-900 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 011 14 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 text-gray-900 outline-none py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 outline-none text-gray-900 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="category">Categories</option>
                <option value="subcategory">Subcategories</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toggle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border">
                          {category.image ? (
                            <Image 
                              src={category.image} 
                              alt={category.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586 1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleCategoryStatus(category)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            category.status === 'active' ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span 
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              category.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewCategory(category)}
                            className="text-blue-600 hover:text-blue-800 mr-2" 
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="text-orange-600 hover:text-orange-800 mr-2" 
                            title="Edit Category"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-800" 
                            title="Delete Category"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Subcategories Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Subcategories</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toggle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubCategories.map((subcategory) => {
                    const parentCategory = categories.find(cat => cat.id === subcategory.categoryId);
                    return (
                      <tr key={subcategory.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border">
                            {subcategory.image ? (
                              <Image 
                                src={subcategory.image} 
                                alt={subcategory.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586 1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{subcategory.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{parentCategory?.title || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            subcategory.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {subcategory.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleSubCategoryStatus(subcategory)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              subcategory.status === 'active' ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <span 
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                subcategory.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewSubCategory(subcategory)}
                              className="text-blue-600 hover:text-blue-800 mr-2" 
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleEditSubCategory(subcategory)}
                              className="text-orange-600 hover:text-orange-800 mr-2" 
                              title="Edit Subcategory"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteSubCategory(subcategory)}
                              className="text-red-600 hover:text-red-800" 
                              title="Delete Subcategory"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
                </h2>
                <button 
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Title</label>
                  <input
                    type="text"
                    value={categoryForm.title}
                    onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                    placeholder="Enter category title"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 outline-none ${
                      categoryErrors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {categoryErrors.title && (
                    <p className="text-red-500 text-xs mt-1">{categoryErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 outline-none ${
                        categoryErrors.image ? 'border-red-500' : ''
                      }`}
                    />
                    {categoryErrors.image && (
                      <p className="text-red-500 text-xs mt-1">{categoryErrors.image}</p>
                    )}
                    {categoryForm.imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={categoryForm.imagePreview} 
                          alt="Category preview" 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={categoryForm.status}
                    onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {modalMode === 'add' ? 'Add Category' : 'Update Category'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subcategory Modal */}
        {showSubCategoryModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' ? 'Add Subcategory' : 'Edit Subcategory'}
                </h2>
                <button 
                  onClick={() => setShowSubCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Title</label>
                  <input
                    type="text"
                    value={subCategoryForm.title}
                    onChange={(e) => setSubCategoryForm({ ...subCategoryForm, title: e.target.value })}
                    placeholder="Enter subcategory title"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 outline-none ${
                      subCategoryErrors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {subCategoryErrors.title && (
                    <p className="text-red-500 text-xs mt-1">{subCategoryErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select
                    value={subCategoryForm.categoryId}
                    onChange={(e) => setSubCategoryForm({ ...subCategoryForm, categoryId: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 ${
                      subCategoryErrors.categoryId ? 'border-red-500' : ''
                    }`}
                  >
                    <option value={0}>Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  {subCategoryErrors.categoryId && (
                    <p className="text-red-500 text-xs mt-1">{subCategoryErrors.categoryId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubCategoryImageChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 outline-none ${
                        subCategoryErrors.image ? 'border-red-500' : ''
                      }`}
                    />
                    {subCategoryErrors.image && (
                      <p className="text-red-500 text-xs mt-1">{subCategoryErrors.image}</p>
                    )}
                    {subCategoryForm.imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={subCategoryForm.imagePreview} 
                          alt="Subcategory preview" 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={subCategoryForm.status}
                    onChange={(e) => setSubCategoryForm({ ...subCategoryForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSubCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSubCategory}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {modalMode === 'add' ? 'Add Subcategory' : 'Update Subcategory'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDeleteItem}
          title={`${itemToDelete && 'subcategories' in itemToDelete ? 'Delete Category' : 'Delete Subcategory'}`}
          message={`Are you sure you want to delete "${itemToDelete?.title || 'this item'}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />

        {/* View Category Modal */}
        {showViewCategoryModal && selectedCategory && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Category Details</h2>
                <button 
                  onClick={() => setShowViewCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    {selectedCategory.title}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedCategory.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCategory.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedCategory.image ? (
                      <div className="flex justify-center">
                        <Image 
                          src={selectedCategory.image} 
                          alt={selectedCategory.title}
                          width={120}
                          height={120}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586 1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowViewCategoryModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View SubCategory Modal */}
        {showViewSubCategoryModal && selectedSubCategory && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Subcategory Details</h2>
                <button 
                  onClick={() => setShowViewSubCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    {categories.find((cat: Category) => cat.id === selectedSubCategory.categoryId)?.title || 'Unknown'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    {selectedSubCategory.title}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedSubCategory.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedSubCategory.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedSubCategory.image ? (
                      <div className="flex justify-center">
                        <Image 
                          src={selectedSubCategory.image} 
                          alt={selectedSubCategory.title}
                          width={120}
                          height={120}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586 1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowViewSubCategoryModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
