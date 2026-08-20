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

// ==========================================
// 👁️ PASSWORD SHOW/HIDE LOGIC
// ==========================================
window.togglePassword = () => {
    const passInput = document.getElementById('saPass');
    const eyeIcon = document.getElementById('toggleEye');
    if (passInput.type === "password") {
        passInput.type = "text";
        eyeIcon.classList.replace("ph-eye", "ph-eye-slash");
        eyeIcon.style.color = "#00d084"; // Dekhne par Green ho jayega
    } else {
        passInput.type = "password";
        eyeIcon.classList.replace("ph-eye-slash", "ph-eye");
        eyeIcon.style.color = "#8b94a7";
    }
};

// ==========================================
// 🔐 HACKER-PROOF FIREBASE LOGIN SYSTEM (Loop Fixed)
// ==========================================
window.superAdminLogin = () => {
    // .trim() aage-peeche ke galti se lage spaces ko hata dega
    const email = document.getElementById('saEmail').value.trim();
    const pass = document.getElementById('saPass').value.trim();
    
    if(!email || !pass) {
        showToast("Email aur Password dono daalo!", "error");
        return;
    }

    showToast("Verifying Security... ⏳", "success");

    auth.signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            showToast("Welcome CEO Arun! 🚀", "success");
            // Yahan se aage ka kaam onAuthStateChanged khud sambhal lega
        })
        .catch((error) => {
            if(error.code === 'auth/invalid-credential') {
                showToast("Galat Password ya Email! Aankh (Eye) daba kar check karo.", "error");
            } else {
                showToast("Error: " + error.message, "error");
            }
            console.error(error);
        });
};

window.logoutDashboard = () => {
    // 🛑 FIXED: Confirmation Popup
    const confirmLogout = confirm("⚠️ Are you sure you want to log out of the Master Panel?");
    
    // Agar User 'OK' dabayega tabhi logout hoga
    if (confirmLogout) {
        auth.signOut().then(() => {
            showToast("Logged out successfully! 🔒", "success");
            document.getElementById('saPass').value = ""; // Password clear karna
        }).catch((error) => {
            console.error(error);
        });
    }
};

// 🛡️ THE ULTIMATE SECURITY GUARD
window.onload = () => {
    updateGreetingAndDate();
    
    auth.onAuthStateChanged((user) => {
        const loginSec = document.getElementById('loginSection');
        const dashSec = document.getElementById('dashboardSection');
        
        if (user) {
            if(loginSec) loginSec.style.display = 'none';
            if(dashSec) dashSec.style.display = 'flex';
        } else {
            if(dashSec) dashSec.style.display = 'none';
            if(loginSec) loginSec.style.display = 'flex';
        }
    });
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

// ==========================================
// ✏️ GOD MODE: EDIT & DELETE LOGIC
// ==========================================

// 1. Popup kholna aur purana data laana
window.openEditModal = (dbId) => {
    // Array me se us restaurant ko dhundho jiska pencil icon click hua hai
    const client = clientsData.find(c => c.dbId === dbId);
    if(!client) return;

    // Popup ke inputs me asli data bharo
    document.getElementById('editClientId').value = client.dbId;
    document.getElementById('editName').value = client.name;
    document.getElementById('editCity').value = client.city;
    document.getElementById('editPlan').value = client.plan;
    
    const statusSelect = document.getElementById('editStatus');
    if(client.status === 'Active') statusSelect.value = 'Active';
    else if(client.status === 'Trial Phase') statusSelect.value = 'Trial Phase';
    else statusSelect.value = 'Deactivated';

    // Popup dikhao
    document.getElementById('editModal').style.display = 'flex';
};

window.closeEditModal = () => {
    document.getElementById('editModal').style.display = 'none';
};

// 2. Firebase me naya data UPDATE karna
window.saveEditedClient = () => {
    const dbId = document.getElementById('editClientId').value;
    const newName = document.getElementById('editName').value;
    const newCity = document.getElementById('editCity').value;
    const newPlan = document.getElementById('editPlan').value;
    const newStatus = document.getElementById('editStatus').value;
    
    // Status ke hisaab se color badge set karna
    let newStatusClass = 'active-badge';
    if(newStatus === 'Trial Phase') newStatusClass = 'trial-badge';
    if(newStatus === 'Deactivated') newStatusClass = ''; // Isko baad me red kar denge

    showToast("Updating Cloud Server... ⏳", "success");

    // Firebase update command
    db.collection("merchants").doc(dbId).update({
        restaurantName: newName,
        city: newCity,
        plan: newPlan,
        status: newStatus,
        statusClass: newStatusClass
    }).then(() => {
        showToast("Client Data Updated Successfully! 🚀", "success");
        closeEditModal();
    }).catch((error) => {
        showToast("Error updating client!", "error");
        console.error(error);
    });
};

// 3. Firebase se hamesha ke liye DELETE karna
window.deleteClient = () => {
    const dbId = document.getElementById('editClientId').value;
    
    // Safety check: Delete karne se pehle poochega
    const confirmDelete = confirm("⚠️ WARNING: Are you sure you want to permanently delete this Restaurant? All their data will be lost!");
    
    if(confirmDelete) {
        showToast("Deleting from Cloud... ⏳", "success");
        
        // Firebase delete command
        db.collection("merchants").doc(dbId).delete().then(() => {
            showToast("Restaurant Deleted Permanently! 🗑️", "success");
            closeEditModal();
        }).catch((error) => {
            showToast("Error deleting client!", "error");
            console.error(error);
        });
    }
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
const auth = firebase.auth();
let clientsData = [];

// 🚀 REAL-TIME LISTENER (Data lana aur Dashboard Dashboard Update karna)
db.collection("merchants").onSnapshot((snapshot) => {
    clientsData = [];
    
    // Counters start from zero
    let totalClientsCount = 0;
    let activeClientsCount = 0;
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Data map kar rahe hain
        clientsData.push({ 
            dbId: doc.id, 
            id: data.restaurantId || data.id || '#SM-???', 
            name: data.restaurantName || data.name || 'Unknown', 
            city: data.city || 'N/A', 
            plan: data.plan || 'Free Tier', 
            status: data.status || 'Active',
            statusClass: data.statusClass || 'active-badge'
        });

        // Ginti (Counting) kar rahe hain
        totalClientsCount++;
        if(data.status === 'Active' || !data.status) {
            activeClientsCount++;
        }
    });
    
    // UI Table Update karna
    renderTable(); 
    
    // 📊 Dashboard ke Numbers Update karna
    const dashTotal = document.getElementById('dashTotalClients');
    const dashActive = document.getElementById('dashActiveClients');
    const dashRev = document.getElementById('dashRevenue');
    
    if(dashTotal) dashTotal.innerText = totalClientsCount;
    if(dashActive) dashActive.innerText = activeClientsCount;
    
    // Maan lo har active client ka 1500 Rs ka plan hai (Revenue calculation)
    const estimatedRevenue = activeClientsCount * 1500;
    if(dashRev) dashRev.innerText = "₹" + estimatedRevenue.toLocaleString("en-IN");
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

// ==========================================
// 🥷 NINJA TRICK: CRASH-PROOF SECONDARY APP
// ==========================================
let secondaryApp;
// Check karo ki kya SecondaryApp pehle se bana hua hai? 
if (firebase.apps.find(app => app.name === "SecondaryApp")) {
    secondaryApp = firebase.app("SecondaryApp");
} else {
    secondaryApp = firebase.initializeApp(firebaseConfig, "SecondaryApp");
}
const secondaryAuth = secondaryApp.auth();
// ➕ NAYA CLIENT SAVE & AUTO-LOGIN CREATE KARNA
window.saveNewClient = () => {
    const name = document.getElementById('clientNameInput').value;
    const email = document.getElementById('clientEmailInput').value;
    const pass = document.getElementById('clientPassInput').value;
    const city = document.getElementById('clientCityInput').value;
    const plan = document.getElementById('clientPlanInput').value;
    
    // Check karo ki sab zaruri details bhari hain ya nahi
    if(!name || !email || !pass) { 
        showToast("Restaurant Name, Email aur Password zaruri hai!", "error"); 
        return; 
    }

    const randomId = '#SM-' + Math.floor(Math.random() * 900 + 100);
    showToast("Creating Secure Login & Database... ⏳", "success");
    
    // STEP 1: Background me naya Account banana
    secondaryAuth.createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            // Account bante hi secondary engine ko turant sign-out kar do taaki kachra na jama ho
            secondaryAuth.signOut();
            
            // STEP 2: Agar login ban gaya, toh Firestore me Data save karo
            return db.collection("merchants").add({
                restaurantId: randomId,
                restaurantName: name,
                email: email, 
                upiId: "Not Provided", 
                city: city || 'N/A',
                plan: plan,
                status: 'Active',
                statusClass: 'active-badge',
                createdAt: firebase.firestore.FieldValue.serverTimestamp() 
            });
        })
        .then(() => {
            showToast("Hotel Created & Owner Account Ready! 🚀", "success");
            
            // Form Clear karna
            const inputs = document.querySelectorAll('#addClientSection input');
            inputs.forEach(input => input.value = '');
            const select = document.querySelector('#addClientSection select');
            if(select) select.selectedIndex = 0;

            setTimeout(() => { switchTab('list'); }, 1500);
        })
        .catch((error) => {
            // Agar email pehle se exist karta hai ya password weak hai
            showToast("Error: " + error.message, "error");
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
// Start logic & Security Check

