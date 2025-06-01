
function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    input.addEventListener('change', function() {
        preview.innerHTML = '';
        if (this.files) {
            Array.from(this.files).forEach(file => {
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
        }
    });
}


setupImagePreview('brandLogo', 'brandLogoPreview');


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
        formData.append('logo', brandLogo);


        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Creating...';

        const response = await fetch('http://localhost:3000/api/brands/add', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        });


        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
        }


        this.reset();
        document.getElementById('brandLogoPreview').innerHTML = '';
        showNotification('Brand created successfully!', 'success');
        
    } catch (err) {
        console.error('Full error:', err);
        showNotification(`Error: ${err.message}`, 'error');
    } finally {
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bx bx-plus"></i> Create Brand';
    }
});


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


const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
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
document.head.appendChild(notificationStyles);