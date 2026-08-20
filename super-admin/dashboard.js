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
    let greeting = "Good Evening, Arun Bhai! 🌙";
    
    if (hour >= 5 && hour < 12) greeting = "Good Morning, Arun Bhai! 🌅";
    else if (hour >= 12 && hour < 17) greeting = "Good Afternoon, Arun Bhai! ☀️";
    
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

// Tab Switching Logic (Overview vs Add Client)
window.switchTab = (tabName) => {
    const overviewSec = document.getElementById('overviewSection');
    const addSec = document.getElementById('addClientSection');
    const navOverview = document.getElementById('nav-overview');
    const navAdd = document.getElementById('nav-add');

    if (tabName === 'overview') {
        overviewSec.style.display = 'grid';
        addSec.style.display = 'none';
        navOverview.classList.add('active');
        navAdd.classList.remove('active');
    } 
    else if (tabName === 'add') {
        overviewSec.style.display = 'none';
        addSec.style.display = 'block';
        navOverview.classList.remove('active');
        navAdd.classList.add('active');
    }
};

// Auto load for testing (Bypass Login)
window.onload = () => {
    updateGreetingAndDate();
};
