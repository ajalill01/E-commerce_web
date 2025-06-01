document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const API_BASE = 'https://e-commerce-web-1nmc.onrender.com/api/products';
    const AUTH_HEADER = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    // DOM Elements
    const productsTable = document.querySelector('#productsTable tbody');
    const productForm = document.getElementById('productForm');
    const productSearch = document.getElementById('productSearch');
    const refreshBtn = document.getElementById('refreshBtn');
    const editFormContainer = document.getElementById('editFormContainer');
    const cancelBtn = document.getElementById('cancelBtn');
    const productIdField = document.getElementById('productId');
    const productName = document.getElementById('productName');
    const productDescription = document.getElementById('productDescription');
    const productPrice = document.getElementById('productPrice');
    const imagePreview = document.getElementById('imagePreview');

    // Initialize the page
    fetchProducts();
    setupEventListeners();

    // Fetch products from API
    async function fetchProducts() {
        try {
            showLoading(true);
            const response = await fetch(`${API_BASE}/get`, {
                headers: AUTH_HEADER
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('Failed to load products. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Render products in the table
    function renderProducts(products) {
        productsTable.innerHTML = '';
        
        if (!products || products.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-message">No products found</td>
                </tr>
            `;
            return;
        }
        
        products.forEach(product => {
            const carName = product.car ? product.car.name || product.car.model || 'N/A' : 'N/A';
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${product.name || 'Unnamed Product'}</td>
                <td>$${(product.price || 0).toFixed(2)}</td>
                <td>${carName}</td>
                <td class="actions">
                    <button class="btn-edit" data-id="${product._id}">
                        <i class='bx bx-edit'></i> Edit
                    </button>
                    <button class="btn-delete" data-id="${product._id}">
                        <i class='bx bx-trash'></i> Delete
                    </button>
                </td>
            `;
            
            productsTable.appendChild(row);
        });

        // Setup event listeners for the new buttons
        setupTableButtonListeners();
    }

    // Handle edit button click
    async function handleEdit(e) {
        const productId = e.currentTarget.getAttribute('data-id');
        
        try {
            showLoading(true);
            const response = await fetch(`${API_BASE}/get/${productId}`, {
                headers: AUTH_HEADER
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const product = await response.json();
            populateEditForm(product);
            editFormContainer.style.display = 'block';
            editFormContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading product:', error);
            showNotification('Failed to load product details. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Populate the edit form with product data
    function populateEditForm(product) {
        productIdField.value = product._id;
        productName.value = product.name || '';
        productDescription.value = product.description || '';
        productPrice.value = product.price || '';
        
        imagePreview.innerHTML = '';
        if (product.images?.length > 0) {
            product.images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = image.url;
                imgElement.alt = 'Product image';
                imagePreview.appendChild(imgElement);
            });
        } else {
            imagePreview.innerHTML = '<p class="no-images">No images available</p>';
        }
    }

    // Handle delete button click
    async function handleDelete(e) {
        const productId = e.currentTarget.getAttribute('data-id');
        
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        try {
            showLoading(true);
            const response = await fetch(`${API_BASE}/${productId}`, {
                method: 'DELETE',
                headers: AUTH_HEADER
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            showNotification('Product deleted successfully', 'success');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Handle form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const productId = productIdField.value;
        const productData = {
            name: productName.value.trim(),
            description: productDescription.value.trim(),
            price: parseFloat(productPrice.value)
        };
        
        // Basic validation
        if (!productData.name || isNaN(productData.price)) {
            showNotification('Please fill all required fields with valid data', 'error');
            return;
        }
        
        try {
            showLoading(true);
            const response = await fetch(`${API_BASE}/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...AUTH_HEADER
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update product');
            }
            
            showNotification('Product updated successfully', 'success');
            editFormContainer.style.display = 'none';
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification(error.message || 'Failed to update product. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Form submission
        productForm.addEventListener('submit', handleFormSubmit);
        
        // Cancel button
        cancelBtn.addEventListener('click', () => {
            editFormContainer.style.display = 'none';
        });
        
        // Search functionality
        productSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = productsTable.querySelectorAll('tr');
            
            rows.forEach(row => {
                const name = row.querySelector('td:first-child').textContent.toLowerCase();
                row.style.display = name.includes(searchTerm) ? '' : 'none';
            });
        });
        
        // Refresh button
        refreshBtn.addEventListener('click', fetchProducts);
    }

    // Setup event listeners for table buttons
    function setupTableButtonListeners() {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    // Show loading state
    function showLoading(isLoading) {
        if (isLoading) {
            refreshBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Loading...';
            refreshBtn.disabled = true;
        } else {
            refreshBtn.innerHTML = '<i class="bx bx-refresh"></i> Refresh';
            refreshBtn.disabled = false;
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
});