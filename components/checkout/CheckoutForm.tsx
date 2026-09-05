'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/utils/auth.api';
import { checkoutDefaultsFromUser, profileUpdateFromCheckout } from '@/utils/userAddress.util';
import { fetchPakistanCities } from '@/utils/cities.api';
import AuthModal from '@/components/auth/AuthModal';
import { getCheckoutTotals } from '@/utils/checkoutTotals';
import { isValidPakistanPhone } from '@/utils/phone.util';
import {
  clearAlfalahRedirect,
  initAlfalahPayment,
  storeAlfalahRedirect,
  submitAlfalahRedirectForm,
} from '@/utils/alfalahRedirect.util';

const inputFocus =
  'focus:ring-2 focus:ring-[#E36630] focus:border-[#E36630] outline-none';

/** Readable value + placeholder contrast on white fields */
const inputBase =
  'w-full rounded-lg border px-4 py-3 text-gray-900 placeholder:text-gray-600';

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

  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const cityOptions = useMemo(() => {
    const list = [...cities];
    const saved = (formData.city || user?.city || '').trim();
    if (saved && !list.includes(saved)) list.unshift(saved);
    return list;
  }, [cities, formData.city, user?.city]);

  useEffect(() => {
    let cancelled = false;
    setCitiesLoading(true);
    setCitiesError(null);
    fetchPakistanCities()
      .then((data) => {
        if (!cancelled) setCities(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setCitiesError((err as Error).message);
          setCities([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCitiesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const { subtotal, shippingCharges, deliveryCharges, total } = getCheckoutTotals(cartItems);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !isValidPakistanPhone(formData.phone)) {
      newErrors.phone = 'Enter a valid phone (e.g. 0333-1166925 or 042-111-313-106)';
    }

    return newErrors;
  };

  const scrollToFirstError = (fieldErrors: Record<string, string>) => {
    const firstField = ['fullName', 'email', 'phone', 'city', 'address'].find((f) => fieldErrors[f]);
    if (!firstField) return;
    requestAnimationFrame(() => {
      document.querySelector(`[name="${firstField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
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

    const fieldErrors = validateForm();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors({
        ...fieldErrors,
        submit: 'Please complete all required fields to continue to payment.',
      });
      scrollToFirstError(fieldErrors);
      return;
    }

    setErrors({});
    setIsProcessing(true);

    try {
      if (user) {
        const profilePayload = profileUpdateFromCheckout({
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
        });
        void authApi
          .updateProfile(profilePayload)
          .then((res) => {
            const u = res.data!.user;
            updateUser({
              phoneNumber: u.phoneNumber,
              city: u.city,
              address: u.address,
            });
          })
          .catch(() => {
            /* order API will sync again after payment if cookie is sent */
          });
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

      const { ok, json } = await initAlfalahPayment(paymentData);

      if (json.alreadyPaid) {
        localStorage.setItem(
          'lastOrder',
          JSON.stringify({ ...paymentData, paymentStatus: 'paid', dbOrderId: json.dbOrderId }),
        );
        localStorage.removeItem('paymentData');
        clearAlfalahRedirect();
        router.push(`/order-success?order=${encodeURIComponent(paymentData.orderId)}&status=paid`);
        return;
      }

      if (ok && json.success && json.actionUrl && json.fields) {
        sessionStorage.setItem('pendingPaymentOrderId', paymentData.orderId);
        const redirect = {
          actionUrl: String(json.actionUrl),
          fields: json.fields as Record<string, string>,
          orderId: paymentData.orderId,
        };
        storeAlfalahRedirect(redirect);
        submitAlfalahRedirectForm(redirect.actionUrl, redirect.fields);
        return;
      }

      if (json.code === 'GATEWAY_NOT_CONFIGURED') {
        router.push('/payment');
        return;
      }

      setErrors({
        submit:
          (typeof json.message === 'string' && json.message) ||
          'Could not start payment. Please try again.',
      });
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
                className={`${inputBase} ${inputFocus} ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
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
                className={`${inputBase} ${inputFocus} ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-50 disabled:text-gray-800`}
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
                className={`${inputBase} ${inputFocus} ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0333-1166925"
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
              {citiesError || (!citiesLoading && cityOptions.length === 0) ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`${inputBase} ${inputFocus} ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your city"
                />
              ) : (
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={citiesLoading}
                  className={`${inputBase} ${inputFocus} ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-50 disabled:text-gray-600`}
                >
                  <option value="">
                    {citiesLoading ? 'Loading cities…' : 'Select city'}
                  </option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
              {citiesError && (
                <p className="mt-1 text-sm text-amber-700">
                  City list unavailable — type your city manually.
                </p>
              )}
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`${inputBase} ${inputFocus} ${
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
                className={`${inputBase} border-gray-300 ${inputFocus}`}
                placeholder="Special instructions for delivery"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">PKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping Charges</span>
              <span className="font-medium text-gray-900">
                {shippingCharges === 0 ? 'FREE' : `PKR ${shippingCharges.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-[#E36630]">PKR {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Standard shipping is PKR {shippingCharges.toLocaleString()} per
              order. Delivery is available across Pakistan; remote areas may need extra charges
              confirmed by our team.
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
              Redirecting to Alfalah…
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
