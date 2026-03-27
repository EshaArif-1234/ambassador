'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PaymentData {
  orderId: string;
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  orderItems: any[];
}

const PaymentGatewayPage = () => {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    // Wallet fields
    walletNumber: '',
    walletType: 'jazzcash', // jazzcash or easypaisa
    // Bank transfer fields
    bankAccount: '',
    transactionId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [walletStep, setWalletStep] = useState<'phone' | 'gateway'>('phone');
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

  const validateBankPayment = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankAccount.trim()) {
      newErrors.bankAccount = 'Bank account number is required';
    }

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    }

    return newErrors;
  };

  const validateWalletPayment = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.walletNumber.trim()) {
      newErrors.walletNumber = 'Wallet number is required';
    } else if (!/^\d{11}$/.test(formData.walletNumber.replace(/\s/g, ''))) {
      newErrors.walletNumber = 'Invalid wallet number (11 digits required)';
    }

    return newErrors;
  };

  const handleWalletPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const validationErrors = validateWalletPayment();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call to initiate wallet payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store payment initiation data
      const walletPaymentData = {
        ...paymentData,
        walletNumber: formData.walletNumber,
        walletType: formData.walletType,
        initiatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('walletPaymentData', JSON.stringify(walletPaymentData));
      
      // Move to gateway step (show popup/redirect)
      setWalletStep('gateway');
      
      // Simulate gateway popup/redirect
      setTimeout(() => {
        // In real implementation, this would open the wallet gateway
        // For demo, we'll simulate the PIN/OTP flow
        handleGatewayCallback();
      }, 1000);
      
    } catch (error) {
      setErrors({ submit: 'Failed to initiate wallet payment. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGatewayCallback = async () => {
    // Simulate gateway PIN/OTP entry and success
    setIsProcessing(true);
    
    try {
      // Simulate user entering PIN/OTP in gateway
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Payment success from gateway
      const orderData = {
        ...paymentData,
        paymentMethod: 'online',
        paymentType: `${formData.walletType}_wallet`,
        paymentStatus: 'paid',
        paymentId: `WAL-${Date.now()}`,
        paidAt: new Date().toISOString(),
        walletNumber: formData.walletNumber
      };

      // Store order data for success page
      localStorage.setItem('lastOrder', JSON.stringify(orderData));
      
      // Clear payment data
      localStorage.removeItem('paymentData');
      localStorage.removeItem('walletPaymentData');
      
      setShowSuccess(true);
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push('/order-success');
      }, 2000);
      
    } catch (error) {
      setErrors({ submit: 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'wallet' && walletStep === 'phone') {
      // Handle wallet phone submission
      await handleWalletPhoneSubmit(e);
      return;
    }
    
    // Show confirmation modal first
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmModal(false);
    
    // Validate based on payment method
    const validationErrors = paymentMethod === 'card' 
      ? validateCardPayment()
      : paymentMethod === 'bank'
      ? validateBankPayment()
      : {};

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate payment success (90% success rate for demo)
      const paymentSuccess = Math.random() > 0.1;

      if (paymentSuccess) {
        // Create order with payment success
        const orderData = {
          ...paymentData,
          paymentMethod: 'online',
          paymentStatus: 'paid',
          paymentId: `PAY-${Date.now()}`,
          paidAt: new Date().toISOString()
        };

        // Store order data for success page
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Clear payment data
        localStorage.removeItem('paymentData');
        
        setShowSuccess(true);
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push('/order-success');
        }, 2000);
      } else {
        setErrors({ submit: 'Payment failed. Please try again or use a different payment method.' });
      }
    } catch (error) {
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
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                {paymentData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600 text-sm">Order ID:</span>
                        <p className="font-medium text-gray-900">{paymentData?.orderId || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Customer:</span>
                        <p className="font-medium text-gray-900">{paymentData?.customerInfo?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Email:</span>
                        <p className="font-medium text-gray-900">{paymentData?.customerInfo?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Phone:</span>
                        <p className="font-medium text-gray-900">{paymentData?.customerInfo?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-orange-500">₹{paymentData?.amount?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">Loading payment data...</p>
                )}
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                    <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      paymentMethod === 'wallet'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Mobile Wallet</span>
                    </div>
                    <p className="text-sm text-gray-600">JazzCash, EasyPaisa</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      paymentMethod === 'bank'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">Bank Transfer</span>
                    </div>
                    <p className="text-sm text-gray-600">Online Banking</p>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  {paymentMethod === 'card' && 'Card Details'}
                  {paymentMethod === 'wallet' && 'Mobile Wallet Details'}
                  {paymentMethod === 'bank' && 'Bank Transfer Details'}
                </h2>

                {/* Credit/Debit Card Form */}
                {paymentMethod === 'card' && (
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
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
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                            errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                          }`}
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
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                            errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                          }`}
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
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
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
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                            errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cardholderName && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Wallet Form */}
                {paymentMethod === 'wallet' && (
                  <div className="space-y-4">
                    {walletStep === 'phone' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Wallet Type *
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, walletType: 'jazzcash' }))}
                              className={`p-4 border rounded-lg text-left transition-colors ${
                                formData.walletType === 'jazzcash'
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2">
                                  <span className="text-white text-xs font-bold">JC</span>
                                </div>
                                <span className="font-medium">JazzCash</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, walletType: 'easypaisa' }))}
                              className={`p-4 border rounded-lg text-left transition-colors ${
                                formData.walletType === 'easypaisa'
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                                  <span className="text-white text-xs font-bold">EP</span>
                                </div>
                                <span className="font-medium">EasyPaisa</span>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Number *
                          </label>
                          <input
                            type="text"
                            name="walletNumber"
                            value={formData.walletNumber}
                            onChange={handleInputChange}
                            placeholder="03XX-XXXXXXX"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                              errors.walletNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.walletNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.walletNumber}</p>
                          )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>Payment Flow:</strong> After clicking "Pay Now", you will be redirected to {formData.walletType === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} gateway to enter your MPIN and OTP for payment confirmation.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-orange-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Redirecting to {formData.walletType === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}...
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Please complete the payment in the {formData.walletType === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} app
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Security Note:</strong> Never share your MPIN with anyone. The payment gateway is secure and encrypted.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Transfer Form */}
                {paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleInputChange}
                        placeholder="Your bank account number"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                          errors.bankAccount ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.bankAccount && (
                        <p className="mt-1 text-sm text-red-600">{errors.bankAccount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleInputChange}
                        placeholder="Transaction reference number"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                          errors.transactionId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.transactionId && (
                        <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Bank Transfer Instructions:</strong>
                      </p>
                      <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                        <li>Transfer ₹{paymentData?.amount?.toLocaleString() || '0'} to our bank account</li>
                        <li>Account: Ambassador Engineering Ltd.</li>
                        <li>Bank: Habib Bank Limited</li>
                        <li>Account #: 1234-5678901-2</li>
                        <li>Enter your transaction ID above</li>
                      </ol>
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
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
                    `Pay ₹${paymentData?.amount?.toLocaleString() || '0'}`
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

            {/* Right Column - Payment & Delivery Information */}
            <div className="lg:col-span-1">
              {/* Delivery Charges Information */}
              <div className="bg-orange-50 border border-gray-300 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">Payment & Delivery Information</h3>
                    <div className="text-yellow-800 space-y-2">
                      <p>
                        <strong>Important:</strong> We collect only the product payment online. Delivery charges will be calculated separately after order confirmation.
                      </p>
                      <div className=" rounded-lg p-3 mt-3">
                        <p className="text-sm text-yellow-900 font-medium mb-2">What happens next:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li><strong>Online Payment:</strong> You pay only for the products now</li>
                          <li><strong>Team Contact:</strong> Our team calls within 24 hours</li>
                          <li><strong>Delivery Quote:</strong> We provide delivery charges based on your location and order size</li>
                          <li><strong>Your Approval:</strong> You confirm or modify the order based on final charges</li>
                          <li><strong>Delivery Payment:</strong> Delivery charges paid separately when confirmed</li>
                        </ol>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-yellow-900">
                          <strong>Delivery charges depend on:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm mt-1">
                          <li>Your location and delivery address</li>
                          <li>Order size and weight</li>
                          <li>Installation requirements (if needed)</li>
                          <li>Delivery timeline preferences</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-blue-900">
                          <strong>Benefit:</strong> You only pay for delivery charges after you approve the final quote. No hidden fees!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    <span className="font-medium text-gray-900">
                      {paymentMethod === 'card' && 'Credit/Debit Card'}
                      {paymentMethod === 'wallet' && `${formData.walletType === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Wallet`}
                      {paymentMethod === 'bank' && 'Bank Transfer'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">₹{paymentData?.amount?.toLocaleString() || '0'}</span>
                  </div>

                  {paymentMethod === 'card' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Card:</span>
                        <span className="font-medium text-gray-900">**** **** **** {formData.cardNumber.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cardholder:</span>
                        <span className="font-medium text-gray-900">{formData.cardholderName}</span>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mobile Number:</span>
                      <span className="font-medium text-gray-900">{formData.walletNumber}</span>
                    </div>
                  )}
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
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
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
