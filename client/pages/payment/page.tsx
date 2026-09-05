'use client';



import { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import OrderSummary from '@/components/checkout/OrderSummary';

import CheckoutComingSoon from '@/components/checkout/CheckoutComingSoon';

import { useCart, type CartItem } from '@/contexts/CartContext';

import { validateCardPayment } from '@/utils/paymentCard.util';

import type { PaymentErrorCode } from '@/lib/paymentGateway';

import {
  clearAlfalahRedirect,
  initAlfalahPayment,
  readAlfalahRedirect,
  storeAlfalahRedirect,
  submitAlfalahRedirectForm,
} from '@/utils/alfalahRedirect.util';



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



type PaymentSubmitError = {

  title: string;

  message: string;

  detail?: string;

  code?: PaymentErrorCode;

};



type PaymentMode = 'loading' | 'alfalah-redirect' | 'demo-card' | 'error';



function mapPaymentApiError(json: {

  code?: PaymentErrorCode;

  message?: string;

  detail?: string;

}): PaymentSubmitError {

  switch (json.code) {

    case 'GATEWAY_NOT_CONFIGURED':

      return {

        code: json.code,

        title: 'Payment gateway not available',

        message: json.message ?? 'Online payments are not active yet.',

        detail:

          json.detail ??

          'Contact info@ambassador.pk or call 0333-1166925 to complete your order.',

      };

    default:

      return {

        code: json.code,

        title: 'Payment could not be started',

        message: json.message ?? 'Something went wrong during payment.',

        detail: json.detail,

      };

  }

}



const inputBase =

  'w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-600 outline-none';

const inputFocus =

  'focus:ring-2 focus:ring-[#E36630] focus:border-[#E36630]';



function AlfalahRedirectForm({
  actionUrl,
  fields,
}: {
  actionUrl: string;
  fields: Record<string, string>;
}) {
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearAlfalahRedirect();
    submitAlfalahRedirectForm(actionUrl, fields);
  }, [actionUrl, fields]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[#E36630] border-t-transparent" />
        <h2 className="text-xl font-semibold text-gray-900">Redirecting to Alfalah</h2>
        <p className="mt-2 text-sm text-gray-600">
          Connecting you to the secure Bank Alfalah payment page…
        </p>
        <button
          type="button"
          onClick={() => submitAlfalahRedirectForm(actionUrl, fields)}
          className="mt-6 w-full rounded-lg bg-[#E36630] py-3 px-4 font-medium text-white hover:bg-[#cc5a2a]"
        >
          Continue to payment
        </button>
      </div>
    </div>
  );
}



const PaymentGatewayPage = () => {

  const router = useRouter();

  const { clearCart } = useCart();

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const [mode, setMode] = useState<PaymentMode>('loading');

  const [alfaRedirect, setAlfaRedirect] = useState<{

    actionUrl: string;

    fields: Record<string, string>;

  } | null>(null);

  const [initError, setInitError] = useState<PaymentSubmitError | null>(null);



  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({

    cardNumber: '',

    expiryMonth: '',

    expiryYear: '',

    cvv: '',

    cardholderName: '',

  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitError, setSubmitError] = useState<PaymentSubmitError | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const initStartedRef = useRef(false);

  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    const cached = readAlfalahRedirect();
    if (cached?.actionUrl && cached.fields) {
      sessionStorage.setItem('pendingPaymentOrderId', cached.orderId);
      submitAlfalahRedirectForm(cached.actionUrl, cached.fields);
      setMode('alfalah-redirect');
      setAlfaRedirect({ actionUrl: cached.actionUrl, fields: cached.fields });
      return;
    }

    const savedPaymentData = localStorage.getItem('paymentData');

    if (!savedPaymentData) {

      router.push('/checkout');

      return;

    }



    let data: PaymentData;

    try {

      data = JSON.parse(savedPaymentData) as PaymentData;

      setPaymentData(data);

    } catch {

      router.push('/checkout');

      return;

    }



    const startAlfalah = async () => {
      try {
        const { ok, json } = await initAlfalahPayment(data);

        if (json.alreadyPaid) {
          localStorage.setItem(
            'lastOrder',
            JSON.stringify({
              ...data,
              paymentStatus: 'paid',
              dbOrderId: json.dbOrderId,
            }),
          );
          localStorage.removeItem('paymentData');
          clearAlfalahRedirect();
          clearCart();
          router.replace(`/order-success?order=${encodeURIComponent(String(json.orderId))}&status=paid`);
          return;
        }

        if (ok && json.success && json.actionUrl && json.fields) {
          const pendingOrderId = (json.orderId as string | undefined) ?? data.orderId;
          sessionStorage.setItem('pendingPaymentOrderId', pendingOrderId);

          const redirect = {
            actionUrl: String(json.actionUrl),
            fields: json.fields as Record<string, string>,
            orderId: pendingOrderId,
          };
          storeAlfalahRedirect(redirect);
          submitAlfalahRedirectForm(redirect.actionUrl, redirect.fields);
          setAlfaRedirect({ actionUrl: redirect.actionUrl, fields: redirect.fields });
          setMode('alfalah-redirect');
          return;
        }

        if (json.code === 'GATEWAY_NOT_CONFIGURED') {
          setMode('demo-card');
          return;
        }

        setInitError(mapPaymentApiError(json as { code?: PaymentErrorCode; message?: string; detail?: string }));
        setMode('error');
      } catch (err) {
        console.error('[payment/init]', err);
        setInitError({
          title: 'Network error',
          message: 'Could not reach the payment server.',
          detail: 'Check your internet connection and try again.',
          code: 'SERVER_ERROR',
        });
        setMode('error');
      }
    };



    void startAlfalah();

  }, [router, clearCart]);



  const handleConfirmPayment = async () => {

    setShowConfirmModal(false);

    setSubmitError(null);



    const validationErrors = validateCardPayment({

      cardNumber: formData.cardNumber,

      expiryMonth: formData.expiryMonth,

      expiryYear: formData.expiryYear,

      cvv: formData.cvv,

      cardholderName: formData.cardholderName,

    });



    if (Object.keys(validationErrors).length > 0) {

      setErrors(validationErrors);

      return;

    }



    if (!paymentData) return;



    setIsProcessing(true);

    setErrors({});



    try {

      const res = await fetch('/api/payment/process', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        credentials: 'include',

        body: JSON.stringify({ paymentData, card: formData }),

      });

      const json = await res.json();



      if (!res.ok || !json.success) {

        if (json.fieldErrors) setErrors(json.fieldErrors as Record<string, string>);

        setSubmitError(mapPaymentApiError(json));

        return;

      }



      localStorage.setItem(

        'lastOrder',

        JSON.stringify({

          ...paymentData,

          paymentMethod: 'card',

          paymentStatus: 'paid',

          paymentId: json.paymentId,

          paidAt: new Date().toISOString(),

          dbOrderId: json.dbOrderId,

          demoMode: json.demoMode,

        }),

      );

      localStorage.removeItem('paymentData');

      clearCart();

      router.push(`/order-success?order=${encodeURIComponent(paymentData.orderId)}&status=paid`);

    } catch (err) {

      console.error('[payment/demo]', err);

      setSubmitError({

        title: 'Network error',

        message: 'Could not reach the payment server.',

        code: 'SERVER_ERROR',

      });

    } finally {

      setIsProcessing(false);

    }

  };



  if (mode === 'loading') {

    return (

      <div className="flex min-h-screen items-center justify-center bg-gray-50">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#E36630] border-t-transparent" />

          <p className="text-gray-600">Connecting to Bank Alfalah…</p>

        </div>

      </div>

    );

  }



  if (mode === 'alfalah-redirect' && alfaRedirect) {

    return (

      <div className="min-h-screen bg-gray-50">

        <AlfalahRedirectForm actionUrl={alfaRedirect.actionUrl} fields={alfaRedirect.fields} />

      </div>

    );

  }



  if (mode === 'error') {

    return (

      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">

        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-md">

          <h2 className="text-lg font-semibold text-red-800">

            {initError?.title ?? 'Payment unavailable'}

          </h2>

          <p className="mt-2 text-sm text-red-700">{initError?.message}</p>

          {initError?.detail && (

            <p className="mt-2 text-sm text-red-600">{initError.detail}</p>

          )}

          <button

            type="button"

            onClick={() => router.push('/checkout')}

            className="mt-6 rounded-lg bg-[#E36630] px-6 py-2 text-white hover:bg-[#cc5a2a]"

          >

            Back to checkout

          </button>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gray-50">

      <div className="border-b bg-white shadow-sm">

        <div className="container mx-auto px-4 py-4">

          <button

            type="button"

            onClick={() => router.push('/checkout')}

            className="flex items-center text-orange-500 hover:text-orange-600"

          >

            ← Back to Checkout

          </button>

        </div>

      </div>



      <div className="container mx-auto px-4 py-8">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2">

            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">

              <p className="font-semibold">Demo payment mode</p>

              <p className="mt-1">

                Alfalah credentials are incomplete. Complete APG setup or use demo card entry below.

              </p>

            </div>



            <form

              onSubmit={(e) => {

                e.preventDefault();

                setShowConfirmModal(true);

              }}

              className="rounded-lg bg-white p-6 shadow-md"

            >

              <h2 className="mb-6 text-lg font-semibold text-gray-900">Card Details (Demo)</h2>

              <div className="space-y-4">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">Card Number *</label>

                  <input

                    type="text"

                    name="cardNumber"

                    value={formData.cardNumber}

                    onChange={(e) => {

                      const formatted = e.target.value

                        .replace(/\s/g, '')

                        .replace(/(.{4})/g, '$1 ')

                        .trim();

                      setFormData((prev) => ({ ...prev, cardNumber: formatted }));

                    }}

                    placeholder="1234 5678 9012 3456"

                    maxLength={19}

                    className={`${inputBase} ${inputFocus} ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}

                  />

                  {errors.cardNumber && (

                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>

                  )}

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Expiry Month *</label>

                    <select

                      name="expiryMonth"

                      value={formData.expiryMonth}

                      onChange={(e) =>

                        setFormData((prev) => ({ ...prev, expiryMonth: e.target.value }))

                      }

                      className={`${inputBase} ${inputFocus} ${errors.expiryMonth ? 'border-red-500' : 'border-gray-300'}`}

                    >

                      <option value="">Month</option>

                      {Array.from({ length: 12 }, (_, i) => (

                        <option key={i} value={String(i + 1).padStart(2, '0')}>

                          {String(i + 1).padStart(2, '0')}

                        </option>

                      ))}

                    </select>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Expiry Year *</label>

                    <select

                      name="expiryYear"

                      value={formData.expiryYear}

                      onChange={(e) =>

                        setFormData((prev) => ({ ...prev, expiryYear: e.target.value }))

                      }

                      className={`${inputBase} ${inputFocus} ${errors.expiryYear ? 'border-red-500' : 'border-gray-300'}`}

                    >

                      <option value="">Year</option>

                      {Array.from({ length: 10 }, (_, i) => (

                        <option key={i} value={new Date().getFullYear() + i}>

                          {new Date().getFullYear() + i}

                        </option>

                      ))}

                    </select>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">CVV *</label>

                    <input

                      type="text"

                      name="cvv"

                      value={formData.cvv}

                      onChange={(e) => setFormData((prev) => ({ ...prev, cvv: e.target.value }))}

                      maxLength={4}

                      className={`${inputBase} ${inputFocus} ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}

                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Cardholder *</label>

                    <input

                      type="text"

                      name="cardholderName"

                      value={formData.cardholderName}

                      onChange={(e) =>

                        setFormData((prev) => ({ ...prev, cardholderName: e.target.value }))

                      }

                      className={`${inputBase} ${inputFocus} ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'}`}

                    />

                  </div>

                </div>

              </div>



              {submitError && (

                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                  {submitError.message}

                </div>

              )}



              <button

                type="submit"

                disabled={isProcessing}

                className="mt-6 w-full rounded-lg bg-[#E36630] py-3 text-white hover:bg-[#cc5a2a] disabled:opacity-50"

              >

                {isProcessing ? 'Processing…' : `Pay PKR ${paymentData?.amount?.toLocaleString() ?? '0'}`}

              </button>

            </form>

          </div>



          <div className="lg:col-span-1">

            {paymentData && (

              <OrderSummary

                readOnly

                items={paymentData.orderItems}

                subtotal={paymentData.orderData?.subtotal}

                deliveryCharges={paymentData.orderData?.deliveryCharges}

                total={paymentData.amount}

                orderId={paymentData.orderId}

                customerInfo={paymentData.customerInfo}

              />

            )}

          </div>

        </div>

      </div>



      {showConfirmModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">

            <h3 className="text-lg font-semibold text-gray-900">Confirm demo payment</h3>

            <p className="mt-2 text-sm text-gray-600">

              No real charge will be made in demo mode.

            </p>

            <div className="mt-6 flex gap-3">

              <button

                type="button"

                onClick={() => setShowConfirmModal(false)}

                className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700"

              >

                Cancel

              </button>

              <button

                type="button"

                onClick={handleConfirmPayment}

                disabled={isProcessing}

                className="flex-1 rounded-lg bg-[#E36630] py-2 text-white hover:bg-[#cc5a2a]"

              >

                Confirm

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};



function PaymentComingSoonPage() {

  return <CheckoutComingSoon />;

}



export default function PaymentPage({ checkoutEnabled }: { checkoutEnabled: boolean }) {

  if (!checkoutEnabled) {

    return <PaymentComingSoonPage />;

  }

  return <PaymentGatewayPage />;

}

