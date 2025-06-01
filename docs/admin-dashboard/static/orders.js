const sideMenu = document.querySelector("aside");
const menuBtn = document.getElementById("menu-btn");
const closeBtn = document.getElementById("close-btn");
const themeToggler = document.querySelector(".them-toggler");
const ordersTable = document.getElementById("orders-body");
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';

const API_BASE = "http://localhost:3000/api";
let currentPage = 1;
const ordersPerPage = 15;
let isLoading = false;
let hasMoreOrders = true;

const modal = document.createElement('div');
modal.id = 'orderModal';
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-content">
    <span class="close-modal">&times;</span>
    <h2>Order Details <span id="order-id"></span></h2>
    <div class="order-info-grid">
      <div class="customer-info">
        <h3><i class='bx bxs-user'></i> Customer Information</h3>
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span id="customer-name" class="info-value"></span>
        </div>
        <div class="info-item">
          <span class="info-label">Phone:</span>
          <span id="customer-phone" class="info-value"></span>
        </div>
        <div class="info-item">
          <span class="info-label">Address:</span>
          <span id="customer-address" class="info-value"></span>
        </div>
        <div class="info-item">
          <span class="info-label">Status:</span>
          <span id="order-status" class="info-value status-badge"></span>
        </div>
        <div class="info-item">
          <span class="info-label">Date:</span>
          <span id="order-date" class="info-value"></span>
        </div>
      </div>
      <div class="order-items">
        <h3><i class='bx bxs-package'></i> Order Items</h3>
        <div class="items-container">
          <table id="order-items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody id="order-items-body"></tbody>
          </table>
        </div>
        <div class="order-summary">
          <div class="summary-item">
            <span>Subtotal:</span>
            <span id="subtotal-price">$0.00</span>
          </div>
          <div class="summary-item">
            <span>Total:</span>
            <span id="total-price" class="total-amount">$0.00</span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button id="back-btn" class="action-btn back-btn">
        <i class='bx bx-arrow-back'></i> Back
      </button>
      <button id="cancel-btn" class="action-btn cancel-btn">
        <i class='bx bx-x-circle'></i> Cancel Order
      </button>
      <button id="confirm-btn" class="action-btn confirm-btn">
        <i class='bx bx-check-circle'></i> Confirm Order
      </button>
    </div>
  </div>
`;
document.body.appendChild(modal);

function applySavedTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === '1') {
        document.body.classList.add('dark-theme-variables');
        themeToggler.querySelector('.bx:nth-child(1)').classList.remove('active');
        themeToggler.querySelector('.bx:nth-child(2)').classList.add('active');
    }
}

menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
});

themeToggler.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme-variables');
    themeToggler.querySelector('.bx:nth-child(1)').classList.toggle('active');
    themeToggler.querySelector('.bx:nth-child(2)').classList.toggle('active');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-theme-variables') ? '1' : '0');
});

document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    initializeApp();
});

function initializeApp() {
    ordersTable.innerHTML = '';
    currentPage = 1;
    hasMoreOrders = true;
    
    loadOrders();
    document.querySelector('main').addEventListener('scroll', handleScroll);
    setupModal();
}

async function loadOrders() {
    if (isLoading || !hasMoreOrders) return;

    isLoading = true;
    showLoadingIndicator();

    try {
        const response = await fetch(`${API_BASE}/orders/get?page=${currentPage}&limit=${ordersPerPage}`, {
            headers: {
                "Authorization": `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.data.length === 0) {
            hasMoreOrders = false;
            return;
        }

        renderOrders(result.data);
        currentPage++;
    } catch (error) {
        showError(error);
    } finally {
        isLoading = false;
        hideLoadingIndicator();
    }
}

function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const threshold = 100;
    if (scrollTop + clientHeight >= scrollHeight - threshold && !isLoading && hasMoreOrders) {
        loadOrders();
    }
}

function renderOrders(orders) {
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.firstName}</td>
            <td>${order.lastName}</td>
            <td>${formatPhone(order.phoneNumber)}</td>
            <td class="${getStatusClass(order.status)}">${capitalizeFirst(order.status)}</td>
            <td class="primary details-btn" data-order-id="${order._id}">
                Details <i class='bx bx-chevron-right'></i>
            </td>
        `;
        ordersTable.appendChild(tr);
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.currentTarget.dataset.orderId;
            openOrderModal(orderId);
        });
    });
}

function openOrderModal(orderId) {
    modal.dataset.orderId = orderId;
    fetchOrderDetails(orderId)
        .then(order => {
            document.getElementById("order-id").textContent = `#${order._id.slice(-6).toUpperCase()}`;
            document.getElementById("customer-name").textContent = `${order.firstName} ${order.lastName}`;
            document.getElementById("customer-phone").textContent = formatPhone(order.phoneNumber);
            document.getElementById("customer-address").textContent = order.address;
            document.getElementById("order-date").textContent = order.formattedCreatedAt;
            
            const statusBadge = document.getElementById("order-status");
            statusBadge.textContent = capitalizeFirst(order.status);
            statusBadge.className = `info-value status-badge ${getStatusClass(order.status)}`;
            
            renderOrderItems(order.cartItems);
            
            const subtotal = order.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            document.getElementById("subtotal-price").textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById("total-price").textContent = `$${order.totalPrice.toFixed(2)}`;
            
            const cancelBtn = modal.querySelector("#cancel-btn");
            const confirmBtn = modal.querySelector("#confirm-btn");
            
            if (order.status === 'success') {
                cancelBtn.style.display = 'none';
                confirmBtn.style.display = 'none';
            } else if (order.status === 'canceled') {
                cancelBtn.style.display = 'none';
                confirmBtn.style.display = 'block';
            } else {
                cancelBtn.style.display = 'block';
                confirmBtn.style.display = 'block';
            }
            
            modal.style.display = "block";
        })
        .catch(error => {
            console.error("Error loading order details:", error);
            alert("Failed to load order details");
        });
}

async function fetchOrderDetails(orderId) {
    const response = await fetch(`${API_BASE}/orders/getDetails/${orderId}`, {
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`
        }
    });
    if (!response.ok) throw new Error("Failed to fetch order details");
    const { data } = await response.json();
    return data;
}

function renderOrderItems(items) {
    const tbody = document.getElementById("order-items-body");
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.productId?.name || 'Product'}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
}

function closeModal() {
    modal.style.display = "none";
    document.getElementById("order-items-body").innerHTML = "";
}

function showLoadingIndicator() {
    loadingIndicator.textContent = 'Loading more orders...';
    document.querySelector('main').appendChild(loadingIndicator);
}

function hideLoadingIndicator() {
    if (loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
}

function showError(error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = `Error: ${error.message}`;
    ordersTable.parentNode.appendChild(errorEl);
}

function getStatusClass(status) {
    const statusMap = {
        'pending': 'warning',
        'success': 'success',
        'canceled': 'danger',
        'shipped': 'info'
    };
    return statusMap[status.toLowerCase()] || 'info';
}

function formatPhone(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAuthToken() {
    return localStorage.getItem('token') || '';
}

function setupModal() {
    const closeModalBtn = modal.querySelector(".close-modal");
    closeModalBtn.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => e.target === modal && closeModal());
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "block") closeModal();
    });

    modal.querySelector("#back-btn").addEventListener("click", closeModal);
    
    modal.querySelector("#cancel-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to cancel this order?")) {
            updateOrderStatus("canceled");
        }
    });

    modal.querySelector("#confirm-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to confirm this order?")) {
            updateOrderStatus("success");
        }
    });
}

async function updateOrderStatus(newStatus) {
    const orderId = modal.dataset.orderId; 
    
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/change`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            throw new Error(errorData.message || "Failed to update order status");
        }

        const result = await response.json();
        
        const statusBadge = document.getElementById("order-status");
        statusBadge.textContent = capitalizeFirst(newStatus);
        statusBadge.className = `info-value status-badge ${getStatusClass(newStatus)}`;
        
        const orderRow = document.querySelector(`[data-order-id="${orderId}"]`).closest('tr');
        if (orderRow) {
            const statusCell = orderRow.querySelector('td:nth-child(4)');
            statusCell.textContent = capitalizeFirst(newStatus);
            statusCell.className = getStatusClass(newStatus);
        }
        
        alert(`Order status updated to ${newStatus}`);
        closeModal();
        
        initializeApp();
    } catch (error) {
        alert(`Failed to update order status: ${error.message}`);
    }
}