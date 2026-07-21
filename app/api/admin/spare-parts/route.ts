import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import SparePart from '@/backend/models/SparePart.model';
import { requireAdmin } from '@/backend/lib/adminAuth';
import { parseSparePartPrice, validateSparePartLinks } from '@/backend/lib/adminSpareParts';

const PAGE_SIZE = 10;

const LIST_PROJECTION = {
  name: 1,
  slug: 1,
  price: 1,
  originalPrice: 1,
  stock: 1,
  status: 1,
  images: { $slice: 1 },
  linkedCategoryIds: 1,
  linkedProductIds: 1,
  createdAt: 1,
};

/** GET /api/admin/spare-parts */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const status = searchParams.get('status') ?? 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? String(PAGE_SIZE), 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'active' || status === 'inactive') filter.status = status;

    const [rows, total] = await Promise.all([
      SparePart.find(filter, LIST_PROJECTION)
        .populate('linkedCategoryIds', 'title slug')
        .populate('linkedProductIds', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SparePart.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET /api/admin/spare-parts]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** POST /api/admin/spare-parts */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await req.json();
    const name = String(body.name ?? '').trim();
    if (!name) {
      return NextResponse.json({ success: false, message: 'Spare part title is required.' }, { status: 400 });
    }

    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
    const imagePublicIds = Array.isArray(body.imagePublicIds) ? body.imagePublicIds.filter(Boolean) : [];
    if (!images.length) {
      return NextResponse.json({ success: false, message: 'Spare part image is required.' }, { status: 400 });
    }

    const priceCheck = parseSparePartPrice(body);
    if (!priceCheck.ok) {
      return NextResponse.json({ success: false, message: priceCheck.message }, { status: 400 });
    }

    const linkCheck = await validateSparePartLinks(body.linkedCategoryIds, body.linkedProductIds);
    if (!linkCheck.ok) {
      return NextResponse.json({ success: false, message: linkCheck.message }, { status: 400 });
    }

    const sparePart = await SparePart.create({
      name,
      linkedCategoryIds: linkCheck.linkedCategoryIds,
      linkedProductIds: linkCheck.linkedProductIds,
      originalPrice: priceCheck.originalPrice,
      ...(priceCheck.price != null ? { price: priceCheck.price } : {}),
      stock: Math.max(0, Number(body.stock ?? 0)),
      status: body.status === 'inactive' ? 'inactive' : 'active',
      images,
      imagePublicIds,
      specifications: {},
    });

    const populated = await SparePart.findById(sparePart._id)
      .populate('linkedCategoryIds', 'title slug')
      .populate('linkedProductIds', 'name slug')
      .lean();

    return NextResponse.json(
      { success: true, message: 'Spare part created.', data: populated },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/admin/spare-parts]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
