// API Configuration
const API_BASE_URL = "https://e-commerce-web-1nmc.onrender.com";
const API_ENDPOINTS = {
  BRANDS: `${API_BASE_URL}/api/brands`,
  CARS: `${API_BASE_URL}/api/cars`,
  PRODUCTS: `${API_BASE_URL}/api/products`
};

// Image Preview Functionality
function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const newInput = input.cloneNode(true);
  
  input.parentNode.replaceChild(newInput, input);
  preview.innerHTML = '';

  newInput.addEventListener('change', function() {
    preview.innerHTML = '';
    if (this.files && this.files.length > 0) {
      Array.from(this.files).forEach(file => {
        if (!file.type.match('image.*')) {
          showNotification('Please select only image files', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
          const previewItem = document.createElement('div');
          previewItem.className = 'image-preview-item';
          previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <div class="remove-image" onclick="this.parentElement.remove()">
              <i class='bx bx-x'></i>
            </div>
          `;
          preview.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
      });
    }
  });
}

// Notification System
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

// Theme Management
function applySavedTheme() {
  const savedTheme = localStorage.getItem('darkMode');
  const themeToggler = document.querySelector(".them-toggler");
  
  if (!themeToggler) return;
  
  if (savedTheme === '1') {
    document.body.classList.add('dark-theme-variables');
    themeToggler.querySelector('i:nth-child(1)').classList.remove('active');
    themeToggler.querySelector('i:nth-child(2)').classList.add('active');
  } else {
    document.body.classList.remove('dark-theme-variables');
    themeToggler.querySelector('i:nth-child(1)').classList.add('active');
    themeToggler.querySelector('i:nth-child(2)').classList.remove('active');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();
  
  // Setup image previews
  setupImagePreview('brandLogo', 'brandLogoPreview');
  setupImagePreview('modelImages', 'modelImagesPreview'); 
  setupImagePreview('productImages', 'imagePreview');
  
  // Setup sidebar toggle
  document.getElementById('menu-btn').addEventListener('click', function() {
    document.querySelector('aside').classList.toggle('active');
  });

  // Setup theme toggler
  const themeToggler = document.querySelector('.them-toggler');
  if (themeToggler) {
    themeToggler.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme-variables');
      themeToggler.querySelector('i:nth-child(1)').classList.toggle('active');
      themeToggler.querySelector('i:nth-child(2)').classList.toggle('active');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-theme-variables') ? '1' : '0');
    });
  }

  // Load initial data
  loadBrandsForModelForm();
  loadBrandsForProductForm();
  setupFormSubmissions();
});

// Form Submission Handlers
function setupFormSubmissions() {
  // Brand Form
  document.getElementById('brandForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('brandName').value);
    formData.append('photos', document.getElementById('brandLogo').files[0]);

    await submitForm(this, `${API_ENDPOINTS.BRANDS}/add`, formData, 'Brand created successfully!');
  });

  // Model Form
  document.getElementById('modelForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('brandId', document.getElementById('modelBrand').value);
    formData.append('name', document.getElementById('modelName').value);
    formData.append('year', document.getElementById('modelYear').value);
    
    Array.from(document.getElementById('modelImages').files).forEach(file => {
      formData.append('photos', file);
    });

    await submitForm(this, `${API_ENDPOINTS.CARS}/add`, formData, 'Car model added successfully!');
  });

  // Product Form
  document.getElementById('productForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('carId', document.getElementById('productCar').value);
    formData.append('price', document.getElementById('productPrice').value);
    
    Array.from(document.getElementById('productImages').files).forEach(file => {
      formData.append('photos', file);
    });

    await submitForm(this, `${API_ENDPOINTS.PRODUCTS}/add`, formData, 'Product added successfully!');
  });
}

// Generic Form Submission Handler
async function submitForm(form, url, formData, successMessage) {
  const submitBtn = form.querySelector('button[type="submit"]');
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Processing...';

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Unknown error occurred');
    }

    form.reset();
    const previewId = form.querySelector('[id$="Preview"]')?.id;
    if (previewId) document.getElementById(previewId).innerHTML = '';
    
    showNotification(successMessage, 'success');
  } catch (err) {
    console.error('Submission error:', err);
    showNotification(`Error: ${err.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
  }
}

// Brand Loading Functions
async function loadBrandsForModelForm() {
  await loadBrands('modelBrand');
}

async function loadBrandsForProductForm() {
  const brandSelect = await loadBrands('productBrand');
  if (brandSelect) {
    brandSelect.addEventListener('change', async (e) => {
      const brandId = e.target.value;
      const carSelect = document.getElementById('productCar');
      carSelect.disabled = !brandId;
      
      if (brandId) {
        await loadCarsForProductForm(brandId);
      }
    });
  }
}

async function loadBrands(selectId) {
  const brandSelect = document.getElementById(selectId);
  if (!brandSelect) return null;
  
  try {
    const response = await fetch(`${API_ENDPOINTS.BRANDS}/get`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) throw new Error('Failed to load brands');
    
    const brands = await response.json();
    brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
    brands.forEach(brand => {
      brandSelect.innerHTML += `<option value="${brand._id}">${brand.name}</option>`;
    });
    
    return brandSelect;
  } catch (err) {
    console.error("Brand loading error:", err);
    showNotification('Failed to load brands', 'error');
    return null;
  }
}

async function loadCarsForProductForm(brandId) {
  const carSelect = document.getElementById('productCar');
  if (!carSelect) return;
  
  try {
    const response = await fetch(`${API_ENDPOINTS.CARS}/get?brandId=${brandId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) throw new Error('Failed to load car models');
    
    const cars = await response.json();
    carSelect.innerHTML = '<option value="">-- Select Model --</option>';
    cars.forEach(car => {
      carSelect.innerHTML += `<option value="${car._id}">${car.name} (${car.year})</option>`;
    });
  } catch (err) {
    console.error("Car loading error:", err);
    showNotification('Failed to load car models', 'error');
  }
}

// Sidebar Management
const sideMenu = document.querySelector("aside");
const menuBtn = document.getElementById("menu-btn");
const closeBtn = document.getElementById("close-btn");

if (menuBtn && closeBtn) {
  menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !sideMenu.contains(e.target) && 
        e.target !== menuBtn) {
      sideMenu.style.display = 'none';
    }
  });
}