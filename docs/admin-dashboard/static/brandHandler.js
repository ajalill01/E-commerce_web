// API Configuration
const API_BASE = "https://e-commerce-web-1nmc.onrender.com/api";
const BRANDS_ENDPOINT = `${API_BASE}/brands/add`;
const AUTH_HEADER = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    setupImagePreview('brandLogo', 'brandLogoPreview');
    setupBrandForm();
    addNotificationStyles();
});

// Image Preview Functionality
function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    input.addEventListener('change', function() {
        preview.innerHTML = '';
        if (!this.files) return;

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
            }
            reader.readAsDataURL(file);
        });
    });
}

// Brand Form Setup
function setupBrandForm() {
    const form = document.getElementById('brandForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const brandName = document.getElementById('brandName').value.trim();
        const brandLogo = document.getElementById('brandLogo').files[0];
        
        if (!validateBrandInput(brandName, brandLogo)) return;

        try {
            await submitBrandForm(this, brandName, brandLogo);
        } catch (error) {
            console.error('Brand creation error:', error);
            showNotification(`Error: ${error.message}`, 'error');
        }
    });
}

// Form Validation
function validateBrandInput(name, logo) {
    if (!name) {
        showNotification('Brand name is required', 'error');
        return false;
    }
    if (!logo) {
        showNotification('Brand logo is required', 'error');
        return false;
    }
    if (!logo.type.match('image.*')) {
        showNotification('Please select a valid image file', 'error');
        return false;
    }
    return true;
}

// Form Submission
async function submitBrandForm(form, name, logo) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Creating...';

        const formData = new FormData();
        formData.append('name', name);
        formData.append('logo', logo);

        const response = await fetch(BRANDS_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: AUTH_HEADER
        });

        await handleBrandResponse(response);

        // Reset form on success
        form.reset();
        document.getElementById('brandLogoPreview').innerHTML = '';
        showNotification('Brand created successfully!', 'success');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Handle API Response
async function handleBrandResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        
        if (contentType?.includes('application/json')) {
            const data = await response.json();
            errorMessage = data.error || data.message || errorMessage;
        } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
    }

    if (!contentType?.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
    }

    return await response.json();
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
    
    // Auto-remove notification after delay
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add Notification Styles
function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius-1);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            color: white;
            box-shadow: var(--box-shadow);
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            animation: slideIn 0.3s ease-out forwards;
        }
        
        .notification.success {
            background: var(--color-success);
        }
        
        .notification.error {
            background: var(--color-danger);
        }
        
        .notification.fade-out {
            animation: fadeOut 0.3s ease-in forwards;
        }
        
        @keyframes slideIn {
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            to {
                transform: translateY(100px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styles);
}