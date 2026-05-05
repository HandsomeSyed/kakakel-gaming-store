document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navbarMenu = document.getElementById('navbarMenu');
  const wishlistBadge = document.getElementById('wishlistBadge');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navbarMenu) {
    mobileToggle.addEventListener('click', function() {
      navbarMenu.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
      if (!navbar.contains(e.target) && navbarMenu.classList.contains('active')) {
        navbarMenu.classList.remove('active');
      }
    });
  }

  updateWishlistBadge();
  updateCartBadge();
  initNewsletter();
  initFAQ();
  loadTrendingProducts();
});

function getCart() {
  const cart = localStorage.getItem('kakakel_cart');
  return cart ? JSON.parse(cart) : [];
}

function addToCart(productId) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  
  localStorage.setItem('kakakel_cart', JSON.stringify(cart));
  updateCartBadge();
  showNotification('Added to cart!');
}

function updateCartBadge() {
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function showNotification(message) {
  let notification = document.querySelector('.cart-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'cart-notification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

async function loadTrendingProducts() {
  const container = document.getElementById('trendingProducts');
  if (!container) return;
  
  try {
    const response = await fetch('data/products.json');
    const data = await response.json();
    const trendingProducts = data.products.filter(p => p.featured).slice(0, 4);
    container.innerHTML = trendingProducts.map(product => createProductCard(product)).join('');
  } catch (error) {
    console.error('Error loading trending products:', error);
  }
}

function getWishlist() {
  const wishlist = localStorage.getItem('kakakel_wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

function addToWishlist(productId) {
  const wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('kakakel_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    return true;
  }
  return false;
}

function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(id => id !== productId);
  localStorage.setItem('kakakel_wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
}

function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.includes(productId);
}

function updateWishlistBadge() {
  const wishlistBadge = document.getElementById('wishlistBadge');
  if (wishlistBadge) {
    const count = getWishlist().length;
    wishlistBadge.textContent = count;
    wishlistBadge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  if (hasHalfStar) {
    stars += '½';
  }
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆';
  }
  return stars;
}

function createProductCard(product) {
  const inWishlist = isInWishlist(product.id);
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-wishlist ${inWishlist ? 'active' : ''}" onclick="toggleWishlistItem('${product.id}', this)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </div>
      <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          <span class="product-stars">${generateStars(product.rating)}</span>
          <span class="product-rating-count">(${product.rating})</span>
        </div>
        <div class="product-price">Rs. ${product.price.toLocaleString()}</div>
        <div class="product-buttons">
          <button class="btn btn-cart btn-sm" onclick="addToCart('${product.id}')">Add to Cart</button>
          <button class="btn btn-buy btn-sm" onclick="buyNow('${product.id}')">Buy Now</button>
        </div>
      </div>
    </div>
  `;
}

function buyNow(productId) {
  addToCart(productId);
  window.location.href = 'checkout.html';
}

function toggleWishlistItem(productId, element) {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    element.classList.remove('active');
    element.querySelector('svg').setAttribute('fill', 'none');
  } else {
    addToWishlist(productId);
    element.classList.add('active');
    element.querySelector('svg').setAttribute('fill', 'currentColor');
  }
}

function initNewsletter() {
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      
      const button = this.querySelector('button');
      const originalText = button.textContent;
      button.textContent = '✓ Subscribed!';
      button.style.background = 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)';
      
      this.querySelector('input[type="email"]').value = '';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 3000);
      
      console.log('Newsletter signup:', email);
    });
  }
}

function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}
