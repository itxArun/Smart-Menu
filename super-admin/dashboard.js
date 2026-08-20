window.showToast = (message, type = "success") => {
    const toast = document.getElementById('customToast');
    const icon = document.getElementById('toastIcon');
    const text = document.getElementById('toastMessage');

    if (type === "success") {
        icon.innerHTML = '<i class="ph-fill ph-check-circle"></i>';
        toast.className = 'custom-toast toast-success show';
    } else {
        icon.innerHTML = '<i class="ph-fill ph-warning-circle"></i>';
        toast.className = 'custom-toast toast-error show';
    }
    text.innerText = message;
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
};

window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('expanded');
};

const updateGreetingAndDate = () => {
    const hour = new Date().getHours();
    let greeting = "Good Evening, Arun! 🌙";
    if (hour >= 5 && hour < 12) greeting = "Good Morning, Arun! 🌅";
    else if (hour >= 12 && hour < 17) greeting = "Good Afternoon, Arun! ☀️";
    
    document.getElementById('dynamicGreeting').innerText = greeting;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', options);
};

window.superAdminLogin = () => {
    const email = document.getElementById('saEmail').value;
    const pass = document.getElementById('saPass').value;
    
    if(email === "admin@arun.com" && pass === "Arun@123") {
        showToast("Welcome CEO! 🚀", "success");
        setTimeout(() => {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'flex';
            updateGreetingAndDate(); 
        }, 500);
    } else {
        showToast("Invalid Credentials!", "error");
    }
};

window.logoutDashboard = () => {
    document.getElementById('saPass').value = "";
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'flex'; 
    document.getElementById('sidebar').classList.remove('expanded'); 
    showToast("Logged out successfully!", "success");
};

// 🌟 Chart.js Logic (Anti-Glitch)
let myChart = null;
const loadAnalyticsChart = () => {
    const ctx = document.getElementById('mainChart');
    if(!ctx) return;
    
    if(myChart) myChart.destroy(); 

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Total Scans',
                data: [1500, 3200, 2800, 4950],
                borderColor: '#00d084',
                backgroundColor: 'rgba(0, 208, 132, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, /* Ye property glitch ko rokegi */
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b94a7' } },
                x: { grid: { display: false }, ticks: { color: '#8b94a7' } }
            }
        }
    });
};
window.switchTab = (tabName) => {
    const overviewSec = document.getElementById('overviewSection');
    const addSec = document.getElementById('addClientSection');
    const listSec = document.getElementById('clientListSection');
    const analyticsSec = document.getElementById('analyticsSection');
    
    const navOverview = document.getElementById('nav-overview');
    const navAdd = document.getElementById('nav-add');
    const navList = document.getElementById('nav-list');
    const navAnalytics = document.getElementById('nav-analytics');

    overviewSec.style.display = 'none'; addSec.style.display = 'none';
    listSec.style.display = 'none'; analyticsSec.style.display = 'none';
    
    navOverview.classList.remove('active'); navAdd.classList.remove('active');
    navList.classList.remove('active'); navAnalytics.classList.remove('active');

    if (tabName === 'overview') {
        overviewSec.style.display = 'grid'; navOverview.classList.add('active');
    } else if (tabName === 'add') {
        addSec.style.display = 'block'; navAdd.classList.add('active');
    } else if (tabName === 'list') {
        listSec.style.display = 'block'; navList.classList.add('active');
    } else if (tabName === 'analytics') {
        analyticsSec.style.display = 'block'; navAnalytics.classList.add('active');
        // Jab Analytics tab khule, tabhi Chart render karo
        setTimeout(() => { loadAnalyticsChart(); }, 100);
    }
};

window.saveNewClient = () => {
    showToast("Client Account Created & Details Sent! 🚀", "success");
    const inputs = document.querySelectorAll('#addClientSection input');
    inputs.forEach(input => input.value = '');
    const select = document.querySelector('#addClientSection select');
    if(select) select.selectedIndex = 0;
    setTimeout(() => { switchTab('overview'); }, 1200);
};

// 🌟 NAYA: Notification Toggle Logic
window.toggleNotif = () => {
    document.getElementById('notifDropdown').classList.toggle('show');
};

// 🌟 NAYA: Edit Modal Logic
window.openEditModal = () => {
    document.getElementById('editModal').style.display = 'flex';
};

window.closeEditModal = (isSaved) => {
    document.getElementById('editModal').style.display = 'none';
    if(isSaved) showToast("Client Plan Updated!", "success");
};

window.onload = () => {
    updateGreetingAndDate();
};
// ==========================================
// 💾 LOCAL STORAGE & DATA LOGIC
// ==========================================

// Default data (Agar system naya hai)
let clientsData = [
    { id: '#SM-001', name: 'Food Station', city: 'Patna', plan: 'Premium (Yearly)', status: 'Active', statusClass: 'active-badge' },
    { id: '#SM-002', name: 'FoodVilla', city: 'Delhi', plan: 'Pro Plan', status: 'Active', statusClass: 'active-badge' },
    { id: '#SM-003', name: 'Demo Cafe', city: 'Mumbai', plan: '14-Days Trial', status: 'Trial Phase', statusClass: 'trial-badge' }
];

// Check karo agar browser me pehle se save hai
if(localStorage.getItem('smartMenuClients')) {
    clientsData = JSON.parse(localStorage.getItem('smartMenuClients'));
}

// Table ko Load karne ka function
const renderTable = () => {
    const tbody = document.getElementById("clientTableBody");
    if(!tbody) return;
    
    tbody.innerHTML = ''; // Purana static html saaf karo
    
    clientsData.forEach(client => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:#8b94a7;">${client.id}</td>
            <td>${client.name}</td>
            <td>${client.city}</td>
            <td>${client.plan}</td>
            <td><span class="status-badge ${client.statusClass}">${client.status}</span></td>
            <td><button class="action-btn" onclick="openEditModal()"><i class="ph ph-pencil-simple"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
};

// 🔍 LIVE SEARCH LOGIC
window.filterTable = (query) => {
    let filter = query.toLowerCase();
    let tbody = document.getElementById("clientTableBody");
    let trs = tbody.getElementsByTagName("tr");
    
    for (let i = 0; i < trs.length; i++) {
        let text = trs[i].innerText.toLowerCase();
        trs[i].style.display = text.includes(filter) ? "" : "none";
    }
};

// ➕ REAL-TIME CLIENT ADD & SAVE LOGIC
window.saveNewClient = () => {
    const name = document.getElementById('clientNameInput').value;
    const city = document.getElementById('clientCityInput').value;
    const plan = document.getElementById('clientPlanInput').value;
    
    if(!name) { showToast("Please enter Restaurant Name!", "error"); return; }

    const randomId = '#SM-' + Math.floor(Math.random() * 900 + 100);
    
    // Naye client ko list me sabse upar add karo
    clientsData.unshift({
        id: randomId,
        name: name,
        city: city || 'N/A',
        plan: plan,
        status: 'Active',
        statusClass: 'active-badge'
    });

    // Browser Storage me Save karo
    localStorage.setItem('smartMenuClients', JSON.stringify(clientsData));
    
    // Table ko wapas reload karo naye data ke sath
    renderTable();

    showToast("Client Added & Saved Permanently! 🚀", "success");
    
    const inputs = document.querySelectorAll('#addClientSection input');
    inputs.forEach(input => input.value = '');
    setTimeout(() => { switchTab('list'); }, 1000);
};

// 📥 EXPORT TO CSV (EXCEL) LOGIC
window.exportToCSV = () => {
    if(clientsData.length === 0) { showToast("No data to export!", "error"); return; }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Client ID,Restaurant Name,City,Plan,Status\n"; // Headings
    
    // Har client ka data line by line add karo
    clientsData.forEach(client => {
        let row = `${client.id},${client.name},${client.city},${client.plan},${client.status}`;
        csvContent += row + "\n";
    });
    
    // File Banakar Download Karao
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SmartMenu_Clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Excel File Downloaded! 📊", "success");
};

// Jab page khule toh Table Data automatically load ho jaye
window.onload = () => {
    updateGreetingAndDate();
    renderTable(); // <--- NAYA: Table loading start hogi
};
