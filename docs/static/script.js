document.addEventListener('DOMContentLoaded', function() {
    const brandFilter = document.getElementById('brand-filter');
    const carFilter = document.getElementById('car-filter');
    const resetBtn = document.getElementById('reset-btn');
    const productsGrid = document.getElementById('products-grid');
    const loading = document.getElementById('loading');

    let brands = [];
    let cars = [];
    let allProducts = []; // Store all products
    let filteredProducts = []; // Store filtered products

    // Initialize the app
    init();

    async function init() {
        await Promise.all([
            loadBrands(),
            loadAllProducts()
        ]);
    }

    // Load all brands
    async function loadBrands() {
        showLoading();
        try {
            const response = await fetch('http://localhost:3000/api/brands/get');
            if (!response.ok) throw new Error('Failed to load brands');
            brands = await response.json();
            
            // Clear and populate brand dropdown
            brandFilter.innerHTML = '<option value="">All Brands</option>';
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand._id;
                option.textContent = brand.name;
                brandFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading brands:', error);
            showError('Failed to load brands');
        } finally {
            hideLoading();
        }
    }

    // Load cars for selected brand
    async function loadCars(brandId) {
        showLoading();
        try {
            const response = await fetch(`http://localhost:3000/api/cars/get?brandId=${brandId}`);
            if (!response.ok) throw new Error('Failed to load cars');
            cars = await response.json();
            
            // Clear and populate car dropdown
            carFilter.innerHTML = '<option value="">All Models</option>';
            carFilter.disabled = false;
            
            cars.forEach(car => {
                const option = document.createElement('option');
                option.value = car._id;
                option.textContent = `${car.name} (${car.year || ''})`;
                carFilter.appendChild(option);
            });
            
            // Enable the car filter
            carFilter.disabled = false;
        } catch (error) {
            console.error('Error loading cars:', error);
            showError('Failed to load car models');
            carFilter.disabled = true;
        } finally {
            hideLoading();
        }
    }

    // Load all products
    async function loadAllProducts() {
        showLoading();
        try {
            const response = await fetch('http://localhost:3000/api/products/get');
            if (!response.ok) throw new Error('Failed to load products');
            allProducts = await response.json();
            filteredProducts = [...allProducts];
            renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            showError('Failed to load products');
        } finally {
            hideLoading();
        }
    }

    // Filter products based on selections
    function filterProducts() {
        const brandId = brandFilter.value;
        const carId = carFilter.value;
        
        if (!brandId && !carId) {
            // No filters - show all products
            filteredProducts = [...allProducts];
        } else {
            filteredProducts = allProducts.filter(product => {
                const matchesBrand = !brandId || product.car?.brand?._id === brandId;
                const matchesCar = !carId || product.car?._id === carId;
                return matchesBrand && matchesCar;
            });
        }
        
        renderProducts();
    }

    // Render products to the page
    function renderProducts() {
        productsGrid.innerHTML = '';
        
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>No products found matching your filters</p>
                </div>
            `;
            return;
        }
        
        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.images[0]?.url || 'placeholder.jpg'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='placeholder.jpg'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">$${(product.price || 0).toFixed(2)}</div>
                    <div class="product-meta">
                        <span>${product.car?.brand?.name || 'No brand'}</span>
                        <span>${product.car?.name || 'No model'}</span>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                window.location.href = `product.html?id=${product._id}`;
            });
            
            productsGrid.appendChild(card);
        });
    }

    // Event listeners
    brandFilter.addEventListener('change', async (e) => {
        const brandId = e.target.value;
        if (brandId) {
            await loadCars(brandId);
        } else {
            carFilter.innerHTML = '<option value="">All Models</option>';
            carFilter.disabled = true;
        }
        filterProducts();
    });

    carFilter.addEventListener('change', filterProducts);

    resetBtn.addEventListener('click', () => {
        brandFilter.value = '';
        carFilter.innerHTML = '<option value="">All Models</option>';
        carFilter.disabled = true;
        filterProducts();
    });

    // Helper functions
    function showLoading() {
        loading.style.display = 'flex';
    }

    function hideLoading() {
        loading.style.display = 'none';
    }

    function showError(message) {
        productsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
});