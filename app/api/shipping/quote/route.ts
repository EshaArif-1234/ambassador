import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import { isCheckoutEnabled } from '@/lib/checkoutEnabled';
import { SHIPPING_RATE_PKR_PER_KG } from '@/lib/shippingConstants';
import {
  computeShippingQuote,
  shippingLineItemsFromCart,
  ShippingQuoteError,
} from '@/lib/shippingQuote';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type QuoteItemPayload = {
  productId?: string;
  id?: string;
  quantity?: number;
  price?: number;
};

/** POST /api/shipping/quote — weight-based delivery charge (PKR 100/kg, rounded up). */
export async function POST(req: NextRequest) {
  try {
    if (!isCheckoutEnabled()) {
      return NextResponse.json(
        { success: false, message: 'Online checkout is not available yet.' },
        { status: 503 },
      );
    }

    const body = await req.json();
    const rawItems = Array.isArray(body?.items) ? (body.items as QuoteItemPayload[]) : [];
    const city = typeof body?.city === 'string' ? body.city : '';
    const address = typeof body?.address === 'string' ? body.address : '';

    if (!rawItems.length) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty.' },
        { status: 400 },
      );
    }

    const items = shippingLineItemsFromCart(
      rawItems.map((item) => ({
        id: String(item.productId ?? item.id ?? ''),
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      })),
    );

    if (items.some((item) => !item.productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid cart item for shipping quote.' },
        { status: 400 },
      );
    }

    await connectDB();

    const quote = await computeShippingQuote(items, { city, address });

    return NextResponse.json({
      success: true,
      subtotal: quote.subtotal,
      deliveryCharges: quote.deliveryCharges,
      total: quote.total,
      quoteReady: quote.quoteReady,
      ratePerKg: SHIPPING_RATE_PKR_PER_KG,
    });
  } catch (err) {
    if (err instanceof ShippingQuoteError) {
      return NextResponse.json(
        { success: false, code: err.code, message: err.message },
        { status: 400 },
      );
    }
    console.error('[POST /api/shipping/quote]', err);
    return NextResponse.json(
      { success: false, message: 'Could not calculate shipping.' },
      { status: 500 },
    );
  }
}
