import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { products, categories } from '../data/products';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceType, setPriceType] = useState('retail');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  // Initialize filters from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (type) setPriceType(type);
    if (category) setSelectedCategory(category);
    if (search) setSearchTerm(search);
  }, [searchParams]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return (priceType === 'wholesale' ? a.wholesalePrice : a.retailPrice) - 
                 (priceType === 'wholesale' ? b.wholesalePrice : b.retailPrice);
        case 'price-high':
          return (priceType === 'wholesale' ? b.wholesalePrice : b.retailPrice) - 
                 (priceType === 'wholesale' ? a.wholesalePrice : a.retailPrice);
        case 'featured':
          return b.featured - a.featured;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, sortBy, priceType]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handlePriceTypeChange = (type) => {
    setPriceType(type);
    const params = new URLSearchParams(searchParams);
    params.set('type', type);
    setSearchParams(params);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1, priceType);
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-4 aspect-h-3">
        <img
          className="w-full h-48 object-cover"
          src={product.image}
          alt={product.name}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          {product.featured && (
            <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary-600">
                ${priceType === 'wholesale' ? product.wholesalePrice : product.retailPrice}
              </span>
              <span className="text-sm text-gray-500 ml-2">{priceType}</span>
            </div>
            {priceType === 'wholesale' && (
              <div className="text-right">
                <span className="text-sm text-gray-500">Min: {product.minWholesaleQuantity}</span>
              </div>
            )}
          </div>
          {priceType === 'wholesale' && (
            <p className="text-xs text-gray-500 mt-1">
              Wholesale pricing available
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleAddToCart(product)}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Add to Cart
          </button>
          <Link
            to={`/product/${product.id}`}
            className="flex-1 border border-primary-600 text-primary-600 py-2 px-4 rounded-md hover:bg-primary-50 transition-colors text-sm font-medium text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  const ProductListItem = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-48 flex-shrink-0">
          <img
            className="w-full h-32 md:h-48 object-cover rounded-lg"
            src={product.image}
            alt={product.name}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
            {product.featured && (
              <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
            )}
          </div>
          <p className="text-gray-600 mb-4">{product.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-primary-600">
                ${priceType === 'wholesale' ? product.wholesalePrice : product.retailPrice}
              </span>
              <span className="text-sm text-gray-500 ml-2">{priceType}</span>
            </div>
            {priceType === 'wholesale' && (
              <div className="text-right">
                <span className="text-sm text-gray-500">Min: {product.minWholesaleQuantity}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleAddToCart(product)}
              className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700 transition-colors font-medium"
            >
              Add to Cart
            </button>
            <Link
              to={`/product/${product.id}`}
              className="border border-primary-600 text-primary-600 py-2 px-6 rounded-md hover:bg-primary-50 transition-colors font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {priceType === 'wholesale' ? 'Wholesale Products' : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} products found
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Price Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handlePriceTypeChange('retail')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  priceType === 'retail'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Retail
              </button>
              <button
                onClick={() => handlePriceTypeChange('wholesale')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  priceType === 'wholesale'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Wholesale
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          <div className={`mt-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="featured">Featured First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
          }>
            {filteredProducts.map((product) => (
              viewMode === 'grid' ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <ProductListItem key={product.id} product={product} />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSearchParams({});
              }}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
