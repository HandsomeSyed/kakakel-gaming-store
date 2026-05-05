let allProducts = [];
let digitalProducts = [];
let cart = [];
let selectedPaymentMethod = null;
let promoApplied = false;
let discountPercent = 0;

const VALID_PROMOS = {
  'GAMING10': 10,
  'KAKAKEL20': 20,
  'WELCOME15': 15
};

document.addEventListener('DOMContentLoaded', async function() {
  await loadProducts();
  cart = getCart();
  renderCart();
  updateSummary();
  initPaymentMethods();
  initPromoCode();
  initFormValidation();
  
  document.getElementById('placeOrder').addEventListener('click', placeOrder);
});

async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    const data = await response.json();
    allProducts = data.products || [];
    digitalProducts = data.digitalProducts || [];
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function initPaymentMethods() {
  const paymentOptions = document.querySelectorAll('.payment-option');
  
  paymentOptions.forEach(option => {
    option.addEventListener('click', function() {
      paymentOptions.forEach(o => o.classList.remove('active'));
      this.classList.add('active');
      
      selectedPaymentMethod = this.dataset.method;
      handlePaymentMethodChange(selectedPaymentMethod);
      updateSteps();
    });
  });
}

function handlePaymentMethodChange(method) {
  document.querySelectorAll('.payment-details').forEach(el => el.classList.remove('show'));
  
  if (method === 'card') {
    document.getElementById('cardDetails').classList.add('show');
  } else if (method === 'easypaisa') {
    document.getElementById('easypaisaDetails').classList.add('show');
  } else if (method === 'jazzcash') {
    document.getElementById('jazzcashDetails').classList.add('show');
  } else if (method === 'bank') {
    document.getElementById('bankDetails').classList.add('show');
  }
}

function initPromoCode() {
  const applyBtn = document.getElementById('applyPromo');
  const promoInput = document.getElementById('promoCode');
  
  applyBtn.addEventListener('click', function() {
    const code = promoInput.value.trim().toUpperCase();
    
    if (VALID_PROMOS[code]) {
      discountPercent = VALID_PROMOS[code];
      promoApplied = true;
      promoInput.style.borderColor = 'var(--accent-cyan)';
      applyBtn.textContent = '✓ Applied';
      applyBtn.style.background = 'var(--accent-cyan)';
      applyBtn.style.color = '#000';
      applyBtn.style.borderColor = 'var(--accent-cyan)';
      updateSummary();
    } else {
      promoInput.style.borderColor = '#ff4757';
      setTimeout(() => {
        promoInput.style.borderColor = '';
      }, 2000);
    }
  });
}

function initFormValidation() {
  const inputs = document.querySelectorAll('.checkout-main .form-input');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() !== '') {
        this.style.borderColor = 'var(--accent-cyan)';
      } else {
        this.style.borderColor = '';
      }
    });
  });

  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', function(e) {
      let value = this.value.replace(/\s/g, '').replace(/\D/g, '');
      let formatted = value.match(/.{1,4}/g)?.join(' ') || '';
      this.value = formatted;
    });
  }

  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', function(e) {
      let value = this.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
      this.value = value;
    });
  }
}

function renderCart() {
  const container = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started!</p>
        <a href="shop.html" class="btn btn-primary" style="margin-top: 24px;">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = cart.map(item => {
    const product = findProduct(item.id);
    if (!product) return '';
    
    return `
      <div class="cart-item" data-id="${item.id}">
        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h3 class="cart-item-name">${product.name}</h3>
          <div class="cart-item-price">Rs. ${product.price.toLocaleString()}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-total">Rs. ${(product.price * item.quantity).toLocaleString()}</div>
        <div class="cart-item-remove" onclick="removeFromCart('${item.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
      </div>
    `;
  }).join('');
}

function findProduct(id) {
  return allProducts.find(p => p.id === id) || digitalProducts.find(p => p.id === id);
}

function updateQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  
  item.quantity += change;
  
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  localStorage.setItem('kakakel_cart', JSON.stringify(cart));
  renderCart();
  updateSummary();
  updateCartBadge();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  localStorage.setItem('kakakel_cart', JSON.stringify(cart));
  renderCart();
  updateSummary();
  updateCartBadge();
  
  if (cart.length === 0) {
    window.location.href = 'shop.html';
  }
}

function updateSummary() {
  let subtotal = 0;
  const summaryItems = document.getElementById('summaryItems');
  
  let itemsHtml = '';
  cart.forEach(item => {
    const product = findProduct(item.id);
    if (product) {
      subtotal += product.price * item.quantity;
      itemsHtml += `
        <div class="summary-item">
          <span class="summary-item-name">${product.name}</span>
          <span class="summary-item-qty">x${item.quantity}</span>
          <span>Rs. ${(product.price * item.quantity).toLocaleString()}</span>
        </div>
      `;
    }
  });
  
  summaryItems.innerHTML = itemsHtml;
  
  const shipping = cart.length > 0 ? 150 : 0;
  let discountAmount = 0;
  
  if (promoApplied && discountPercent > 0) {
    discountAmount = Math.round(subtotal * (discountPercent / 100));
  }
  
  const total = subtotal + shipping - discountAmount;
  
  document.getElementById('subtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
  document.getElementById('shipping').textContent = `Rs. ${shipping.toLocaleString()}`;
  
  const discountRow = document.getElementById('discountRow');
  if (promoApplied && discountAmount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('discount').textContent = `- Rs. ${discountAmount.toLocaleString()} (${discountPercent}%)`;
  } else {
    discountRow.style.display = 'none';
  }
  
  document.getElementById('total').textContent = `Rs. ${total.toLocaleString()}`;
  
  const placeOrderBtn = document.getElementById('placeOrder');
  placeOrderBtn.textContent = `Pay Rs. ${total.toLocaleString()}`;
}

function updateSteps() {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  
  const formFilled = document.getElementById('firstName').value && 
                     document.getElementById('lastName').value &&
                     document.getElementById('email').value &&
                     document.getElementById('phone').value &&
                     document.getElementById('address').value &&
                     document.getElementById('city').value &&
                     document.getElementById('zipCode').value;
  
  if (formFilled) {
    step1.classList.add('completed');
    step1.classList.remove('active');
  }
  
  if (selectedPaymentMethod) {
    step2.classList.add('completed');
    step2.classList.remove('active');
    step3.classList.add('active');
  }
}

function placeOrder() {
  if (cart.length === 0) {
    showNotification('Your cart is empty!', 'error');
    return;
  }
  
  if (!selectedPaymentMethod) {
    showNotification('Please select a payment method.', 'error');
    return;
  }
  
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'province'];
  let allFilled = true;
  
  requiredFields.forEach(id => {
    const field = document.getElementById(id);
    if (!field.value.trim()) {
      field.style.borderColor = '#ff4757';
      allFilled = false;
      setTimeout(() => { field.style.borderColor = ''; }, 2000);
    }
  });
  
  if (!allFilled) {
    showNotification('Please fill in all shipping details.', 'error');
    return;
  }
  
  if (selectedPaymentMethod === 'card') {
    const cardFields = ['cardNumber', 'cardExpiry', 'cardCvc', 'cardName'];
    let cardFilled = true;
    cardFields.forEach(id => {
      const field = document.getElementById(id);
      if (field && !field.value.trim()) {
        field.style.borderColor = '#ff4757';
        cardFilled = false;
        setTimeout(() => { field.style.borderColor = ''; }, 2000);
      }
    });
    if (!cardFilled) {
      showNotification('Please fill in all card details.', 'error');
      return;
    }
  }
  
  const button = document.getElementById('placeOrder');
  const originalText = button.textContent;
  button.textContent = 'Processing...';
  button.disabled = true;
  button.style.opacity = '0.7';
  
  setTimeout(() => {
    button.textContent = '✓ Order Placed!';
    button.style.background = 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)';
    button.style.opacity = '1';
    
    setTimeout(() => {
      localStorage.removeItem('kakakel_cart');
      showNotification('Order placed successfully! Check your email for confirmation.', 'success');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    }, 1500);
  }, 2500);
}

function showNotification(message, type = 'info') {
  let notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 3000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.95rem;
    max-width: 350px;
  `;
  
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #ff4757, #ff6b81)';
  } else {
    notification.style.background = 'var(--bg-card)';
    notification.style.border = '1px solid var(--accent-purple)';
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 50);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }, 3500);
}
