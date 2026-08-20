// ==========================================
// 🎨 UI & UTILITY FUNCTIONS
// ==========================================
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

// ==========================================
// 📊 CHART & TAB NAVIGATION
// ==========================================
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
            maintainAspectRatio: false, 
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
        setTimeout(() => { loadAnalyticsChart(); }, 100);
    }
};

window.toggleNotif = () => {
    document.getElementById('notifDropdown').classList.toggle('show');
};

window.openEditModal = (dbId) => {
    // dbId ko aage chal kar Update function ke liye use karenge
    document.getElementById('editModal').style.display = 'flex';
};

window.closeEditModal = (isSaved) => {
    document.getElementById('editModal').style.display = 'none';
    if(isSaved) showToast("Client Plan Updated!", "success");
};


// ==========================================
// 🔥 FIREBASE CLOUD DATABASE LOGIC
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyDHfU0QaryYKy7zfhFXQdMEqh1KdIApNXY",
    authDomain: "itx-arun-bdf24.firebaseapp.com",
    projectId: "itx-arun-bdf24",
    storageBucket: "itx-arun-bdf24.firebasestorage.app",
    messagingSenderId: "442083262265",
    appId: "1:442083262265:web:3e023b1211f752cb3132e8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let clientsData = [];

// 🚀 REAL-TIME LISTENER (merchants folder aur tumhara old data mapping)
db.collection("merchants").onSnapshot((snapshot) => {
    clientsData = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        clientsData.push({ 
            dbId: doc.id, 
            id: data.restaurantId || data.id || '#SM-???', 
            name: data.restaurantName || data.name || 'Unknown', 
            city: data.city || 'N/A', 
            plan: data.plan || 'Free Tier', 
            status: data.status || 'Active',
            statusClass: data.statusClass || 'active-badge'
        });
    });
    renderTable(); 
});

const renderTable = () => {
    const tbody = document.getElementById("clientTableBody");
    if(!tbody) return;
    tbody.innerHTML = ''; 
    
    clientsData.forEach(client => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:#8b94a7;">${client.id}</td>
            <td>${client.name}</td>
            <td>${client.city}</td>
            <td>${client.plan}</td>
            <td><span class="status-badge ${client.statusClass}">${client.status}</span></td>
            <td><button class="action-btn" onclick="openEditModal('${client.dbId}')"><i class="ph ph-pencil-simple"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
};

window.filterTable = (query) => {
    let filter = query.toLowerCase();
    let tbody = document.getElementById("clientTableBody");
    let trs = tbody.getElementsByTagName("tr");
    
    for (let i = 0; i < trs.length; i++) {
        let text = trs[i].innerText.toLowerCase();
        trs[i].style.display = text.includes(filter) ? "" : "none";
    }
};

// ➕ NAYA CLIENT SAVE KARNA (Matching your old DB structure)
window.saveNewClient = () => {
    const name = document.getElementById('clientNameInput').value;
    const city = document.getElementById('clientCityInput').value;
    const plan = document.getElementById('clientPlanInput').value;
    
    if(!name) { showToast("Please enter Restaurant Name!", "error"); return; }

    const randomId = '#SM-' + Math.floor(Math.random() * 900 + 100);
    showToast("Connecting to Cloud Server... ⏳", "success");
    
    db.collection("merchants").add({
        restaurantId: randomId,
        restaurantName: name,
        email: "Not Provided", 
        upiId: "Not Provided", 
        city: city || 'N/A',
        plan: plan,
        status: 'Active',
        statusClass: 'active-badge',
        createdAt: firebase.firestore.FieldValue.serverTimestamp() 
    }).then(() => {
        showToast("Client Saved to Cloud Database! ☁️🚀", "success");
        
        // Form Clear karna
        const inputs = document.querySelectorAll('#addClientSection input');
        inputs.forEach(input => input.value = '');
        const select = document.querySelector('#addClientSection select');
        if(select) select.selectedIndex = 0;

        setTimeout(() => { switchTab('list'); }, 1200);
    }).catch((error) => {
        showToast("Error connecting to server!", "error");
        console.error(error);
    });
};

// 📥 EXPORT TO CSV (BLOB METHOD)
window.exportToCSV = () => {
    if(clientsData.length === 0) { showToast("No data to export!", "error"); return; }
    
    let csvContent = "Client ID,Restaurant Name,City,Plan,Status\n"; 
    clientsData.forEach(client => {
        let row = `${client.id},${client.name},${client.city},${client.plan},${client.status}`;
        csvContent += row + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "SmartMenu_Clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Excel File Downloaded! 📊", "success");
};

// Start logic
window.onload = () => {
    updateGreetingAndDate();
};
