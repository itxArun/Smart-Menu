import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail, updatePassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// 🔥 FIREBASE CONFIGURATION 🔥
const firebaseConfig = {
    apiKey: "AIzaSyDHfU0QaryYKy7zfhFXQdMEqh1KdIApNXY",
    authDomain: "itx-arun-bdf24.firebaseapp.com",
    projectId: "itx-arun-bdf24",
    storageBucket: "itx-arun-bdf24.firebasestorage.app",
    messagingSenderId: "442083262265",
    appId: "1:442083262265:web:3e023b1211f752cb3132e8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.currentRestaurantId = null; 

if(typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}
const dateInput = document.getElementById('reportDate');
if(dateInput) dateInput.valueAsDate = new Date();

// ==========================================
// 🔐 AUTHENTICATION & MULTI-TENANT LOGIC
// ==========================================

window.showLoginError = (message) => {
    const errorBox = document.getElementById('loginErrorBox');
    const errorText = document.getElementById('loginErrorText');
    if (errorBox && errorText) {
        errorText.innerText = message;
        errorBox.style.display = 'flex';
    }
};

window.hideLoginError = () => {
    const errorBox = document.getElementById('loginErrorBox');
    if (errorBox) errorBox.style.display = 'none';
};

window.loginAdmin = () => {
    window.hideLoginError();
    const email = document.getElementById('adminEmail').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    const btn = document.getElementById('loginBtn');
    
    if(!email || !pass) {
        window.showLoginError("Please enter both Email and Password.");
        return;
    }

    if(btn) {
        btn.innerHTML = 'Verifying <i class="ph-bold ph-spinner ph-spin"></i>'; 
        btn.disabled = true;
    }
    
    signInWithEmailAndPassword(auth, email, pass).catch(error => {
        let errMsg = "Incorrect Email or Password! Please check and try again.";
        if (error.code === 'auth/invalid-email') {
            errMsg = "Please enter a valid email address.";
        } else if (error.code === 'auth/too-many-requests') {
            errMsg = "Too many failed attempts. Please try again later.";
        } else if (error.code === 'auth/network-request-failed') {
            errMsg = "Network error! Please check your internet connection.";
        }
        
        window.showLoginError(errMsg);
        
        if(btn) {
            btn.innerHTML = 'Login to Dashboard <i class="ph-bold ph-arrow-right"></i>'; 
            btn.disabled = false;
        }
    });
};

window.togglePasswordVisibility = () => {
    const passInput = document.getElementById('adminPass');
    const eyeIcon = document.getElementById('togglePassEye');
    if (passInput && eyeIcon) {
        if (passInput.type === 'password') {
            passInput.type = 'text';
            eyeIcon.classList.replace('ph-eye', 'ph-eye-slash');
        } else {
            passInput.type = 'password';
            eyeIcon.classList.replace('ph-eye-slash', 'ph-eye');
        }
    }
};

const loginBtn = document.getElementById('loginBtn');
if(loginBtn) loginBtn.onclick = window.loginAdmin;

const passInput = document.getElementById('adminPass');
if(passInput) {
    passInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') window.loginAdmin();
    });
}

onAuthStateChanged(auth, async (user) => {
    const loginScreen = document.getElementById('loginScreen');
    const btn = document.getElementById('loginBtn');
    const shield = document.getElementById('zeroFlashShield');
    
    if (user) { 
        try {
            let q = query(collection(db, "merchants"), where("email", "==", user.email));
            let querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                q = query(collection(db, "merchants"), where("uid", "==", user.uid));
                querySnapshot = await getDocs(q);
            }
            
            if (!querySnapshot.empty) {
                const merchantData = querySnapshot.docs[0].data();
                window.currentRestaurantId = merchantData.restaurantId; 
                
                const realName = merchantData.restaurantName || "Partner POS";

                const brandLogos = document.querySelectorAll('#admin-restaurant-name, #qr-brand-name, .brand-logo');
                brandLogos.forEach(el => el.innerText = realName);
                
                localStorage.setItem('crave_hotel_name_cache', realName);
                localStorage.setItem('crave_restaurant_id_cache', merchantData.restaurantId);
                localStorage.setItem('pos_is_logged_in', 'true');

                if(loginScreen) loginScreen.style.setProperty('display', 'none', 'important'); 
                if(typeof window.initAdminData === 'function') window.initAdminData(); 

            } else {
                localStorage.removeItem('pos_is_logged_in');
                if (shield) shield.remove();
                await signOut(auth);
                window.showLoginError("No Restaurant Profile linked with this Account! Please contact Support.");
                if(loginScreen) loginScreen.style.setProperty('display', 'flex', 'important');
                if(btn) {
                    btn.innerHTML = 'Login to Dashboard <i class="ph-bold ph-arrow-right"></i>'; 
                    btn.disabled = false;
                }
            }

        } catch (error) {
            console.error("Error fetching merchant data:", error);
            localStorage.removeItem('pos_is_logged_in');
            if (shield) shield.remove();
            await signOut(auth);
            window.showLoginError("Authentication Error: " + error.message);
            if(loginScreen) loginScreen.style.setProperty('display', 'flex', 'important');
        }
    } else { 
        localStorage.removeItem('pos_is_logged_in');
        if (shield) shield.remove();
        if(loginScreen) loginScreen.style.setProperty('display', 'flex', 'important'); 
    }
});

window.triggerLogout = () => {
    const modal = document.getElementById('logoutConfirmModal');
    if(modal) modal.classList.add('show');
};

window.closeLogoutModal = () => {
    const modal = document.getElementById('logoutConfirmModal');
    if(modal) modal.classList.remove('show');
};

window.executeLogout = () => {
    const btn = document.querySelector('#logoutConfirmModal button:last-child');
    if(btn) {
        btn.innerHTML = 'Wait <i class="ph-bold ph-spinner ph-spin"></i>';
        btn.disabled = true;
    }
    
    localStorage.removeItem('crave_hotel_name_cache');
    localStorage.removeItem('crave_restaurant_id_cache');
    localStorage.removeItem('pos_is_logged_in');
    
    signOut(auth).then(() => {
        window.closeLogoutModal();
        if(btn) {
            btn.innerHTML = 'Yes, Logout';
            btn.disabled = false;
        }
        location.reload();
    });
};

// ==========================================
// 🔊 SOUND & UTILS (SILENT AUDIO AUTOPLAY)
// ==========================================
let soundActivated = false;

window.enableAudioContext = () => {
    const orderAud = document.getElementById('orderSound');
    const waiterAud = document.getElementById('waiterSound');
    if(orderAud) orderAud.play().then(() => { orderAud.pause(); orderAud.currentTime = 0; }).catch(e=>{});
    if(waiterAud) waiterAud.play().then(() => { waiterAud.pause(); waiterAud.currentTime = 0; }).catch(e=>{});
    soundActivated = true;
};

document.addEventListener('click', () => {
    if (!soundActivated) {
        window.enableAudioContext();
    }
}, { once: true });

setInterval(() => {
    document.querySelectorAll('.time-ago-tracker').forEach(el => {
        const orderTime = parseInt(el.getAttribute('data-time'));
        const diffMins = Math.floor((Date.now() - orderTime) / 60000);
        let text = diffMins <= 0 ? 'Just now' : `${diffMins} min ago`;
        let color = 'var(--success)';
        if(diffMins >= 15 && diffMins < 30) color = 'var(--warning)';
        else if(diffMins >= 30) color = 'var(--danger)';
        el.innerText = `⏱️ ${text}`;
        el.style.color = color;
    });
}, 60000);

// ==========================================
// 📊 CHARTS & CRM
// ==========================================
let revenueChartInstance = null;
window.allCompletedOrdersForChart = [];

window.updateRevenueChart = (completedOrders) => {
    const filterType = document.getElementById('chartFilter').value;
    let labels = []; let revenueData = [];
    const now = new Date(); const currentYear = now.getFullYear();

    if (filterType === 'weekly') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        revenueData = [0, 0, 0, 0, 0, 0, 0];
        completedOrders.forEach(o => {
            if(o.timestamp) {
                let dayIdx = o.timestamp.toDate().getDay() - 1; 
                if(dayIdx === -1) dayIdx = 6;
                revenueData[dayIdx] += o.totalAmount;
            }
        });
    } else if (filterType === 'monthly') {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        revenueData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        completedOrders.forEach(o => {
            if(o.timestamp && o.timestamp.toDate().getFullYear() === currentYear) revenueData[o.timestamp.toDate().getMonth()] += o.totalAmount;
        });
    } else if (filterType === 'yearly') {
        labels = [currentYear-4, currentYear-3, currentYear-2, currentYear-1, currentYear];
        revenueData = [0, 0, 0, 0, 0];
        completedOrders.forEach(o => {
            if(o.timestamp) {
                const idx = labels.indexOf(o.timestamp.toDate().getFullYear());
                if(idx !== -1) revenueData[idx] += o.totalAmount;
            }
        });
    }

    let maxRev = 0; let bestLabel = "";
    revenueData.forEach((rev, idx) => { if(rev > maxRev) { maxRev = rev; bestLabel = labels[idx]; } });

    const bestDayText = document.getElementById('best-day-text');
    if(bestDayText) {
        if(maxRev > 0) bestDayText.innerText = `🔥 Highest: ${bestLabel} (₹${maxRev})`;
        else bestDayText.innerText = `Waiting for sales...`;
    }

    const ctx = document.getElementById('revenueBarChart');
    if(!ctx) return;
    if(revenueChartInstance) revenueChartInstance.destroy();
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#F5F5F5' : '#1C1C1E';

    revenueChartInstance = new Chart(ctx, {
        type: 'bar', 
        data: { labels: labels, datasets: [{ label: 'Revenue (₹)', data: revenueData, backgroundColor: '#E53935', borderRadius: 6, borderWidth: 0 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { display: false, grid: { display: false } }, x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Poppins', size: 10 } } } },
            plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'top', color: textColor, font: { family: 'Poppins', weight: 'bold', size: 10 }, formatter: (value) => value > 0 ? `₹${value}` : '' } },
            layout: { padding: { top: 20 } } 
        }
    });
};

window.sendPromoWhatsApp = (phone) => {
    const msgInput = document.getElementById('promoMessage');
    const msg = encodeURIComponent(msgInput ? msgInput.value : "Hello! Visit us again soon!");
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
};

// ==========================================
// 🍔 MENU & INVENTORY & 3-TAB PIPELINE DATA
// ==========================================
let allMenuData = [];
let isInitialLoad = true;
window.adminActiveCat = 'All';

window.initAdminData = function() {
    const reportDateEl = document.getElementById('reportDate');
    const selectedDate = reportDateEl ? reportDateEl.value : new Date().toISOString().split('T')[0];

    const qMenu = query(collection(db, "menu_items"), where("restaurantId", "==", window.currentRestaurantId));
    onSnapshot(qMenu, (snap) => {
        const totalDishes = document.getElementById('total-dishes');
        if(totalDishes) totalDishes.innerText = snap.size;
        
        allMenuData = [];
        snap.forEach(doc => { let d = doc.data(); d.id = doc.id; allMenuData.push(d); });
        window.filterAdminMenu(); 
    });

    const qWaiter = query(collection(db, "waiter_calls"), where("restaurantId", "==", window.currentRestaurantId));
    onSnapshot(qWaiter, (waiterSnap) => {
        const actionContainer = document.getElementById('action-center-container');
        const actionList = document.getElementById('action-alerts-list');
        if(!actionContainer || !actionList) return;

        actionList.innerHTML = ''; let hasActions = false;

        waiterSnap.forEach(doc => {
            const d = doc.data();
            if(d.status === 'New') {
                hasActions = true;
                actionList.innerHTML += `
                    <div class="action-alert">
                        <div><span style="font-size:20px; margin-right:10px;">🛎️</span><strong style="color:var(--danger);">Table ${d.tableNumber}</strong> needs Waiter! <br><span style="font-size:11px; color:var(--text-sub); margin-left:30px;">Remark: ${d.remark || 'None'}</span></div>
                        <button onclick="resolveAction('waiter_calls', '${doc.id}')" style="background:var(--danger); color:white; border:none; padding:8px 16px; border-radius:12px; font-weight:bold; cursor:pointer;">Done ✓</button>
                    </div>
                `;
                const soundToggle = document.getElementById('soundToggle');
                if(soundToggle && soundToggle.checked && !isInitialLoad && soundActivated) {
                    const now = new Date(); const callTime = d.timestamp ? d.timestamp.toDate() : now;
                    if((now - callTime) < 120000) document.getElementById('waiterSound').play().catch(e=>{});
                }
            }
        });
        actionContainer.style.display = hasActions ? 'block' : 'none';
    });

    const qReviews = query(collection(db, "reviews"), where("restaurantId", "==", window.currentRestaurantId));
    onSnapshot(qReviews, (revSnap) => {
        const reviewsContainer = document.getElementById('reviews-feed-list');
        const avgBadge = document.getElementById('avg-rating-badge');
        if (!reviewsContainer) return;

        let totalStars = 0;
        let count = 0;
        reviewsContainer.innerHTML = '';

        revSnap.forEach(doc => {
            const r = doc.data();
            count++;
            totalStars += (r.rating || 5);
            
            const starsHTML = "★".repeat(r.rating || 5) + "☆".repeat(5 - (r.rating || 5));
            const dateStr = r.timestamp ? r.timestamp.toDate().toLocaleDateString('en-US', {day: 'numeric', month: 'short'}) : 'Recent';

            reviewsContainer.innerHTML += `
                <div style="padding: 14px 20px; border-bottom: 1px solid var(--border); background: var(--bg-card); display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; font-size: 13px; color: var(--text-main);"><i class="ph-fill ph-user" style="color: var(--primary);"></i> ${r.customerName || "Happy Customer"}</span>
                        <span style="font-size: 11px; color: var(--text-sub); font-weight: 600;">${dateStr}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #FF9F00; font-weight: 800; font-size: 14px; letter-spacing: 2px;">${starsHTML}</span>
                        <span style="font-size: 12px; color: var(--text-sub); font-style: italic;">"${r.comment || 'Great food & service!'}"</span>
                    </div>
                </div>
            `;
        });

        if (count === 0) {
            reviewsContainer.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-sub); font-size: 13px;"><i class="ph-fill ph-star" style="font-size: 32px; opacity: 0.3; margin-bottom: 6px;"></i><br>No customer reviews received yet.</div>';
            if (avgBadge) avgBadge.innerText = "No Ratings";
        } else {
            const avg = (totalStars / count).toFixed(1);
            if (avgBadge) avgBadge.innerText = `${avg} ★ (${count})`;
        }
    });
    
    // 3. 🚨 3-TAB PIPELINE ORDERS BOUNCER & SAAS ANALYTICS
    const qLive = query(collection(db, "orders"), where("restaurantId", "==", window.currentRestaurantId));
    onSnapshot(qLive, (snap) => {
        const newList = document.getElementById('admin-new-orders');
        const activeList = document.getElementById('admin-active-orders');
        
        if(!newList || !activeList) return;

        // 🔥 FIX: Sirf New aur Active list clear karo. History list render function manage karega!
        newList.innerHTML = ''; activeList.innerHTML = '';
        
        let newCount = 0; let kitchenCount = 0; let pastCount = 0;
        let totalRev = 0; window.crmCustomersMap.clear(); 
        window.allCompletedOrdersForChart = []; 

        let saasPending = 0; let saasPreparing = 0; let saasServed = 0; let saasCancelled = 0;
        let revWeek = 0; let revMonth = 0; let dishCount = {}; 

        let allOrders = [];
        snap.forEach((doc) => {
            let d = doc.data();
            d.docId = doc.id;
            allOrders.push(d);
        });

        allOrders.forEach((data) => {
            const date = data.timestamp ? data.timestamp.toDate() : new Date();
            const todayDate = new Date();
            const isToday = date.getDate() === todayDate.getDate() && date.getMonth() === todayDate.getMonth() && date.getFullYear() === todayDate.getFullYear();
            const timeFormat = date.toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit', hour12: true});
            const displayTimeStr = isToday ? timeFormat : `${date.toLocaleDateString('en-US', {day: 'numeric', month: 'short'})}, ${timeFormat}`;
            const orderDateStr = date.toISOString().split('T')[0];

            if(data.customerPhone && data.customerPhone !== "N/A") {
                let phoneStr = String(data.customerPhone).replace(/\D/g, '');
                if(phoneStr.length >= 10) {
                    if(phoneStr.length === 10) phoneStr = '91' + phoneStr;
                    
                    if (!window.crmCustomersMap.has(phoneStr)) {
                        window.crmCustomersMap.set(phoneStr, {
                            name: data.customerName || "Customer",
                            phone: phoneStr,
                            totalSpend: 0,
                            orderCount: 0,
                            ordersList: [],
                            dishCount: {}
                        });
                    }
                    const cust = window.crmCustomersMap.get(phoneStr);
                    if (data.customerName && data.customerName !== "Customer") cust.name = data.customerName;
                    
                    if (data.status === 'Completed' || data.status === 'Served') {
                        cust.totalSpend += (data.totalAmount || 0);
                        cust.orderCount += 1;
                        cust.ordersList.unshift(data);
                        (data.items || []).forEach(item => {
                            cust.dishCount[item.name] = (cust.dishCount[item.name] || 0) + (item.qty || 1);
                        });
                    }
                }
            }

            if (isToday) {
                if (data.status === 'New') saasPending++;
                if (data.status === 'Preparing') saasPreparing++;
                if (data.status === 'Completed' || data.status === 'Served') saasServed++;
                if (data.status === 'Cancelled') saasCancelled++;
            }

            if(data.status === 'Completed' || data.status === 'Served') {
                window.allCompletedOrdersForChart.unshift(data); 
                if(orderDateStr === selectedDate) totalRev += data.totalAmount;
                
                const diffTime = Math.abs(todayDate - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays <= 7) revWeek += data.totalAmount;
                if (date.getMonth() === todayDate.getMonth() && date.getFullYear() === todayDate.getFullYear()) {
                    revMonth += data.totalAmount;
                }
                if(data.items) {
                    data.items.forEach(item => { dishCount[item.name] = (dishCount[item.name] || 0) + item.qty; });
                }
            }

            // 🔥 FIX: Sirf New aur Active cards ko yahan generate karo, History alag se chalega
            if(data.status === 'New' || data.status === 'Accepted' || data.status === 'Preparing' || data.status === 'Ready') {
                let itemsHTML = '';
                data.items.forEach(item => {
                    itemsHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid var(--border); padding-bottom:6px;">
                        <span><b>${item.qty}x</b> ${item.name} <span style="color:var(--text-sub); font-size:11px;">${item.variant || ""}</span></span>
                        <span>₹${item.price * item.qty}</span>
                    </div>`;
                });

                const notesHtml = (data.chefNotes && data.chefNotes !== "None" && data.chefNotes.trim() !== "") 
                    ? `<div style="background:rgba(255, 59, 48, 0.08); color:var(--danger); padding:10px 15px; border-radius:12px; font-size:12px; font-weight:700; margin-top:10px; border:1px dashed var(--danger);"><i class="ph-bold ph-warning"></i> Note: ${data.chefNotes}</div>` 
                    : '';

                const cardTypeClass = data.orderType === 'Takeaway' ? 'type-takeaway' : 'type-dinein';
                const tableDisplayBadge = data.orderType === 'Takeaway' 
                    ? `<div class="table-id-box" style="color:var(--warning);"><div class="number-avatar" style="background:var(--warning);"><i class="ph-bold ph-shopping-bag"></i></div> Takeaway</div>` 
                    : `<div class="table-id-box"><div class="number-avatar">${String(data.tableNumber || '#').padStart(2, '0')}</div> Table ${data.tableNumber}</div>`;
                
                let statusBadge = '';
                if(data.status === 'New') statusBadge = `<span class="status-badge status-new"><i class="ph-bold ph-bell-ringing"></i> New</span>`;
                else if(data.status === 'Accepted') statusBadge = `<span class="status-badge status-accepted"><i class="ph-bold ph-thumbs-up"></i> Accepted</span>`;
                else if(data.status === 'Preparing') statusBadge = `<span class="status-badge status-prep"><i class="ph-bold ph-cooking-pot"></i> Cooking</span>`;
                else if(data.status === 'Ready') statusBadge = `<span class="status-badge status-ready"><i class="ph-bold ph-check-circle"></i> Ready</span>`;

                const isPaid = data.isPaid === true;
                const paidBadgeHTML = isPaid 
                    ? `<button onclick="toggleOrderPayment('${data.docId}', true)" style="background:rgba(36,150,63,0.15); color:var(--success); border:1px solid var(--success); padding:5px 12px; border-radius:10px; font-size:11px; font-weight:800; cursor:pointer;"><i class="ph-bold ph-check-circle"></i> PAID</button>`
                    : `<button onclick="toggleOrderPayment('${data.docId}', false)" style="background:rgba(229,57,53,0.15); color:var(--danger); border:1px solid var(--danger); padding:5px 12px; border-radius:10px; font-size:11px; font-weight:800; cursor:pointer;"><i class="ph-bold ph-x-circle"></i> UNPAID</button>`;

                let actionButtons = '';
                if(data.status === 'New') {
                    actionButtons = `<button class="btn-action-new" style="background:var(--success);" onclick="updateOrderStatus('${data.docId}', 'Accepted')">Accept Order ✓</button>
                                     <button class="btn-action-new" style="background:rgba(255,59,48,0.1); color:var(--danger); flex:0.3;" onclick="updateOrderStatus('${data.docId}', 'Cancelled')"><i class="ph-bold ph-x"></i></button>`;
                } else if(data.status === 'Accepted') {
                    actionButtons = `
    <button class="btn-action-new" style="background:var(--info); color: white;" onclick="printKOT('${data.docId}')"><i class="ph-bold ph-printer"></i> Print KOT</button>
    <button class="btn-action-new" style="background:var(--warning);" onclick="updateOrderStatus('${data.docId}', 'Preparing')">Start Cooking 🍳</button>
`;
                } else if(data.status === 'Preparing') {
                    actionButtons = `<button class="btn-action-new" style="background:var(--success);" onclick="updateOrderStatus('${data.docId}', 'Ready')">Mark as Ready 🔔</button>`;
                } else if(data.status === 'Ready') {
                    actionButtons = `<button class="btn-action-new" style="background:var(--primary);" onclick="updateOrderStatus('${data.docId}', 'Served')">Served & Paid 🎉</button>`;
                }

                let diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
                let waitText = diffMins <= 0 ? 'Just now' : `${diffMins} min ago`;
                let waitColor = diffMins >= 30 ? 'var(--danger)' : (diffMins >= 15 ? 'var(--warning)' : 'var(--success)');
                const phoneLink = (data.customerPhone && data.customerPhone !== "N/A") ? `<a href="tel:${data.customerPhone}" style="color:var(--primary); font-size:16px;"><i class="ph-bold ph-phone-call"></i></a>` : '';

                let cardHtml = `
                    <div class="order-card premium-hover ${cardTypeClass}">
                        <div class="card-top-row">
                            ${tableDisplayBadge}
                            <div class="order-time-display">
                                <span class="main-time">${displayTimeStr}</span>
                                <span class="time-ago-tracker ago-time" data-time="${date.getTime()}" style="color:${waitColor};">⏱️ ${waitText}</span>
                            </div>
                        </div>
                        <div class="card-badge-row">${statusBadge}${paidBadgeHTML}</div>
                        <div style="font-size:12px; font-weight:600; color:var(--text-main); background:var(--input-bg); padding:10px 15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                            <span><i class="ph-fill ph-user" style="color:var(--primary);"></i> ${data.customerName || "N/A"}</span>
                            <span>${phoneLink}</span>
                        </div>
                        <div style="margin-top:14px; font-size:13px; font-weight:500;">${itemsHTML}${notesHtml}</div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:15px; border-top:1px dashed var(--border);">
                            <span style="font-size:18px; font-weight:800; color:var(--primary);">₹${data.totalAmount}</span>
                            <div class="order-actions-row" style="width:65%; justify-content:flex-end;">${actionButtons}</div>
                        </div>
                    </div>`;

                if (data.status === 'New') {
                    newCount++;
                    newList.innerHTML = cardHtml + newList.innerHTML;
                    const soundToggle = document.getElementById('soundToggle');
                    if(soundToggle && soundToggle.checked && !isInitialLoad && soundActivated) {
                        if((new Date() - date) < 120000) document.getElementById('orderSound').play().catch(e=>{});
                    }
                } else {
                    kitchenCount++;
                    activeList.innerHTML += cardHtml;
                }
            } else if (orderDateStr === selectedDate) {
                pastCount++; // Aaj ke served orders ka badge counter
            }
        });

        isInitialLoad = false;
        
        const bNew = document.getElementById('badge-new-count');
        const bActive = document.getElementById('badge-active-count');
        const bPast = document.getElementById('badge-past-count');
        // 🔥 UPDATE NOTIFICATION BELL BADGE
        const bellBadge = document.getElementById('nav-bell-badge');
        if (bellBadge) {
            bellBadge.innerText = newCount;
            bellBadge.style.display = newCount > 0 ? 'flex' : 'none';
        }
        if(bNew) bNew.innerText = newCount;
        if(bActive) bActive.innerText = kitchenCount;
        if(bPast) bPast.innerText = pastCount;

        const pSale = document.getElementById('pulse-today-sale');
        const pTotal = document.getElementById('pulse-total-orders');
        const pActive = document.getElementById('pulse-kitchen-active');
        if(pSale) pSale.innerText = '₹' + totalRev;
        if(pTotal) pTotal.innerText = saasPending + saasPreparing + saasServed + saasCancelled;
        if(pActive) pActive.innerText = kitchenCount;

        const totOrders = document.getElementById('total-orders');
        const totRev = document.getElementById('total-revenue');
        if(totOrders) totOrders.innerText = newCount + kitchenCount;
        if(totRev) totRev.innerText = '₹' + totalRev;

        const setStat = (id, val, prefix = "") => {
            const el = document.getElementById(id);
            if(el) {
                el.classList.remove('skeleton');
                let start = 0;
                const duration = 1000; 
                const stepTime = Math.abs(Math.floor(duration / (val || 1)));
                if(val === 0) { el.innerText = prefix + val; return; }
                const timer = setInterval(() => {
                    start += Math.ceil(val / 20);
                    if(start >= val) { start = val; clearInterval(timer); }
                    el.innerText = prefix + start;
                }, stepTime);
            }
        };

        setStat('saas-total-orders', saasPending + saasPreparing + saasServed + saasCancelled);
        setStat('saas-pending', saasPending);
        setStat('saas-preparing', saasPreparing);
        setStat('saas-served', saasServed);
        setStat('saas-cancelled', saasCancelled);
        setStat('rev-today', totalRev, "₹");
        setStat('rev-week', revWeek, "₹");
        setStat('rev-month', revMonth, "₹");

        let topDish = Object.keys(dishCount).sort((a,b) => dishCount[b] - dishCount[a])[0];
        const topDishEl = document.getElementById('top-dish-name');
        if(topDishEl) {
            topDishEl.classList.remove('skeleton');
            topDishEl.innerText = topDish ? `${topDish} (${dishCount[topDish]} sold)` : "Need more orders";
        }
        
        const topCatEl = document.getElementById('top-cat-name');
        if(topCatEl) {
            topCatEl.classList.remove('skeleton');
            topCatEl.innerText = topDish ? "Trending 🔥" : "Need more orders";
        }

        if(window.updateRevenueChart) window.updateRevenueChart(window.allCompletedOrdersForChart);
        
        if(newList.innerHTML === '') newList.innerHTML = '<div style="padding: 50px 20px; text-align: center; color: var(--text-sub);"><i class="ph-fill ph-bell-slash" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><br><span style="font-size: 14px; font-weight:600;">No new incoming orders right now.</span></div>';
        if(activeList.innerHTML === '') activeList.innerHTML = '<div style="padding: 50px 20px; text-align: center; color: var(--text-sub);"><i class="ph-fill ph-check-circle" style="font-size:40px; color:var(--success); opacity:0.5; margin-bottom:10px;"></i><br><span style="font-size: 14px; font-weight:600;">Kitchen is clear! No cooking pending. 🎉</span></div>';

        const totCustomers = document.getElementById('total-customers');
        if(totCustomers) totCustomers.innerText = window.crmCustomersMap.size;
        
        // 🔥 MASTER ORDERS LIST UPDATE & CRM TABLE RENDER
        window.allOrdersMaster = allOrders;
        window.renderPastOrdersList();

        const crmBody = document.getElementById('crm-body');
        if(crmBody) {
            crmBody.innerHTML = '';
            if(window.crmCustomersMap.size === 0) { 
                crmBody.innerHTML = '<div style="padding:40px 20px; text-align:center; color:var(--text-sub);"><i class="ph-fill ph-users-slash" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><br><span style="font-size:13px; font-weight:600;">No customer phone numbers collected yet.</span></div>'; 
            } else {
                window.crmCustomersMap.forEach((c, phoneKey) => {
                    crmBody.innerHTML += `
                        <div class="crm-customer-row premium-hover" onclick="openCustomerHistory('${phoneKey}')" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border); background: var(--bg-card); margin-bottom: 8px; border-radius: 14px;">
                            <div>
                                <div style="font-weight: 700; font-size: 15px; color: var(--text-main); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                                    <i class="ph-fill ph-user-circle" style="color: var(--primary);"></i> ${c.name}
                                </div>
                                <div style="font-size: 12px; font-weight: 600; color: var(--text-sub);">
                                    <i class="ph-fill ph-phone" style="color: var(--info);"></i> +${c.phone} • <span style="color: var(--success); font-weight: 800;">₹${c.totalSpend} (${c.orderCount} orders)</span>
                                </div>
                            </div>
                            <button class="btn-wa" onclick="event.stopPropagation(); sendPromoWhatsApp('${c.phone}')" style="background: rgba(37, 211, 102, 0.15); color: #25D366; border: 1px solid rgba(37, 211, 102, 0.3); padding: 8px 12px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <i class="ph-bold ph-paper-plane-right"></i> Promo
                            </button>
                        </div>
                    `;
                });
            }
        }
    });
};

window.toggleOrderPayment = async (orderId, isCurrentlyPaid) => {
    try {
        await updateDoc(doc(db, "orders", orderId), {
            isPaid: !isCurrentlyPaid
        });
    } catch(e) {
        alert("Payment status update failed: " + e.message);
    }
};

window.filterAdminCat = (cat, element) => {
    document.querySelectorAll('.admin-cat-pill').forEach(p => p.classList.remove('active'));
    element.classList.add('active');
    window.adminActiveCat = cat;
    window.filterAdminMenu();
};

window.filterAdminMenu = () => {
    const searchInput = document.getElementById('adminSearchInput');
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    let filtered = allMenuData;
    if (window.adminActiveCat !== 'All') filtered = filtered.filter(d => d.category === window.adminActiveCat);
    if (q) filtered = filtered.filter(d => d.name.toLowerCase().includes(q));
    renderAdminMenu(filtered);
};

function getPremiumIcon(category) {
    let cat = (category || '').toLowerCase();
    if (cat.includes('veg') && !cat.includes('non')) return '<i class="ph-fill ph-leaf" style="color: var(--success);"></i>';
    if (cat.includes('non')) return '<i class="ph-fill ph-bone" style="color: var(--danger);"></i>';
    if (cat.includes('starter')) return '<i class="ph-fill ph-bowl-food" style="color: var(--warning);"></i>';
    if (cat.includes('main')) return '<i class="ph-fill ph-cooking-pot" style="color: var(--primary);"></i>';
    if (cat.includes('bread')) return '<i class="ph-fill ph-bread"></i>';
    if (cat.includes('rice')) return '<i class="ph-fill ph-bowl-steam"></i>';
    if (cat.includes('drink')) return '<i class="ph-fill ph-martini"></i>';
    if (cat.includes('dessert')) return '<i class="ph-fill ph-ice-cream"></i>';
    return '<i class="ph-fill ph-fork-knife"></i>';
}

window.renderAdminMenu = (data) => {
    const list = document.getElementById('menu-body');
    if(!list) return;
    list.innerHTML = '';
    data.forEach(item => {
        let catBadgeClass = ''; let icon = '';
        if(item.category === 'Veg' || item.category === 'Starters') { catBadgeClass = 'color:var(--success); background:rgba(36,150,63,0.1)'; icon='<i class="ph-fill ph-leaf"></i>';}
        else if(item.category === 'Non-Veg' || item.category === 'Main Course') { catBadgeClass = 'color:var(--danger); background:rgba(229,57,53,0.1)'; icon='<i class="ph-fill ph-bone"></i>';}
        else if(item.category === 'Breads' || item.category === 'Rice') { catBadgeClass = 'color:var(--warning); background:rgba(255,159,0,0.1)'; icon='<i class="ph-fill ph-bowl-steam"></i>';}
        else { catBadgeClass = 'color:var(--info); background:rgba(0,122,255,0.1)'; icon='<i class="ph-fill ph-brandy"></i>';}
        
        const inStock = item.inStock !== false;
        const opacity = inStock ? '1' : '0.5';
        const stockIcon = inStock ? '<i class="ph-bold ph-prohibit"></i>' : '<i class="ph-bold ph-check-circle"></i>';
        const stockText = inStock ? 'Mark Out of Stock' : 'Mark In Stock';
        const stockBadge = !inStock ? '<span style="color:var(--danger); font-size:10px; background:rgba(255,59,48,0.1); padding:2px 6px; border-radius:6px; margin-left:5px; border:1px solid rgba(255,59,48,0.2);">Out of Stock</span>' : '';
        
        let displayIcon = item.emoji && item.emoji.length < 5 && !item.emoji.includes('http') && item.emoji !== '🍲' ? item.emoji : getPremiumIcon(item.category);

        list.innerHTML += `
            <div class="menu-item-row premium-hover" style="opacity: ${opacity}">
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
        `;
    });
    if(data.length === 0) list.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-sub); font-size: 13px;"><i class="ph-fill ph-magnifying-glass" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><br>No items found.</div>';
};

window.toggleItemMenu = (id) => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if(menu.id !== `drop-${id}`) menu.classList.remove('show');
    });
    const drop = document.getElementById(`drop-${id}`);
    if(drop) drop.classList.toggle('show');
};

window.addEventListener('click', (e) => {
    if(!e.target.matches('.btn-dots')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    }
});

window.toggleStock = async (id, currentState) => {
    try { await updateDoc(doc(db, "menu_items", id), { inStock: !currentState }); } 
    catch(e) { alert("Failed to update stock status: " + e.message); }
};

window.openModal = () => {
    document.getElementById('modalTitle').innerHTML = '<i class="ph-fill ph-plus-circle text-primary"></i> Add New Dish';
    document.getElementById('dishId').value = "";
    document.getElementById('dishEmoji').value = "";
    document.getElementById('dishName').value = "";
    document.getElementById('dishCategory').value = "Starters";
    document.getElementById('dishPrice').value = "";
    document.getElementById('dishPriceHalf').value = "";
    document.getElementById('dishPricePiece').value = "";
    document.getElementById('dishModel').value = "";
    document.getElementById('dishPhoto1').value = "";
    document.getElementById('dishPhoto2').value = "";
    document.getElementById('dishPhoto3').value = "";
    document.getElementById('dishPhoto4').value = "";
    document.getElementById('addModal').classList.add('show');
};

window.closeModal = () => { document.getElementById('addModal').classList.remove('show'); };

window.editDish = (id) => {
    const dish = allMenuData.find(d => d.id === id);
    if(dish) {
        document.getElementById('modalTitle').innerHTML = '<i class="ph-fill ph-pencil-simple text-primary"></i> Edit Dish';
        document.getElementById('dishId').value = dish.id;
        document.getElementById('dishEmoji').value = dish.emoji || "🍲";
        document.getElementById('dishName').value = dish.name;
        document.getElementById('dishCategory').value = dish.category;
        document.getElementById('dishPrice').value = dish.price;
        document.getElementById('dishPriceHalf').value = dish.priceHalf || "";
        document.getElementById('dishPricePiece').value = dish.pricePiece || "";
        document.getElementById('dishModel').value = dish.modelUrl || "";
        document.getElementById('dishPhoto1').value = (dish.images && dish.images[0]) ? dish.images[0] : "";
        document.getElementById('dishPhoto2').value = (dish.images && dish.images[1]) ? dish.images[1] : "";
        document.getElementById('dishPhoto3').value = (dish.images && dish.images[2]) ? dish.images[2] : "";
        document.getElementById('dishPhoto4').value = (dish.images && dish.images[3]) ? dish.images[3] : "";
        document.getElementById('addModal').classList.add('show');
    }
};

window.saveDish = async () => {
    const btn = document.getElementById('saveBtn');
    btn.innerHTML = 'Saving <i class="ph-bold ph-spinner ph-spin"></i>'; btn.disabled = true;
    const id = document.getElementById('dishId').value;
    const imagesArray = [document.getElementById('dishPhoto1').value, document.getElementById('dishPhoto2').value, document.getElementById('dishPhoto3').value, document.getElementById('dishPhoto4').value].filter(url => url.trim() !== "");

    const data = {
        emoji: document.getElementById('dishEmoji').value,
        name: document.getElementById('dishName').value,
        category: document.getElementById('dishCategory').value,
        price: parseFloat(document.getElementById('dishPrice').value),
        priceHalf: parseFloat(document.getElementById('dishPriceHalf').value) || null,
        pricePiece: parseFloat(document.getElementById('dishPricePiece').value) || null,
        modelUrl: document.getElementById('dishModel').value,
        images: imagesArray,
        restaurantId: window.currentRestaurantId
    };

    if(!id) data.inStock = true;

    try {
        if(id) await updateDoc(doc(db, "menu_items", id), data);
        else await addDoc(collection(db, "menu_items"), data);
        closeModal();
    } catch(e) { alert("Error: " + e.message); }
    btn.innerHTML = '<i class="ph-bold ph-floppy-disk"></i> Save & Publish'; btn.disabled = false;
};

let deleteIdTemp = null;
window.triggerDeleteModal = (id) => { deleteIdTemp = id; document.getElementById('deleteConfirmModal').classList.add('show'); };
window.closeDeleteModal = () => { deleteIdTemp = null; document.getElementById('deleteConfirmModal').classList.remove('show'); };

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if(deleteIdTemp) {
        const btn = document.getElementById('confirmDeleteBtn');
        btn.innerText = "Deleting..."; btn.disabled = true;
        try {
            await deleteDoc(doc(db, "menu_items", deleteIdTemp));
            closeDeleteModal();
        } catch(e) { alert("Delete failed: " + e.message); }
        btn.innerText = "Yes, Delete"; btn.disabled = false;
    }
});

window.updateOrderStatus = async (orderId, newStatus) => {
    try { await updateDoc(doc(db, "orders", orderId), { status: newStatus }); } 
    catch(e) { alert("Error updating order: " + e.message); }
};

window.resolveAction = async (collectionName, id) => {
    try { await updateDoc(doc(db, collectionName, id), { status: "Resolved" }); } catch(e) { console.error("Resolution Failed: ", e); }
};

window.switchTab = (tabId, element = null) => {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const activeSec = document.getElementById('section-' + tabId);
    if(activeSec) activeSec.classList.add('active');
    
    if(element) {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
    }

    if (tabId === 'settings') {
        setTimeout(() => {
            const qrBox = document.getElementById("qrcode-box");
            if (qrBox) {
                qrBox.innerHTML = ""; 
                const dynamicLink = `https://itxarun.github.io/Smart-Menu/index.html?rest=${window.currentRestaurantId}`;
                
                const linkInput = document.getElementById("menu-link");
                if (linkInput) linkInput.value = dynamicLink;
                
                new QRCode(qrBox, { 
                    text: dynamicLink, 
                    width: 220, 
                    height: 220, 
                    colorDark: "#1C1C1E", 
                    colorLight: "#ffffff", 
                    correctLevel: QRCode.CorrectLevel.H 
                });
            }
        }, 100);
    }
};

window.switchAdminOrderTab = (tab) => {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#section-orders .menu-list').forEach(list => list.style.display = 'none');
    
    const targetBtn = document.getElementById(`tab-admin-${tab}`);
    const targetList = document.getElementById(`admin-${tab}-orders`);
    
    if(targetBtn) targetBtn.classList.add('active');
    if(targetList) targetList.style.display = 'flex';
};

window.downloadQR = () => {
    const cachedName = localStorage.getItem('crave_hotel_name_cache');
    const brandElement = document.getElementById("admin-restaurant-name") || document.querySelector(".brand-logo");
    const brandName = cachedName || (brandElement ? brandElement.innerText : "SMART MENU");
    
    const exportBrandElement = document.getElementById("export-brand-name");
    if (exportBrandElement) {
        exportBrandElement.innerText = brandName.toUpperCase();
    }
    
    const qrCanvas = document.querySelector("#qrcode-box canvas");
    const exportQrBox = document.getElementById("export-qr-box");
    
    if (!qrCanvas) {
        alert("Pehle Table QR generate hone dein!");
        return;
    }

    exportQrBox.innerHTML = ''; 
    const img = document.createElement("img");
    img.src = qrCanvas.toDataURL("image/png");
    img.style.width = "300px";
    img.style.height = "300px";
    exportQrBox.appendChild(img);

    if (typeof html2canvas !== 'undefined') {
        html2canvas(document.getElementById('premium-qr-export'), { 
            scale: 2, 
            useCORS: true 
        }).then(canvas => {
            let link = document.createElement('a');
            link.download = brandName.replace(/\s+/g, '_') + '_Table_QR.png';
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    } else {
        alert("Error: html2canvas library missing!");
    }
};
    
window.toggleTheme = () => {
    const tgl = document.getElementById('themeToggle');
    if(tgl && tgl.checked) document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
    
    if(window.updateRevenueChart && window.allCompletedOrdersForChart.length > 0) {
       window.updateRevenueChart(window.allCompletedOrdersForChart);
    }
};

// =======================================================
// 🔥 NEW: UNIVERSAL ORDER HISTORY SEARCH & LIFETIME CRM
// =======================================================
window.historyFilterType = 'today';
window.historySearchQuery = '';
window.allOrdersMaster = [];
window.crmCustomersMap = new Map();

window.setHistoryFilter = (type) => {
    window.historyFilterType = type;
    const btnToday = document.getElementById('btn-hist-today');
    const btnAll = document.getElementById('btn-hist-all');
    if (btnToday && btnAll) {
        if (type === 'today') {
            btnToday.style.background = 'var(--danger, #E53935)';
            btnToday.style.color = 'white';
            btnAll.style.background = 'transparent';
            btnAll.style.color = 'var(--text-sub)';
        } else {
            btnAll.style.background = 'var(--danger, #E53935)';
            btnAll.style.color = 'white';
            btnToday.style.background = 'transparent';
            btnToday.style.color = 'var(--text-sub)';
        }
    }
    window.renderPastOrdersList();
};

window.filterHistoryOrders = () => {
    const input = document.getElementById('historySearchInput');
    window.historySearchQuery = input ? input.value.trim().toLowerCase() : '';
    window.renderPastOrdersList();
};

window.renderPastOrdersList = () => {
    const container = document.getElementById('history-cards-container');
    if (!container) return;

    const todayDate = new Date();
    let filtered = window.allOrdersMaster.filter(data => {
        const date = data.timestamp ? data.timestamp.toDate() : new Date();
        const isToday = date.getDate() === todayDate.getDate() && date.getMonth() === todayDate.getMonth() && date.getFullYear() === todayDate.getFullYear();
        
        if (window.historyFilterType === 'today' && !isToday) return false;
        return (data.status === 'Completed' || data.status === 'Served' || data.status === 'Cancelled' || !isToday);
    });

    if (window.historySearchQuery) {
        filtered = filtered.filter(data => {
            const nameMatch = (data.customerName || "").toLowerCase().includes(window.historySearchQuery);
            const phoneMatch = String(data.customerPhone || "").includes(window.historySearchQuery);
            const tableMatch = String(data.tableNumber || "").includes(window.historySearchQuery);
            const dishMatch = (data.items || []).some(item => (item.name || "").toLowerCase().includes(window.historySearchQuery));
            return nameMatch || phoneMatch || tableMatch || dishMatch;
        });
    }

    container.innerHTML = '';
    if (filtered.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-sub); font-size: 13px;"><i class="ph-fill ph-clock-counter-clockwise" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><br><span style="font-size: 14px; font-weight:600;">No matching past orders found.</span></div>';
        return;
    }

    filtered.forEach(data => {
        const date = data.timestamp ? data.timestamp.toDate() : new Date();
        const displayTimeStr = date.toLocaleDateString('en-US', {day: 'numeric', month: 'short', hour: 'numeric', minute:'2-digit', hour12: true});
        const cardTypeClass = data.orderType === 'Takeaway' ? 'type-takeaway' : 'type-dinein';
        
        let itemsHTML = '';
        (data.items || []).forEach(item => {
            itemsHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:4px; border-bottom:1px solid var(--border); padding-bottom:4px;">
                <span><b>${item.qty}x</b> ${item.name}</span>
                <span>₹${item.price * item.qty}</span>
            </div>`;
        });

        let statusBadge = data.status === 'Cancelled' 
            ? `<span class="status-badge status-canc"><i class="ph-bold ph-x-circle"></i> Cancelled</span>`
            : `<span class="status-badge status-done"><i class="ph-bold ph-flag-checkered"></i> Served</span>`;

        container.innerHTML += `
            <div class="order-card premium-hover ${cardTypeClass}" style="margin-bottom: 12px;">
                <div class="card-top-row">
                    <div class="table-id-box"><div class="number-avatar">${String(data.tableNumber || '#').padStart(2, '0')}</div> Table ${data.tableNumber || 'N/A'}</div>
                    <span class="main-time" style="font-size: 11px;">${displayTimeStr}</span>
                </div>
                <div class="card-badge-row">${statusBadge}</div>
                <div style="font-size:12px; font-weight:600; color:var(--text-main); background:var(--input-bg); padding:8px 12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                    <span><i class="ph-fill ph-user" style="color:var(--primary);"></i> ${data.customerName || "Customer"}</span>
                    <span><i class="ph-fill ph-phone" style="color:var(--info);"></i> ${data.customerPhone || "N/A"}</span>
                </div>
                <div style="font-size:12px; font-weight:500;">${itemsHTML}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:10px; border-top:1px dashed var(--border);">
                    <span style="font-size:16px; font-weight:800; color:var(--primary);">Total: ₹${data.totalAmount || 0}</span>
                    <button onclick="printBill('${data.docId}')" style="background: var(--input-bg); color: var(--text-main); border: 1px solid var(--border); padding: 8px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <i class="ph-bold ph-printer" style="font-size: 16px; color: var(--info);"></i> Print Bill
                    </button>
                </div>
            </div>
        `;
    });
};

window.openCustomerHistory = (phoneKey) => {
    const customer = window.crmCustomersMap.get(String(phoneKey));
    if (!customer) return;

    document.getElementById('custModalName').innerHTML = `<i class="ph-fill ph-user-circle" style="color: var(--primary); font-size: 24px;"></i> ${customer.name}`;
    document.getElementById('custModalPhone').innerText = `+${customer.phone}`;
    document.getElementById('custModalSpend').innerText = `₹${customer.totalSpend}`;
    document.getElementById('custModalCount').innerText = `${customer.orderCount}`;

    let favDish = "N/A";
    let maxQty = 0;
    Object.keys(customer.dishCount || {}).forEach(dish => {
        if (customer.dishCount[dish] > maxQty) {
            maxQty = customer.dishCount[dish];
            favDish = dish;
        }
    });
    document.getElementById('custModalFav').innerText = favDish;

    const timelineEl = document.getElementById('customer-orders-timeline');
    timelineEl.innerHTML = '';
    
    (customer.ordersList || []).forEach(order => {
        const date = order.timestamp ? order.timestamp.toDate() : new Date();
        const dateStr = date.toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'});
        let itemsStr = (order.items || []).map(i => `${i.qty}x ${i.name}`).join(", ");

        timelineEl.innerHTML += `
            <div style="background: var(--bg-main); padding: 12px; border-radius: 12px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-sub);">${dateStr}</span>
                    <span style="font-size: 13px; font-weight: 800; color: var(--success);">₹${order.totalAmount}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-main); font-weight: 600;">🍽️ ${itemsStr}</div>
            </div>
        `;
    });

    document.getElementById('customerHistoryModal').classList.add('show');
};

window.closeCustomerHistoryModal = () => {
    document.getElementById('customerHistoryModal').classList.remove('show');
};

// =======================================================
// 🔥 NEW: ADMIN PILL DROPDOWN & NOTIFICATION BELL LOGIC
// =======================================================

window.toggleAdminMenu = (e) => {
    if (e) e.stopPropagation();
    const drop = document.getElementById('adminProfileDropdown');
    if (drop) {
        drop.style.display = drop.style.display === 'flex' ? 'none' : 'flex';
    }
};

// Screen ke kisi aur hisse par click karne par dropdown close ho jaye
document.addEventListener('click', () => {
    const drop = document.getElementById('adminProfileDropdown');
    if (drop && drop.style.display === 'flex') {
        drop.style.display = 'none';
    }
});

// Sound toggle ko main setting checkbox ke sath sync rakho
window.toggleNavSound = (checked) => {
    const mainSound = document.getElementById('soundToggle');
    if (mainSound) mainSound.checked = checked;
};

// Dark mode toggle ko sync rakho
window.syncNavTheme = (checked) => {
    const mainTheme = document.getElementById('themeToggle');
    if (mainTheme) mainTheme.checked = checked;
};
// =======================================================
// 🔑 FORGOT PASSWORD LOGIC (ZOMATO STYLE)
// =======================================================

// 1. Modal open karne ka function (Fix)
window.showForgotPassword = () => {
    try {
        const emailInput = document.getElementById('adminEmail') || document.querySelector('input[type="email"]');
        const resetInput = document.getElementById('resetEmailInput');
        const feedbackMsg = document.getElementById('resetFeedbackMsg');
        const modal = document.getElementById('forgotPassModal');
        
        if (!modal) return;

        if (emailInput && emailInput.value && resetInput) {
            resetInput.value = emailInput.value; 
        }
        
        if (feedbackMsg) feedbackMsg.style.display = 'none'; 
        
        // 🔥 YAHI MAGIC HAI! Invisible hatane ke liye 'show' add kar rahe hain!
        modal.classList.add('show');
        
    } catch (error) {
        console.error("Modal open error:", error);
    }
};

// 2. Modal close karne ka function
window.closeForgotPassword = () => {
    document.getElementById('forgotPassModal').classList.remove('show');
};

// 3. Asli Firebase Reset Function
window.executePasswordReset = async () => {
    const email = document.getElementById('resetEmailInput').value.trim();
    const feedbackMsg = document.getElementById('resetFeedbackMsg');
    const btn = document.getElementById('btnSendReset');

    if (!email) {
        feedbackMsg.style.display = 'block';
        feedbackMsg.style.color = '#E53935';
        feedbackMsg.innerText = '⚠️ Please enter your email address.';
        return;
    }

    btn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Sending...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    try {
        await sendPasswordResetEmail(auth, email);
        
        feedbackMsg.style.display = 'block';
        feedbackMsg.style.color = '#24963F'; 
        feedbackMsg.innerText = '✅ Reset link sent! Check your email inbox.';
        
        setTimeout(() => {
            closeForgotPassword();
            btn.innerHTML = 'Send Link';
            btn.style.opacity = '1';
            btn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error("Password reset error:", error);
        feedbackMsg.style.display = 'block';
        feedbackMsg.style.color = '#E53935'; 
        
        if (error.code === 'auth/user-not-found') {
            feedbackMsg.innerText = '⚠️ No account found with this email.';
        } else if (error.code === 'auth/invalid-email') {
            feedbackMsg.innerText = '⚠️ Please enter a valid email format.';
        } else {
            feedbackMsg.innerText = '⚠️ Failed to send reset link. Please try again.';
        }
        
        btn.innerHTML = 'Send Link';
        btn.style.opacity = '1';
        btn.disabled = false;
    }
};
// =======================================================
// 🖨️ THERMAL PRINTER LOGIC
// =======================================================
window.printBill = (orderId) => {
    // Order dhundo
    const targetOrder = window.allOrdersMaster.find(o => o.docId === orderId);
    
    if (!targetOrder) {
        alert("Order details not found for printing!");
        return;
    }

   // Receipt HTML me data bharo
    const cachedName = localStorage.getItem('crave_hotel_name_cache') || 'Restaurant Bill';
    document.getElementById('print-hotel-name').innerText = cachedName;
    
    document.getElementById('print-order-id').innerText = orderId.substring(0, 6).toUpperCase();
    
    // Dine in ya Takeaway
    let typeText = targetOrder.orderType === 'Takeaway' ? 'Takeaway' : `Dine-in (Table ${targetOrder.tableNumber})`;
    document.getElementById('print-type').innerText = typeText;
    document.getElementById('print-total').innerText = targetOrder.totalAmount;

    // Items list banani
    const tbody = document.getElementById('print-items-body');
    tbody.innerHTML = ''; 

    (targetOrder.items || []).forEach(item => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 3px 0;">${item.name}</td>
            <td style="padding: 3px 0; text-align: center;">x${item.qty}</td>
            <td style="padding: 3px 0; text-align: right;">₹${item.price * item.qty}</td>
        `;
        tbody.appendChild(tr);
    });

    // Thoda sa delay deke print dialog kholo
    setTimeout(() => {
        window.print();
    }, 300);
};
// =======================================================
// 🔒 UPDATE ADMIN PASSWORD LOGIC
// =======================================================
window.updateAdminPassword = async () => {
    const newPass = document.getElementById('newPassInput').value;
    const confirmPass = document.getElementById('confirmNewPassInput').value;
    const feedback = document.getElementById('changePassFeedback');

    feedback.style.display = 'block';

    // 1. Check if empty
    if (!newPass || !confirmPass) {
        feedback.style.color = 'var(--danger)';
        feedback.innerText = 'Please fill both password fields!';
        return;
    }

    // 2. Check password length
    if (newPass.length < 6) {
        feedback.style.color = 'var(--danger)';
        feedback.innerText = 'Password must be at least 6 characters long!';
        return;
    }

    // 3. Check if passwords match
    if (newPass !== confirmPass) {
        feedback.style.color = 'var(--danger)';
        feedback.innerText = 'Passwords do not match!';
        return;
    }

    feedback.style.color = 'var(--warning)';
    feedback.innerText = 'Updating your password...';

    try {
        // auth variable tumhare admin.js me pehle se defined hona chahiye
        const user = auth.currentUser; 
        
        if (user) {
            await updatePassword(user, newPass);
            feedback.style.color = 'var(--success)';
            feedback.innerText = 'Password updated successfully! 🎉';
            
            // Success ke baad Modal close karo aur fields khali karo
            setTimeout(() => {
                document.getElementById('changePassModal').classList.remove('show');
                document.getElementById('newPassInput').value = '';
                document.getElementById('confirmNewPassInput').value = '';
                feedback.style.display = 'none';
            }, 2000);
        } else {
            feedback.style.color = 'var(--danger)';
            feedback.innerText = 'Error: You must be logged in to change password!';
        }
    } catch (error) {
        console.error("Password update error:", error);
        feedback.style.color = 'var(--danger)';
        
        // Firebase Security Feature: Agar user purana logged in hai, to use relogin karna padta hai
        if (error.code === 'auth/requires-recent-login') {
            feedback.innerText = 'Security Alert: Please logout and login again to change your password.';
        } else {
            feedback.innerText = error.message;
        }
    }
};
// =======================================================
// 🪑 LIVE TABLE MANAGER (FIREBASE CLOUD SYNC)
// =======================================================

window.restaurantTables = [];
let isTableListenerActive = false;

// 🔥 JADOO: 1 sec me check karega login, aur Firebase se tables le aayega
const tableChecker = setInterval(() => {
    if (window.currentRestaurantId && !isTableListenerActive) {
        isTableListenerActive = true;
        clearInterval(tableChecker);

        const qTables = query(collection(db, "tables"), where("restaurantId", "==", window.currentRestaurantId));
        onSnapshot(qTables, (snap) => {
            window.restaurantTables = [];
            snap.forEach(doc => {
                window.restaurantTables.push({ id: doc.id, number: doc.data().tableNumber });
            });
            renderTables(); // Data aate hi screen par draw kar dega
        });
    }
}, 1000);

window.addNewTable = () => {
    document.getElementById('newTableInput').value = ''; 
    document.getElementById('addTableError').style.display = 'none'; 
    document.getElementById('addTableModal').classList.add('show');
};

window.confirmAddNewTable = async () => {
    const tableNumInput = document.getElementById('newTableInput').value;
    const errorText = document.getElementById('addTableError');
    
    if (!tableNumInput || isNaN(tableNumInput)) {
        errorText.innerText = "Please enter a valid number!";
        errorText.style.display = "block";
        return;
    }

    const tableNum = Number(tableNumInput);

    // Check if table already exists in cloud
    if (window.restaurantTables.find(t => t.number === tableNum)) {
        errorText.innerText = `Table ${tableNum} is already added!`;
        errorText.style.display = "block";
        return;
    }

    document.getElementById('addTableModal').classList.remove('show');
    
    // 🔥 NAYA LOGIC: LocalStorage ki jagah sidha Firebase (Database) me save!
    try {
        await addDoc(collection(db, "tables"), {
            restaurantId: window.currentRestaurantId,
            tableNumber: tableNum,
            timestamp: new Date()
        });
    } catch(e) {
        alert("Error adding table: " + e.message);
    }
};

// =======================================================
// 🎛️ GLOBAL STATE FOR TABLE GRID SIZE
// =======================================================
if (!window.currentTableSize) window.currentTableSize = 'medium';

window.toggleTableSize = () => {
    // Small -> Large -> Medium -> Small (Cycle karega)
    if (window.currentTableSize === 'medium') window.currentTableSize = 'small';
    else if (window.currentTableSize === 'small') window.currentTableSize = 'large';
    else window.currentTableSize = 'medium';
    window.renderTables(); // Turant naye size me refresh karega
};

// =======================================================
// 🎛️ GLOBAL STATE FOR TABLE GRID SIZE
// =======================================================
if (!window.currentTableSize) window.currentTableSize = 'medium';

window.toggleTableSize = () => {
    if (window.currentTableSize === 'medium') window.currentTableSize = 'small';
    else if (window.currentTableSize === 'small') window.currentTableSize = 'large';
    else window.currentTableSize = 'medium';
    window.renderTables(); 
};

// =======================================================
// 🎛️ GLOBAL STATE FOR TABLE GRID COLUMNS
// =======================================================
// Default 6 column set kiya hai
if (!window.currentTableCols) window.currentTableCols = 6; 

window.toggleTableCols = () => {
    // Cycle karega: 6 -> 4 -> 3 -> 6
    if (window.currentTableCols === 6) window.currentTableCols = 4;
    else if (window.currentTableCols === 4) window.currentTableCols = 3;
    else window.currentTableCols = 6;
    window.renderTables(); 
};

// =======================================================
// 🚦 VIP SMART TABLE RENDERER (PERFECT SQUARE & EXACT COLUMNS)
// =======================================================
window.renderTables = () => {
    const grid = document.getElementById('tables-grid');
    if (!grid) return;
    
    grid.style.paddingBottom = '120px';

    // 🔥 FIX 1: Font size scale based on Columns (Taaki 6 col me text bahar na nikle)
    let scaleFont = 1;
    if (window.currentTableCols === 6) scaleFont = 0.75;
    else if (window.currentTableCols === 4) scaleFont = 0.95;
    else scaleFont = 1.15; // 3 Columns

    // 🔥 FIX 2: Exact Column Control (Ab ye auto-fill nahi karega, strict rows banayega)
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${window.currentTableCols}, 1fr)`; 
    grid.style.gap = '15px';
    grid.style.alignItems = 'start';
    grid.innerHTML = ''; 

    // 🔥 FIX 3: Dynamic Column Control Button
    const controlsHtml = `
        <div style="grid-column: 1 / -1; display: flex; justify-content: flex-end; margin-bottom: 5px;">
            <button onclick="toggleTableCols()" style="background: #ffffff; border: 1px solid #ddd; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 800; color: #333; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: 0.2s;">
                <i class="ph-bold ph-grid-four" style="color: var(--primary, #E53935);"></i> View: ${window.currentTableCols} Columns
            </button>
        </div>
    `;
    grid.insertAdjacentHTML('beforeend', controlsHtml);

    // 🔥 FIX 4: Sidebar Menu "Tables" ko Active (Red) color dene ka automatic hack
    setTimeout(() => {
        // Ye code sidebar ke "Tables" button ko dhund kar usko highlight kar dega
        document.querySelectorAll('.menu-item, .nav-item, li').forEach(nav => {
            if (nav.innerText && nav.innerText.toLowerCase().includes('tables')) {
                nav.style.color = 'var(--primary, #E53935)'; // Red Highlight
                nav.classList.add('active');
            } else if (nav.innerText && nav.innerText.trim().length > 0) {
                nav.style.color = ''; // Baaki sabko normal kar dega
                nav.classList.remove('active');
            }
        });
    }, 100);

    // Render Tables Loop
    window.restaurantTables.sort((a,b) => a.number - b.number).forEach(table => {
        const tableNum = table.number;
        
        let activeOrders = window.allOrdersMaster.filter(o => 
            o.tableNumber == tableNum && 
            (o.status === 'New' || o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready' || o.status === 'Served')
        );
        
        let tableStatus = 'Available';
        let cardBg = '#F8F9FA';    
        let cardBorder = '1px solid #E9ECEF';  
        let shadow = '0 4px 10px rgba(0,0,0,0.04)';
        let totalUnpaid = 0;
        let paidOrdersToClear = []; 
        let custName = '';
        let totalItemsCount = 0;
        
        if (activeOrders.length > 0) {
            const firstOrder = activeOrders[0];
            if(firstOrder.customerName && firstOrder.customerName !== 'N/A') {
                custName = firstOrder.customerName;
            }

            activeOrders.forEach(o => {
                if (o.isPaid !== true) totalUnpaid += (o.totalAmount || 0);
                else paidOrdersToClear.push(o.docId);
                
                if(o.items) o.items.forEach(item => totalItemsCount += item.qty);
            });
            
            if (totalUnpaid > 0) {
                tableStatus = 'Dining';
                cardBg = '#FFF5EB';    
                cardBorder = '1px solid #FFD8A8';  
                shadow = '0 6px 15px rgba(255, 159, 0, 0.12)';
            } else if (paidOrdersToClear.length > 0) {
                tableStatus = 'Paid';
                cardBg = '#E7F5FF';    
                cardBorder = '1px solid #A5D8FF';  
                shadow = '0 6px 15px rgba(0, 122, 255, 0.12)';
            }
        }

        let statusHtml = '';
        let topLeftButton = ''; 
        let viewDetailsBtn = '';
        
        if (tableStatus === 'Available') {
            statusHtml = `<div style="font-size: ${12 * scaleFont}px; color: #ADB5BD; font-weight: 800; margin-top: 10px; text-transform: uppercase;">Available</div>`;
        } else if (tableStatus === 'Paid') {
            statusHtml = `<div style="font-size: ${15 * scaleFont}px; color: #228BE6; font-weight: 900; margin-top: 5px;">PAID ✓</div>`;
            topLeftButton = `
                <button onclick="event.stopPropagation(); forceClearTable('${paidOrdersToClear.join(',')}')" style="position: absolute; top: 10px; left: 10px; background: #228BE6; color: white; border: none; width: ${30 * scaleFont}px; height: ${30 * scaleFont}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: ${16 * scaleFont}px; box-shadow: 0 4px 10px rgba(34, 139, 230, 0.3); z-index: 10;" title="Clear Table">
                    <i class="ph-bold ph-broom"></i>
                </button>
            `;
        } else {
            statusHtml = `<div style="font-size: ${18 * scaleFont}px; color: #FD7E14; font-weight: 900; margin-top: 5px;">₹${totalUnpaid}</div>`;
            topLeftButton = `
                <button onclick="event.stopPropagation(); settleTablePayment(${tableNum}, 'Cash/UPI')" style="position: absolute; top: 10px; left: 10px; background: #40C057; color: white; border: none; width: ${30 * scaleFont}px; height: ${30 * scaleFont}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: ${16 * scaleFont}px; box-shadow: 0 4px 10px rgba(64, 192, 87, 0.3); z-index: 10;" title="Collect Payment">
                    <i class="ph-bold ph-check"></i>
                </button>
            `;
        }

        if (tableStatus !== 'Available') {
            viewDetailsBtn = `
                <button onclick="viewTableDetails(${tableNum})" style="margin-top: 10px; background: rgba(0,0,0,0.05); color: var(--text-main); border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 4px 10px; font-size: ${11 * scaleFont}px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: 0.2s;">
                    <i class="ph-bold ph-eye"></i> Details
                </button>
            `;
        }
        
        const threeDotMenu = `
            <div style="position: absolute; top: 10px; right: 10px; z-index: 20;">
                <button onclick="event.stopPropagation(); toggleTableMenu(${tableNum}, event)" style="background: transparent; border: none; color: #868E96; width: ${30 * scaleFont}px; height: ${30 * scaleFont}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: ${22 * scaleFont}px;">
                    <i class="ph-bold ph-dots-three-vertical"></i>
                </button>
                
                <div id="table-menu-${tableNum}" class="table-dropdown" style="display: none; position: absolute; top: 35px; right: 0; background: #ffffff; border: 1px solid #eee; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 12px; padding: 6px; width: 130px; z-index: 30;">
                    <button onclick="event.stopPropagation(); downloadPremiumQR(${tableNum}); toggleTableMenu(${tableNum}, event)" style="width: 100%; text-align: left; background: transparent; border: none; padding: 10px; font-size: 13px; font-weight: 700; color: #343A40; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                        <i class="ph-bold ph-qr-code"></i> Download QR
                    </button>
                    <button onclick="event.stopPropagation(); deleteTable('${table.id}'); toggleTableMenu(${tableNum}, event)" style="width: 100%; text-align: left; background: transparent; border: none; padding: 10px; font-size: 13px; font-weight: 700; color: #FA5252; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                        <i class="ph-bold ph-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        // 🔥 VIP FIX 5: Saari Fixed Heights Hata di hain. Sirf "aspect-ratio: 1 / 1" chhoda hai.
        const cardHtml = `
            <div class="table-card" id="table-card-${tableNum}" style="position: relative; background: ${cardBg}; border: ${cardBorder}; box-shadow: ${shadow}; border-radius: 20px; display: flex; flex-direction: column; aspect-ratio: 1 / 1; justify-content: center; align-items: center; text-align: center; transition: transform 0.2s ease;">
                
                ${topLeftButton}
                ${threeDotMenu}
                
                ${totalItemsCount > 0 ? `<div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); font-size: ${9 * scaleFont}px; font-weight: 800; color: #FD7E14; background: rgba(253, 126, 20, 0.1); padding: 2px 8px; border-radius: 12px;"><i class="ph-bold ph-cooking-pot"></i> ${totalItemsCount}</div>` : ''}

                <div class="table-number" style="font-size: ${28 * scaleFont}px; font-weight: 900; color: #212529; letter-spacing: -1px; margin-top: 10px;">T-${tableNum}</div>
                
                ${custName ? `<div style="font-size: ${11 * scaleFont}px; font-weight: 800; color: #868E96; margin-top: 4px; background: rgba(0,0,0,0.04); padding: 4px 10px; border-radius: 12px; text-transform: capitalize; max-width: 85%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><i class="ph-fill ph-user"></i> ${custName}</div>` : ''}
                
                ${statusHtml}
                ${viewDetailsBtn}
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
};
// =======================================================
// ⚙️ TOGGLE 3-DOT MENU LOGIC
// =======================================================
window.toggleTableMenu = (tableNum, event) => {
    if(event) event.stopPropagation();
    
    // Pehle saare open menus ko close kar do
    document.querySelectorAll('.table-dropdown').forEach(menu => {
        if (menu.id !== `table-menu-${tableNum}`) menu.style.display = 'none';
    });
    
    // Ab click kiye gaye menu ko toggle karo
    const menu = document.getElementById(`table-menu-${tableNum}`);
    if(menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
};

// Agar screen par kahin aur click ho, toh menu band ho jaye
document.addEventListener('click', (e) => {
    if (!e.target.closest('.table-dropdown') && !e.target.closest('.ph-dots-three-vertical')) {
        document.querySelectorAll('.table-dropdown').forEach(menu => menu.style.display = 'none');
    }
});

// =======================================================
// 👁️ DYNAMIC POPUP FOR TABLE ORDER DETAILS
// =======================================================
window.viewTableDetails = (tableNum) => {
    // Purana modal agar khula ho toh hata do
    const existingModal = document.getElementById('dynamicTableModal');
    if(existingModal) existingModal.remove();

    // Table ke live orders dhundo
    let activeOrders = window.allOrdersMaster.filter(o => 
        o.tableNumber == tableNum && 
        (o.status === 'New' || o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready' || o.status === 'Served')
    );
    
    if(activeOrders.length === 0) return;

    let detailsHtml = activeOrders.map(o => {
        let itemsList = o.items.map(i => `<div style="display:flex; justify-content:space-between; padding: 4px 0; border-bottom: 1px dashed rgba(0,0,0,0.05);"><span><b>${i.qty}x</b> ${i.name}</span> <span>₹${i.price * i.qty}</span></div>`).join('');
        let custName = o.customerName !== 'N/A' ? o.customerName : 'Guest Customer';
        let custPhone = o.customerPhone && o.customerPhone !== 'N/A' ? o.customerPhone : 'No Number';
        let chefNote = o.chefNotes && o.chefNotes !== 'None' ? `<div style="margin-top:8px; font-size: 11px; background: #FFE5E5; color: #E53935; padding: 6px; border-radius: 6px;"><b>Note:</b> ${o.chefNotes}</div>` : '';

        return `
            <div style="background: var(--input-bg); border: 1px solid var(--border); padding: 12px; border-radius: 12px; margin-bottom: 15px; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 8px;">
                    <span style="font-weight: 800; font-size: 14px;">Order #${o.docId.slice(-4)}</span>
                    <span style="font-weight: 800; color: var(--primary);">₹${o.totalAmount}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 10px;">
                    <div><i class="ph-fill ph-user-circle"></i> <b>${custName}</b></div>
                    <div><i class="ph-fill ph-phone"></i> ${custPhone}</div>
                </div>
                <div style="font-size: 12px; color: var(--text-main);">
                    ${itemsList}
                </div>
                ${chefNote}
            </div>
        `;
    }).join('');

    // Jadoo: Bina HTML chhede JS se direct Modal Popup banana
    let modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '999999';
    modal.id = 'dynamicTableModal';
    modal.innerHTML = `
        <div class="modal-card" style="transform: none; margin: auto; max-width: 380px; text-align: center; border-radius: 20px; padding: 25px 20px; max-height: 85vh; overflow-y: auto; background: var(--bg-card); box-shadow: 0 15px 40px rgba(0,0,0,0.2);">
            <h3 style="margin-top: 0; margin-bottom: 20px; color: var(--text-main); font-size: 18px; font-weight: 800;">
                <i class="ph-fill ph-receipt" style="color: var(--primary);"></i> Table ${tableNum} Details
            </h3>
            
            ${detailsHtml}
            
            <button onclick="document.getElementById('dynamicTableModal').remove()" style="width: 100%; background: var(--text-main); color: var(--bg-main); padding: 14px; border-radius: 12px; border: none; font-weight: 800; font-size: 14px; margin-top: 10px; cursor: pointer;">
                Close Details
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};
// =======================================================
// 🧹 FAILSAFE: INSTANT CLEAR TABLE (WITH AUTO-REFRESH FIX)
// =======================================================
window.forceClearTable = async (docIdsString) => {
    if(!docIdsString) return;
    const docIds = docIdsString.split(',');
    
    for(let id of docIds) {
        if(id) {
            try {
                await updateDoc(doc(db, "orders", id), { status: 'Completed' });
                // 👈 ISSUE 2 FIX: Update hone ke baad manually screen refresh karwana
                setTimeout(() => { if (typeof window.renderTables === 'function') window.renderTables(); }, 500);
            } catch(e) { console.error("Failsafe Clear Error: ", e); }
        }
    }
};
// =======================================================
// 💸 1-CLICK BILL SETTLEMENT (WITH CUSTOM PREMIUM POPUP)
// =======================================================
window.settleTablePayment = (tableNum, method) => {
    // Purana modal agar khula ho toh hata do
    const existingModal = document.getElementById('paymentConfirmModal');
    if(existingModal) existingModal.remove();

    // Jadoo: Bina HTML chhede JS se direct Modal Popup banana
    let modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '999999';
    modal.id = 'paymentConfirmModal';
    
    modal.innerHTML = `
        <div class="modal-card" style="transform: none; margin: auto; max-width: 340px; text-align: center; border-radius: 24px; padding: 30px 20px; background: var(--bg-card, #ffffff); box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
            <div style="background: rgba(36, 150, 63, 0.1); width: 65px; height: 65px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 15px auto;">
                <i class="ph-bold ph-wallet" style="font-size: 32px; color: var(--success, #24963F);"></i>
            </div>
            <h3 style="margin-bottom: 10px; color: var(--text-main, #1C1C1E); font-weight: 800; font-size: 20px; font-family: 'Okra', sans-serif;">Confirm Payment</h3>
            <p style="font-size: 13px; color: var(--text-sub, #757575); margin-bottom: 25px; font-weight: 500;">
                Are you sure you want to collect payment for <b>Table ${tableNum}</b> via <b>${method}</b>?
            </p>
            <div style="display: flex; gap: 10px;">
                <button onclick="document.getElementById('paymentConfirmModal').remove()" style="flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; background: var(--input-bg, #f5f5f5); color: var(--text-main, #333); transition: 0.2s;">Cancel</button>
                <button onclick="executeTablePayment(${tableNum}, '${method}')" style="flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; background: var(--success, #24963F); color: white; box-shadow: 0 8px 20px rgba(36, 150, 63, 0.3); transition: 0.2s;">Yes, Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// =======================================================
// ⚙️ ASLI PAYMENT LOGIC (JAB MANAGER 'YES' DABAYEGA)
// =======================================================
window.executeTablePayment = async (tableNum, method) => {
    // 1. Popup ko turant gayab karo
    const modal = document.getElementById('paymentConfirmModal');
    if(modal) modal.remove();

    // 2. Unpaid orders dhundo us table ke
    let activeOrders = window.allOrdersMaster.filter(o => 
        o.tableNumber == tableNum && 
        (o.status === 'New' || o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready' || o.status === 'Served') &&
        o.isPaid !== true
    );
    
    for (let order of activeOrders) {
        try {
            // Pehle order ko PAID mark karo (Table Blue ho jayegi)
            await updateDoc(doc(db, "orders", order.docId), { 
                isPaid: true,
                paymentMethod: method
            });
            
            // 🔥 5-SECOND TIMER MAGIC
            // 5 second baad order apne aap Completed (History) me jayega aur Table 🟢 Green (Available) ho jayegi!
            setTimeout(async () => {
                try {
                    await updateDoc(doc(db, "orders", order.docId), { status: 'Completed' });
                } catch(err) {
                    console.error("Auto-clear failed: ", err);
                }
            }, 5000); 

        } catch(e) {
            console.error("Payment update failed: ", e);
        }
    }
};
// =======================================================
// 🗑️ VIP DELETE TABLE LOGIC (CUSTOM MODAL)
// =======================================================
let tableIdToDelete = null;

// 1. Sirf VIP Popup Open Karna
window.deleteTable = (docId) => {
    tableIdToDelete = docId;
    document.getElementById('deleteTableModal').classList.add('show');
};

// 2. Popup Close Karna
window.closeDeleteTableModal = () => {
    tableIdToDelete = null;
    document.getElementById('deleteTableModal').classList.remove('show');
};

// 3. Asli Firebase Delete Logic (Jab 'Yes' dabaye)
window.confirmDeleteTableAction = async () => {
    if (!tableIdToDelete) return;
    
    // Niche wala button loading me badalna (Optional premium touch)
    const btn = document.querySelector('#deleteTableModal button:last-child');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Wait...';
    btn.style.pointerEvents = "none";

    try {
        await deleteDoc(doc(db, "tables", tableIdToDelete));
        closeDeleteTableModal();
    } catch(e) {
        alert("Failed to delete table: " + e.message);
        closeDeleteTableModal();
    } finally {
        // Button wapas normal karna
        btn.innerHTML = originalText;
        btn.style.pointerEvents = "auto";
    }
};

// 3. SILENT QR DOWNLOAD (Bina kisi boring alert ke)
window.downloadTableQR = (tableNum) => {
    const baseUrl = "https://itxarun.github.io/Smart-Menu/index.html";
    const tableUrl = `${baseUrl}?table=${tableNum}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}&margin=15`;
    
    const btn = document.getElementById(`btn-qr-${tableNum}`);
    const originalText = btn.innerHTML;
    
    btn.innerHTML = `<i class="ph-bold ph-spinner ph-spin"></i> Wait...`;
    btn.style.pointerEvents = "none"; 
    
    fetch(qrApiUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Table_${tableNum}_NextPlate_QR.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            btn.innerHTML = `<i class="ph-bold ph-check" style="color: var(--success);"></i> Done!`;
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.pointerEvents = "auto";
            }, 2000);
        })
        .catch(() => {
            window.open(qrApiUrl, '_blank');
            btn.innerHTML = originalText;
            btn.style.pointerEvents = "auto";
        });
};
// =======================================================
// 🖨️ KITCHEN ORDER TICKET (KOT) LOGIC
// =======================================================
window.printKOT = (orderId) => {
    // 1. Order ki details nikalo
    const targetOrder = window.allOrdersMaster.find(o => o.docId === orderId);
    if (!targetOrder) {
        alert("Order details not found!");
        return;
    }

    // 2. KOT ka format set karo (Bina Price ke)
    let typeText = targetOrder.orderType === 'Takeaway' ? 'Takeaway' : `Table ${targetOrder.tableNumber}`;
    let printWindow = window.open('', '', 'width=320,height=500');
    
    printWindow.document.write(`
        <html><head><style>
            body { font-family: 'Courier New', Courier, monospace; text-align: left; margin: 0; padding: 15px; color: #000; }
            .kot-header { text-align: center; font-size: 22px; font-weight: 900; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .order-info { font-size: 14px; margin-bottom: 5px; font-weight: bold; }
            .item-row { font-size: 16px; font-weight: bold; margin-bottom: 8px; display: flex; justify-content: space-between; }
            .notes-box { font-size: 14px; font-weight: bold; border: 2px solid #000; padding: 10px; margin-top: 15px; }
            .divider { border-bottom: 2px dashed #000; margin: 10px 0; }
        </style></head><body>
        
        <div class="kot-header">KOT - ${typeText}</div>
        <div class="order-info">ID: #${orderId.substring(0,6).toUpperCase()}</div>
        <div class="order-info">Time: ${new Date().toLocaleTimeString()}</div>
        <div class="divider"></div>
    `);

    // 3. Items print karna
    targetOrder.items.forEach(item => {
        let variant = item.variant ? `<span style="font-size:12px;">(${item.variant})</span>` : '';
        printWindow.document.write(`<div class="item-row"><span>${item.qty} x ${item.name} ${variant}</span></div>`);
    });

    // 4. Agar Chef ke liye koi Note hai, toh usko bada dikhana
    if (targetOrder.chefNotes && targetOrder.chefNotes !== 'None' && targetOrder.chefNotes.trim() !== '') {
        printWindow.document.write(`<div class="notes-box">⚠️ NOTE: ${targetOrder.chefNotes}</div>`);
    }

    printWindow.document.write(`
        <div class="divider"></div>
        <div style="text-align: center; font-size: 12px; margin-top: 10px;">* Send this slip with food *</div>
        </body></html>
    `);
    
    // 5. Print dialog open karna
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { 
        printWindow.print(); 
        printWindow.close(); 
    }, 500);
};
// =======================================================
// 💸 HOTEL UPI SETTINGS LOGIC
// =======================================================

// 1. UPI ID Save karna
window.saveHotelUPI = async () => {
    const upiInput = document.getElementById('adminUpiInput').value.trim();
    const btn = document.getElementById('btnSaveUpi');
    
    if (!upiInput) {
        alert("Please enter a valid UPI ID!");
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Saving...';
    btn.disabled = true;

    try {
        // Firebase me current hotel ko dhundho
        const q = query(collection(db, "merchants"), where("restaurantId", "==", window.currentRestaurantId));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
            const docId = snap.docs[0].id; // Hotel ka asli database ID
            // UPI ID update kar do
            await updateDoc(doc(db, "merchants", docId), {
                upiId: upiInput
            });
            
            btn.innerHTML = '<i class="ph-bold ph-check"></i> Saved!';
            btn.style.background = 'var(--success)';
            btn.style.boxShadow = '0 4px 15px rgba(36, 150, 63, 0.2)';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '#007AFF';
                btn.style.boxShadow = '0 4px 15px rgba(0, 122, 255, 0.2)';
                btn.disabled = false;
            }, 3000);
        }
    } catch(e) {
        alert("Failed to save UPI: " + e.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

// 2. Settings tab khulte hi purana UPI ID load karna
// Tumhare switchTab function ko thoda sa upgrade kar rahe hain taaki UPI fetch ho jaye
const originalSwitchTab = window.switchTab;
window.switchTab = async (tabId, element = null) => {
    originalSwitchTab(tabId, element);
    
    // Agar settings tab khula hai, toh database se UPI ID manga lo
    if (tabId === 'settings') {
        const upiBox = document.getElementById('adminUpiInput');
        if (upiBox && !upiBox.value) {
            try {
                const q = query(collection(db, "merchants"), where("restaurantId", "==", window.currentRestaurantId));
                const snap = await getDocs(q);
                if (!snap.empty && snap.docs[0].data().upiId) {
                    upiBox.value = snap.docs[0].data().upiId;
                }
            } catch(e) {}
        }
    }
};
// =======================================================
// 🔄 VIP AUTO-REFRESH ENGINE FOR LIVE TABLES
// =======================================================
// Ye engine background me chupke se dekhta rahega, aur jaise hi
// customer order karega ya payment hogi, tables ka color apne aap badal dega!

setTimeout(() => {
    if (window.currentRestaurantId) {
        const qLiveTableOrders = query(collection(db, "orders"), where("restaurantId", "==", window.currentRestaurantId));
        
        onSnapshot(qLiveTableOrders, () => {
            // Jaise hi database me koi bhi halchal hogi (Order/Payment),
            // Ye engine automatically Tables ko refresh kar dega (Bina page reload kiye)
            if (typeof window.renderTables === 'function') {
                setTimeout(() => {
                    window.renderTables();
                }, 500); // 0.5 sec ka delay taaki data properly sync ho jaye
            }
        });
    }
}, 2000); // App load hone ke 2 second baad engine start hoga
