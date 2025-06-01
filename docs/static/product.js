document.addEventListener('DOMContentLoaded', function() {
    const productDetail = document.getElementById('product-detail');
    const loading = document.getElementById('loading');
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    loadProductDetails(productId);
    
    async function loadProductDetails(id) {
        showLoading();
        try {
            const response = await fetch(`https://e-commerce-web-1nmc.onrender.com/api/products/get/${id}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Product not found');
            }
            
            const product = await response.json();
            renderProductDetails(product);
            
        } catch (error) {
            console.error('Error loading product:', error);
            showErrorState(error.message);
        } finally {
            hideLoading();
        }
    }

    function renderProductDetails(product) {
        const mainImage = product.images[0]?.url || getPlaceholderImage(600, 400, 'Product Image');
        
        const thumbnails = product.images.length > 0 
            ? product.images.map(img => `
                <img src="${img.url}" 
                     alt="${product.name}" 
                     onerror="this.src='${getPlaceholderImage(100, 100, 'Thumbnail')}">
            `).join('')
            : '<div class="no-images">No additional images</div>';
        
        productDetail.innerHTML = `
            <div class="product-gallery">
                <img src="${mainImage}" class="main-image" id="main-image">
                ${thumbnails}
            </div>
            <div class="product-info">
                <h1 class="product-title">${product.name}</h1>
                <div class="product-price">$${product.price?.toFixed(2) || '0.00'}</div>
                
                <div class="product-meta">
                    <div>
                        <i class="fas fa-tag"></i> ${product.car?.brand?.name || 'No brand'}
                    </div>
                    <div>
                        <i class="fas fa-car"></i> ${product.car?.name || 'No model'}
                    </div>
                </div>
                
                <div class="product-description">
                    ${product.description || 'No description available.'}
                </div>
                
                <div class="quantity-control">
                    <button class="quantity-btn minus">-</button>
                    <input type="number" class="quantity-input" value="1" min="1">
                    <button class="quantity-btn plus">+</button>
                </div>
                
                <button class="add-to-cart" data-product-id="${product._id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                
                <div class="cart-actions" id="cartActions"></div>
            </div>
        `;
        
        setupThumbnailNavigation();
        setupQuantityControls();
        setupAddToCartButton(product);
        updateCartActions();
    }
    
    function setupThumbnailNavigation() {
        document.querySelectorAll('.product-gallery img:not(.main-image)').forEach(img => {
            img.addEventListener('click', () => {
                document.getElementById('main-image').src = img.src;
            });
        });
    }
    
    function setupQuantityControls() {
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        const quantityInput = document.querySelector('.quantity-input');
        
        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
    }
    
    function setupAddToCartButton(product) {
        document.querySelector('.add-to-cart').addEventListener('click', () => {
            const quantity = parseInt(document.querySelector('.quantity-input').value);
            const cartItem = {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0]?.url,
                quantity: quantity
            };
            
            addToCart(cartItem);
            showCartNotification(cartItem);
            updateCartActions();
        });
    }
    
    function updateCartActions() {
        const cart = getCart();
        const cartActions = document.getElementById('cartActions');
        
        if (cart.length > 0) {
            cartActions.innerHTML = `
                <a href="checkout.html" class="checkout-btn">
                    <i class="fas fa-credit-card"></i> Proceed to Checkout (${cart.reduce((sum, item) => sum + item.quantity, 0)})
                </a>
                <button class="view-cart-btn" id="viewCartBtn">
                    <i class="fas fa-shopping-basket"></i> View Cart
                </button>
            `;
            
            document.getElementById('viewCartBtn').addEventListener('click', () => {
                alert(`${cart.length} items in cart. Ready to checkout?`);
            });
        } else {
            cartActions.innerHTML = '';
        }
    }
    
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }
    
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function addToCart(product) {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            cart.push(product);
        }
        
        saveCart(cart);
    }
    
    function showCartNotification(product) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Added ${product.quantity} ${product.quantity > 1 ? 'items' : 'item'} to cart</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, 10);
    }
    
    function showErrorState(message) {
        productDetail.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <a href="index.html">Return to products</a>
            </div>
        `;
    }
    
    function getPlaceholderImage(width, height, text) {
        return `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"%3E%3Crect fill="%23eee" width="${width}" height="${height}"%3E%3C/rect%3E%3Ctext fill="%23aaa" font-family="sans-serif" font-size="20" dy=".3em" font-weight="bold" x="50%" y="50%" text-anchor="middle"%3E${text}%3C/text%3E%3C/svg%3E`;
    }
    
    function showLoading() {
        loading.style.display = 'flex';
    }
    
    function hideLoading() {
        loading.style.display = 'none';
    }
});