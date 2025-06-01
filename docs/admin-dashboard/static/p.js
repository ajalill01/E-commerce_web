document.addEventListener('DOMContentLoaded', function() {
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
    

    const API_BASE = 'http://localhost:3000/api/product';
    

    async function fetchProducts() {
        try {
            const response = await fetch(API_BASE + '/get');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load products. Please try again.');
        }
    }
    

    function renderProducts(products) {
        productsTable.innerHTML = '';
        
        if (products.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">No products found</td>
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
                <td>
                    <button class="btn-edit" data-id="${product._id}">Edit</button>
                    <button class="btn-delete" data-id="${product._id}">Delete</button>
                </td>
            `;
            
            productsTable.appendChild(row);
        });
        

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }
    

    async function handleEdit(e) {
        const productId = e.target.getAttribute('data-id');
        
        try {
            const response = await fetch(`${API_BASE}/get/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            const product = await response.json();
            

            productIdField.value = product._id;
            productName.value = product.name || '';
            productDescription.value = product.description || '';
            productPrice.value = product.price || '';
            

            imagePreview.innerHTML = '';
            if (product.images && product.images.length > 0) {
                product.images.forEach(image => {
                    const imgElement = document.createElement('img');
                    imgElement.src = image.url;
                    imgElement.alt = 'Product image';
                    imagePreview.appendChild(imgElement);
                });
            } else {
                imagePreview.innerHTML = '<p>No images available</p>';
            }
            

            editFormContainer.style.display = 'block';
            

            editFormContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load product details. Please try again.');
        }
    }
    

    async function handleDelete(e) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        const productId = e.target.getAttribute('data-id');
        
        try {
            const response = await fetch(`${API_BASE}/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            
            alert('Product deleted successfully');
            fetchProducts(); 
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete product. Please try again.');
        }
    }
    

    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const productId = productIdField.value;
        const productData = {
            name: productName.value,
            description: productDescription.value,
            price: productPrice.value
        };
        
        try {
            const response = await fetch(`${API_BASE}/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update product');
            }
            
            alert('Product updated successfully');
            editFormContainer.style.display = 'none';
            fetchProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update product. Please try again.');
        }
    });
    

    cancelBtn.addEventListener('click', function() {
        editFormContainer.style.display = 'none';
    });
    

    productSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = productsTable.querySelectorAll('tr');
        
        rows.forEach(row => {
            const name = row.querySelector('td:first-child').textContent.toLowerCase();
            const description = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            
            if (name.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
    

    refreshBtn.addEventListener('click', fetchProducts);
    

    fetchProducts();
});