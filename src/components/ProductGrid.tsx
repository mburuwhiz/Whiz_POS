import React from 'react';
import { usePosStore, Product } from '../store/posStore';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import defaultImage from '../../assets/cart.png';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { addToCart, businessSetup } = usePosStore(state => ({
    addToCart: state.addToCart,
    businessSetup: state.businessSetup,
  }));

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Prevents an infinite loop if the default image itself is not found
    if (target.src !== defaultImage) {
      target.src = defaultImage;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((product) => (
        <motion.div
          key={product.id}
          className={cn(
            'relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-105',
            !product.available && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => product.available && addToCart(product)}
          whileTap={{ scale: 0.95 }}
        >
          <img
            className="h-32 w-full object-cover"
            src={product.image || product.localImage || defaultImage}
            alt={product.name}
            onError={handleImageError}
          />
          <div className="p-3">
            <h3 className="truncate text-sm font-semibold text-gray-800">{product.name}</h3>
            <p className="text-xs text-gray-500">{product.category}</p>
            <p className="mt-2 text-base font-bold text-green-600">
              {businessSetup?.currency || 'Ksh.'} {product.price.toFixed(2)}
            </p>
          </div>
          {!product.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="text-lg font-bold text-white">OUT OF STOCK</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;
