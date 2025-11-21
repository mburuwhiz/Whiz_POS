import React from 'react';
import { usePosStore } from '../store/posStore';
import { Plus } from 'lucide-react';
import cartPlaceholder from '../assets/cart.png'; // Use direct import for assets in Vite

/**
 * ProductGrid Component
 *
 * Displays a grid of available products for selection.
 * Includes a search bar to filter products by name.
 * Allows adding products to the cart by clicking on the product card.
 *
 * @returns {JSX.Element} The rendered product grid.
 */
export default function ProductGrid() {
  const { products, addToCart } = usePosStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  /**
   * Filters the product list based on the user's search input.
   */
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="product-grid" className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Products</h2>
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 flex flex-col justify-between"
            onClick={() => addToCart(product)}
          >
            <div>
              <div className="aspect-square bg-gray-200 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                <img
                  // Prioritize remote URL, then local path, then imported placeholder
                  src={product.image || product.localImage || cartPlaceholder}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Prevent infinite loop if placeholder also fails (unlikely with import)
                    if (target.src !== cartPlaceholder) {
                      target.src = cartPlaceholder;
                    }
                  }}
                />
              </div>
              <h3 className="font-medium text-gray-800 text-sm mb-1">{product.name}</h3>
              <p className="text-lg font-bold text-blue-600">KES {product.price}</p>
            </div>
            <button className="mt-3 w-full bg-blue-500 text-white rounded-lg py-2.5 px-4 hover:bg-blue-600 transition-colors flex items-center justify-center text-sm font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
