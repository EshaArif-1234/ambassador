'use client';

import Image from 'next/image';

interface CartPopupProps {
  show: boolean;
  onClose: () => void;
  product?: {
    title: string;
    images: string[];
    specifications: { [key: string]: string };
    price: number;
  };
  quantity?: number;
}

const CartPopup = ({ show, onClose, product, quantity = 1 }: CartPopupProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg mx-4 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Added to Cart!</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
            {product?.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">
              {product?.title || 'Product successfully added to your cart'}
            </h4>
            {product?.specifications && (
              <p className="text-sm text-gray-600 mb-2">
                Product Code: {product.specifications['Product Code'] || 'N/A'}
              </p>
            )}
            {quantity > 1 && (
              <p className="text-sm text-gray-600">
                Quantity: {quantity}
              </p>
            )}
            {product?.price && (
              <p className="text-sm text-green-600 font-medium">
                Price: ₹{product.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;
