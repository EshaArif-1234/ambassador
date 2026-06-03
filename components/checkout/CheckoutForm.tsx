'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/utils/auth.api';
import {
  checkoutDefaultsFromUser,
  profileUpdateFromCheckout,
  SHIPPING_CITIES,
} from '@/utils/userAddress.util';
import AuthModal from '@/components/auth/AuthModal';

const inputFocus =
  'focus:ring-2 focus:ring-[#E36630] focus:border-[#E36630] outline-none';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  deliveryNotes: string;
}

const emptyForm: CheckoutFormData = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  deliveryNotes: '',
};

const CheckoutForm = () => {
  const { cartItems } = useCart();
  const { user, isLoading: authLoading, updateUser } = useUser();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CheckoutFormData>(emptyForm);
  const prefilledFromProfile = useRef(false);

  // Logged-in: pre-fill from user profile (default phone, city, address)
  useEffect(() => {
    if (authLoading || !user || prefilledFromProfile.current) return;
    prefilledFromProfile.current = true;
    const defaults = checkoutDefaultsFromUser(user);
    setFormData((prev) => ({
      ...prev,
      ...defaults,
      deliveryNotes: prev.deliveryNotes,
    }));
  }, [user, authLoading]);

  // Guest: restore draft from localStorage
  useEffect(() => {
    if (authLoading || user) return;
    const savedData = localStorage.getItem('checkoutFormData');
    if (!savedData) return;
    try {
      const parsed = JSON.parse(savedData) as Record<string, unknown>;
      setFormData({
        fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
        email: typeof parsed.email === 'string' ? parsed.email : '',
        phone: typeof parsed.phone === 'string' ? parsed.phone : '',
        city: typeof parsed.city === 'string' ? parsed.city : '',
        address: typeof parsed.address === 'string' ? parsed.address : '',
        deliveryNotes:
          typeof parsed.deliveryNotes === 'string' ? parsed.deliveryNotes : '',
      });
    } catch {
      /* ignore corrupt storage */
    }
  }, [user, authLoading]);

  // Guest draft only — logged-in users rely on profile + order sync
  useEffect(() => {
    if (user) return;
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData, user]);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryCharges = subtotal > 0 ? 200 : 0; // Fixed delivery charge
  const total = subtotal + deliveryCharges;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (Pakistan format)
    const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Pakistani phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      if (user) {
        const profilePayload = profileUpdateFromCheckout({
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
        });
        try {
          const res = await authApi.updateProfile(profilePayload);
          const u = res.data!.user;
          updateUser({
            phoneNumber: u.phoneNumber,
            city: u.city,
            address: u.address,
          });
        } catch {
          /* order API will sync again after payment if cookie is sent */
        }
      }

      const orderData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        deliveryNotes: formData.deliveryNotes,
        userId: user?.id ?? null,
        products: cartItems,
        subtotal,
        deliveryCharges,
        totalAmount: total,
        paymentMethod: 'online' as const,
        paymentStatus: 'pending',
        orderStatus: 'processing',
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
      };

      const paymentData = {
        orderId: orderData.orderId,
        amount: total,
        customerInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
        },
        orderItems: cartItems,
        orderData: orderData,
      };

      localStorage.setItem('paymentData', JSON.stringify(paymentData));
      router.push('/payment');
    } catch (error) {
      console.error('Order failed:', error);
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Customer Information</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 ${inputFocus} ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                } placeholder:text-gray-400`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 ${inputFocus} ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } placeholder:text-gray-400`}
                placeholder="Enter your email"
                disabled={Boolean(user)}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              {user && (
                <p className="mt-1 text-xs text-gray-500">Using your account email.</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 ${inputFocus} ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } placeholder:text-gray-400`}
                placeholder="03XX-XXXXXXX"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Shipping Details</h3>
          {user && (user.phoneNumber || user.address || user.city) && (
            <p className="mb-3 text-xs text-gray-500">
              Pre-filled from your profile. Change anything here to update your default contact and
              address.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 ${inputFocus} ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select city</option>
                {SHIPPING_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full rounded-lg border px-4 py-3 ${inputFocus} ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your complete address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Delivery Notes (Optional)
              </label>
              <textarea
                name="deliveryNotes"
                value={formData.deliveryNotes}
                onChange={handleInputChange}
                rows={2}
                className={`w-full rounded-lg border border-gray-300 px-4 py-3 ${inputFocus}`}
                placeholder="Special instructions for delivery"
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Delivery is currently available only in Lahore, Karachi,
              Islamabad, Rawalpindi, and Faisalabad.
            </p>
          </div>
        </div>

        {/* Payment — online only */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment</h3>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="font-medium text-gray-900">Online payment</p>
            <p className="mt-1 text-sm text-gray-600">
              After you continue, you will complete payment securely with card, mobile wallet, or bank
              transfer. Cash on delivery is not available.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || cartItems.length === 0}
          className="w-full rounded-lg bg-[#E36630] py-4 font-medium text-white transition-colors hover:bg-[#cc5a2a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing…
            </span>
          ) : (
            `Continue to payment • PKR ${total.toLocaleString()}`
          )}
        </button>
      </form>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default CheckoutForm;
