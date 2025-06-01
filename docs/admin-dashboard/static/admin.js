const sideMenu = document.querySelector("aside")
const menuBtn = document.getElementById("menu-btn")
const closeBtn = document.getElementById("close-btn")
const themeToggler = document.querySelector(".them-toggler")

function applySavedTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === '1') {
        document.body.classList.add('dark-theme-variables');
        themeToggler.querySelector('.bx:nth-child(1)').classList.remove('active');
        themeToggler.querySelector('.bx:nth-child(2)').classList.add('active');
    }
}

menuBtn.addEventListener('click',()=>{
    sideMenu.style.display = 'block';
})

closeBtn.addEventListener('click',()=>{
    sideMenu.style.display = 'none';
})

themeToggler.addEventListener('click',()=>{
    document.body.classList.toggle('dark-theme-variables')

    themeToggler.querySelector('.bx:nth-child(1)').classList.toggle('active');
    themeToggler.querySelector('.bx:nth-child(2)').classList.toggle('active');

    // Save theme preference
    localStorage.setItem('darkMode', document.body.classList.contains('dark-theme-variables') ? '1' : '0');
})

const statsURL = "http://localhost:3000/api/stats";
const ordersURL = "http://localhost:3000/api/orders/get";

document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    fetchStats();
    fetchOrders();
});

async function fetchStats() {
    try {
        const res = await fetch(statsURL, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const data = await res.json();
        if (!data.success) throw new Error("Failed to fetch stats");

        const { totalSales, totalExpenses, totalIncome } = data.stats;

        setTextById("total-sales", `${totalSales}`);
        setTextById("total-expenses", `$${totalExpenses}`);
        setTextById("total-income", `$${totalIncome}`);

        const salesPercent = calcPercent(totalSales, 3000);
        const expensesPercent = calcPercent(totalExpenses, 500000);
        const incomePercent = calcPercent(totalIncome, 1000000);

        updateProgressCircle(".sales .progress circle", salesPercent);
        updateProgressNumber(".sales .progress .number p", salesPercent);

        updateProgressCircle(".expences .progress circle", expensesPercent);
        updateProgressNumber(".expences .progress .number p", expensesPercent);

        updateProgressCircle(".income .progress circle", incomePercent);
        updateProgressNumber(".income .progress .number p", incomePercent);


        
    // setTextById("total-sales", `$${totalSales}`);
    // setTextById("total-expenses", `$${totalExpenses}`);
    // setTextById("total-income", `$${totalIncome}`);

    // const salesPercent = calcPercent(totalSales, 30000);
    // const expensesPercent = calcPercent(totalExpenses, 50000);
    // const incomePercent = calcPercent(totalIncome, 5000);

    // updateProgressCircle(".sales .progress circle", salesPercent);
    // updateProgressNumber(".sales .progress .number p", salesPercent);

    // updateProgressCircle(".expences .progress circle", expensesPercent);
    // updateProgressNumber(".expences .progress .number p", expensesPercent);

    // updateProgressCircle(".income .progress circle", incomePercent);
    // updateProgressNumber(".income .progress .number p", incomePercent);
    } catch (err) {
        console.error("Error fetching stats:", err.message);
    }
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

async function fetchOrders() {
    try {
        const res = await fetch(ordersURL, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });

        const data = await res.json();
        if (!data.success) {
            throw new Error("Failed to fetch orders");
        }

        const orders = data.data.slice(0, 5);
        const tbody = document.getElementById("orders-body");
        if (!tbody) {
            console.log("No tbody");
            return;
        }

        tbody.innerHTML = "";

        orders.forEach((order) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${order.firstName}</td> 
                <td>${order.lastName}</td>
                <td>${order.phoneNumber}</td>
                <td class="${getStatusClass(order.status)}">${order.status}</td>
            `;

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error fetching orders:", err.message);
    }
}

function setTextById(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function calcPercent(current, max) {
    return Math.min(100, Math.round((current / max) * 100));
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case "pending":
            return "warning";
        case "success":
            return "success";
        case "canceled":
            return "danger";
        default:
            return "info";
    }
}