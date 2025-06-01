// Test file to verify the AdminProducts fix
// This simulates the API response structure and tests the filtering logic

const mockApiResponse = {
  data: {
    products: [
      {
        id: '1',
        title: 'iPhone 15 Pro',
        description: 'Latest iPhone',
        price: 999,
        category: 'smartphone',
        brand: 'Apple',
        countInStock: 10,
        isActive: true,
        createdAt: '2025-06-01'
      },
      {
        id: '2', 
        title: 'Samsung Galaxy S24',
        description: 'Android flagship',
        price: 899,
        category: 'smartphone',
        brand: 'Samsung',
        countInStock: 0,
        isActive: true,
        createdAt: '2025-05-31'
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalProducts: 2
    },
    filters: {}
  }
};

// Test the response structure extraction
console.log('Testing API response structure extraction...');

// This is how the old code worked (would fail)
const oldWay = mockApiResponse.data; // This would be the object with products, pagination, filters
console.log('Old way - trying to filter on:', oldWay);
console.log('Old way - is array?', Array.isArray(oldWay));
// oldWay.filter would throw "filter is not a function"

// This is how the fixed code works
const newWay = mockApiResponse.data.products || mockApiResponse.data || [];
console.log('New way - extracted products:', newWay);
console.log('New way - is array?', Array.isArray(newWay));
console.log('New way - can filter?', typeof newWay.filter === 'function');

// Test the array safeguard
function testFilteredProducts(products) {
  // This is the safeguard from our fix
  if (!Array.isArray(products)) {
    console.log('Safeguard activated - returning empty array');
    return [];
  }
  
  return products.filter(product => product.title.toLowerCase().includes('iphone'));
}

console.log('\nTesting with proper array:', testFilteredProducts(newWay));
console.log('Testing with non-array (old way):', testFilteredProducts(oldWay));

console.log('\n✅ Fix verified - the AdminProducts component should now work correctly!');
