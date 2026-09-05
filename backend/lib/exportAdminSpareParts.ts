import mongoose from 'mongoose';
import { dedupeExportProducts, uniqueIdsInOrder } from '@/utils/dedupeExportProducts';

const EXPORT_PROJECTION = {
  name: 1,
  slug: 1,
  price: 1,
  originalPrice: 1,
  stock: 1,
  status: 1,
  images: 1,
  imagePublicIds: 1,
};

export async function fetchAdminSparePartsForExport(options: {
  stock?: string | null;
  ids?: string | null;
}) {
  const { default: SparePart } = await import('@/backend/models/SparePart.model');

  const idsParam = options.ids?.trim();
  const stock = options.stock ?? 'all';

  let filter: Record<string, unknown> = {};
  let orderIds: string[] | null = null;

  if (idsParam) {
    const ids = uniqueIdsInOrder(
      idsParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id)),
    );

    if (ids.length === 0) {
      throw new Error('At least one valid spare part id is required.');
    }

    orderIds = ids;
    filter = {
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    };
  } else {
    if (stock !== 'in_stock' && stock !== 'out_of_stock' && stock !== 'all') {
      throw new Error('stock must be in_stock, out_of_stock, or all.');
    }

    filter =
      stock === 'in_stock'
        ? { stock: { $gt: 0 } }
        : stock === 'out_of_stock'
          ? { stock: { $lte: 0 } }
          : {};
  }

  let spareParts = await SparePart.find(filter, EXPORT_PROJECTION).sort({ name: 1 }).lean();
  spareParts = dedupeExportProducts(spareParts);

  if (orderIds) {
    const byId = new Map(spareParts.map((part) => [String(part._id), part]));
    spareParts = orderIds
      .map((id) => byId.get(id))
      .filter((part): part is (typeof spareParts)[number] => part != null);
  }

  return {
    data: spareParts,
    total: spareParts.length,
    stock: idsParam ? 'selected' : stock,
  };
}
