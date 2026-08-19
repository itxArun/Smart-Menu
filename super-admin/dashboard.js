// 🔥 SUPER ADMIN LOGIC FILE

window.superAdminLogin = () => {
    const email = document.getElementById('saEmail').value;
    const pass = document.getElementById('saPass').value;
    
    // Abhi ke liye temporary test login (Baad me isko Firebase se jodenge)
    if(email === "admin@arun.com" && pass === "Arun@123") {
        alert("Welcome CEO Arun Bhai! 🚀 Dashboard access granted...");
        // Yahan baad me andar ka UI dikhane ka code aayega
    } else {
        const errorMsg = document.getElementById('saError');
        errorMsg.style.display = 'block';
        
        // 3 second baad error apne aap gayab ho jayega
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 3000);
    }
};
