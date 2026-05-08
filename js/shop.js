let allProducts = [];
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', async function() {
  await loadProducts();
  renderProducts(filteredProducts);
  initFilters();
  initSearch();
  initSort();
  initFilterToggle();
});

async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    const data = await response.json();
    allProducts = data.products;
    filteredProducts = [...allProducts];
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function renderProducts(products) {
  const container = document.getElementById('shopProducts');
  const countElement = document.getElementById('productCount');
  
  if (container) {
    if (products.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1; padding: 40px;">No products found matching your criteria.</p>';
    } else {
      container.innerHTML = products.map(product => createProductCard(product)).join('');
    }
  }
  
  if (countElement) {
    countElement.textContent = products.length;
  }
}

function initFilters() {
  const categoryFilters = document.querySelectorAll('#categoryFilters .filter-option');
  const ratingFilters = document.querySelectorAll('#ratingFilters .filter-option');
  
  categoryFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      categoryFilters.forEach(f => f.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.dataset.category;
      applyFilters();
    });
  });
  
  ratingFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      ratingFilters.forEach(f => f.classList.remove('active'));
      this.classList.add('active');
      
      applyFilters();
    });
  });
  
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  
  if (minPriceInput && maxPriceInput) {
    minPriceInput.addEventListener('change', applyFilters);
    maxPriceInput.addEventListener('change', applyFilters);
  }
}

function applyFilters() {
  const activeCategory = document.querySelector('#categoryFilters .filter-option.active');
  const activeRating = document.querySelector('#ratingFilters .filter-option.active');
  const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) || 999999;
  
  filteredProducts = allProducts.filter(product => {
    const categoryMatch = activeCategory.dataset.category === 'all' || product.category === activeCategory.dataset.category;
    const ratingMatch = product.rating >= parseFloat(activeRating.dataset.rating || 0);
    const priceMatch = product.price >= minPrice && product.price <= maxPrice;
    
    return categoryMatch && ratingMatch && priceMatch;
  });
  
  applySorting();
  renderProducts(filteredProducts);
}

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      filteredProducts = allProducts.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
               product.category.toLowerCase().includes(searchTerm);
      });
      
      applySorting();
      renderProducts(filteredProducts);
    });
  }
}

function initSort() {
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      applySorting();
      renderProducts(filteredProducts);
    });
  }
}

function applySorting() {
  const sortValue = document.getElementById('sortSelect').value;
  
  switch(sortValue) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    default:
      filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

function initFilterToggle() {
  const toggle = document.getElementById('filterToggle');
  const filters = document.getElementById('shopFilters');
  if (toggle && filters) {
    toggle.addEventListener('click', function() {
      filters.classList.toggle('collapsed');
      toggle.querySelector('span:last-child').textContent = filters.classList.contains('collapsed') ? '▶' : '▼';
    });
    const filterOptions = filters.querySelectorAll('.filter-option');
    filterOptions.forEach(opt => {
      opt.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          filters.classList.add('collapsed');
          toggle.querySelector('span:last-child').textContent = '▶';
        }
      });
    });
  }
}
