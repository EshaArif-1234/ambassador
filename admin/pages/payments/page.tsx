'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightPaymentId, setHighlightPaymentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer'>('all');
  const [timePeriod, setTimePeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPayments: Payment[] = [
        {
          id: 'pay_001',
          userId: 1,
          userName: 'John Smith',
          userEmail: 'john.smith@email.com',
          productId: 101,
          productName: 'Kitchen cabinet + countertop (order ORD-2024-001)',
          productImage: '/Images/products/kitchen-cabinet.jpg',
          amount: 4100,
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
          userName: 'Sarah Johnson',
          userEmail: 'sarah.j@email.com',
          productId: 102,
          productName: 'LED Lighting Kit ×3 (order ORD-2024-002)',
          productImage: '/Images/products/led-lights.jpg',
          amount: 450,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'paypal',
          transactionId: 'txn_ord_002',
          createdAt: '2024-04-02T09:14:00Z',
          completedAt: '2024-04-02T09:15:00Z'
        },
        {
          id: 'pay_004',
          userId: 4,
          userName: 'Emily Wilson',
          userEmail: 'emily.w@email.com',
          productId: 104,
          productName: 'Bakery Equipment Set (order ORD-2024-004)',
          productImage: '/Images/products/bakery-equipment.jpg',
          amount: 3500,
          currency: 'USD',
          status: 'refunded',
          paymentMethod: 'debit_card',
          transactionId: 'txn_ord_004',
          createdAt: '2024-04-01T10:58:00Z',
          completedAt: '2024-04-01T11:00:00Z',
          refundedAt: '2024-04-02T08:00:00Z'
        }
      ];
      
      setPayments(mockPayments);
      setLoading(false);
    };

    fetchPayments();
  }, []);

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

  const getFilteredPayments = () => {
    const phrase = searchTerm.trim().toLowerCase();
    return filterByTimePeriod(
      payments.filter(payment => {
        const matchesSearch =
          !phrase ||
          payment.id.toLowerCase().includes(phrase) ||
          payment.userName.toLowerCase().includes(phrase) ||
          payment.userEmail.toLowerCase().includes(phrase) ||
          payment.productName.toLowerCase().includes(phrase) ||
          payment.transactionId.toLowerCase().includes(phrase);
        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
        const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
        return matchesSearch && matchesStatus && matchesMethod;
      }),
      timePeriod
    );
  };

  const filteredPayments = getFilteredPayments();

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;
  const refundedPayments = payments.filter(p => p.status === 'refunded').length;

  useEffect(() => {
    const pid = searchParams.get('paymentId');
    if (pid) {
      setSearchTerm(pid);
      setHighlightPaymentId(pid);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!highlightPaymentId || loading) return;
    const t = window.setTimeout(() => {
      document.getElementById(`payment-row-${highlightPaymentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    return () => clearTimeout(t);
  }, [highlightPaymentId, loading, payments]);

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
          <p className="text-gray-600">Online payments linked to checkout orders</p>
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
              <div className="p-3 bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Refunded</p>
                <p className="text-2xl font-bold text-gray-900">{refundedPayments}</p>
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
                  <tr
                    key={payment.id}
                    id={`payment-row-${payment.id}`}
                    className={`hover:bg-gray-50 ${highlightPaymentId === payment.id ? 'bg-amber-50 ring-2 ring-inset ring-amber-300' : ''}`}
                  >
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
                        <div className="text-sm text-gray-900 max-w-[14rem] truncate" title={payment.productName}>{payment.productName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.currency} {payment.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(payment.paymentMethod)}`}>
                        {payment.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(payment)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
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
                    <span className="text-sm font-medium text-gray-600">Payment ID:</span>
                    <span className="text-sm font-mono text-gray-900">{selectedPayment.id}</span>
                  </div>

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
                      {selectedPayment.paymentMethod.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status.replace(/_/g, ' ')}
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

                  {selectedPayment.refundedAt && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-600">Refunded:</span>
                      <span className="text-sm text-gray-900">{new Date(selectedPayment.refundedAt).toLocaleString()}</span>
                    </div>
                  )}

                  {selectedPayment.failedReason && (
                    <div className="py-2 border-b">
                      <span className="text-sm font-medium text-gray-600 block mb-1">Failed Reason:</span>
                      <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">{selectedPayment.failedReason}</span>
                    </div>
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
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
