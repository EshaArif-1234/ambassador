'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Payment {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  productId: number;
  productName: string;
  productImage?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cod_pending' | 'cod_completed' | 'cod_failed';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'cash_on_delivery';
  transactionId: string;
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  codCollectedBy?: string;
  codCollectionTime?: string;
  failedReason?: string;
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'online' | 'cod'>('online');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer'>('all');
  const [codFilterStatus, setCodFilterStatus] = useState<'all' | 'cod_pending' | 'cod_completed' | 'cod_failed'>('all');
  const [timePeriod, setTimePeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedReason, setFailedReason] = useState('');
  const [paymentToFail, setPaymentToFail] = useState<Payment | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPayments: Payment[] = [
        {
          id: 'pay_001',
          userId: 1,
          userName: 'John Doe',
          userEmail: 'john.doe@ambassadors.com',
          productId: 101,
          productName: 'Premium Kitchen Set',
          productImage: '/Images/products/kitchen-set.jpg',
          amount: 299.99,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'credit_card',
          transactionId: 'txn_123456789',
          createdAt: '2024-04-01T10:30:00Z',
          completedAt: '2024-04-01T10:32:00Z'
        },
        {
          id: 'pay_002',
          userId: 2,
          userName: 'Jane Smith',
          userEmail: 'jane.smith@ambassadors.com',
          productId: 102,
          productName: 'Professional Chef Knife',
          productImage: '/Images/products/chef-knife.jpg',
          amount: 89.99,
          currency: 'USD',
          status: 'cod_pending',
          paymentMethod: 'cash_on_delivery',
          transactionId: 'cod_123456790',
          createdAt: '2024-04-02T14:15:00Z',
          deliveryAddress: '123 Main St, New York, NY 10001',
          deliveryDate: '2024-04-05T00:00:00Z'
        },
        {
          id: 'pay_003',
          userId: 3,
          userName: 'Mike Johnson',
          userEmail: 'mike.johnson@ambassadors.com',
          productId: 103,
          productName: 'Cooking Course Bundle',
          amount: 199.99,
          currency: 'USD',
          status: 'failed',
          paymentMethod: 'bank_transfer',
          transactionId: 'txn_123456791',
          createdAt: '2024-04-03T09:45:00Z'
        },
        {
          id: 'pay_004',
          userId: 4,
          userName: 'Sarah Wilson',
          userEmail: 'sarah.wilson@ambassadors.com',
          productId: 104,
          productName: 'Baking Essentials Kit',
          productImage: '/Images/products/baking-kit.jpg',
          amount: 149.99,
          currency: 'USD',
          status: 'cod_completed',
          paymentMethod: 'cash_on_delivery',
          transactionId: 'cod_123456792',
          createdAt: '2024-03-28T16:20:00Z',
          completedAt: '2024-03-30T14:30:00Z',
          deliveryAddress: '456 Oak Ave, Los Angeles, CA 90001',
          deliveryDate: '2024-03-30T00:00:00Z',
          codCollectedBy: 'Delivery Agent - John Smith',
          codCollectionTime: '2024-03-30T14:30:00Z'
        },
        {
          id: 'pay_005',
          userId: 5,
          userName: 'David Brown',
          userEmail: 'david.brown@ambassadors.com',
          productId: 105,
          productName: 'Advanced Cooking Tools',
          amount: 349.99,
          currency: 'USD',
          status: 'cod_failed',
          paymentMethod: 'cash_on_delivery',
          transactionId: 'cod_123456793',
          createdAt: '2024-03-25T11:10:00Z',
          deliveryAddress: '789 Pine St, Chicago, IL 60601',
          deliveryDate: '2024-03-28T00:00:00Z',
          failedReason: 'Customer refused delivery - product not as expected'
        }
      ];
      
      setPayments(mockPayments);
      setLoading(false);
    };

    fetchPayments();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsDropdown && !(event.target as Element).closest('.relative')) {
        setShowActionsDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionsDropdown]);

  const filterByTimePeriod = (payments: Payment[], period: string): Payment[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'daily':
        return payments.filter(payment => 
          new Date(payment.createdAt) >= today
        );
      case 'weekly':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return payments.filter(payment => 
          new Date(payment.createdAt) >= weekAgo
        );
      case 'monthly':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return payments.filter(payment => 
          new Date(payment.createdAt) >= monthAgo
        );
      case 'yearly':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return payments.filter(payment => 
          new Date(payment.createdAt) >= yearAgo
        );
      default:
        return payments;
    }
  };

  // Separate online and COD payments
  const onlinePayments = payments.filter(p => p.paymentMethod !== 'cash_on_delivery');
  const codPayments = payments.filter(p => p.paymentMethod === 'cash_on_delivery');

  // Filter based on active tab
  const getFilteredPayments = () => {
    const basePayments = activeTab === 'online' ? onlinePayments : codPayments;
    
    return filterByTimePeriod(
      basePayments.filter(payment => {
        const matchesSearch = 
          payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'online') {
          const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
          const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
          return matchesSearch && matchesStatus && matchesMethod;
        } else {
          const matchesStatus = codFilterStatus === 'all' || payment.status === codFilterStatus;
          return matchesSearch && matchesStatus;
        }
      }),
      timePeriod
    );
  };

  const filteredPayments = getFilteredPayments();

  // Calculate stats for online payments
  const onlineTotalRevenue = onlinePayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const onlinePendingPayments = onlinePayments.filter(p => p.status === 'pending').length;
  const onlineCompletedPayments = onlinePayments.filter(p => p.status === 'completed').length;
  const onlineFailedPayments = onlinePayments.filter(p => p.status === 'failed').length;

  // Calculate stats for COD payments
  const codTotalRevenue = codPayments.filter(p => p.status === 'cod_completed').reduce((sum, p) => sum + p.amount, 0);
  const codPendingPayments = codPayments.filter(p => p.status === 'cod_pending').length;
  const codCompletedPayments = codPayments.filter(p => p.status === 'cod_completed').length;
  const codFailedPayments = codPayments.filter(p => p.status === 'cod_failed').length;

  // Calculate stats based on active tab
  const totalRevenue = activeTab === 'online' ? onlineTotalRevenue : codTotalRevenue;
  const pendingPayments = activeTab === 'online' ? onlinePendingPayments : codPendingPayments;
  const completedPayments = activeTab === 'online' ? onlineCompletedPayments : codCompletedPayments;
  const failedPayments = activeTab === 'online' ? onlineFailedPayments : codFailedPayments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cod_completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cod_pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cod_failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'credit_card': return 'bg-blue-100 text-blue-800';
      case 'debit_card': return 'bg-indigo-100 text-indigo-800';
      case 'paypal': return 'bg-purple-100 text-purple-800';
      case 'bank_transfer': return 'bg-green-100 text-green-800';
      case 'cash': return 'bg-orange-100 text-orange-800';
      case 'cash_on_delivery': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleUpdateCodStatus = (payment: Payment, newStatus: 'cod_completed' | 'cod_failed') => {
    const updatedPayments = payments.map(p => 
      p.id === payment.id 
        ? { 
            ...p, 
            status: newStatus,
            completedAt: newStatus === 'cod_completed' ? new Date().toISOString() : undefined,
            codCollectedBy: newStatus === 'cod_completed' ? 'Admin - Manual Update' : undefined,
            codCollectionTime: newStatus === 'cod_completed' ? new Date().toISOString() : undefined
          }
        : p
    );
    setPayments(updatedPayments);
  };

  const handleMarkAsDelivered = (payment: Payment) => {
    const updatedPayments = payments.map(p => 
      p.id === payment.id 
        ? { 
            ...p, 
            deliveryDate: new Date().toISOString()
          }
        : p
    );
    setPayments(updatedPayments);
  };

  const handleMarkAsPaid = (payment: Payment) => {
    handleUpdateCodStatus(payment, 'cod_completed');
  };

  const handleMarkAsFailed = (payment: Payment) => {
    setPaymentToFail(payment);
    setFailedReason('');
    setShowFailedModal(true);
    setShowActionsDropdown(null);
  };

  const confirmMarkAsFailed = () => {
    if (paymentToFail && failedReason.trim()) {
      const updatedPayments = payments.map(p => 
        p.id === paymentToFail.id 
          ? { 
              ...p, 
              status: 'cod_failed' as const,
              failedReason: failedReason.trim()
            }
          : p
      );
      setPayments(updatedPayments);
      setShowFailedModal(false);
      setPaymentToFail(null);
      setFailedReason('');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments Dashboard</h1>
          <p className="text-gray-600">Real-time payment monitoring and management</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('online')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'online'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Online Payments
              </button>
              <button
                onClick={() => setActiveTab('cod')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cod'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cash on Delivery
              </button>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{failedPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-teal-100 rounded-full">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">COD Orders</p>
                <p className="text-2xl font-bold text-gray-900">{codPayments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payments..."
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as any)}
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
              </select>
            </div>
            {activeTab === 'online' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Methods</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">COD Status</label>
                <select
                  value={codFilterStatus}
                  onChange={(e) => setCodFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="cod_pending">Pending</option>
                  <option value="cod_completed">Completed</option>
                  <option value="cod_failed">Failed</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.transactionId}</div>
                      <div className="text-xs text-gray-500">{payment.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                      <div className="text-xs text-gray-500">{payment.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 mr-3">
                          {payment.productImage ? (
                            <img src={payment.productImage} alt={payment.productName} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-900">{payment.productName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.currency} {payment.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(payment.paymentMethod)}`}>
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.replace('cod_', '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        {activeTab === 'cod' ? (
                          <button
                            onClick={() => setShowActionsDropdown(showActionsDropdown === payment.id ? null : payment.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            <span>Actions</span>
                            <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        
                        {showActionsDropdown === payment.id && (
                          <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleViewDetails(payment);
                                  setShowActionsDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  handleMarkAsDelivered(payment);
                                  setShowActionsDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mark as Delivered
                              </button>
                              <button
                                onClick={() => {
                                  handleMarkAsPaid(payment);
                                  setShowActionsDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Mark as Paid
                              </button>
                              <button
                                onClick={() => handleMarkAsFailed(payment)}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              >
                                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mark as Failed
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h10a3 3 0 003-3H6a3 3 0 00-3 3v-1m0 0v1m0 0h1m-6 0H6a3 3 0 00-3-3v-1m0 0v1m0 0h1m-6 0h10a3 3 0 003 3v1m0 0v-1m0 0h-1" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {searchTerm ? `No payments found matching "${searchTerm}"` : 'No payments available'}
            </p>
          </div>
        )}

        {/* Payment Details Modal */}
        {showDetailsModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.transactionId}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">User:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.userName}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.userEmail}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Product:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.productName}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Amount:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPayment.currency} {selectedPayment.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(selectedPayment.paymentMethod)}`}>
                      {selectedPayment.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                  </div>
                  
                  {selectedPayment.completedAt && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-600">Completed:</span>
                      <span className="text-sm text-gray-900">{new Date(selectedPayment.completedAt).toLocaleString()}</span>
                    </div>
                  )}

                  {selectedPayment.failedReason && (
                    <div className="py-2 border-b">
                      <span className="text-sm font-medium text-gray-600 block mb-1">Failed Reason:</span>
                      <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">{selectedPayment.failedReason}</span>
                    </div>
                  )}

                  {selectedPayment.paymentMethod === 'cash_on_delivery' && (
                    <>
                      {selectedPayment.deliveryAddress && (
                        <div className="py-2 border-b">
                          <span className="text-sm font-medium text-gray-600 block mb-1">Delivery Address:</span>
                          <span className="text-sm text-gray-900">{selectedPayment.deliveryAddress}</span>
                        </div>
                      )}
                      
                      {selectedPayment.deliveryDate && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-sm font-medium text-gray-600">Delivery Date:</span>
                          <span className="text-sm text-gray-900">{new Date(selectedPayment.deliveryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {selectedPayment.codCollectedBy && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-sm font-medium text-gray-600">Collected By:</span>
                          <span className="text-sm text-gray-900">{selectedPayment.codCollectedBy}</span>
                        </div>
                      )}
                      
                      {selectedPayment.codCollectionTime && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-sm font-medium text-gray-600">Collection Time:</span>
                          <span className="text-sm text-gray-900">{new Date(selectedPayment.codCollectionTime).toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Failed Reason Modal */}
        {showFailedModal && paymentToFail && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mark as Failed - Reason</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please provide a reason for marking this order as failed:
                    </label>
                    <textarea
                      value={failedReason}
                      onChange={(e) => setFailedReason(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter reason for failure..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowFailedModal(false);
                      setPaymentToFail(null);
                      setFailedReason('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmMarkAsFailed}
                    disabled={!failedReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Mark as Failed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
