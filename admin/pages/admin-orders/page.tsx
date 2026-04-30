'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate: string;
  deliveryDate?: string;
  shippingMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  failedReason?: string;
  /** Matches `Payment.id` on the Payments dashboard */
  paymentId: string;
  transactionId: string;
  gatewayMethod: string;
  paidAt?: string;
}

interface OrderItem {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedReason, setFailedReason] = useState('');
  const [orderToFail, setOrderToFail] = useState<Order | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'pending' | 'paid' | 'failed' | 'refunded'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'recent'>('all');

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrders: Order[] = [
        {
          id: 1,
          orderNumber: 'ORD-2024-001',
          customerName: 'John Smith',
          customerEmail: 'john.smith@email.com',
          customerPhone: '+1 234-567-8900',
          items: [
            {
              id: 1,
              productName: 'Kitchen Cabinet Set',
              productImage: '/Images/products/kitchen-cabinet.jpg',
              quantity: 1,
              price: 2500,
              total: 2500,
              sku: 'KCH-CAB-001'
            },
            {
              id: 2,
              productName: 'Marble Countertop',
              productImage: '/Images/products/marble-countertop.jpg',
              quantity: 2,
              price: 800,
              total: 1600,
              sku: 'CTR-MRB-880'
            }
          ],
          totalAmount: 4100,
          currency: 'USD',
          status: 'delivered',
          paymentStatus: 'paid',
          orderDate: '2024-04-01',
          deliveryDate: '2024-04-03',
          shippingMethod: 'Standard shipping (5–7 business days)',
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          notes: 'Leave at front desk if unavailable',
          paymentId: 'pay_001',
          transactionId: 'txn_123456789',
          gatewayMethod: 'Credit card (Visa •••• 4242)',
          paidAt: '2024-04-01T10:32:00Z'
        },
        {
          id: 2,
          orderNumber: 'ORD-2024-002',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah.j@email.com',
          customerPhone: '+1 234-567-8901',
          items: [
            {
              id: 3,
              productName: 'LED Lighting Kit',
              productImage: '/Images/products/led-lights.jpg',
              quantity: 3,
              price: 150,
              total: 450,
              sku: 'LED-KIT-12V'
            }
          ],
          totalAmount: 450,
          currency: 'USD',
          status: 'processing',
          paymentStatus: 'paid',
          orderDate: '2024-04-02',
          shippingMethod: 'Express (2 business days)',
          shippingAddress: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA'
          },
          paymentId: 'pay_002',
          transactionId: 'txn_ord_002',
          gatewayMethod: 'PayPal',
          paidAt: '2024-04-02T09:15:00Z'
        },
        {
          id: 4,
          orderNumber: 'ORD-2024-004',
          customerName: 'Emily Wilson',
          customerEmail: 'emily.w@email.com',
          customerPhone: '+1 234-567-8903',
          items: [
            {
              id: 5,
              productName: 'Bakery Equipment Set',
              productImage: '/Images/products/bakery-equipment.jpg',
              quantity: 1,
              price: 3500,
              total: 3500,
              sku: 'BKR-EQP-PRO'
            }
          ],
          totalAmount: 3500,
          currency: 'USD',
          status: 'cancelled',
          paymentStatus: 'refunded',
          orderDate: '2024-04-01',
          shippingMethod: 'Standard shipping (5–7 business days)',
          shippingAddress: {
            street: '321 Elm St',
            city: 'Houston',
            state: 'TX',
            zipCode: '77001',
            country: 'USA'
          },
          notes: 'Customer cancelled due to budget constraints',
          paymentId: 'pay_004',
          transactionId: 'txn_ord_004',
          gatewayMethod: 'Debit card (Mastercard •••• 9921)',
          paidAt: '2024-04-01T11:00:00Z'
        }
      ];
      
      setOrders(mockOrders);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // Close dropdown when clicking outside (table trigger uses .relative; menu is portaled fixed — exclude it)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showActionsDropdown) return;
      const el = event.target as Element;
      if (el.closest('[data-order-actions-menu]')) return;
      if (el.closest('.order-actions-trigger')) return;
      setShowActionsDropdown(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionsDropdown]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      if (selectedOrder?.id === orderToDelete.id) {
        setSelectedOrder(null);
        setShowViewModal(false);
      }
      setOrderToDelete(null);
    }
    setShowDeleteModal(false);
  };

  const handleUpdateStatus = (order: Order, newStatus: Order['status']) => {
    if (isOrderWorkflowLocked(order)) return;
    setOrders(prev =>
      prev.map(o => (o.id === order.id ? { ...o, status: newStatus } : o))
    );
    setSelectedOrder(sel =>
      sel?.id === order.id ? { ...sel, status: newStatus } : sel
    );
  };

  const handleCancelOrder = (order: Order) => {
    if (isOrderWorkflowLocked(order)) return;
    setOrderToCancel(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    if (orderToCancel) {
      const oid = orderToCancel.id;
      setOrders(prev =>
        prev.map(o =>
          o.id === oid
            ? {
                ...o,
                status: 'cancelled',
                paymentStatus: 'refunded' as const,
                notes: o.notes
                  ? `${o.notes}\n\nCancelled: ${cancelReason}`
                  : `Cancelled: ${cancelReason}`,
              }
            : o
        )
      );
      setSelectedOrder(sel =>
        sel?.id === oid
          ? {
              ...sel,
              status: 'cancelled',
              paymentStatus: 'refunded',
              notes: sel.notes
                ? `${sel.notes}\n\nCancelled: ${cancelReason}`
                : `Cancelled: ${cancelReason}`,
            }
          : sel
      );
    }
    setShowCancelModal(false);
    setOrderToCancel(null);
    setCancelReason('');
  };

  const handleMarkAsProcessing = (order: Order) => {
    if (isOrderWorkflowLocked(order)) return;
    const oid = order.id;
    setOrders(prev =>
      prev.map(o => (o.id === oid ? { ...o, status: 'processing' as const } : o))
    );
    setSelectedOrder(sel =>
      sel?.id === oid ? { ...sel, status: 'processing' } : sel
    );
  };

  const handleMarkAsShipped = (order: Order) => {
    if (isOrderWorkflowLocked(order)) return;
    const oid = order.id;
    setOrders(prev =>
      prev.map(o => (o.id === oid ? { ...o, status: 'shipped' as const } : o))
    );
    setSelectedOrder(sel => (sel?.id === oid ? { ...sel, status: 'shipped' } : sel));
  };

  const handleMarkAsDelivered = (order: Order) => {
    if (isOrderWorkflowLocked(order)) return;
    const oid = order.id;
    const deliveryDate = new Date().toISOString().split('T')[0];
    setOrders(prev =>
      prev.map(o =>
        o.id === oid
          ? { ...o, status: 'delivered' as const, deliveryDate }
          : o
      )
    );
    setSelectedOrder(sel =>
      sel?.id === oid ? { ...sel, status: 'delivered', deliveryDate } : sel
    );
  };

  const handleMarkAsFailed = (order: Order) => {
    if (isOrderWorkflowLocked(order)) return;
    setOrderToFail(order);
    setFailedReason('');
    setShowFailedModal(true);
    setShowActionsDropdown(null);
  };

  const confirmMarkAsFailed = () => {
    if (orderToFail && failedReason.trim()) {
      const oid = orderToFail.id;
      const reason = failedReason.trim();
      setOrders(prev =>
        prev.map(o =>
          o.id === oid
            ? {
                ...o,
                status: 'cancelled' as const,
                paymentStatus: 'failed' as const,
                failedReason: reason,
              }
            : o
        )
      );
      setSelectedOrder(sel =>
        sel?.id === oid
          ? {
              ...sel,
              status: 'cancelled',
              paymentStatus: 'failed',
              failedReason: reason,
            }
          : sel
      );
      setShowFailedModal(false);
      setOrderToFail(null);
      setFailedReason('');
    }
  };

  // Function to handle dropdown positioning
  const handleActionsClick = (event: React.MouseEvent, orderNumber: string) => {
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (order && isOrderWorkflowLocked(order)) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Position dropdown below and to the right of the button
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.right - 200 + window.scrollX // 200px width dropdown, align right edge
    });
    
    setShowActionsDropdown(showActionsDropdown === orderNumber ? null : orderNumber);
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPaymentStatus = filterPaymentStatus === 'all' || order.paymentStatus === filterPaymentStatus;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const orderDate = new Date(order.orderDate);
        const today = new Date();
        
        switch (dateRange) {
          case 'today':
            matchesDate = orderDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchesDate = orderDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchesDate = orderDate >= monthAgo;
            break;
          case 'recent':
            const recentAgo = new Date(today);
            recentAgo.setDate(recentAgo.getDate() - 3);
            matchesDate = orderDate >= recentAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate;
    });
  };

  const filteredOrders = getFilteredOrders();

  /** Cancelled orders cannot change fulfillment status (includes cancel + mark as failed). */
  const isOrderWorkflowLocked = (order: Order) => order.status === 'cancelled';

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Online checkout orders — payment is captured before fulfillment</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
                    if (paidOrders.length === 0) return '—';
                    const cur = paidOrders[0].currency;
                    const sum = paidOrders.reduce((s, o) => s + o.totalAmount, 0);
                    return `${cur} ${sum.toLocaleString()}`;
                  })()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
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
                placeholder="Search orders..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none text-gray-900 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none text-gray-900 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none text-gray-900 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Payment</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none text-gray-900 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="recent">Recent Orders (Last 3 Days)</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.items.length} items</div>
                      <div className="text-xs text-gray-500">
                        {order.items.slice(0, 2).map(item => item.productName).join(', ')}
                        {order.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.currency} {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        {isOrderWorkflowLocked(order) ? (
                          <span
                            className="inline-flex cursor-not-allowed items-center px-3 py-2 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-md"
                            title="This order is closed — status cannot be changed."
                          >
                            Closed
                          </span>
                        ) : (
                        <button
                          type="button"
                          onClick={(e) => handleActionsClick(e, order.orderNumber)}
                          className="order-actions-trigger inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          <span>Actions</span>
                          <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm ? `No orders found matching "${searchTerm}"` : 'No orders available'}
            </p>
          </div>
        )}

        {/* Actions Dropdown - Positioned outside table */}
        {showActionsDropdown && (
          <div 
            data-order-actions-menu
            className="fixed z-[9999] w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={{ 
              top: `${dropdownPosition.top}px`, 
              left: `${dropdownPosition.left}px` 
            }}
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  const order = orders.find(o => o.orderNumber === showActionsDropdown);
                  if (order && !isOrderWorkflowLocked(order)) handleMarkAsProcessing(order);
                  setShowActionsDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Mark as Processing
              </button>
              <button
                type="button"
                onClick={() => {
                  const order = orders.find(o => o.orderNumber === showActionsDropdown);
                  if (order && !isOrderWorkflowLocked(order)) handleMarkAsShipped(order);
                  setShowActionsDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 010 1.414l-3.414 3.414A1 1 0 0118.586 16H16" />
                </svg>
                Mark as Shipped
              </button>
              <button
                type="button"
                onClick={() => {
                  const order = orders.find(o => o.orderNumber === showActionsDropdown);
                  if (order && !isOrderWorkflowLocked(order)) handleMarkAsDelivered(order);
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
                type="button"
                onClick={() => {
                  const order = orders.find(o => o.orderNumber === showActionsDropdown);
                  if (order && !isOrderWorkflowLocked(order)) handleCancelOrder(order);
                  setShowActionsDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cancel Order
              </button>
              <button
                type="button"
                onClick={() => {
                  const order = orders.find(o => o.orderNumber === showActionsDropdown);
                  if (order && !isOrderWorkflowLocked(order)) handleMarkAsFailed(order);
                  setShowActionsDropdown(null);
                }}
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

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setOrderToDelete(null);
          }}
          onConfirm={confirmDeleteOrder}
          title="Delete Order"
          message={`Are you sure you want to delete order "${orderToDelete?.orderNumber || 'this order'}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Cancel Order</h2>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to cancel order <span className="font-semibold">{orderToCancel?.orderNumber}</span> for <span className="font-semibold">{orderToCancel?.customerName}</span>?
                  </p>
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ This will also refund the payment and cannot be undone.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Reason</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancelling this order..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  disabled={!cancelReason.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        {showViewModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order {selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Placed {new Date(selectedOrder.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/payments?paymentId=${encodeURIComponent(selectedOrder.paymentId)}`}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
                  >
                    View payment
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary row */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadgeColor(selectedOrder.paymentStatus)}`}>
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedOrder.currency} {selectedOrder.totalAmount.toLocaleString()} total
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Order</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Order number</dt>
                        <dd className="font-medium text-gray-900 text-right">{selectedOrder.orderNumber}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Delivery target</dt>
                        <dd className="font-medium text-gray-900 text-right">
                          {selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Customer</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="font-medium text-gray-900 text-right">{selectedOrder.customerName}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Email</dt>
                        <dd className="font-medium text-gray-900 text-right break-all">{selectedOrder.customerEmail}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Phone</dt>
                        <dd className="font-medium text-gray-900 text-right">{selectedOrder.customerPhone}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Payment</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between gap-4 sm:col-span-2">
                      <dt className="text-gray-500">Payment record</dt>
                      <dd className="font-mono text-xs text-gray-900">{selectedOrder.paymentId}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Transaction</dt>
                      <dd className="font-mono text-xs text-gray-900 truncate max-w-[12rem] sm:max-w-none" title={selectedOrder.transactionId}>
                        {selectedOrder.transactionId}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Method</dt>
                      <dd className="font-medium text-gray-900 text-right">{selectedOrder.gatewayMethod}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Amount</dt>
                      <dd className="font-semibold text-gray-900">{selectedOrder.currency} {selectedOrder.totalAmount.toLocaleString()}</dd>
                    </div>
                    {selectedOrder.paidAt && (
                      <div className="flex justify-between gap-4 sm:col-span-2">
                        <dt className="text-gray-500">Paid at</dt>
                        <dd className="text-gray-900 text-right">{new Date(selectedOrder.paidAt).toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Shipping method</h3>
                    <p className="text-sm text-gray-900">{selectedOrder.shippingMethod}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Shipping address</h3>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Line items</h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Line total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden border shrink-0">
                                  {item.productImage ? (
                                    <Image
                                      src={item.productImage}
                                      alt={item.productName}
                                      width={44}
                                      height={44}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <span className="text-[10px] text-gray-400">No img</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-900 truncate">{item.productName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-gray-600">{item.sku ?? '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {selectedOrder.currency} {item.price.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {selectedOrder.currency} {item.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Order total</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                            {selectedOrder.currency} {selectedOrder.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {selectedOrder.failedReason && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">Failure reason</h3>
                    <p className="text-sm text-red-800">{selectedOrder.failedReason}</p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Notes</h3>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Failed Reason Modal */}
        {showFailedModal && orderToFail && (
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
                      setOrderToFail(null);
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

export default OrdersPage;
