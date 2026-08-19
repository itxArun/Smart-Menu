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

// 🚀 SUPER ADMIN LOGIN & TRANSITION LOGIC
window.superAdminLogin = () => {
    const email = document.getElementById('saEmail').value;
    const pass = document.getElementById('saPass').value;
    
    if(email === "admin@arun.com" && pass === "Arun@123") {
        showToast("Welcome CEO! 🚀", "success");
        
        // 0.5 second ka delay taaki popup dikh sake, fir login screen gayab
        setTimeout(() => {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'flex';
        }, 500);

    } else {
        showToast("Invalid Credentials!", "error");
    }
};

// 🔒 LOGOUT LOGIC
window.logoutDashboard = () => {
    document.getElementById('saPass').value = ""; // Password clear kar do
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    showToast("Logged out successfully!", "success");
};
