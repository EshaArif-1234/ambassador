'use client';

import Link from 'next/link';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';
import { useCart, type CartItem } from '@/contexts/CartContext';
import Image from 'next/image';
import { getCheckoutTotals } from '@/utils/checkoutTotals';

export type OrderSummaryCustomerInfo = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
};

type OrderSummaryProps = {
  /** Read-only summary for payment page (no cart edits). */
  readOnly?: boolean;
  items?: CartItem[];
  subtotal?: number;
  deliveryCharges?: number;
  total?: number;
  orderId?: string;
  customerInfo?: OrderSummaryCustomerInfo;
};

const OrderSummary = ({
  readOnly = false,
  items: itemsProp,
  subtotal: subtotalProp,
  deliveryCharges: deliveryChargesProp,
  total: totalProp,
  orderId,
  customerInfo,
}: OrderSummaryProps = {}) => {
  const { cartItems, removeFromCart } = useCart();
  const items = itemsProp ?? cartItems;

  const computed = getCheckoutTotals(items);
  const subtotal = subtotalProp ?? computed.subtotal;
  const shippingCharges = deliveryChargesProp ?? computed.shippingCharges;
  const total = totalProp ?? subtotal + shippingCharges;

  return (
    <div className="rounded-lg border bg-white p-6 sticky top-24">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>

      {readOnly && orderId && (
        <p className="mb-3 text-xs text-gray-500">
          Order ID: <span className="font-medium text-gray-800">{orderId}</span>
        </p>
      )}

      {readOnly && customerInfo && (
        <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 space-y-1">
          {customerInfo.name && (
            <p>
              <span className="font-medium text-gray-800">{customerInfo.name}</span>
            </p>
          )}
          {customerInfo.phone && <p>{customerInfo.phone}</p>}
          {customerInfo.email && <p className="break-all">{customerInfo.email}</p>}
          {(customerInfo.city || customerInfo.address) && (
            <p className="whitespace-pre-line">
              {[customerInfo.address, customerInfo.city].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Products */}
      <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-start gap-3 border-b pb-3 last:border-b-0"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-2 pr-1 text-sm font-medium text-gray-900">
                {item.title}
              </h4>
              <p className="mt-1 text-xs text-gray-600">
                Product Code: {item.productCode}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                <span className="text-sm font-medium text-gray-900">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() => removeFromCart(index)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${item.title} from cart`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="py-8 text-center">
            <svg
              className="mx-auto mb-3 h-12 w-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-sm text-gray-500">Your cart is empty</p>
          </div>
        )}
      </div>

      {!readOnly && items.length > 0 && (
        <Link
          href={PRODUCTS_PATH}
          className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-[#0F4C69] transition-colors hover:border-[#E36630] hover:text-[#E36630]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add more products
        </Link>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">PKR {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping Charges</span>
          <span className="text-gray-900">
            {shippingCharges === 0 ? 'FREE' : `PKR ${shippingCharges.toLocaleString()}`}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">PKR 0</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-[#E36630]">
              PKR {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-800">Delivery Information</p>
            <p className="mt-1 text-xs text-blue-700">Estimated delivery: 3-5 business days</p>
            <p className="mt-1 text-xs text-blue-700">Available in major cities only</p>
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="mt-4 flex items-center justify-center">
        <svg className="mr-2 h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span className="text-xs text-gray-600">Secure Checkout</span>
      </div>
    </div>
  );
};

export default OrderSummary;
