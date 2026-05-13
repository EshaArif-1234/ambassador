import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';

/** POST /api/orders — create a new order after successful payment */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      orderId,
      customerInfo,
      orderItems,
      orderData,
      paymentMethod,
      paymentStatus,
      paymentId,
      transactionId,
      gatewayMethod,
      paidAt,
      paymentType,
      walletNumber,
    } = body;

    if (!orderId || !customerInfo || !orderItems?.length) {
      return NextResponse.json(
        { success: false, message: 'Missing required order fields.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Map cart items to order item schema
    const items = orderItems.map((item: any) => ({
      productId: item._id || item.productId || undefined,
      productName: item.name || item.productName || 'Unknown Product',
      productImage: item.image || item.productImage || '',
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      sku: item.sku || undefined,
    }));

    const subtotal = orderData?.subtotal ?? items.reduce((s: number, i: any) => s + i.total, 0);
    const deliveryCharges = orderData?.deliveryCharges ?? 0;
    const totalAmount = orderData?.totalAmount ?? subtotal + deliveryCharges;

    // Build shipping address from orderData
    const rawAddress: string = orderData?.address ?? `${orderData?.city ?? ''}`;
    const city: string = orderData?.city ?? customerInfo.city ?? '';
    const street = rawAddress.includes(',') ? rawAddress.split(',')[0].trim() : rawAddress;

    const methodLabel =
      paymentType?.includes('jazzcash') ? `JazzCash (${walletNumber ?? ''})` :
      paymentType?.includes('easypaisa') ? `EasyPaisa (${walletNumber ?? ''})` :
      paymentMethod === 'bank' ? 'Bank Transfer' :
      paymentMethod === 'card' ? 'Credit/Debit Card' :
      paymentMethod ?? 'Online';

    const order = await Order.create({
      orderNumber: orderId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      items,
      subtotal,
      deliveryCharges,
      totalAmount,
      currency: 'PKR',
      status: 'pending',
      paymentStatus: paymentStatus === 'paid' ? 'paid' : 'pending',
      paymentMethod: paymentMethod ?? 'online',
      paymentId: paymentId ?? undefined,
      transactionId: transactionId ?? undefined,
      gatewayMethod: methodLabel,
      paidAt: paidAt ? new Date(paidAt) : undefined,
      shippingAddress: {
        street: street || customerInfo.address || 'N/A',
        city: city || 'N/A',
        state: '',
        zipCode: '',
        country: 'Pakistan',
      },
      deliveryNotes: orderData?.deliveryNotes ?? '',
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/orders]', err);
    // Duplicate order number — order already saved
    if (err.code === 11000) {
      return NextResponse.json({ success: true, message: 'Order already saved.' }, { status: 200 });
    }
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to create order.' },
      { status: 500 }
    );
  }
}
