import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js"; //[span_5](start_span)[span_5](end_span)
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"; // 🔥 Yahan 'where' add kiya hai[span_6](start_span)[span_6](end_span)
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js"; //[span_7](start_span)[span_7](end_span)

// 🔥 FIREBASE CONFIGURATION 🔥
const firebaseConfig = {
    apiKey: "AIzaSyDHfU0QaryYKy7zfhFXQdMEqh1KdIApNXY",
    authDomain: "itx-arun-bdf24.firebaseapp.com",
    projectId: "itx-arun-bdf24",
    storageBucket: "itx-arun-bdf24.firebasestorage.app",
    messagingSenderId: "442083262265",
    appId: "1:442083262265:web:3e023b1211f752cb3132e8"
}; //[span_8](start_span)[span_8](end_span)

const app = initializeApp(firebaseConfig); //[span_9](start_span)[span_9](end_span)
const db = getFirestore(app); //[span_10](start_span)[span_10](end_span)
const auth = getAuth(app); //[span_11](start_span)[span_11](end_span)

// 🚀 SAAS MULTI-TENANT TAG 🚀
// Abhi ke liye default ID. Future me ye Login karne wale User ki ID hogi!
window.currentRestaurantId = 'rest_001';

Chart.register(ChartDataLabels); //[span_12](start_span)[span_12](end_span)

let revenueChartInstance = null; //[span_13](start_span)[span_13](end_span)
window.allCompletedOrdersForChart = []; //[span_14](start_span)[span_14](end_span)

// 🔥 AUDIO AUTHORIZATION FIX 🔥
let soundActivated = false; //[span_15](start_span)[span_15](end_span)
window.enableAudioContext = () => {
    const orderAud = document.getElementById('orderSound'); //[span_16](start_span)[span_16](end_span)
    const waiterAud = document.getElementById('waiterSound'); //[span_17](start_span)[span_17](end_span)
    orderAud.play().then(() => { orderAud.pause(); orderAud.currentTime = 0; }).catch(e=>{}); //[span_18](start_span)[span_18](end_span)
    waiterAud.play().then(() => { waiterAud.pause(); waiterAud.currentTime = 0; }).catch(e=>{}); //[span_19](start_span)[span_19](end_span)
    
    soundActivated = true; //[span_20](start_span)[span_20](end_span)
    const btn = document.getElementById('soundAuthBtn'); //[span_21](start_span)[span_21](end_span)
    btn.classList.add('active'); //[span_22](start_span)[span_22](end_span)
    btn.innerHTML = '<i class="ph-bold ph-speaker-high"></i> Sound ON'; //[span_23](start_span)[span_23](end_span)
}; //[span_24](start_span)[span_24](end_span)

setInterval(() => {
    document.querySelectorAll('.time-ago-tracker').forEach(el => {
        const orderTime = parseInt(el.getAttribute('data-time')); //[span_25](start_span)[span_25](end_span)
        const diffMins = Math.floor((Date.now() - orderTime) / 60000); //[span_26](start_span)[span_26](end_span)
        let text = diffMins <= 0 ? 'Just now' : `${diffMins} min ago`; //[span_27](start_span)[span_27](end_span)
        let color = 'var(--success)'; //[span_28](start_span)[span_28](end_span)
        if(diffMins >= 15 && diffMins < 30) color = 'var(--warning)'; //[span_29](start_span)[span_29](end_span)
        else if(diffMins >= 30) color = 'var(--danger)'; //[span_30](start_span)[span_30](end_span)
        el.innerText = `(${text})`; //[span_31](start_span)[span_31](end_span)
        el.style.color = color; //[span_32](start_span)[span_32](end_span)
    }); //[span_33](start_span)[span_33](end_span)
}, 60000); //[span_34](start_span)[span_34](end_span)

function calculateTopSeller(orders) {
    let itemCounts = {}; //[span_35](start_span)[span_35](end_span)
    orders.forEach(o => { o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }); }); //[span_36](start_span)[span_36](end_span)
    let topDish = null; let max = 0; //[span_37](start_span)[span_37](end_span)
    for(let name in itemCounts) { if(itemCounts[name] > max) { max = itemCounts[name]; topDish = name; } } //[span_38](start_span)[span_38](end_span)
    return topDish ? { name: topDish, count: max } : null; //[span_39](start_span)[span_39](end_span)
} //[span_40](start_span)[span_40](end_span)

window.updateRevenueChart = (completedOrders) => {
    const filterType = document.getElementById('chartFilter').value; //[span_41](start_span)[span_41](end_span)
    let labels = []; let revenueData = []; //[span_42](start_span)[span_42](end_span)
    const now = new Date(); const currentYear = now.getFullYear(); //[span_43](start_span)[span_43](end_span)

    if (filterType === 'weekly') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; //[span_44](start_span)[span_44](end_span)
        revenueData = [0, 0, 0, 0, 0, 0, 0]; //[span_45](start_span)[span_45](end_span)
        completedOrders.forEach(o => {
            if(o.timestamp) {
                let dayIdx = o.timestamp.toDate().getDay() - 1;  //[span_46](start_span)[span_46](end_span)
                if(dayIdx === -1) dayIdx = 6; //[span_47](start_span)[span_47](end_span)
                revenueData[dayIdx] += o.totalAmount; //[span_48](start_span)[span_48](end_span)
            }
        }); //[span_49](start_span)[span_49](end_span)
    } else if (filterType === 'monthly') {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; //[span_50](start_span)[span_50](end_span)
        revenueData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //[span_51](start_span)[span_51](end_span)
        completedOrders.forEach(o => {
            if(o.timestamp && o.timestamp.toDate().getFullYear() === currentYear) revenueData[o.timestamp.toDate().getMonth()] += o.totalAmount; //[span_52](start_span)[span_52](end_span)
        }); //[span_53](start_span)[span_53](end_span)
    } else if (filterType === 'yearly') {
        labels = [currentYear-4, currentYear-3, currentYear-2, currentYear-1, currentYear]; //[span_54](start_span)[span_54](end_span)
        revenueData = [0, 0, 0, 0, 0]; //[span_55](start_span)[span_55](end_span)
        completedOrders.forEach(o => {
            if(o.timestamp) {
                const idx = labels.indexOf(o.timestamp.toDate().getFullYear()); //[span_56](start_span)[span_56](end_span)
                if(idx !== -1) revenueData[idx] += o.totalAmount; //[span_57](start_span)[span_57](end_span)
            }
        }); //[span_58](start_span)[span_58](end_span)
    }

    let maxRev = 0; let bestLabel = ""; //[span_59](start_span)[span_59](end_span)
    revenueData.forEach((rev, idx) => { if(rev > maxRev) { maxRev = rev; bestLabel = labels[idx]; } }); //[span_60](start_span)[span_60](end_span)

    const bestDayText = document.getElementById('best-day-text'); //[span_61](start_span)[span_61](end_span)
    if(maxRev > 0) bestDayText.innerText = `🔥 Highest: ${bestLabel} (₹${maxRev})`; //[span_62](start_span)[span_62](end_span)
    else bestDayText.innerText = `Waiting for sales...`; //[span_63](start_span)[span_63](end_span)

    const ctx = document.getElementById('revenueBarChart'); //[span_64](start_span)[span_64](end_span)
    if(!ctx) return; //[span_65](start_span)[span_65](end_span)
    if(revenueChartInstance) revenueChartInstance.destroy(); //[span_66](start_span)[span_66](end_span)
    
    const isDark = document.body.getAttribute('data-theme') === 'dark'; //[span_67](start_span)[span_67](end_span)
    const textColor = isDark ? '#F5F5F5' : '#1C1C1E'; //[span_68](start_span)[span_68](end_span)

    revenueChartInstance = new Chart(ctx, {
        type: 'bar',  //[span_69](start_span)[span_69](end_span)
        data: { labels: labels, datasets: [{ label: 'Revenue (₹)', data: revenueData, backgroundColor: '#E53935', borderRadius: 6, borderWidth: 0 }] }, //[span_70](start_span)[span_70](end_span)
        options: {
            responsive: true, maintainAspectRatio: false, //[span_71](start_span)[span_71](end_span)
            scales: { y: { display: false, grid: { display: false } }, x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Poppins', size: 10 } } } }, //[span_72](start_span)[span_72](end_span)
            plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'top', color: textColor, font: { family: 'Poppins', weight: 'bold', size: 10 }, formatter: (value) => value > 0 ? `₹${value}` : '' } }, //[span_73](start_span)[span_73](end_span)
            layout: { padding: { top: 20 } }  //[span_74](start_span)[span_74](end_span)
        }
    }); //[span_75](start_span)[span_75](end_span)
}; //[span_76](start_span)[span_76](end_span)

window.downloadQR = () => {
    const qrCanvas = document.querySelector("#qrcode-box canvas"); //[span_77](start_span)[span_77](end_span)
    if(!qrCanvas) { alert("QR Code not generated yet!"); return; } //[span_78](start_span)[span_78](end_span)

    const printCanvas = document.createElement('canvas'); //[span_79](start_span)[span_79](end_span)
    const ctx = printCanvas.getContext('2d'); //[span_80](start_span)[span_80](end_span)
    printCanvas.width = 800; printCanvas.height = 1100; //[span_81](start_span)[span_81](end_span)

    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, printCanvas.width, printCanvas.height); //[span_82](start_span)[span_82](end_span)
    ctx.fillStyle = '#E53935'; ctx.fillRect(0, 0, printCanvas.width, 250); //[span_83](start_span)[span_83](end_span)

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 80px Arial'; ctx.textAlign = 'center'; //[span_84](start_span)[span_84](end_span)
    ctx.fillText('NextPlate', 400, 110); //[span_85](start_span)[span_85](end_span)
    ctx.font = 'bold 45px Arial'; ctx.fillText('Scan to View Menu & Order', 400, 190); //[span_86](start_span)[span_86](end_span)

    ctx.drawImage(qrCanvas, 200, 300, 400, 400); //[span_87](start_span)[span_87](end_span)

    ctx.fillStyle = '#1C1C1E'; ctx.font = 'bold 40px Arial'; ctx.fillText('How to scan?', 400, 800); //[span_88](start_span)[span_88](end_span)
    ctx.fillStyle = '#757575'; ctx.font = '32px Arial'; //[span_89](start_span)[span_89](end_span)
    ctx.fillText('📷 1. Open Phone Camera / Google Lens', 400, 880); //[span_90](start_span)[span_90](end_span)
    ctx.fillText('👉 2. Point at the QR Code', 400, 940); //[span_91](start_span)[span_91](end_span)
    ctx.fillText('💳 3. You can also use Paytm / PhonePe', 400, 1000); //[span_92](start_span)[span_92](end_span)

    const url = printCanvas.toDataURL("image/png"); //[span_93](start_span)[span_93](end_span)
    const a = document.createElement('a'); a.href = url; a.download = "Table_QR_Standee.png"; //[span_94](start_span)[span_94](end_span)
    document.body.appendChild(a); a.click(); document.body.removeChild(a); //[span_95](start_span)[span_95](end_span)
}; //[span_96](start_span)[span_96](end_span)

new QRCode(document.getElementById("qrcode-box"), { text: document.getElementById("menu-link").value, width: 220, height: 220, colorDark: "#1C1C1E", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H }); //[span_97](start_span)[span_97](end_span)

onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById('loginScreen'); //[span_98](start_span)[span_98](end_span)
    if (user) { loginScreen.style.display = 'none'; initAdminData(); }  //[span_99](start_span)[span_99](end_span)
    else { loginScreen.style.display = 'flex'; } //[span_100](start_span)[span_100](end_span)
}); //[span_101](start_span)[span_101](end_span)

window.loginAdmin = () => {
    const email = document.getElementById('adminEmail').value; //[span_102](start_span)[span_102](end_span)
    const pass = document.getElementById('adminPass').value; //[span_103](start_span)[span_103](end_span)
    const btn = document.getElementById('loginBtn'); //[span_104](start_span)[span_104](end_span)
    btn.innerHTML = 'Loading <i class="ph-bold ph-spinner ph-spin"></i>'; btn.disabled = true; //[span_105](start_span)[span_105](end_span)
    signInWithEmailAndPassword(auth, email, pass).catch(error => {
        alert("Login Failed: " + error.message); //[span_106](start_span)[span_106](end_span)
        btn.innerHTML = 'Login <i class="ph-bold ph-arrow-right"></i>'; btn.disabled = false; //[span_107](start_span)[span_107](end_span)
    }); //[span_108](start_span)[span_108](end_span)
}; //[span_109](start_span)[span_109](end_span)

// 🔥 Naya Smart Logout System
window.triggerLogout = () => {
    document.getElementById('logoutConfirmModal').classList.add('show');
};

window.closeLogoutModal = () => {
    document.getElementById('logoutConfirmModal').classList.remove('show');
};

window.executeLogout = () => {
    const btn = document.querySelector('#logoutConfirmModal button:last-child');
    btn.innerHTML = 'Wait <i class="ph-bold ph-spinner ph-spin"></i>'; 
    btn.disabled = true;
    
    signOut(auth).then(() => {
        window.closeLogoutModal();
        // Firebase Auth apne aap login screen dikha dega
    });
};

window.sendPromoWhatsApp = (phone) => {
    const msg = encodeURIComponent(document.getElementById('promoMessage').value || "Hello! Here is a special offer from NextPlate for you. Visit us again soon!"); //[span_113](start_span)[span_113](end_span)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank'); //[span_114](start_span)[span_114](end_span)
}; //[span_115](start_span)[span_115](end_span)

document.getElementById('reportDate').valueAsDate = new Date(); //[span_116](start_span)[span_116](end_span)
let allMenuData = []; //[span_117](start_span)[span_117](end_span)
let isInitialLoad = true; //[span_118](start_span)[span_118](end_span)
window.adminActiveCat = 'All'; //[span_119](start_span)[span_119](end_span)

// 🔥 Order Tab Switch Logic 🔥
window.switchAdminOrderTab = (tab) => {
    document.getElementById('tab-admin-live').classList.remove('active'); //[span_120](start_span)[span_120](end_span)
    document.getElementById('tab-admin-past').classList.remove('active'); //[span_121](start_span)[span_121](end_span)
    document.getElementById('admin-live-orders').style.display = 'none'; //[span_122](start_span)[span_122](end_span)
    document.getElementById('admin-past-orders').style.display = 'none'; //[span_123](start_span)[span_123](end_span)
    
    document.getElementById(`tab-admin-${tab}`).classList.add('active'); //[span_124](start_span)[span_124](end_span)
    document.getElementById(`admin-${tab}-orders`).style.display = 'flex'; //[span_125](start_span)[span_125](end_span)
}; //[span_126](start_span)[span_126](end_span)

window.initAdminData = function() {
    const selectedDate = document.getElementById('reportDate').value; //[span_127](start_span)[span_127](end_span)

    // 🔥 Filtered Menu Fetch
    const qMenu = query(collection(db, "menu_items"), where("restaurantId", "==", window.currentRestaurantId));
    onSnapshot(qMenu, (snap) => {
        document.getElementById('total-dishes').innerText = snap.size; //[span_128](start_span)[span_128](end_span)
        allMenuData = []; //[span_129](start_span)[span_129](end_span)
        snap.forEach(doc => { let d = doc.data(); d.id = doc.id; allMenuData.push(d); }); //[span_130](start_span)[span_130](end_span)
        window.filterAdminMenu();  //[span_131](start_span)[span_131](end_span)
    }); //[span_132](start_span)[span_132](end_span)

    // 🔥 Filtered Alerts (Waiter / Music)
    const qWaiter = query(collection(db, "waiter_calls"), where("restaurantId", "==", window.currentRestaurantId));
    onSnapshot(qWaiter, (waiterSnap) => {
        const qJuke = query(collection(db, "jukebox_requests"), where("restaurantId", "==", window.currentRestaurantId));
        onSnapshot(qJuke, (jukeSnap) => {
            const actionContainer = document.getElementById('action-center-container'); //[span_133](start_span)[span_133](end_span)
            const actionList = document.getElementById('action-alerts-list'); //[span_134](start_span)[span_134](end_span)
            actionList.innerHTML = ''; let hasActions = false; //[span_135](start_span)[span_135](end_span)

            waiterSnap.forEach(doc => {
                const d = doc.data(); //[span_136](start_span)[span_136](end_span)
                if(d.status === 'New') {
                    hasActions = true; //[span_137](start_span)[span_137](end_span)
                    actionList.innerHTML += `
                        <div class="action-alert">
                            <div><span style="font-size:20px; margin-right:10px;">🛎️</span><strong style="color:var(--danger);">Table ${d.tableNumber}</strong> needs Waiter! <br><span style="font-size:11px; color:var(--text-sub); margin-left:30px;">Remark: ${d.remark || 'None'}</span></div>
                            <button onclick="resolveAction('waiter_calls', '${doc.id}')" style="background:var(--danger); color:white; border:none; padding:8px 16px; border-radius:12px; font-weight:bold; cursor:pointer;">Done ✓</button>
                        </div>
                    `; //[span_138](start_span)[span_138](end_span)
                    // Play waiter music safely
                    if(document.getElementById('soundToggle').checked && !isInitialLoad && soundActivated) {
                        const now = new Date(); const callTime = d.timestamp ? d.timestamp.toDate() : now; //[span_139](start_span)[span_139](end_span)
                        if((now - callTime) < 120000) document.getElementById('waiterSound').play().catch(e=>{}); //[span_140](start_span)[span_140](end_span)
                    }
                }
            }); //[span_141](start_span)[span_141](end_span)

            actionContainer.style.display = hasActions ? 'block' : 'none'; //[span_142](start_span)[span_142](end_span)
        }); //[span_143](start_span)[span_143](end_span)
    }); //[span_144](start_span)[span_144](end_span)

    // 🔥 Filtered Orders & CRM Logic
    const qLive = query(collection(db, "orders"), where("restaurantId", "==", window.currentRestaurantId));
    onSnapshot(qLive, (snap) => {
        const liveList = document.getElementById('admin-live-orders'); //[span_145](start_span)[span_145](end_span)
        const pastList = document.getElementById('admin-past-orders'); //[span_146](start_span)[span_146](end_span)
        liveList.innerHTML = ''; pastList.innerHTML = ''; //[span_147](start_span)[span_147](end_span)
        
        let activeCount = 0; let totalRev = 0; //[span_148](start_span)[span_148](end_span)
        let crmCustomers = new Map();  //[span_149](start_span)[span_149](end_span)
        window.allCompletedOrdersForChart = [];  //[span_150](start_span)[span_150](end_span)
        let todaysCompletedOrdersForTopSeller = []; //[span_151](start_span)[span_151](end_span)

        let allOrders = [];
        snap.forEach((doc) => {
            let d = doc.data();
            d.docId = doc.id;
            allOrders.push(d);
        });

        // Firebase Index error se bachne ke liye data ko JS me hi sort kar rahe hain
        allOrders.sort((a, b) => {
            let timeA = a.timestamp ? a.timestamp.toDate().getTime() : 0;
            let timeB = b.timestamp ? b.timestamp.toDate().getTime() : 0;
            return timeA - timeB;
        });

        allOrders.forEach((data) => {
            const date = data.timestamp ? data.timestamp.toDate() : new Date(); //[span_152](start_span)[span_152](end_span)
            const todayDate = new Date(); //[span_153](start_span)[span_153](end_span)
            const isToday = date.getDate() === todayDate.getDate() && date.getMonth() === todayDate.getMonth() && date.getFullYear() === todayDate.getFullYear(); //[span_154](start_span)[span_154](end_span)
            const timeFormat = date.toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit', hour12: true}); //[span_155](start_span)[span_155](end_span)
            const displayTimeStr = isToday ? timeFormat : `${date.toLocaleDateString('en-US', {day: 'numeric', month: 'short'})}, ${timeFormat}`; //[span_156](start_span)[span_156](end_span)
            const orderDateStr = date.toISOString().split('T')[0]; //[span_157](start_span)[span_157](end_span)

            // CRM Map Extraction 
            if(data.customerPhone && data.customerPhone !== "N/A") {
                let phoneStr = String(data.customerPhone).replace(/\D/g, ''); //[span_158](start_span)[span_158](end_span)
                if(phoneStr.length >= 10) {
                    if(phoneStr.length === 10) phoneStr = '91' + phoneStr; //[span_159](start_span)[span_159](end_span)
                    crmCustomers.set(phoneStr, { name: data.customerName || "Customer", phone: phoneStr }); //[span_160](start_span)[span_160](end_span)
                }
            } //[span_161](start_span)[span_161](end_span)

            if(data.status === 'Completed') {
                window.allCompletedOrdersForChart.unshift(data);  //[span_162](start_span)[span_162](end_span)
                if(orderDateStr === selectedDate) {
                    todaysCompletedOrdersForTopSeller.push(data); //[span_163](start_span)[span_163](end_span)
                    totalRev += data.totalAmount; //[span_164](start_span)[span_164](end_span)
                }
            } //[span_165](start_span)[span_165](end_span)

            // Order Card HTML Generation
            if(orderDateStr === selectedDate || data.status === 'New' || data.status === 'Preparing') {
                let itemsHTML = ''; //[span_166](start_span)[span_166](end_span)
                data.items.forEach(item => {
                    itemsHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid var(--border); padding-bottom:6px;">
                        <span><b>${item.qty}x</b> ${item.name} <span style="color:var(--text-sub); font-size:11px;">${item.variant || ""}</span></span>
                        <span>₹${item.price * item.qty}</span>
                    </div>`; //[span_167](start_span)[span_167](end_span)
                }); //[span_168](start_span)[span_168](end_span)

                const notesHtml = (data.chefNotes && data.chefNotes !== "None" && data.chefNotes.trim() !== "") 
                    ? `<div style="background:rgba(255, 59, 48, 0.08); color:var(--danger); padding:10px 15px; border-radius:12px; font-size:12px; font-weight:700; margin-top:10px; border:1px dashed var(--danger);"><i class="ph-bold ph-warning"></i> Note: ${data.chefNotes}</div>` 
                    : ''; //[span_169](start_span)[span_169](end_span)

                const tableDisplayBadge = data.orderType === 'Takeaway' ? '<span style="background:var(--warning); font-weight:800; padding:6px 12px; border-radius:10px; color:white; font-size:12px;"><i class="ph-fill ph-shopping-bag"></i> Takeaway</span>' : `<span style="background:var(--input-bg); color:var(--text-main); font-weight:800; padding:6px 12px; border-radius:10px; font-size:12px; border:1px solid var(--border);"><i class="ph-fill ph-map-pin"></i> Table ${data.tableNumber}</span>`; //[span_170](start_span)[span_170](end_span)
                
                let statusBadge = ''; //[span_171](start_span)[span_171](end_span)
                if(data.status === 'New') statusBadge = `<span class="status-badge status-new">New</span>`; //[span_172](start_span)[span_172](end_span)
                else if(data.status === 'Preparing') statusBadge = `<span class="status-badge status-prep">Preparing...</span>`; //[span_173](start_span)[span_173](end_span)
                else if(data.status === 'Completed') statusBadge = `<span class="status-badge status-done">Delivered</span>`; //[span_174](start_span)[span_174](end_span)
                else statusBadge = `<span class="status-badge status-canc">Cancelled</span>`; //[span_175](start_span)[span_175](end_span)

                const diffMins = Math.floor((Date.now() - date.getTime()) / 60000); //[span_176](start_span)[span_176](end_span)
                let waitText = diffMins <= 0 ? 'Just now' : `${diffMins} min ago`; //[span_177](start_span)[span_177](end_span)
                let waitColor = diffMins >= 30 ? 'var(--danger)' : (diffMins >= 15 ? 'var(--warning)' : 'var(--success)'); //[span_178](start_span)[span_178](end_span)
                
                const phoneLink = (data.customerPhone && data.customerPhone !== "N/A") ? `<a href="tel:${data.customerPhone}" style="color:var(--info); font-weight:700; text-decoration:none;"><i class="ph-fill ph-phone"></i> ${data.customerPhone}</a>` : "N/A"; //[span_179](start_span)[span_179](end_span)

                let actionButtons = ''; //[span_180](start_span)[span_180](end_span)
                if(data.status === 'New') {
                    activeCount++; //[span_181](start_span)[span_181](end_span)
                    actionButtons = `
                        <button class="btn-action-new" style="background:var(--warning);" onclick="updateOrderStatus('${data.docId}', 'Preparing')"><i class="ph-fill ph-cooking-pot"></i> Cook</button>
                        <button class="btn-action-new" style="background:rgba(255,59,48,0.1); color:var(--danger); flex:0.3;" onclick="updateOrderStatus('${data.docId}', 'Cancelled')"><i class="ph-bold ph-x"></i></button>
                    `; //[span_182](start_span)[span_182](end_span)
                } else if(data.status === 'Preparing') {
                    activeCount++; //[span_183](start_span)[span_183](end_span)
                    actionButtons = `<button class="btn-action-new" style="background:var(--success);" onclick="updateOrderStatus('${data.docId}', 'Completed')"><i class="ph-fill ph-bell-ringing"></i> Serve Order</button>`; //[span_184](start_span)[span_184](end_span)
                } //[span_185](start_span)[span_185](end_span)

                let cardHtml = `
                    <div class="order-card" style="border-radius:24px; border:1px solid var(--border); margin-bottom:20px; box-shadow:var(--shadow-soft);">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--border); padding-bottom:15px; margin-bottom:10px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                ${tableDisplayBadge}
                                ${statusBadge}
                            </div>
                            <div style="display:flex; flex-direction:column; align-items:flex-end;">
                                <span style="font-size:12px; font-weight:700;">${displayTimeStr}</span>
                                ${(data.status === 'New' || data.status === 'Preparing') ? `<span class="time-ago-tracker" data-time="${date.getTime()}" style="font-size:11px; font-weight:800; color:${waitColor};">(${waitText})</span>` : ''}
                            </div>
                        </div>
                        <div style="font-size:12px; font-weight:600; color:var(--text-main); margin-top:5px; background:var(--input-bg); padding:10px 15px; border-radius:12px; display:flex; justify-content:space-between;">
                            <span><i class="ph-fill ph-user"></i> ${data.customerName || "N/A"}</span>
                            <span>${phoneLink}</span>
                        </div>
                        <div style="margin-top:15px; font-size:13px; font-weight:500;">
                            ${itemsHTML}
                            ${notesHtml}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:15px; border-top:1px dashed var(--border);">
                            <span style="font-size:18px; font-weight:800; color:var(--primary);">₹${data.totalAmount}</span>
                            <div class="order-actions-row" style="width:60%; justify-content:flex-end;">
                                ${actionButtons}
                            </div>
                        </div>
                    </div>
                `; //[span_186](start_span)[span_186](end_span)

                if (data.status === 'New' || data.status === 'Preparing') {
                    liveList.innerHTML += cardHtml; //[span_187](start_span)[span_187](end_span)
                    if(data.status === 'New' && document.getElementById('soundToggle').checked && !isInitialLoad && soundActivated) {
                        const now = new Date(); if((now - date) < 120000) document.getElementById('orderSound').play().catch(e=>{}); //[span_188](start_span)[span_188](end_span)
                    }
                } else {
                    pastList.innerHTML = cardHtml + pastList.innerHTML; //[span_189](start_span)[span_189](end_span)
                } //[span_190](start_span)[span_190](end_span)
            }
        }); //[span_191](start_span)[span_191](end_span)

        isInitialLoad = false; //[span_192](start_span)[span_192](end_span)
        document.getElementById('total-orders').innerText = activeCount; //[span_193](start_span)[span_193](end_span)
        document.getElementById('total-revenue').innerText = '₹' + totalRev; //[span_194](start_span)[span_194](end_span)
        
        if(activeCount > 0) document.getElementById('live-order-card').classList.add('pulse-live'); //[span_195](start_span)[span_195](end_span)
        else document.getElementById('live-order-card').classList.remove('pulse-live'); //[span_196](start_span)[span_196](end_span)

        if(window.updateRevenueChart) window.updateRevenueChart(window.allCompletedOrdersForChart); //[span_197](start_span)[span_197](end_span)
        
        if(liveList.innerHTML === '') liveList.innerHTML = '<div style="padding: 50px 20px; text-align: center; color: var(--text-sub);"><i class="ph-fill ph-check-circle" style="font-size:40px; color:var(--success); opacity:0.5; margin-bottom:10px;"></i><br><span style="font-size: 14px; font-weight:600;">No active orders. Kitchen is clear! 🎉</span></div>'; //[span_198](start_span)[span_198](end_span)
        if(pastList.innerHTML === '') pastList.innerHTML = '<div style="padding: 50px 20px; text-align: center; color: var(--text-sub);"><i class="ph-fill ph-clock-counter-clockwise" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><br><span style="font-size: 14px; font-weight:600;">No past orders for today.</span></div>'; //[span_199](start_span)[span_199](end_span)

        document.getElementById('total-customers').innerText = crmCustomers.size; //[span_200](start_span)[span_200](end_span)
        const crmBody = document.getElementById('crm-body'); //[span_201](start_span)[span_201](end_span)
        crmBody.innerHTML = ''; //[span_202](start_span)[span_202](end_span)
        if(crmCustomers.size === 0) { 
            crmBody.innerHTML = '<div style="padding:40px 20px; text-align:center; color:var(--text-sub);"><i class="ph-fill ph-users-slash" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><br><span style="font-size:13px; font-weight:600;">No customer phone numbers collected yet.</span></div>';  //[span_203](start_span)[span_203](end_span)
        } else {
            crmCustomers.forEach(c => {
                crmBody.innerHTML += `
                    <div class="crm-customer-row">
                        <div>
                            <div style="font-weight:700; font-size:15px; color:var(--text-main); margin-bottom:4px;">${c.name}</div>
                            <div style="font-size:12px; font-weight:600; color:var(--text-sub);"><i class="ph-fill ph-phone" style="color:var(--info);"></i> +${c.phone}</div>
                        </div>
                        <button class="btn-wa" onclick="sendPromoWhatsApp('${c.phone}')"><i class="ph-bold ph-paper-plane-right"></i> Send Promo</button>
                    </div>
                `; //[span_204](start_span)[span_204](end_span)
            }); //[span_205](start_span)[span_205](end_span)
        }
    }); //[span_206](start_span)[span_206](end_span)
} //[span_207](start_span)[span_207](end_span)

window.filterAdminCat = (cat, element) => {
    document.querySelectorAll('.admin-cat-pill').forEach(p => p.classList.remove('active')); //[span_208](start_span)[span_208](end_span)
    element.classList.add('active'); //[span_209](start_span)[span_209](end_span)
    window.adminActiveCat = cat; //[span_210](start_span)[span_210](end_span)
    window.filterAdminMenu(); //[span_211](start_span)[span_211](end_span)
}; //[span_212](start_span)[span_212](end_span)

window.filterAdminMenu = () => {
    const q = document.getElementById('adminSearchInput').value.toLowerCase(); //[span_213](start_span)[span_213](end_span)
    let filtered = allMenuData; //[span_214](start_span)[span_214](end_span)
    if (window.adminActiveCat !== 'All') filtered = filtered.filter(d => d.category === window.adminActiveCat); //[span_215](start_span)[span_215](end_span)
    if (q) filtered = filtered.filter(d => d.name.toLowerCase().includes(q)); //[span_216](start_span)[span_216](end_span)
    renderAdminMenu(filtered); //[span_217](start_span)[span_217](end_span)
}; //[span_218](start_span)[span_218](end_span)

function getPremiumIcon(category) {
    let cat = (category || '').toLowerCase(); //[span_219](start_span)[span_219](end_span)
    if (cat.includes('veg') && !cat.includes('non')) return '<i class="ph-fill ph-leaf" style="color: var(--success);"></i>'; //[span_220](start_span)[span_220](end_span)
    if (cat.includes('non')) return '<i class="ph-fill ph-bone" style="color: var(--danger);"></i>'; //[span_221](start_span)[span_221](end_span)
    if (cat.includes('starter')) return '<i class="ph-fill ph-bowl-food" style="color: var(--warning);"></i>'; //[span_222](start_span)[span_222](end_span)
    if (cat.includes('main')) return '<i class="ph-fill ph-cooking-pot" style="color: var(--primary);"></i>'; //[span_223](start_span)[span_223](end_span)
    if (cat.includes('bread')) return '<i class="ph-fill ph-bread"></i>'; //[span_224](start_span)[span_224](end_span)
    if (cat.includes('rice')) return '<i class="ph-fill ph-bowl-steam"></i>'; //[span_225](start_span)[span_225](end_span)
    if (cat.includes('drink')) return '<i class="ph-fill ph-martini"></i>'; //[span_226](start_span)[span_226](end_span)
    if (cat.includes('dessert')) return '<i class="ph-fill ph-ice-cream"></i>'; //[span_227](start_span)[span_227](end_span)
    return '<i class="ph-fill ph-fork-knife"></i>'; //[span_228](start_span)[span_228](end_span)
} //[span_229](start_span)[span_229](end_span)

window.renderAdminMenu = (data) => {
    const list = document.getElementById('menu-body'); //[span_230](start_span)[span_230](end_span)
    list.innerHTML = ''; //[span_231](start_span)[span_231](end_span)
    data.forEach(item => {
        let catBadgeClass = ''; let icon = ''; //[span_232](start_span)[span_232](end_span)
        if(item.category === 'Veg' || item.category === 'Starters') { catBadgeClass = 'color:var(--success); background:rgba(36,150,63,0.1)'; icon='<i class="ph-fill ph-leaf"></i>';} //[span_233](start_span)[span_233](end_span)
        else if(item.category === 'Non-Veg' || item.category === 'Main Course') { catBadgeClass = 'color:var(--danger); background:rgba(229,57,53,0.1)'; icon='<i class="ph-fill ph-bone"></i>';} //[span_234](start_span)[span_234](end_span)
        else if(item.category === 'Breads' || item.category === 'Rice') { catBadgeClass = 'color:var(--warning); background:rgba(255,159,0,0.1)'; icon='<i class="ph-fill ph-bowl-steam"></i>';} //[span_235](start_span)[span_235](end_span)
        else { catBadgeClass = 'color:var(--info); background:rgba(0,122,255,0.1)'; icon='<i class="ph-fill ph-brandy"></i>';} //[span_236](start_span)[span_236](end_span)
        
        const inStock = item.inStock !== false; //[span_237](start_span)[span_237](end_span)
        const opacity = inStock ? '1' : '0.5'; //[span_238](start_span)[span_238](end_span)
        const stockIcon = inStock ? '<i class="ph-bold ph-prohibit"></i>' : '<i class="ph-bold ph-check-circle"></i>'; //[span_239](start_span)[span_239](end_span)
        const stockText = inStock ? 'Mark Out of Stock' : 'Mark In Stock'; //[span_240](start_span)[span_240](end_span)
        const stockBadge = !inStock ? '<span style="color:var(--danger); font-size:10px; background:rgba(255,59,48,0.1); padding:2px 6px; border-radius:6px; margin-left:5px; border:1px solid rgba(255,59,48,0.2);">Out of Stock</span>' : ''; //[span_241](start_span)[span_241](end_span)
        
        let displayIcon = item.emoji && item.emoji.length < 5 && !item.emoji.includes('http') && item.emoji !== '🍲' ? item.emoji : getPremiumIcon(item.category); //[span_242](start_span)[span_242](end_span)

        list.innerHTML += `
            <div class="menu-item-row" style="opacity: ${opacity}">
                <div class="menu-item-info" onclick="editDish('${item.id}')">
                    <div class="dish-icon" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${displayIcon}</div>
                    <div class="dish-details">
                        <span class="dish-name">${item.name} ${stockBadge}</span>
                        <span class="dish-price">₹${item.price} <span class="cat-badge" style="${catBadgeClass}">${icon} ${item.category}</span></span>
                    </div>
                </div>
                <div class="dropdown-container">
                    <button class="btn-dots" onclick="event.stopPropagation(); toggleItemMenu('${item.id}')">⋮</button>
                    <div class="dropdown-menu" id="drop-${item.id}">
                        <div class="dropdown-item" onclick="event.stopPropagation(); toggleStock('${item.id}', ${inStock}); toggleItemMenu('${item.id}')">
                            ${stockIcon} ${stockText}
                        </div>
                        <div class="dropdown-item del-opt" onclick="event.stopPropagation(); triggerDeleteModal('${item.id}'); toggleItemMenu('${item.id}')">
                            <i class="ph-bold ph-trash"></i> Delete Dish
                        </div>
                    </div>
                </div>
            </div>
        `; //[span_243](start_span)[span_243](end_span)
    }); //[span_244](start_span)[span_244](end_span)
    if(data.length === 0) list.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-sub); font-size: 13px;"><i class="ph-fill ph-magnifying-glass" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><br>No items found.</div>'; //[span_245](start_span)[span_245](end_span)
}; //[span_246](start_span)[span_246](end_span)

window.toggleItemMenu = (id) => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if(menu.id !== `drop-${id}`) menu.classList.remove('show'); //[span_247](start_span)[span_247](end_span)
    }); //[span_248](start_span)[span_248](end_span)
    const drop = document.getElementById(`drop-${id}`); //[span_249](start_span)[span_249](end_span)
    if(drop) drop.classList.toggle('show'); //[span_250](start_span)[span_250](end_span)
}; //[span_251](start_span)[span_251](end_span)

window.addEventListener('click', (e) => {
    if(!e.target.matches('.btn-dots')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show')); //[span_252](start_span)[span_252](end_span)
    }
}); //[span_253](start_span)[span_253](end_span)

window.toggleStock = async (id, currentState) => {
    try { await updateDoc(doc(db, "menu_items", id), { inStock: !currentState }); }  //[span_254](start_span)[span_254](end_span)
    catch(e) { alert("Failed to update stock status: " + e.message); } //[span_255](start_span)[span_255](end_span)
}; //[span_256](start_span)[span_256](end_span)

window.openModal = () => {
    document.getElementById('modalTitle').innerHTML = '<i class="ph-fill ph-plus-circle text-primary"></i> Add New Dish'; //[span_257](start_span)[span_257](end_span)
    document.getElementById('dishId').value = ""; //[span_258](start_span)[span_258](end_span)
    document.getElementById('dishEmoji').value = ""; //[span_259](start_span)[span_259](end_span)
    document.getElementById('dishName').value = ""; //[span_260](start_span)[span_260](end_span)
    document.getElementById('dishCategory').value = "Starters"; //[span_261](start_span)[span_261](end_span)
    document.getElementById('dishPrice').value = ""; //[span_262](start_span)[span_262](end_span)
    document.getElementById('dishPriceHalf').value = ""; //[span_263](start_span)[span_263](end_span)
    document.getElementById('dishPricePiece').value = ""; //[span_264](start_span)[span_264](end_span)
    document.getElementById('dishModel').value = ""; //[span_265](start_span)[span_265](end_span)
    document.getElementById('dishPhoto1').value = ""; //[span_266](start_span)[span_266](end_span)
    document.getElementById('dishPhoto2').value = ""; //[span_267](start_span)[span_267](end_span)
    document.getElementById('dishPhoto3').value = ""; //[span_268](start_span)[span_268](end_span)
    document.getElementById('dishPhoto4').value = ""; //[span_269](start_span)[span_269](end_span)
    document.getElementById('addModal').classList.add('show'); //[span_270](start_span)[span_270](end_span)
}; //[span_271](start_span)[span_271](end_span)

window.closeModal = () => { document.getElementById('addModal').classList.remove('show'); }; //[span_272](start_span)[span_272](end_span)

window.editDish = (id) => {
    const dish = allMenuData.find(d => d.id === id); //[span_273](start_span)[span_273](end_span)
    if(dish) {
        document.getElementById('modalTitle').innerHTML = '<i class="ph-fill ph-pencil-simple text-primary"></i> Edit Dish'; //[span_274](start_span)[span_274](end_span)
        document.getElementById('dishId').value = dish.id; //[span_275](start_span)[span_275](end_span)
        document.getElementById('dishEmoji').value = dish.emoji || "🍲"; //[span_276](start_span)[span_276](end_span)
        document.getElementById('dishName').value = dish.name; //[span_277](start_span)[span_277](end_span)
        document.getElementById('dishCategory').value = dish.category; //[span_278](start_span)[span_278](end_span)
        document.getElementById('dishPrice').value = dish.price; //[span_279](start_span)[span_279](end_span)
        document.getElementById('dishPriceHalf').value = dish.priceHalf || ""; //[span_280](start_span)[span_280](end_span)
        document.getElementById('dishPricePiece').value = dish.pricePiece || ""; //[span_281](start_span)[span_281](end_span)
        document.getElementById('dishModel').value = dish.modelUrl || ""; //[span_282](start_span)[span_282](end_span)
        document.getElementById('dishPhoto1').value = (dish.images && dish.images[0]) ? dish.images[0] : ""; //[span_283](start_span)[span_283](end_span)
        document.getElementById('dishPhoto2').value = (dish.images && dish.images[1]) ? dish.images[1] : ""; //[span_284](start_span)[span_284](end_span)
        document.getElementById('dishPhoto3').value = (dish.images && dish.images[2]) ? dish.images[2] : ""; //[span_285](start_span)[span_285](end_span)
        document.getElementById('dishPhoto4').value = (dish.images && dish.images[3]) ? dish.images[3] : ""; //[span_286](start_span)[span_286](end_span)
        document.getElementById('addModal').classList.add('show'); //[span_287](start_span)[span_287](end_span)
    }
}; //[span_288](start_span)[span_288](end_span)

// 🔥 Update kiya hua saveDish (Yahan nayi dish ke sath Restaurant ID chipak jayegi) 🔥
window.saveDish = async () => {
    const btn = document.getElementById('saveBtn'); //[span_289](start_span)[span_289](end_span)
    btn.innerHTML = 'Saving <i class="ph-bold ph-spinner ph-spin"></i>'; btn.disabled = true; //[span_290](start_span)[span_290](end_span)
    const id = document.getElementById('dishId').value; //[span_291](start_span)[span_291](end_span)
    const imagesArray = [document.getElementById('dishPhoto1').value, document.getElementById('dishPhoto2').value, document.getElementById('dishPhoto3').value, document.getElementById('dishPhoto4').value].filter(url => url.trim() !== ""); //[span_292](start_span)[span_292](end_span)

    const data = {
        emoji: document.getElementById('dishEmoji').value, //[span_293](start_span)[span_293](end_span)
        name: document.getElementById('dishName').value, //[span_294](start_span)[span_294](end_span)
        category: document.getElementById('dishCategory').value, //[span_295](start_span)[span_295](end_span)
        price: parseFloat(document.getElementById('dishPrice').value), //[span_296](start_span)[span_296](end_span)
        priceHalf: parseFloat(document.getElementById('dishPriceHalf').value) || null, //[span_297](start_span)[span_297](end_span)
        pricePiece: parseFloat(document.getElementById('dishPricePiece').value) || null, //[span_298](start_span)[span_298](end_span)
        modelUrl: document.getElementById('dishModel').value, //[span_299](start_span)[span_299](end_span)
        images: imagesArray, //[span_300](start_span)[span_300](end_span)
        restaurantId: window.currentRestaurantId // 🚀 YAHAN MAIN TAG AAYA HAI 🚀
    };

    if(!id) data.inStock = true; //[span_301](start_span)[span_301](end_span)

    try {
        if(id) await updateDoc(doc(db, "menu_items", id), data); //[span_302](start_span)[span_302](end_span)
        else await addDoc(collection(db, "menu_items"), data); //[span_303](start_span)[span_303](end_span)
        closeModal(); //[span_304](start_span)[span_304](end_span)
    } catch(e) { alert("Error: " + e.message); } //[span_305](start_span)[span_305](end_span)
    btn.innerHTML = '<i class="ph-bold ph-floppy-disk"></i> Save & Publish'; btn.disabled = false; //[span_306](start_span)[span_306](end_span)
}; //[span_307](start_span)[span_307](end_span)

let deleteIdTemp = null; //[span_308](start_span)[span_308](end_span)
window.triggerDeleteModal = (id) => { deleteIdTemp = id; document.getElementById('deleteConfirmModal').classList.add('show'); }; //[span_309](start_span)[span_309](end_span)
window.closeDeleteModal = () => { deleteIdTemp = null; document.getElementById('deleteConfirmModal').classList.remove('show'); }; //[span_310](start_span)[span_310](end_span)

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if(deleteIdTemp) {
        const btn = document.getElementById('confirmDeleteBtn'); //[span_311](start_span)[span_311](end_span)
        btn.innerText = "Deleting..."; btn.disabled = true; //[span_312](start_span)[span_312](end_span)
        try {
            await deleteDoc(doc(db, "menu_items", deleteIdTemp)); //[span_313](start_span)[span_313](end_span)
            closeDeleteModal(); //[span_314](start_span)[span_314](end_span)
        } catch(e) { alert("Delete failed: " + e.message); } //[span_315](start_span)[span_315](end_span)
        btn.innerText = "Yes, Delete"; btn.disabled = false; //[span_316](start_span)[span_316](end_span)
    }
}); //[span_317](start_span)[span_317](end_span)

window.updateOrderStatus = async (orderId, newStatus) => {
    try { await updateDoc(doc(db, "orders", orderId), { status: newStatus }); }  //[span_318](start_span)[span_318](end_span)
    catch(e) { alert("Error updating order: " + e.message); } //[span_319](start_span)[span_319](end_span)
}; //[span_320](start_span)[span_320](end_span)

window.switchTab = (tabId, element = null) => {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active')); //[span_321](start_span)[span_321](end_span)
    document.getElementById('section-' + tabId).classList.add('active'); //[span_322](start_span)[span_322](end_span)
    
    if(element) {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active')); //[span_323](start_span)[span_323](end_span)
        element.classList.add('active'); //[span_324](start_span)[span_324](end_span)
    }
}; //[span_325](start_span)[span_325](end_span)

window.toggleTheme = () => {
    if(document.getElementById('themeToggle').checked) document.body.setAttribute('data-theme', 'dark'); //[span_326](start_span)[span_326](end_span)
    else document.body.removeAttribute('data-theme'); //[span_327](start_span)[span_327](end_span)
    
    if(window.updateRevenueChart && window.allCompletedOrdersForChart.length > 0) {
       window.updateRevenueChart(window.allCompletedOrdersForChart); //[span_328](start_span)[span_328](end_span)
    }
}; //[span_329](start_span)[span_329](end_span)
