import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  HeartIcon, 
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedPriceType, setSelectedPriceType] = useState('retail');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const foundProduct = getProductById(id);
    if (foundProduct) {
      setProduct(foundProduct);
      // Add more images for demo
      setProduct({
        ...foundProduct,
        images: [
          foundProduct.image,
          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
        ]
      });
    } else {
      navigate('/products');
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      setIsLoading(true);
      addToCart(product, quantity, selectedPriceType);
      setTimeout(() => {
        setIsLoading(false);
        // Show success message or redirect to cart
      }, 500);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const maxQty = selectedPriceType === 'wholesale' 
      ? product.minWholesaleQuantity 
      : product.maxQuantity;
    if (newQuantity >= 1 && newQuantity <= maxQty) {
      setQuantity(newQuantity);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const currentPrice = selectedPriceType === 'wholesale' 
    ? product.wholesalePrice 
    : product.retailPrice;

  const savings = selectedPriceType === 'wholesale' 
    ? ((product.retailPrice - product.wholesalePrice) / product.retailPrice * 100).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-3">
              <img
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                src={product.images[selectedImage]}
                alt={product.name}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <img
                    className="w-full h-20 object-cover hover:opacity-75 transition-opacity"
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">(4.9) • 127 reviews</span>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price Type Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Options</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="priceType"
                      value="retail"
                      checked={selectedPriceType === 'retail'}
                      onChange={(e) => setSelectedPriceType(e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Retail</div>
                      <div className="text-sm text-gray-500">Individual purchase</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">${product.retailPrice}</div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="priceType"
                      value="wholesale"
                      checked={selectedPriceType === 'wholesale'}
                      onChange={(e) => setSelectedPriceType(e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Wholesale</div>
                      <div className="text-sm text-gray-500">Min. {product.minWholesaleQuantity} units</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">${product.wholesalePrice}</div>
                    <div className="text-sm text-green-600">Save {savings}%</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                    max={selectedPriceType === 'wholesale' ? product.minWholesaleQuantity : product.maxQuantity}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (selectedPriceType === 'wholesale' ? product.minWholesaleQuantity : product.maxQuantity)}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Max: {selectedPriceType === 'wholesale' ? product.minWholesaleQuantity : product.maxQuantity} units
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    `Add to Cart - $${(currentPrice * quantity).toFixed(2)}`
                  )}
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <ShareIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900">Free Shipping</div>
                  <div className="text-sm text-gray-500">On orders over $50</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900">Quality Guaranteed</div>
                  <div className="text-sm text-gray-500">Fresh and authentic products</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-primary-500 text-primary-600 font-medium text-sm">
                Product Details
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                Reviews
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                Shipping Info
              </button>
            </nav>
          </div>
          <div className="py-8">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Product</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description} Our commitment to quality ensures that every product is made with the finest ingredients and traditional techniques. 
                This product is perfect for {product.category === 'bread' ? 'daily consumption and meal preparation' : 
                product.category === 'cookies' ? 'snacking and special occasions' :
                product.category === 'pastries' ? 'breakfast and dessert' : 'convenient snacking and on-the-go nutrition'}.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Premium quality ingredients</li>
                    <li>• No artificial preservatives</li>
                    <li>• Fresh and natural</li>
                    <li>• Locally sourced when possible</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Storage</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Store in a cool, dry place</li>
                    <li>• Best consumed within 3-5 days</li>
                    <li>• Can be frozen for longer storage</li>
                    <li>• Follow package instructions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
