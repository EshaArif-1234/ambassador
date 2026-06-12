'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCart, type CartItem } from '@/contexts/CartContext';

interface PaymentData {
  orderId: string;
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    city?: string;
    address?: string;
  };
  orderItems: CartItem[];
  orderData?: {
    subtotal?: number;
    deliveryCharges?: number;
    totalAmount?: number;
  };
}

/** Persist the completed order to MongoDB. Returns Mongo _id when available. */
async function saveOrderToDb(
  orderPayload: Record<string, unknown>
): Promise<{ ok: boolean; id?: string; message?: string }> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(orderPayload),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('[saveOrderToDb]', json?.message ?? res.statusText);
      return { ok: false, message: json?.message ?? 'Failed to save order.' };
    }
    const id = json?.data?._id;
    return { ok: true, id: id != null ? String(id) : undefined };
  } catch (err) {
    console.error('[saveOrderToDb]', err);
    return { ok: false, message: 'Failed to save order.' };
  }
}

const inputBase =
  'w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-600 outline-none';
const inputFocus =
  'focus:ring-2 focus:ring-[#E36630] focus:border-[#E36630]';

const PaymentGatewayPage = () => {
  const router = useRouter();
  const { clearCart } = useCart();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // Get payment data from localStorage
    const savedPaymentData = localStorage.getItem('paymentData');
    if (savedPaymentData) {
      try {
        const data = JSON.parse(savedPaymentData);
        setPaymentData(data);
      } catch (error) {
        console.error('Error parsing payment data:', error);
        router.push('/checkout');
      }
    } else {
      router.push('/checkout');
    }
  }, [router]);

  const validateCardPayment = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!formData.expiryMonth) newErrors.expiryMonth = 'Expiry month is required';
    if (!formData.expiryYear) newErrors.expiryYear = 'Expiry year is required';
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expiryYear = parseInt(formData.expiryYear);
    const expiryMonth = parseInt(formData.expiryMonth);
    
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      newErrors.expiryYear = 'Card has expired';
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmModal(false);

    const validationErrors = validateCardPayment();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const paymentSuccess = Math.random() > 0.1;

      if (paymentSuccess) {
        const payId = `PAY-${Date.now()}`;
        const orderData = {
          ...paymentData,
          paymentMethod: 'online',
          paymentStatus: 'paid',
          paymentId: payId,
          paidAt: new Date().toISOString(),
        };

        const saveResult = await saveOrderToDb({
          ...orderData,
          transactionId: payId,
          gatewayMethod: `Credit/Debit Card (•••• ${formData.cardNumber.replace(/\s/g, '').slice(-4)})`,
        });

        if (!saveResult.ok) {
          setErrors({
            submit: saveResult.message ?? 'Order could not be saved. Please try again or contact support.',
          });
          return;
        }

        localStorage.setItem('lastOrder', JSON.stringify({ ...orderData, dbOrderId: saveResult.id }));

        localStorage.removeItem('paymentData');
        clearCart();

        setShowSuccess(true);

        setTimeout(() => {
          router.push('/order-success');
        }, 2000);
      } else {
        setErrors({ submit: 'Payment failed. Please check your card details and try again.' });
      }
    } catch {
      setErrors({ submit: 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Redirecting to order confirmation...</p>
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              
            </Link>
            <button
              onClick={() => router.push('/checkout')}
              className="text-orange-500 hover:text-orange-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Checkout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-2">
              {/* Payment Method */}
              <div className="mb-6 rounded-lg border border-[#E36630]/30 bg-orange-50 p-4">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 shrink-0 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Credit / Debit Card</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, and other major cards</p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-6 text-lg font-semibold text-gray-900">Card Details</h2>

                <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`${inputBase} ${inputFocus} ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Month *
                        </label>
                        <select
                          name="expiryMonth"
                          value={formData.expiryMonth}
                          onChange={handleInputChange}
                          className={`${inputBase} ${inputFocus} ${
                            formData.expiryMonth ? 'text-gray-900' : 'text-gray-600'
                          } ${errors.expiryMonth ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        {errors.expiryMonth && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryMonth}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Year *
                        </label>
                        <select
                          name="expiryYear"
                          value={formData.expiryYear}
                          onChange={handleInputChange}
                          className={`${inputBase} ${inputFocus} ${
                            formData.expiryYear ? 'text-gray-900' : 'text-gray-600'
                          } ${errors.expiryYear ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 10 }, (_, i) => (
                            <option key={i} value={new Date().getFullYear() + i}>
                              {new Date().getFullYear() + i}
                            </option>
                          ))}
                        </select>
                        {errors.expiryYear && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryYear}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={4}
                          className={`${inputBase} ${inputFocus} ${
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="cardholderName"
                          value={formData.cardholderName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={`${inputBase} ${inputFocus} ${
                            errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cardholderName && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="mt-4 w-full rounded-lg bg-[#E36630] py-3 px-4 text-white transition-colors hover:bg-[#cc5a2a] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Pay PKR ${paymentData?.amount?.toLocaleString() || '0'}`
                  )}
                </button>
              </form>

              {/* Cancel Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/checkout')}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel and return to checkout
                </button>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              {paymentData ? (
                <OrderSummary
                  readOnly
                  items={paymentData.orderItems}
                  subtotal={paymentData.orderData?.subtotal}
                  deliveryCharges={paymentData.orderData?.deliveryCharges}
                  total={paymentData.amount}
                  orderId={paymentData.orderId}
                  customerInfo={paymentData.customerInfo}
                />
              ) : (
                <div className="mb-6 rounded-lg border bg-white p-6">
                  <p className="py-8 text-center text-sm text-gray-500">Loading order summary…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
                Confirm Payment
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">Credit/Debit Card</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">PKR {paymentData?.amount?.toLocaleString() || '0'}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Card:</span>
                    <span className="font-medium text-gray-900">
                      **** **** **** {formData.cardNumber.replace(/\s/g, '').slice(-4) || '----'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cardholder:</span>
                    <span className="font-medium text-gray-900">{formData.cardholderName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800 text-center">
                  <strong>Important:</strong> You're paying only for the products. Delivery charges will be calculated separately and confirmed by our team.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg bg-[#E36630] px-4 py-2 text-white transition-colors hover:bg-[#cc5a2a] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewayPage;
