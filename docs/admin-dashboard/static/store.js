

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

function applySavedTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    const themeToggler = document.querySelector(".them-toggler");
    
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

document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    
    setupImagePreview('brandLogo', 'brandLogoPreview');
    setupImagePreview('modelImages', 'modelImagesPreview'); 
    setupImagePreview('productImages', 'imagePreview');
    
    document.getElementById('menu-btn').addEventListener('click', function() {
        document.querySelector('aside').classList.toggle('active');
    });

    const themeToggler = document.querySelector('.them-toggler');
    themeToggler.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme-variables');
        themeToggler.querySelector('i:nth-child(1)').classList.toggle('active');
        themeToggler.querySelector('i:nth-child(2)').classList.toggle('active');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-theme-variables') ? '1' : '0');
    });

    loadBrandsForModelForm();
    loadBrands();
});

document.getElementById('brandForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const brandName = document.getElementById('brandName').value;
    const brandLogo = document.getElementById('brandLogo').files[0];
    
    if (!brandName || !brandLogo) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('name', brandName);
        formData.append('photos', brandLogo);

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Creating...';

        const response = await fetch('http://localhost:3000/api/brands/add', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (jsonError) {
                throw new Error(`Server error: ${response.status}`);
            }
            throw new Error(errorData.error || errorData.message || 'Unknown error');
        }

        const data = await response.json();
        
        this.reset();
        document.getElementById('brandLogoPreview').innerHTML = '';
        showNotification('Brand created successfully!', 'success');
        
    } catch (err) {
        console.error('Brand creation error:', err);
        showNotification(`Error: ${err.message}`, 'error');
    } finally {
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bx bx-plus"></i> Create Brand';
    }
});

async function loadBrands() {
    const brandSelect = document.getElementById('productBrand');
    const carSelect = document.getElementById('productCar');

    try {
        const response = await fetch('http://localhost:3000/api/brands/get',{
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
        if (!response.ok) throw new Error('Failed to load brands');
        
        const brands = await response.json();
        brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
        brands.forEach(brand => {
            brandSelect.innerHTML += `<option value="${brand._id}">${brand.name}</option>`;
        });
    } catch (err) {
        console.error("Brand loading error:", err);
        showNotification('Failed to load brands', 'error');
    }

    brandSelect.addEventListener('change', async (e) => {
        const brandId = e.target.value;
        carSelect.disabled = !brandId;
        
        if (brandId) {
            try {
                const response = await fetch(`http://localhost:3000/api/cars/get?brandId=${brandId}`, {
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
    });

    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('productName').value);
        formData.append('carId', document.getElementById('productCar').value);
        formData.append('description', 'Sample description');
        formData.append('price', document.getElementById('productPrice').value);
        
        const files = document.getElementById('productImages').files;
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Saving...';

            const response = await fetch('http://localhost:3000/api/products/add', {
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
            e.target.reset();
            document.getElementById('imagePreview').innerHTML = '';
        } catch (err) {
            console.error("Submission error:", err);
            showNotification(`Error: ${err.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Product';
        }
    });
}

async function loadBrandsForModelForm() {
    const brandSelect = document.getElementById('modelBrand');
    
    try {
        const response = await fetch('http://localhost:3000/api/brands/get', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to load brands');
        
        const brands = await response.json();
        brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
        brands.forEach(brand => {
            brandSelect.innerHTML += `<option value="${brand._id}">${brand.name}</option>`;
        });
    } catch (err) {
        console.error("Brand loading error:", err);
        showNotification('Failed to load brands', 'error');
    }
}

document.getElementById('modelForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const brandId = document.getElementById('modelBrand').value;
    const modelName = document.getElementById('modelName').value;
    const modelYear = document.getElementById('modelYear').value;
    const modelImages = document.getElementById('modelImages').files;
    
    if (!brandId || !modelName || !modelYear || modelImages.length === 0) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('brandId', brandId);
        formData.append('name', modelName);
        formData.append('year', modelYear);
        
        for (let i = 0; i < modelImages.length; i++) {
            formData.append('photos', modelImages[i]);
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Adding...';

        const response = await fetch('http://localhost:3000/api/cars/add', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to add car model: ${response.status}`);
        }

        const data = await response.json();
        this.reset();
        document.getElementById('modelImagesPreview').innerHTML = '';
        showNotification('Car model added successfully!', 'success');
        
        if (document.getElementById('productCar')) {
            const currentBrand = document.getElementById('productBrand').value;
            if (currentBrand === brandId) {
                await loadCarsForProductForm(brandId);
            }
        }
        
    } catch (err) {
        console.error('Error adding car model:', err);
        showNotification(`Error: ${err.message}`, 'error');
    } finally {
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bx bx-plus"></i> Add Model';
    }
});

const sideMenu = document.querySelector("aside")
const menuBtn = document.getElementById("menu-btn")
const closeBtn = document.getElementById("close-btn")

menuBtn.addEventListener('click',()=>{
    sideMenu.style.display = 'block';
})

closeBtn.addEventListener('click',()=>{
    sideMenu.style.display = 'none';
})