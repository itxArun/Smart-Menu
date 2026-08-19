// 🔥 CUSTOM PREMIUM POPUP FUNCTION
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

// 🍔 SIDEBAR TOGGLE LOGIC
window.toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('expanded'); // Click karne par expand/collapse hogi
};

// 🌟 DYNAMIC GREETING LOGIC (Time ke hisaab se)
const updateGreetingAndDate = () => {
    const hour = new Date().getHours();
    let greeting = "Good Evening, Arun Bhai! 🌙";
    
    if (hour >= 5 && hour < 12) greeting = "Good Morning, Arun Bhai! 🌅";
    else if (hour >= 12 && hour < 17) greeting = "Good Afternoon, Arun Bhai! ☀️";
    
    document.getElementById('dynamicGreeting').innerText = greeting;

    // Aaj ki real date set karo (e.g., August 19, 2026)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', options);
};

// 🚀 SUPER ADMIN LOGIN LOGIC
window.superAdminLogin = () => {
    const email = document.getElementById('saEmail').value;
    const pass = document.getElementById('saPass').value;
    
    if(email === "admin@arun.com" && pass === "Arun@123") {
        showToast("Welcome CEO! 🚀", "success");
        
        setTimeout(() => {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'flex';
            updateGreetingAndDate(); // Login hote hi time/date update karega
        }, 500);

    } else {
        showToast("Invalid Credentials!", "error");
    }
};

// 🔒 LOGOUT LOGIC
window.logoutDashboard = () => {
    document.getElementById('saPass').value = "";
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    
    // Sidebar ko wapas patla kar do logout hone par
    document.getElementById('sidebar').classList.remove('expanded'); 
    showToast("Logged out successfully!", "success");
};
