// Popup Function
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

// Sidebar Toggle
window.toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('expanded');
};

// Dynamic Date and Greeting
const updateGreetingAndDate = () => {
    const hour = new Date().getHours();
    let greeting = "Good Evening, Arun 🌙";
    
    if (hour >= 5 && hour < 12) greeting = "Good Morning, Arun 🌅";
    else if (hour >= 12 && hour < 17) greeting = "Good Afternoon, Arun ☀️";
    
    document.getElementById('dynamicGreeting').innerText = greeting;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', options);
};

// Login Logic
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

// Logout Logic
window.logoutDashboard = () => {
    document.getElementById('saPass').value = "";
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'flex'; 
    document.getElementById('sidebar').classList.remove('expanded'); 
    showToast("Logged out successfully!", "success");
};

// Tab Switching Logic (Overview, Add Client, Client List, Analytics)
window.switchTab = (tabName) => {
    // Charo Sections ko uthao
    const overviewSec = document.getElementById('overviewSection');
    const addSec = document.getElementById('addClientSection');
    const listSec = document.getElementById('clientListSection');
    const analyticsSec = document.getElementById('analyticsSection');
    
    // Charo Sidebar Buttons ko uthao
    const navOverview = document.getElementById('nav-overview');
    const navAdd = document.getElementById('nav-add');
    const navList = document.getElementById('nav-list');
    const navAnalytics = document.getElementById('nav-analytics');

    // Sabko pehle hide kar do (Clear screen)
    overviewSec.style.display = 'none';
    addSec.style.display = 'none';
    listSec.style.display = 'none';
    analyticsSec.style.display = 'none';
    
    // Sabke buttons se active hata do
    navOverview.classList.remove('active');
    navAdd.classList.remove('active');
    navList.classList.remove('active');
    navAnalytics.classList.remove('active');

    // Jisko click kiya hai, usko show karo aur button ko active karo
    if (tabName === 'overview') {
        overviewSec.style.display = 'grid';
        navOverview.classList.add('active');
    } 
    else if (tabName === 'add') {
        addSec.style.display = 'block';
        navAdd.classList.add('active');
    }
    else if (tabName === 'list') {
        listSec.style.display = 'block';
        navList.classList.add('active');
    }
    else if (tabName === 'analytics') {
        analyticsSec.style.display = 'block';
        navAnalytics.classList.add('active');
    }
};
// Auto load for testing (Bypass Login)
window.onload = () => {
    updateGreetingAndDate();
};
// Save New Client Logic
window.saveNewClient = () => {
    // 1. Success Message Dikhayega
    showToast("Client Account Created & Details Sent! 🚀", "success");

    // 2. Form ke saare input boxes ko khali (clear) karega
    const inputs = document.querySelectorAll('#addClientSection input');
    inputs.forEach(input => input.value = '');

    // Select dropdown ko wapas pehle option par set karega
    const select = document.querySelector('#addClientSection select');
    if(select) select.selectedIndex = 0;

    // 3. Ek second baad wapas Overview screen par bhej dega
    setTimeout(() => {
        switchTab('overview');
    }, 1200);
};
