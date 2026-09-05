import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import { listAdminSpareParts } from '@/backend/lib/spareParts';
import { fetchAdminSparePartsForExport } from '@/backend/lib/exportAdminSpareParts';
import { parseSparePartPrice } from '@/backend/lib/adminSpareParts';
import { uploadImageBuffer } from '@/backend/lib/cloudinaryUpload';
import { requireAdmin, requireFullAdmin } from '@/backend/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadSparePartModel() {
  const { default: SparePart } = await import('@/backend/models/SparePart.model');
  return SparePart;
}

/** GET /api/admin/spareparts — list or export (?export=1&stock=… or ?export=1&ids=…) */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    if (searchParams.get('export') === '1') {
      try {
        const result = await fetchAdminSparePartsForExport({
          stock: searchParams.get('stock'),
          ids: searchParams.get('ids'),
        });
        return NextResponse.json({ success: true, ...result });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed.';
        const status = message.includes('valid spare part id') || message.includes('stock must')
          ? 400
          : 500;
        return NextResponse.json({ success: false, message }, { status });
      }
    }

    const search = searchParams.get('search')?.trim() ?? '';
    const status = searchParams.get('status') ?? 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10', 10));

    const result = await listAdminSpareParts({ search, status, page, limit });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[GET /api/admin/spareparts]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** POST /api/admin/spareparts — JSON or multipart (file + fields in one request). */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const SparePart = await loadSparePartModel();
    const contentType = req.headers.get('content-type') ?? '';

    let name: string;
    let originalPrice: number;
    let price: number | undefined;
    let stock: number;
    let status: 'active' | 'inactive';
    let description: string;
    let images: string[];
    let imagePublicIds: string[];

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');

      name = String(form.get('name') ?? '').trim();
      const priceCheck = parseSparePartPrice({
        originalPrice: form.get('originalPrice'),
        price: form.get('price'),
      });

      if (!priceCheck.ok) {
        return NextResponse.json({ success: false, message: priceCheck.message }, { status: 400 });
      }

      originalPrice = priceCheck.originalPrice;
      price = priceCheck.price;
      stock = Math.max(0, Number(form.get('stock') ?? 0));
      status = form.get('status') === 'inactive' ? 'inactive' : 'active';
      description = String(form.get('description') ?? '').trim();

      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ success: false, message: 'Spare part image is required.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadImageBuffer(buffer, file.type || 'image/jpeg');
      images = [uploaded.url];
      imagePublicIds = [uploaded.publicId];
    } else {
      const body = await req.json();
      name = String(body.name ?? '').trim();

      const priceCheck = parseSparePartPrice(body);
      if (!priceCheck.ok) {
        return NextResponse.json({ success: false, message: priceCheck.message }, { status: 400 });
      }

      originalPrice = priceCheck.originalPrice;
      price = priceCheck.price;
      stock = Math.max(0, Number(body.stock ?? 0));
      status = body.status === 'inactive' ? 'inactive' : 'active';
      description = String(body.description ?? '').trim();
      images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
      imagePublicIds = Array.isArray(body.imagePublicIds) ? body.imagePublicIds.filter(Boolean) : [];
    }

    if (!name) {
      return NextResponse.json({ success: false, message: 'Spare part title is required.' }, { status: 400 });
    }
    if (!images.length) {
      return NextResponse.json({ success: false, message: 'Spare part image is required.' }, { status: 400 });
    }

    if (status === 'inactive') {
      const adminError = await requireFullAdmin(req);
      if (adminError) return adminError;
    }

    const sparePart = await SparePart.create({
      name,
      originalPrice,
      ...(price != null ? { price } : {}),
      stock,
      status,
      description,
      images,
      imagePublicIds,
      specifications: {},
    });

    const data = sparePart.toObject();

    return NextResponse.json(
      {
        success: true,
        message: 'Spare part created.',
        data: { ...data, _id: String(data._id), images: images.slice(0, 1) },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/admin/spareparts]', error);
    const message = error instanceof Error ? error.message : 'Server error.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
