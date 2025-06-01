// API Configuration
const API_BASE = "https://e-commerce-web-1nmc.onrender.com/api";
const AUTH_HEADER = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

// DOM Elements
const sideMenu = document.querySelector("aside");
const menuBtn = document.getElementById("menu-btn");
const closeBtn = document.getElementById("close-btn");
const themeToggler = document.querySelector(".them-toggler");
const ordersTable = document.getElementById("orders-body");
const mainContent = document.querySelector('main');

// State Management
let currentPage = 1;
const ordersPerPage = 15;
let isLoading = false;
let hasMoreOrders = true;

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    initializeApp();
    setupModal();
    setupEventListeners();
});

// Theme Management
function applySavedTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === '1') {
        document.body.classList.add('dark-theme-variables');
        themeToggler.querySelector('.bx:nth-child(1)').classList.remove('active');
        themeToggler.querySelector('.bx:nth-child(2)').classList.add('active');
    }
}

// Application Initialization
function initializeApp() {
    ordersTable.innerHTML = '';
    currentPage = 1;
    hasMoreOrders = true;
    loadOrders();
}

// Event Listeners Setup
function setupEventListeners() {
    // Sidebar controls
    menuBtn.addEventListener('click', () => sideMenu.style.display = 'block');
    closeBtn.addEventListener('click', () => sideMenu.style.display = 'none');
    
    // Theme toggler
    themeToggler.addEventListener('click', toggleTheme);
    
    // Infinite scroll
    mainContent.addEventListener('scroll', handleScroll);
}

// Theme Toggle Function
function toggleTheme() {
    document.body.classList.toggle('dark-theme-variables');
    const icons = themeToggler.querySelectorAll('.bx');
    icons[0].classList.toggle('active');
    icons[1].classList.toggle('active');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-theme-variables') ? '1' : '0');
}

// Order Loading and Display
async function loadOrders() {
    if (isLoading || !hasMoreOrders) return;
    isLoading = true;
    
    try {
        showLoadingIndicator();
        const response = await fetch(`${API_BASE}/orders/get?page=${currentPage}&limit=${ordersPerPage}`, {
            headers: AUTH_HEADER
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { data } = await response.json();
        if (data.length === 0) {
            hasMoreOrders = false;
            return;
        }

        renderOrders(data);
        currentPage++;
    } catch (error) {
        showNotification(`Error loading orders: ${error.message}`, 'error');
    } finally {
        isLoading = false;
        hideLoadingIndicator();
    }
}

// Scroll Handling for Infinite Loading
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = mainContent;
    const threshold = 100;
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
        loadOrders();
    }
}

// Render Orders in Table
function renderOrders(orders) {
    const fragment = document.createDocumentFragment();
    
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
        fragment.appendChild(tr);
    });

    ordersTable.appendChild(fragment);
    setupOrderDetailButtons();
}

// Setup Order Detail Buttons
function setupOrderDetailButtons() {
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.orderId;
            openOrderModal(orderId);
        });
    });
}

// Modal Functions
function setupModal() {
    const modal = createModal();
    document.body.appendChild(modal);
    
    // Close modal events
    modal.querySelector(".close-modal").addEventListener("click", closeModal);
    window.addEventListener("click", (e) => e.target === modal && closeModal());
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    // Action buttons
    modal.querySelector("#back-btn").addEventListener("click", closeModal);
    modal.querySelector("#cancel-btn").addEventListener("click", () => confirmAction("canceled"));
    modal.querySelector("#confirm-btn").addEventListener("click", () => confirmAction("success"));
}

function createModal() {
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
    return modal;
}

async function openOrderModal(orderId) {
    const modal = document.getElementById('orderModal');
    modal.dataset.orderId = orderId;
    
    try {
        const order = await fetchOrderDetails(orderId);
        populateModalContent(order);
        updateActionButtons(order.status);
        modal.style.display = "block";
    } catch (error) {
        showNotification(`Error loading order details: ${error.message}`, 'error');
    }
}

async function fetchOrderDetails(orderId) {
    const response = await fetch(`${API_BASE}/orders/getDetails/${orderId}`, {
        headers: AUTH_HEADER
    });
    if (!response.ok) throw new Error("Failed to fetch order details");
    const { data } = await response.json();
    return data;
}

function populateModalContent(order) {
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

function updateActionButtons(status) {
    const cancelBtn = document.getElementById("cancel-btn");
    const confirmBtn = document.getElementById("confirm-btn");
    
    if (status === 'success') {
        cancelBtn.style.display = 'none';
        confirmBtn.style.display = 'none';
    } else if (status === 'canceled') {
        cancelBtn.style.display = 'none';
        confirmBtn.style.display = 'block';
    } else {
        cancelBtn.style.display = 'block';
        confirmBtn.style.display = 'block';
    }
}

function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = "none";
        document.getElementById("order-items-body").innerHTML = "";
    }
}

function confirmAction(newStatus) {
    const action = newStatus === 'success' ? 'confirm' : 'cancel';
    if (confirm(`Are you sure you want to ${action} this order?`)) {
        updateOrderStatus(newStatus);
    }
}

async function updateOrderStatus(newStatus) {
    const modal = document.getElementById('orderModal');
    const orderId = modal.dataset.orderId;
    
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/change`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...AUTH_HEADER
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update order status");
        }

        showNotification(`Order status updated to ${newStatus}`, 'success');
        closeModal();
        initializeApp(); // Refresh the orders list
    } catch (error) {
        showNotification(`Failed to update order status: ${error.message}`, 'error');
    }
}

// Utility Functions
function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.textContent = 'Loading more orders...';
    mainContent.appendChild(loadingIndicator);
}

function hideLoadingIndicator() {
    const indicator = document.querySelector('.loading-indicator');
    if (indicator) indicator.remove();
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
    return phone?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') || phone;
}

function capitalizeFirst(str) {
    return str?.charAt(0).toUpperCase() + str?.slice(1) || '';
}