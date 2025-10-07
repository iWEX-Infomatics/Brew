export const products = [
  {
    id: 1,
    name: "Artisan Sourdough Bread",
    description: "Traditional sourdough bread made with organic flour and natural fermentation. Perfect for sandwiches or toasting.",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop",
    category: "bread",
    retailPrice: 8.99,
    wholesalePrice: 6.50,
    minWholesaleQuantity: 12,
    maxQuantity: 100,
    inStock: true,
    featured: true,
    tags: ["organic", "artisan", "sourdough"]
  },
  {
    id: 2,
    name: "Chocolate Chip Cookies",
    description: "Soft and chewy chocolate chip cookies made with premium Belgian chocolate chips.",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
    category: "cookies",
    retailPrice: 12.99,
    wholesalePrice: 9.50,
    minWholesaleQuantity: 24,
    maxQuantity: 200,
    inStock: true,
    featured: true,
    tags: ["chocolate", "cookies", "premium"]
  },
  {
    id: 3,
    name: "French Croissants",
    description: "Buttery, flaky croissants made with traditional French techniques. Perfect for breakfast or brunch.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
    category: "pastries",
    retailPrice: 3.99,
    wholesalePrice: 2.75,
    minWholesaleQuantity: 20,
    maxQuantity: 150,
    inStock: true,
    featured: true,
    tags: ["french", "buttery", "breakfast"]
  },
  {
    id: 4,
    name: "Whole Grain Bread",
    description: "Nutritious whole grain bread packed with seeds and grains. Great for healthy sandwiches.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
    category: "bread",
    retailPrice: 7.99,
    wholesalePrice: 5.75,
    minWholesaleQuantity: 12,
    maxQuantity: 100,
    inStock: true,
    featured: false,
    tags: ["healthy", "whole-grain", "seeds"]
  },
  {
    id: 5,
    name: "Cinnamon Rolls",
    description: "Sweet and gooey cinnamon rolls with cream cheese frosting. A perfect treat for any time of day.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    category: "pastries",
    retailPrice: 4.99,
    wholesalePrice: 3.50,
    minWholesaleQuantity: 12,
    maxQuantity: 100,
    inStock: true,
    featured: true,
    tags: ["sweet", "cinnamon", "frosting"]
  },
  {
    id: 6,
    name: "Bagels Assortment",
    description: "Fresh bagels in various flavors: plain, sesame, poppy seed, and everything. Perfect for breakfast or lunch.",
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop",
    category: "bread",
    retailPrice: 15.99,
    wholesalePrice: 11.50,
    minWholesaleQuantity: 12,
    maxQuantity: 120,
    inStock: true,
    featured: false,
    tags: ["assortment", "breakfast", "fresh"]
  },
  {
    id: 7,
    name: "Macarons Box",
    description: "Delicate French macarons in assorted flavors. Perfect for special occasions or gifts.",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
    category: "cookies",
    retailPrice: 24.99,
    wholesalePrice: 18.50,
    minWholesaleQuantity: 6,
    maxQuantity: 50,
    inStock: true,
    featured: true,
    tags: ["french", "delicate", "gift"]
  },
  {
    id: 8,
    name: "Danish Pastries",
    description: "Flaky Danish pastries with various fillings: cheese, fruit, and chocolate. A European breakfast classic.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    category: "pastries",
    retailPrice: 5.99,
    wholesalePrice: 4.25,
    minWholesaleQuantity: 12,
    maxQuantity: 100,
    inStock: true,
    featured: false,
    tags: ["danish", "flaky", "european"]
  },
  {
    id: 9,
    name: "Packaged Granola Bars",
    description: "Healthy granola bars made with oats, nuts, and dried fruits. Perfect for on-the-go snacking.",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
    category: "packaged",
    retailPrice: 18.99,
    wholesalePrice: 13.50,
    minWholesaleQuantity: 24,
    maxQuantity: 200,
    inStock: true,
    featured: false,
    tags: ["healthy", "granola", "snack"]
  },
  {
    id: 10,
    name: "Packaged Biscuits",
    description: "Crispy, buttery biscuits perfect for tea time or as a snack. Available in various flavors.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "packaged",
    retailPrice: 16.99,
    wholesalePrice: 12.00,
    minWholesaleQuantity: 20,
    maxQuantity: 150,
    inStock: true,
    featured: false,
    tags: ["crispy", "buttery", "tea-time"]
  }
];

export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'bread', name: 'Bread' },
  { id: 'cookies', name: 'Cookies' },
  { id: 'pastries', name: 'Pastries' },
  { id: 'packaged', name: 'Packaged Foods' }
];

export const getFeaturedProducts = () => {
  return products.filter(product => product.featured);
};

export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

export const getProductsByCategory = (category) => {
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};
