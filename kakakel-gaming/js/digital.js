let digitalProducts = [];
let selectedProduct = null;
let selectedPaymentMethod = null;

document.addEventListener('DOMContentLoaded', async function() {
  await loadDigitalProducts();
  renderDigitalProducts();
  initPaymentModal();
});

async function loadDigitalProducts() {
  try {
    const response = await fetch('data/products.json');
    const data = await response.json();
    digitalProducts = data.digitalProducts;
  } catch (error) {
    console.error('Error loading digital products:', error);
  }
}

function renderDigitalProducts() {
  const container = document.getElementById('digitalProducts');
  if (container) {
    container.innerHTML = digitalProducts.map(product => createDigitalCard(product)).join('');
  }
}

function createDigitalCard(product) {
  const featuresHTML = product.features.map(feature => 
    `<div class="digital-feature">${feature}</div>`
  ).join('');
  
  return `
    <div class="digital-card">
      <img src="${product.image}" alt="${product.name}" class="digital-image" loading="lazy">
      <div class="digital-content">
        <div class="digital-category">${product.category}</div>
        <h3 class="digital-name">${product.name}</h3>
        <p class="digital-description">${product.description}</p>
        <div class="digital-features">
          ${featuresHTML}
        </div>
        <div class="digital-footer">
          <span class="digital-price">Rs. ${product.price.toLocaleString()}</span>
          <button class="btn btn-primary btn-sm" onclick="openPaymentModal('${product.id}')">Buy Now</button>
        </div>
      </div>
    </div>
  `;
}

function openPaymentModal(productId) {
  selectedProduct = digitalProducts.find(p => p.id === productId);
  if (!selectedProduct) return;
  
  const modal = document.getElementById('paymentModal');
  const productName = document.getElementById('modalProductName');
  const productPrice = document.getElementById('modalPrice');
  
  productName.textContent = selectedProduct.name;
  productPrice.textContent = `Rs. ${selectedProduct.price.toLocaleString()}`;
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  resetPaymentForm();
}

function initPaymentModal() {
  const closeModal = document.getElementById('closeModal');
  const modal = document.getElementById('paymentModal');
  const paymentOptions = document.querySelectorAll('.payment-option');
  const completeButton = document.getElementById('completePayment');
  
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  paymentOptions.forEach(option => {
    option.addEventListener('click', function() {
      paymentOptions.forEach(o => o.classList.remove('active'));
      this.classList.add('active');
      selectedPaymentMethod = this.dataset.method;
      
      const paymentDetails = document.getElementById('paymentDetails');
      const cardForm = document.getElementById('cardForm');
      const manualPayment = document.getElementById('manualPayment');
      const paymentInstructions = document.getElementById('paymentInstructions');
      const paymentAccount = document.getElementById('paymentAccount');
      
      paymentDetails.style.display = 'block';
      completeButton.disabled = false;
      
      if (selectedPaymentMethod === 'card') {
        cardForm.style.display = 'block';
        manualPayment.style.display = 'none';
      } else if (selectedPaymentMethod === 'paypal') {
        cardForm.style.display = 'none';
        manualPayment.style.display = 'block';
        paymentInstructions.textContent = 'You will be redirected to PayPal to complete your payment.';
        paymentAccount.textContent = 'PayPal: pay@kakakel.com';
      } else if (selectedPaymentMethod === 'easypaisa') {
        cardForm.style.display = 'none';
        manualPayment.style.display = 'block';
        paymentInstructions.textContent = 'Send payment via easypaisa app to the account below:';
        paymentAccount.textContent = 'Account: 0345-1234567';
      } else if (selectedPaymentMethod === 'jazzcash') {
        cardForm.style.display = 'none';
        manualPayment.style.display = 'block';
        paymentInstructions.textContent = 'Send payment via JazzCash app to the account below:';
        paymentAccount.textContent = 'Account: 0301-1234567';
      } else if (selectedPaymentMethod === 'bank') {
        cardForm.style.display = 'none';
        manualPayment.style.display = 'block';
        paymentInstructions.textContent = 'Transfer to our bank account:';
        paymentAccount.textContent = 'Account: 1234-5678-9012-3456';
      }
    });
  });
  
  if (completeButton) {
    completeButton.addEventListener('click', completePurchase);
  }
}

function resetPaymentForm() {
  selectedPaymentMethod = null;
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
  document.getElementById('paymentDetails').style.display = 'none';
  document.getElementById('completePayment').disabled = true;
  document.getElementById('completePayment').textContent = 'Complete Purchase';
  document.getElementById('completePayment').style.background = '';
  document.getElementById('deliveryEmail').value = '';
}

function completePurchase() {
  const email = document.getElementById('deliveryEmail').value;
  
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email for delivery.');
    return;
  }
  
  const button = document.getElementById('completePayment');
  button.textContent = 'Processing...';
  button.disabled = true;
  
  setTimeout(() => {
    button.textContent = '✓ Purchase Complete!';
    button.style.background = 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)';
    
    setTimeout(() => {
      const modal = document.getElementById('paymentModal');
      modal.classList.remove('active');
      document.body.style.overflow = '';
      
      alert(`Thank you for your purchase! Your download link has been sent to ${email}`);
    }, 1500);
  }, 2000);
  
  console.log('Purchase:', {
    product: selectedProduct.name,
    price: selectedProduct.price,
    paymentMethod: selectedPaymentMethod,
    email: email
  });
}
