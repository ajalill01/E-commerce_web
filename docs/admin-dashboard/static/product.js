document.addEventListener('DOMContentLoaded', async () => {
  // API Configuration
  const API_BASE_URL = "https://e-commerce-web-1nmc.onrender.com";
  const BRANDS_ENDPOINT = `${API_BASE_URL}/api/brands/get`;
  const CARS_ENDPOINT = `${API_BASE_URL}/api/cars/get`;
  const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products/add`;

  // DOM Elements
  const brandSelect = document.getElementById('productBrand');
  const carSelect = document.getElementById('productCar');
  const productForm = document.getElementById('productForm');
  const submitBtn = productForm?.querySelector('button[type="submit"]');

  // Load brands on page load
  try {
    const response = await fetch(BRANDS_ENDPOINT, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load brands: ${response.status}`);
    }

    const brands = await response.json();
    
    brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
    brands.forEach(brand => {
      brandSelect.innerHTML += `<option value="${brand._id}">${brand.name}</option>`;
    });
  } catch (err) {
    console.error("Failed to load brands:", err);
    showNotification('Failed to load brands. Please try again.', 'error');
  }

  // Load car models when brand is selected
  brandSelect.addEventListener('change', async (e) => {
    const brandId = e.target.value;
    carSelect.disabled = !brandId;
    
    if (brandId) {
      try {
        const response = await fetch(`${CARS_ENDPOINT}?brandId=${brandId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load car models: ${response.status}`);
        }

        const cars = await response.json();
        
        carSelect.innerHTML = '<option value="">-- Select Model --</option>';
        cars.forEach(car => {
          carSelect.innerHTML += `<option value="${car._id}">${car.model || car.name}</option>`;
        });
      } catch (err) {
        console.error("Failed to load cars:", err);
        showNotification('Failed to load car models. Please try again.', 'error');
      }
    }
  });

  // Handle product form submission
  productForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    const productName = document.getElementById('productName').value;
    const carId = document.getElementById('productCar').value;
    const price = document.getElementById('productPrice').value;
    const files = document.getElementById('productImages').files;
    
    if (!productName || !carId || !price || files.length === 0) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('carId', carId);
    formData.append('description', document.getElementById('productDescription').value || 'No description');
    formData.append('price', price);
    
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    // Submit form
    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Saving...';

      const response = await fetch(PRODUCTS_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      const result = await response.json();
      showNotification('Product added successfully!', 'success');
      productForm.reset();
      document.getElementById('imagePreview').innerHTML = '';
    } catch (err) {
      console.error("Submission error:", err);
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Product';
    }
  });
});

// Notification function
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