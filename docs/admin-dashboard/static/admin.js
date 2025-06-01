// API Configuration
const API_BASE = "https://e-commerce-web-1nmc.onrender.com/api";
const STATS_ENDPOINT = `${API_BASE}/stats`;
const ORDERS_ENDPOINT = `${API_BASE}/orders/get`;
const AUTH_HEADER = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

// DOM Elements
const sideMenu = document.querySelector("aside");
const menuBtn = document.getElementById("menu-btn");
const closeBtn = document.getElementById("close-btn");
const themeToggler = document.querySelector(".them-toggler");

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    setupEventListeners();
    loadDashboardData();
});

// Theme Management
function applySavedTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === '1') {
        document.body.classList.add('dark-theme-variables');
        updateThemeToggler(true);
    }
}

function updateThemeToggler(isDark) {
    const icons = themeToggler.querySelectorAll('.bx');
    icons[0].classList.toggle('active', !isDark);
    icons[1].classList.toggle('active', isDark);
}

// Event Listeners
function setupEventListeners() {
    menuBtn.addEventListener('click', () => sideMenu.style.display = 'block');
    closeBtn.addEventListener('click', () => sideMenu.style.display = 'none');
    
    themeToggler.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const isDark = !document.body.classList.contains('dark-theme-variables');
    document.body.classList.toggle('dark-theme-variables', isDark);
    updateThemeToggler(isDark);
    localStorage.setItem('darkMode', isDark ? '1' : '0');
}

// Dashboard Data Loading
async function loadDashboardData() {
    try {
        await Promise.all([fetchStats(), fetchRecentOrders()]);
    } catch (error) {
        console.error("Dashboard loading error:", error);
        showNotification("Failed to load dashboard data", "error");
    }
}

// Statistics Functions
async function fetchStats() {
    try {
        const response = await fetch(STATS_ENDPOINT, {
            headers: AUTH_HEADER
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { stats } = await response.json();
        if (!stats) throw new Error("No stats data received");

        updateStatsDisplay(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        throw error;
    }
}

function updateStatsDisplay({ totalSales, totalExpenses, totalIncome }) {
    // Update text values
    setTextById("total-sales", `${totalSales}`);
    setTextById("total-expenses", `$${totalExpenses}`);
    setTextById("total-income", `$${totalIncome}`);

    // Update progress indicators
    updateProgressIndicator(".sales", totalSales, 3000);
    updateProgressIndicator(".expences", totalExpenses, 500000);
    updateProgressIndicator(".income", totalIncome, 1000000);
}

function updateProgressIndicator(selector, value, maxValue) {
    const percent = calcPercent(value, maxValue);
    updateProgressCircle(`${selector} .progress circle`, percent);
    updateProgressNumber(`${selector} .progress .number p`, percent);
}

function updateProgressCircle(selector, percent) {
    const circle = document.querySelector(selector);
    if (!circle) return;

    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
}

function updateProgressNumber(selector, percent) {
    const numberEl = document.querySelector(selector);
    if (numberEl) numberEl.textContent = `${percent}%`;
}

// Orders Functions
async function fetchRecentOrders() {
    try {
        const response = await fetch(ORDERS_ENDPOINT, {
            headers: {
                ...AUTH_HEADER,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();
        if (!data) throw new Error("No orders data received");

        displayRecentOrders(data.slice(0, 5));
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
}

function displayRecentOrders(orders) {
    const tbody = document.getElementById("orders-body");
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.firstName}</td>
            <td>${order.lastName}</td>
            <td>${formatPhoneNumber(order.phoneNumber)}</td>
            <td class="${getStatusClass(order.status)}">${capitalizeFirst(order.status)}</td>
        </tr>
    `).join('');
}

// Utility Functions
function setTextById(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function calcPercent(current, max) {
    return Math.min(100, Math.round((current / max) * 100));
}

function getStatusClass(status) {
    const statusClasses = {
        'pending': 'warning',
        'success': 'success',
        'canceled': 'danger'
    };
    return statusClasses[status.toLowerCase()] || 'info';
}

function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Format as (XXX) XXX-XXXX
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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