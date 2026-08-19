// 🔥 CUSTOM PREMIUM POPUP FUNCTION
window.showToast = (message, type = "success") => {
    const toast = document.getElementById('customToast');
    const icon = document.getElementById('toastIcon');
    const text = document.getElementById('toastMessage');

    // Check karo Success hai ya Error
    if (type === "success") {
        icon.innerHTML = '<i class="ph-fill ph-check-circle"></i>';
        toast.className = 'custom-toast toast-success';
    } else {
        icon.innerHTML = '<i class="ph-fill ph-warning-circle"></i>';
        toast.className = 'custom-toast toast-error';
    }
    
    text.innerText = message;
    toast.classList.add('show'); // Popup ko hawa me lao

    // 3 Second baad apne aap gayab kar do
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

// 🔥 SUPER ADMIN LOGIN LOGIC
window.superAdminLogin = () => {
    const email = document.getElementById('saEmail').value;
    const pass = document.getElementById('saPass').value;
    
    // Purana bekaar sa laal text error hata diya
    const oldErrorMsg = document.getElementById('saError');
    if(oldErrorMsg) oldErrorMsg.style.display = 'none';
    
    // Testing Login
    if(email === "admin@arun.com" && pass === "Arun@123") {
        // Asli Alert ki jagah apna Premium Toast (Green)
        showToast("Welcome CEO! 🚀 Access granted...", "success");
    } else {
        // Asli Alert ki jagah apna Premium Toast (Red)
        showToast("Invalid Master Credentials!", "error");
    }
};
