import { APIService } from './core/db-adapter.js';
import { initSession, getSessionData } from './core/session.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, getDocs, query, orderBy, limit, doc, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// ==========================================
// 🚀 SMART SAAS URL READER
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const scannedRestaurantId = urlParams.get('rest');
window.currentRestaurantId = scannedRestaurantId ? scannedRestaurantId : 'rest_001';
console.log("Customer is viewing Menu for Hotel ID: ", window.currentRestaurantId);
// 🚀 INSTANT CACHE LOADER (0ms Hotel Name Display)
const cachedHotelName = localStorage.getItem('crave_hotel_name_cache');
if (cachedHotelName) {
    const loaderBrand = document.getElementById('loader-brand-name');
    if (loaderBrand) loaderBrand.innerText = cachedHotelName;
}

// ==========================================
// ✨ 10-IN-1 RANDOM LUXURY SAAS TAGLINE ENGINE
// ==========================================
window.updateSmartGreeting = () => {
    const greetingEl = document.getElementById('greeting-display');
    if (!greetingEl) return;

    // 10 Best Catchy & Luxury Taglines with matching icons
    const taglines = [
        { text: "Love At First Bite", icon: "ph-heart", color: "var(--danger)" },
        { text: "Smart • Fast • Delicious", icon: "ph-lightning", color: "var(--warning)" },
        { text: "Good Food • Great Mood", icon: "ph-smiley-wink", color: "var(--green)" },
        { text: "Fresh • Fast • Flavorful", icon: "ph-leaf", color: "var(--green)" },
        { text: "Scan • Order • Enjoy", icon: "ph-qr-code", color: "var(--primary)" },
        { text: "Savor The Flavor", icon: "ph-cooking-pot", color: "var(--warning)" },
        { text: "Crafted With Passion", icon: "ph-star-four", color: "var(--danger)" },
        { text: "Taste • Elegance • Joy", icon: "ph-sparkle", color: "var(--warning)" },
        { text: "Freshly Cooked For You", icon: "ph-chef-hat", color: "var(--primary)" },
        { text: "Feast • Flavor • Fun", icon: "ph-confetti", color: "var(--danger)" }
    ];

    // Randomly ek pick karo
    const randomPick = taglines[Math.floor(Math.random() * taglines.length)];

    greetingEl.innerHTML = `${randomPick.text} <i class="ph-fill ${randomPick.icon}" style="color: ${randomPick.color}; margin-left: 2px;"></i>`;
};


window.allDishes = [];
window.currentDish = null;
window.currentVariant = 'full'; 
window.activeCategory = 'All'; 
window.trendingIds = []; 
window.currentOrderType = 'Dine-in';
window.favorites = JSON.parse(localStorage.getItem('nextplate_favs')) || [];
window.cart = JSON.parse(localStorage.getItem('nextplate_cart')) || {};

window.saveCart = () => { localStorage.setItem('nextplate_cart', JSON.stringify(window.cart)); };

setTimeout(() => { window.updateGlobalCartUI(); }, 500);

window.closeCoinModal = () => document.getElementById('coinModal').classList.remove('show');
window.toggleTracker = () => document.getElementById('tracker-modal').classList.toggle('show');
window.switchOrderTab = (tab) => {
    document.getElementById('tab-live-orders').classList.remove('active'); document.getElementById('tab-past-orders').classList.remove('active');
    document.getElementById('live-orders-container').style.display = 'none'; document.getElementById('past-orders-container').style.display = 'none';
    document.getElementById(`tab-${tab}-orders`).classList.add('active'); document.getElementById(`${tab}-orders-container`).style.display = 'block';
};
window.toggleFavList = () => { const modal = document.getElementById('fav-modal'); if(!modal.classList.contains('show')) window.renderFavList(); modal.classList.toggle('show'); };
window.closeAlert = () => document.getElementById('customAlert').classList.remove('show');
window.openWaiterPrompt = () => { document.getElementById('waiterTableInput').value = ''; document.getElementById('waiterRemarkInput').value = ''; document.getElementById('waiterPromptModal').classList.add('show'); window.triggerHapticPop(); };
window.closeWaiterPrompt = () => document.getElementById('waiterPromptModal').classList.remove('show');

window.confirmCallWaiter = async () => {
    const tableNo = document.getElementById('waiterTableInput').value; const remark = document.getElementById('waiterRemarkInput').value || "No remark";
    if (!tableNo) { alert("Please enter a table number!"); return; }
    try {
        await addDoc(collection(db, "waiter_calls"), { tableNumber: tableNo, remark: remark, status: "New", timestamp: new Date(), restaurantId: window.currentRestaurantId });
        window.closeWaiterPrompt(); window.showToast("Waiter is on the way!"); window.triggerHapticPop();
    } catch(e) { alert("Failed to call waiter."); }
};

window.triggerHapticPop = () => { try { if(navigator.vibrate) navigator.vibrate(40); const audio = document.getElementById('popSound'); audio.currentTime = 0; audio.play().catch(()=>{}); } catch(err) {} };

window.createFlyingDot = (e) => {
    if (!e || !e.clientX) return;
    const target = document.getElementById('cart-icon-target'); const targetRect = target.getBoundingClientRect();
    const dot = document.createElement('div'); dot.className = 'flying-dot'; dot.style.left = `${e.clientX - 10}px`; dot.style.top = `${e.clientY - 10}px`;
    document.body.appendChild(dot);
    setTimeout(() => { dot.style.opacity = '1'; dot.style.transform = `translate(${targetRect.left - e.clientX + 20}px, ${targetRect.top - e.clientY + 10}px) scale(0.5)`; }, 10);
    setTimeout(() => { dot.remove(); target.style.transform = 'scale(1.2)'; setTimeout(() => target.style.transform = 'scale(1)', 200); }, 600);
};

window.showToast = (msg) => { const toast = document.getElementById('toast'); toast.querySelector('span').innerText = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); };

window.toggleFavIcon = (e) => {
    e.stopPropagation(); window.triggerHapticPop();
    const btn = e.currentTarget; if(!window.currentDish) return; const dishId = window.currentDish.id;
    if (window.favorites.includes(dishId)) {
        window.favorites = window.favorites.filter(id => id !== dishId);
        btn.style.color = '#BDBDBD'; window.showToast("Removed from Favorites");
    } else {
        window.favorites.push(dishId);
        btn.style.color = 'var(--danger)'; window.showToast("Added to Favorites!");
    }
    localStorage.setItem('nextplate_favs', JSON.stringify(window.favorites));
    if(document.getElementById('fav-modal').classList.contains('show')) window.renderFavList();
};

window.renderFavList = () => {
    const list = document.getElementById('fav-items-list'); list.innerHTML = '';
    if(window.favorites.length === 0) { list.innerHTML = '<div style="text-align:center; padding:40px 0;"><i class="ph-fill ph-heart-break" style="font-size:40px; color:var(--text-sub); opacity:0.3; margin-bottom:10px;"></i><p style="color:var(--text-sub); font-weight:600; margin:0;">No favorites yet!</p></div>'; return; }
    window.favorites.forEach(favId => {
        const dish = window.allDishes.find(d => d.id === favId);
        if(dish) {
            let imgBg = dish.images && dish.images.length > 0 ? dish.images[0] : '';
            list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border:1px solid var(--border-light); border-radius:16px; margin-bottom:10px; background:var(--white); box-shadow:var(--shadow-soft);">
                <div style="display:flex; align-items:center; gap:12px; flex:1; cursor:pointer;" onclick="loadDishFromFav('${dish.id}')">
                    <div style="width:50px; height:50px; border-radius:10px; background:url('${imgBg}') center/cover; background-color:#eee;"></div>
                    <div><b style="font-size:14px; color:var(--text-main);">${dish.name}</b><div style="font-size:13px; color:var(--primary); font-weight:700;">₹${dish.price}</div></div>
                </div>
                <button onclick="quickAddFav('${dish.id}')" style="background:rgba(226, 55, 68, 0.1); color:var(--danger); border:none; padding:8px 16px; border-radius:12px; font-weight:700; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:4px;"><i class="ph-bold ph-plus"></i> ADD</button>
            </div>`;
        }
    });
};

window.loadDishFromFav = (id) => { const dish = window.allDishes.find(d => d.id === id); if(dish) { window.loadDish(dish); window.toggleFavList(); } };

window.quickAddFav = (id) => {
    const dish = window.allDishes.find(d => d.id === id);
    if(dish) {
        const key = `${dish.id}_full`;
        if(window.cart[key]) window.cart[key].qty++; else window.cart[key] = { id: dish.id, name: dish.name, price: dish.price, variant: '', qty: 1 };
        window.saveCart(); window.triggerHapticPop(); window.showToast("Added to Cart!");
        window.updateGlobalCartUI(); if(window.currentDish && window.currentDish.id === id) window.checkCartForCurrentDish();
    }
};

const i18n = {
    en: { add: "ADD", ar: "View on Table", viewCart: "Continue", cartTitle: "Your Cart", place: "Place Order", totalPay: "Total to Pay", alertOk: "OK, Got it", search: "Search...", trackTitle: "My Orders", trackBtn: "Orders", dineIn: "Dine-in", takeaway: "Takeaway", waiter: "Waiter", notes: "Chef Notes", waiterTitle: "Call Waiter", waiterCancel: "Cancel", waiterCall: "Call Now", waiterInput: "Enter Table Number" },
    hi: { add: "जोड़ें", ar: "टेबल पर देखें", viewCart: "आगे बढ़ें", cartTitle: "आपकी कार्ट", place: "ऑर्डर दें", totalPay: "कुल भुगतान", alertOk: "ठीक है", search: "खोजें...", trackTitle: "मेरे ऑर्डर", trackBtn: "ऑर्डर", dineIn: "यहीं खाएंगे", takeaway: "पैक करें", waiter: "वेटर", notes: "शेफ के लिए निर्देश", waiterTitle: "वेटर बुलाएं", waiterCancel: "रद्द करें", waiterCall: "कॉल करें", waiterInput: "टेबल नंबर दर्ज करें" }
};

let currentLang = 'en';
window.setLanguage = (l) => {
    currentLang = l; document.getElementById('btn-en').classList.toggle('active', l === 'en'); document.getElementById('btn-hi').classList.toggle('active', l === 'hi');
    document.getElementById('btn-add-new').innerHTML = `${i18n[l].add} <i class="ph-bold ph-plus"></i>`; 
    document.getElementById('float-btn-view').innerHTML = `${i18n[l].viewCart} <i class="ph-bold ph-arrow-right"></i>`; document.getElementById('cart-title-text').innerHTML = `<i class="ph-fill ph-shopping-bag"></i> ${i18n[l].cartTitle}`;
    document.getElementById('checkoutBtn').innerHTML = `${i18n[l].place} <i class="ph-bold ph-arrow-right"></i>`; document.getElementById('bill-total-text').innerText = i18n[l].totalPay;
    document.getElementById('btn-alert-ok').innerText = i18n[l].alertOk; document.getElementById('searchInput').placeholder = i18n[l].search;
    document.getElementById('tracker-title-text').innerHTML = `<i class="ph-fill ph-receipt"></i> ${i18n[l].trackTitle}`; document.getElementById('track-btn-text').innerHTML = `<i class="ph-fill ph-package"></i> ${i18n[l].trackBtn}`;
    document.getElementById('waiterTitleText').innerText = i18n[l].waiterTitle; document.getElementById('waiterCancelBtn').innerText = i18n[l].waiterCancel;
    document.getElementById('waiterCallBtn').innerText = i18n[l].waiterCall; document.getElementById('waiterTableInput').placeholder = i18n[l].waiterInput;
    window.setOrderType(window.currentOrderType); window.updateGlobalCartUI();
};
try { window.setLanguage(currentLang); } catch(e) {}

window.startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { window.showToast("Voice search not supported"); return; }
    const recognition = new SpeechRecognition(); recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
    const micBtn = document.getElementById('micBtn'); micBtn.classList.add('listening'); window.triggerHapticPop();
    recognition.start(); recognition.onresult = (e) => { document.getElementById('searchInput').value = e.results[0][0].transcript; window.applyFilters(); };
    recognition.onspeechend = () => { micBtn.classList.remove('listening'); }; recognition.onerror = () => { micBtn.classList.remove('listening'); };
};

window.setOrderType = (type) => {
    window.currentOrderType = type; document.getElementById('btn-dinein').classList.toggle('active', type === 'Dine-in'); document.getElementById('btn-takeaway').classList.toggle('active', type === 'Takeaway');
    const tableInput = document.getElementById('tableNumber'); const nameInput = document.getElementById('customerName');
    if (type === 'Takeaway') { tableInput.style.display = 'none'; tableInput.required = false; nameInput.placeholder = currentLang === 'hi' ? "आपका नाम (पैक करने के लिए ज़रूरी) *" : "Your Name (Required for Takeaway) *"; nameInput.required = true; } 
    else { tableInput.style.display = 'block'; tableInput.required = true; nameInput.placeholder = currentLang === 'hi' ? "आपका नाम (वैकल्पिक)" : "Your Name (Optional)"; nameInput.required = false; }
};

let pzInstance = null; let fsImages = []; let fsCurrentIndex = 0;
window.openFullscreen = (index) => { 
    if (!window.currentDish || !window.currentDish.images) return; 
    fsImages = window.currentDish.images; fsCurrentIndex = index; 
    document.getElementById('fs-viewer').classList.add('show'); window.updateFsImage(); history.pushState({ fsOpen: true }, "", "#photo"); 
};
window.updateFsImage = () => {
    const img = document.getElementById('fs-img'); if (pzInstance) { pzInstance.dispose(); pzInstance = null; }
    img.style.transform = ''; img.onload = () => { pzInstance = panzoom(img, { maxZoom: 5, minZoom: 1, bounds: true, boundsPadding: 0 }); }; img.src = fsImages[fsCurrentIndex];
    const prevBtn = document.querySelector('.fs-prev'); const nextBtn = document.querySelector('.fs-next');
    if (fsImages.length <= 1) { prevBtn.classList.add('hide'); nextBtn.classList.add('hide'); } else { prevBtn.classList.remove('hide'); nextBtn.classList.remove('hide'); }
    const dotsContainer = document.getElementById('fs-dots'); dotsContainer.innerHTML = '';
    if (fsImages.length > 1) { fsImages.forEach((_, idx) => { const dot = document.createElement('div'); dot.className = `fs-dot ${idx === fsCurrentIndex ? 'active' : ''}`; dotsContainer.appendChild(dot); }); }
};
window.navigateFs = (direction) => { fsCurrentIndex += direction; if (fsCurrentIndex < 0) fsCurrentIndex = fsImages.length - 1; if (fsCurrentIndex >= fsImages.length) fsCurrentIndex = 0; window.updateFsImage(); };
window.closeFullscreen = (e) => { if (e) e.stopPropagation(); document.getElementById('fs-viewer').classList.remove('show'); if (pzInstance) { pzInstance.dispose(); pzInstance = null; } if (window.location.hash === "#photo") history.back(); };
window.addEventListener('popstate', (e) => { if (document.getElementById('fs-viewer').classList.contains('show')) { document.getElementById('fs-viewer').classList.remove('show'); if (pzInstance) { pzInstance.dispose(); pzInstance = null; } } });

let touchStartX = 0; let touchEndX = 0; const fsViewer = document.getElementById('fs-viewer');
fsViewer.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
fsViewer.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; if (fsImages.length > 1) { let currentScale = pzInstance ? pzInstance.getTransform().scale : 1; if (currentScale <= 1.1) { const threshold = 50; if (touchEndX < touchStartX - threshold) window.navigateFs(1); if (touchEndX > touchStartX + threshold) window.navigateFs(-1); } } }, {passive: true});

window.toggleMedia = () => {
    const slider = document.getElementById('photo-slider'); const toggleBtn = document.getElementById('media-toggle');
    const viewer = document.querySelector('#ar-viewer');
    if (slider.classList.contains('hide')) { slider.classList.remove('hide'); if(viewer) viewer.style.display = 'none'; toggleBtn.innerHTML = '<i class="ph-fill ph-cube"></i> View 3D'; } 
    else { slider.classList.add('hide'); if(viewer) { viewer.style.display = 'block'; viewer.src = viewer.getAttribute('data-src'); } toggleBtn.innerHTML = '<i class="ph-fill ph-image"></i> View Photos'; }
};

// ==========================================
// 📈 MULTI-TRACKER & DYNAMIC HEADER BUTTON
// ==========================================
let activeOrderListeners = {}; let activeOrderData = {};

window.listenToLiveOrder = function(orderId) {
    if (activeOrderListeners[orderId]) return; 
    activeOrderListeners[orderId] = onSnapshot(doc(db, "orders", orderId), (d) => { if (!d.exists()) return; activeOrderData[orderId] = d.data(); window.renderMultiTracker(); });
}

window.renderMultiTracker = function() {
    const liveContainer = document.getElementById('live-orders-container'); 
    const pastContainer = document.getElementById('past-orders-container');
    
    // Dynamic Header Button Elements
    const trackBtn = document.getElementById('btn-track-order'); 
    const trackBtnText = document.getElementById('track-btn-text');
    const pulse = document.getElementById('track-badge-pulse');

    if(liveContainer) liveContainer.innerHTML = ''; 
    if(pastContainer) pastContainer.innerHTML = ''; 
    
    let showTrackBtn = false; 
    let showPulse = false;
    let activeOrdersList = []; 
    try { activeOrdersList = JSON.parse(localStorage.getItem('craveActiveOrders') || '[]'); } catch(e) { activeOrdersList = []; }
    let newActiveList = [];
    let highestStatusLevel = -1; 

    activeOrdersList.forEach(id => {
        const data = activeOrderData[id]; 
        if (!data) { newActiveList.push(id); return; }
        
        let statusRaw = data.status; 
        newActiveList.push(id); 
        
        let isNew = (statusRaw === 'New'); 
        let isAcc = (statusRaw === 'Accepted'); 
        let isPrep = (statusRaw === 'Preparing'); 
        let isReady = (statusRaw === 'Ready');
        let isServed = (statusRaw === 'Served'); 
        let isCanc = (statusRaw === 'Cancelled');
        let isDone = isServed; 
        
        if (!isCanc) showTrackBtn = true; 
        if (isNew || isPrep || isAcc || isReady) showPulse = true;

        let currentLevel = -1;
        if (isNew) currentLevel = 0;
        if (isAcc) currentLevel = 1;
        if (isPrep) currentLevel = 2;
        if (isReady) currentLevel = 3;
        if (currentLevel > highestStatusLevel) highestStatusLevel = currentLevel;

        let isToday = false;
        if (data.timestamp) { 
            const d = data.timestamp.toDate(); const t = new Date(); 
            isToday = d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear(); 
        } else { isToday = true; }

        let itemsList = data.items.map(i => `<span style="display:block; padding:4px 0; border-bottom:1px solid rgba(0,0,0,0.02);"><b>${i.qty}x</b> ${i.name}</span>`).join('');
        
        let orderTime = '';
        if (data.timestamp) {
            const d = data.timestamp.toDate();
            const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            orderTime = `<span style="font-weight: 700;">${isToday ? 'Today' : d.toLocaleDateString()}</span>, ${timeStr}`;
        }

        let actionHtml = '';
        if (isNew) actionHtml = `<button onclick="cancelCustomerOrder('${id}')" style="background:#FFE5E5; color:var(--danger); border:1px solid var(--danger); padding:8px 16px; border-radius:50px; font-size:12px; font-weight:700; cursor:pointer; display:inline-block; margin-top:10px; transition:0.2s;">Cancel ❌</button>`;
        else if (isPrep) { let eta = data.items.length * 5; actionHtml = `<div style="background:rgba(255, 159, 0, 0.1); color:var(--warning); padding:10px; border-radius:12px; font-size:13px; font-weight:700; text-align:center; margin-top:15px; border:1px dashed var(--warning);">⏳ ETA: ${eta} - ${eta+5} Mins</div>`; } 
        else if (isDone) actionHtml = `<div style="background:rgba(36, 150, 63, 0.1); color:var(--green); border:1px dashed var(--green); padding:10px; border-radius:12px; font-size:12px; font-weight:700; text-align:center; margin-top:15px; margin-bottom:10px;">🎉 Enjoy your meal!</div>`;
        else if (isCanc) actionHtml = `<div style="background:var(--bg-light); color:var(--text-sub); padding:10px; border-radius:12px; font-size:13px; font-weight:700; text-align:center; margin-top:15px;">Order Cancelled</div>`;

        let cardBg = isDone ? 'var(--light-green)' : '#fff'; 
        let cardBorder = isDone ? '1px solid #24963F' : '1px solid var(--border-light)';

        let cardHtml = `
        <div style="background:${cardBg}; border:${cardBorder}; border-radius: 20px; padding: 20px; margin-bottom: 15px; text-align: left; box-shadow: var(--shadow-soft); transition:0.3s;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom: 1px solid #eee; padding-bottom:10px;">
                <div style="font-weight:800; color:var(--text-main); font-size:16px;">#${id.slice(-4)}</div>
                <div style="display:flex; flex-direction:column; align-items:flex-end;">
                    <div style="font-size:16px; font-weight:800; color:var(--primary);">₹${data.totalAmount}</div>
                    <div style="font-size:11px; color:var(--text-sub); font-weight:500;">${orderTime}</div>
                </div>
            </div>
            <div style="font-size: 13px; color: var(--text-main); font-weight: 500; margin-bottom: 20px;">${itemsList}</div>
            
            ${(!isCanc && !isDone) ? `      
            <div class="visual-tracker" style="display: flex; justify-content: space-between; position: relative; margin-top: 15px;">
                <div style="position: absolute; top: 15px; left: 10%; right: 10%; height: 3px; background: var(--border-light); z-index: 1;"></div>
                
                <div class="tracker-step" style="z-index: 2; text-align: center; width: 25%;">
                    <div class="step-icon" style="background: ${isNew ? 'var(--primary)' : 'var(--success)'}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: ${isNew ? '0 0 10px rgba(226,55,68,0.5)' : 'none'};"><i class="ph-bold ph-receipt"></i></div>
                    <div class="step-text" style="font-size: 10px; font-weight: 700; margin-top: 5px; color: var(--text-main);">Placed</div>
                </div>

                <div class="tracker-step" style="z-index: 2; text-align: center; width: 25%;">
                    <div class="step-icon" style="background: ${isAcc ? 'var(--primary)' : (isPrep || isReady || isServed ? 'var(--success)' : '#eee')}; color: ${isAcc || isPrep || isReady || isServed ? 'white' : '#aaa'}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: ${isAcc ? '0 0 10px rgba(226,55,68,0.5)' : 'none'};"><i class="ph-bold ph-thumbs-up"></i></div>
                    <div class="step-text" style="font-size: 10px; font-weight: 700; margin-top: 5px; color: ${isAcc || isPrep || isReady || isServed ? 'var(--text-main)' : '#aaa'};">Accepted</div>
                </div>

                <div class="tracker-step" style="z-index: 2; text-align: center; width: 25%;">
                    <div class="step-icon" style="background: ${isPrep ? 'var(--warning)' : (isReady || isServed ? 'var(--success)' : '#eee')}; color: ${isPrep || isReady || isServed ? 'white' : '#aaa'}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: ${isPrep ? '0 0 10px rgba(255,159,0,0.5)' : 'none'};"><i class="ph-bold ph-cooking-pot"></i></div>
                    <div class="step-text" style="font-size: 10px; font-weight: 700; margin-top: 5px; color: ${isPrep || isReady || isServed ? 'var(--text-main)' : '#aaa'};">Cooking</div>
                </div>
                
                <div class="tracker-step" style="z-index: 2; text-align: center; width: 25%;">
                    <div class="step-icon" style="background: ${isReady ? 'var(--success)' : (isServed ? 'var(--success)' : '#eee')}; color: ${isReady || isServed ? 'white' : '#aaa'}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: ${isReady ? '0 0 10px rgba(36,150,63,0.5)' : 'none'};"><i class="ph-bold ph-bell-ringing"></i></div>
                    <div class="step-text" style="font-size: 10px; font-weight: 700; margin-top: 5px; color: ${isReady || isServed ? 'var(--text-main)' : '#aaa'};">Ready</div>
                </div>
            </div>` : ''}

            ${actionHtml}
        </div>`;

        // 🔥 STRICT TODAY VS PAST LOGIC 🔥
        if(liveContainer && pastContainer) {
            if (isToday) liveContainer.innerHTML = cardHtml + liveContainer.innerHTML; 
            else pastContainer.innerHTML = cardHtml + pastContainer.innerHTML; 
        }
    });

    localStorage.setItem('craveActiveOrders', JSON.stringify(newActiveList));
    
    // 🔮 SMART HEADER BUTTON ANIMATION LOGIC 
    if(trackBtn && pulse) {
        if (showTrackBtn && activeOrdersList.length > 0) { 
            trackBtn.classList.add('show'); 
            pulse.style.display = showPulse ? 'block' : 'none'; 
            
            // Animation Trigger for Status Changes
            if (highestStatusLevel !== -1 && trackBtnText) {
                const previousStatus = trackBtn.getAttribute('data-status') || '-1';
                const currentStatusStr = highestStatusLevel.toString();
                
                let statusText = "Orders"; let statusIcon = "ph-package"; let expandClass = "expand";

                if (highestStatusLevel === 0) { statusText = "Placed!"; statusIcon = "ph-receipt"; expandClass = "expand"; } 
                else if (highestStatusLevel === 1) { statusText = "Accepted"; statusIcon = "ph-thumbs-up"; expandClass = "expand-blue"; } 
                else if (highestStatusLevel === 2) { statusText = "Cooking..."; statusIcon = "ph-cooking-pot"; expandClass = "expand"; } 
                else if (highestStatusLevel === 3) { statusText = "Ready!"; statusIcon = "ph-bell-ringing"; expandClass = "expand-green"; }

                if (previousStatus !== currentStatusStr) {
                    trackBtn.setAttribute('data-status', currentStatusStr);
                    trackBtnText.innerHTML = `<i class="ph-fill ${statusIcon}"></i> ${statusText}`;
                    
                    trackBtn.classList.remove('expand', 'expand-blue', 'expand-green');
                    trackBtn.classList.add(expandClass);
                    
                    setTimeout(() => {
                        trackBtn.classList.remove('expand', 'expand-blue', 'expand-green');
                        setTimeout(() => { trackBtnText.innerHTML = `<i class="ph-fill ph-package"></i> Orders`; }, 300);
                    }, 3000);
                }
            }
        } 
        else { 
            trackBtn.classList.remove('show'); 
            if(trackBtnText) trackBtnText.innerHTML = `<i class="ph-fill ph-package"></i> Orders`;
            trackBtn.setAttribute('data-status', '-1');
        }
    }
    
    if(liveContainer && liveContainer.innerHTML === '') liveContainer.innerHTML = `<div style="text-align:center; padding: 40px 0; color:var(--text-sub);"><i class="ph-fill ph-receipt" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><p style="font-size:13px; font-weight:600; margin:0;">No orders placed today.</p></div>`;
    if(pastContainer && pastContainer.innerHTML === '') pastContainer.innerHTML = `<div style="text-align:center; padding: 40px 0; color:var(--text-sub);"><i class="ph-fill ph-clock-counter-clockwise" style="font-size:40px; opacity:0.3; margin-bottom:10px;"></i><p style="font-size:13px; font-weight:600; margin:0;">No past orders found.</p></div>`;
}

window.orderToCancelId = null;

window.cancelCustomerOrder = (orderId) => { window.orderToCancelId = orderId; document.getElementById('cancelConfirmModal').classList.add('show'); window.triggerHapticPop(); };
window.closeCancelModal = () => { window.orderToCancelId = null; document.getElementById('cancelConfirmModal').classList.remove('show'); };
window.confirmCancelOrder = async () => {
    const orderId = window.orderToCancelId;
    if (!orderId) { alert("System Error: Order ID is missing!"); return; }
    window.showToast("Cancelling...");
    try { 
        await updateDoc(doc(db, "orders", orderId), { status: 'Cancelled' }); 
        window.closeCancelModal(); window.showToast("Order Cancelled Successfully! ❌"); 
        if(typeof window.triggerHapticPop === 'function') window.triggerHapticPop();
    } catch(e) { window.showToast("Failed to cancel order."); window.closeCancelModal(); }
};

window.filterCategory = function(cat, element) { window.activeCategory = cat; document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active')); element.classList.add('active'); window.applyFilters(); };

window.applyFilters = function() {
    const queryText = document.getElementById('searchInput').value.toLowerCase(); let filtered = window.allDishes;
    if (window.activeCategory === 'Veg Only') filtered = filtered.filter(d => (d.emoji && d.emoji.includes('🟢')) || d.category === 'Veg' || d.category === 'Desserts' || d.category === 'Drinks');
    else if (window.activeCategory === 'Non-Veg Only') filtered = filtered.filter(d => (d.emoji && d.emoji.includes('🔴')) || d.category === 'Non-Veg');
    else if (window.activeCategory === 'Trending') filtered = filtered.filter(d => window.trendingIds.includes(d.id));
    else if (window.activeCategory !== 'All') filtered = filtered.filter(dish => dish.category === window.activeCategory);
    if (queryText) filtered = filtered.filter(dish => dish.name.toLowerCase().includes(queryText));
    window.renderSidebar(filtered);
};

function getPremiumIcon(category) {
    let cat = (category || '').toLowerCase();
    if (cat.includes('veg') && !cat.includes('non')) return '<i class="ph-fill ph-leaf" style="color: var(--green);"></i>';
    if (cat.includes('non')) return '<i class="ph-fill ph-bone" style="color: var(--danger);"></i>';
    if (cat.includes('starter')) return '<i class="ph-fill ph-bowl-food" style="color: var(--warning);"></i>';
    if (cat.includes('main')) return '<i class="ph-fill ph-cooking-pot" style="color: var(--primary);"></i>';
    if (cat.includes('bread')) return '<i class="ph-fill ph-bread"></i>';
    if (cat.includes('rice')) return '<i class="ph-fill ph-bowl-steam"></i>';
    if (cat.includes('drink')) return '<i class="ph-fill ph-martini"></i>';
    if (cat.includes('dessert')) return '<i class="ph-fill ph-ice-cream"></i>';
    return '<i class="ph-fill ph-fork-knife"></i>';
}

window.renderSidebar = function(dishesToRender) {
    const sidebar = document.getElementById('sidebar-menu'); sidebar.innerHTML = '';
    if (dishesToRender.length === 0) { sidebar.innerHTML = '<div style="padding:40px 10px; font-size:12px; color:var(--text-sub); text-align:center;"><i class="ph-fill ph-magnifying-glass" style="font-size:30px; opacity:0.5; margin-bottom:10px;"></i><br>No match</div>'; return; }
    
    const groupedDishes = {};
    dishesToRender.forEach(dish => { const cat = window.activeCategory === 'Trending' ? 'TRENDING' : (dish.category || "Uncategorized"); if (!groupedDishes[cat]) groupedDishes[cat] = []; groupedDishes[cat].push(dish); });

    for (let cat in groupedDishes) {
        const header = document.createElement('div'); header.style.padding = "20px 5px 10px 5px"; header.style.fontSize = "10px"; header.style.fontWeight = "800"; header.style.color = "var(--text-sub)"; header.style.textAlign = "center"; header.innerText = cat.toUpperCase(); sidebar.appendChild(header);
        groupedDishes[cat].forEach((data) => {
            const itemDiv = document.createElement('div'); itemDiv.className = `side-item ${window.currentDish && window.currentDish.id === data.id ? 'active' : ''}`;
            let trendTag = window.trendingIds.includes(data.id) ? '<div class="best-seller-tag"><i class="ph-fill ph-star"></i> Best Seller</div>' : '';
            let displayIcon = data.emoji; if(!data.emoji || data.emoji.length >= 5 || data.emoji === '🍲') displayIcon = getPremiumIcon(data.category);
            itemDiv.innerHTML = `<div class="side-icon-wrapper" style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${displayIcon}</div><div class="side-name">${data.name}<br>${trendTag}</div>`;
            itemDiv.onclick = () => { document.querySelectorAll('.side-item').forEach(d => d.classList.remove('active')); itemDiv.classList.add('active'); window.loadDish(data); };
            sidebar.appendChild(itemDiv);
        });
    }
};

window.loadDish = function(data) {
    window.currentDish = data; window.currentVariant = 'full'; 
    let iconClass = 'ph-circle'; let iconColor = 'var(--text-sub)';
    if (data.category === 'Veg') { iconClass = 'ph-circle'; iconColor = 'var(--green)'; } else if (data.category === 'Non-Veg') { iconClass = 'ph-triangle'; iconColor = 'var(--danger)'; } else if (data.category === 'Drinks') { iconClass = 'ph-brandy'; iconColor = '#007AFF'; } else if (data.category === 'Desserts') { iconClass = 'ph-ice-cream'; iconColor = 'var(--warning)'; }

    document.getElementById('display-type-icon').innerHTML = `<i class="ph-fill ${iconClass}" style="color:${iconColor}"></i>`;
    document.getElementById('display-name').innerText = data.name; 

    let currentPrice = data.price; let fakeOldPrice = currentPrice + Math.floor(currentPrice * 0.2);
    document.getElementById('display-price').innerHTML = `<span style="font-size: 16px; color: #BDBDBD; text-decoration: line-through; margin-right: 8px; font-weight: 500;">₹${fakeOldPrice}</span>₹${currentPrice}`;
    
    const variantBox = document.getElementById('variant-box'); const btnHalf = document.getElementById('btn-half'); const btnFull = document.getElementById('btn-full'); const btnPiece = document.getElementById('btn-piece');
    btnHalf.style.display = data.priceHalf ? 'block' : 'none'; btnPiece.style.display = data.pricePiece ? 'block' : 'none';
    if (data.priceHalf || data.pricePiece) { variantBox.classList.remove('hide'); btnFull.classList.add('active'); btnHalf.classList.remove('active'); btnPiece.classList.remove('active'); } else { variantBox.classList.add('hide'); }

    const slider = document.getElementById('photo-slider'); const toggleBtn = document.getElementById('media-toggle'); const viewer = document.querySelector('#ar-viewer'); const progressBar = document.querySelector('.progress-bar');
    slider.innerHTML = ''; slider.classList.remove('hide'); 
    if(viewer) { viewer.style.display = 'none'; viewer.removeAttribute('src'); } if(progressBar) progressBar.classList.add('hide');

    let validImages = [];
    if (data.images && Array.isArray(data.images) && data.images.length > 0) validImages = data.images.filter(url => url && url.trim() !== "");
    else if (data.image && typeof data.image === 'string' && data.image.trim() !== "") validImages = [data.image];
    else if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim() !== "") validImages = [data.imageUrl];

    if (validImages.length > 0) { validImages.forEach((imgUrl, idx) => { const img = document.createElement('img'); img.src = imgUrl; img.className = 'slide-img'; img.onclick = () => window.openFullscreen(idx); slider.appendChild(img); }); } 
    else { slider.innerHTML = `<img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" class="slide-img" style="opacity: 0.8; object-fit: cover;">`; }

    if (data.modelUrl && data.modelUrl.trim() !== "") { toggleBtn.classList.remove('hide'); toggleBtn.innerHTML = '<i class="ph-fill ph-cube"></i> View 3D'; if(viewer) viewer.setAttribute('data-src', data.modelUrl); } 
    else { toggleBtn.classList.add('hide'); }
    
    const favBtn = document.querySelector('.card-fav-btn');
    if(window.favorites.includes(data.id)) favBtn.style.color = 'var(--danger)'; else favBtn.style.color = '#BDBDBD';

    window.checkCartForCurrentDish();
};

window.selectVariant = (type) => {
    window.currentVariant = type; document.querySelectorAll('.var-btn').forEach(b => b.classList.remove('active')); document.getElementById('btn-' + type).classList.add('active');
    let selPrice = window.currentDish.price; if (type === 'half') selPrice = window.currentDish.priceHalf; else if (type === 'piece') selPrice = window.currentDish.pricePiece;
    let fakeOldPrice = selPrice + Math.floor(selPrice * 0.2); document.getElementById('display-price').innerHTML = `<span style="font-size: 16px; color: #BDBDBD; text-decoration: line-through; margin-right: 8px; font-weight: 500;">₹${fakeOldPrice}</span>₹${selPrice}`;
    window.checkCartForCurrentDish(); 
};

window.getCartKey = function() { return `${window.currentDish.id}_${window.currentVariant}`; }

window.checkCartForCurrentDish = () => {
    const key = window.getCartKey(); const wrapper = document.getElementById('add-action-wrapper');
    if (window.cart[key] && window.cart[key].qty > 0) { wrapper.classList.add('show-stepper'); document.getElementById('current-qty-display').innerText = window.cart[key].qty; } else { wrapper.classList.remove('show-stepper'); }
};

window.addCurrentToCart = (e) => {
    const key = window.getCartKey(); let price = window.currentDish.price; let variantText = '';
    if (window.currentVariant === 'half') { price = window.currentDish.priceHalf; variantText = '(Half)'; }
    if (window.currentVariant === 'piece') { price = window.currentDish.pricePiece; variantText = '(Per Piece)'; }
    window.cart[key] = { id: window.currentDish.id, name: window.currentDish.name, price: price, variant: variantText, qty: 1 };
    window.saveCart(); window.triggerHapticPop(); window.createFlyingDot(e); window.showToast("Added to Cart!");
    window.updateGlobalCartUI(); window.checkCartForCurrentDish();
};

window.changeCurrentQty = (delta) => { const key = window.getCartKey(); window.changeCartQty(key, delta); };
window.changeCartQty = (key, delta) => { if (window.cart[key]) { window.cart[key].qty += delta; if (window.cart[key].qty <= 0) delete window.cart[key]; } window.saveCart(); window.triggerHapticPop(); window.updateGlobalCartUI(); window.checkCartForCurrentDish(); window.renderCartModal(); };

window.updateGlobalCartUI = () => {
    const floatingBar = document.getElementById('floating-checkout'); const bottomUi = document.getElementById('bottom-ui-card');
    let totalItems = 0; let totalPrice = 0;
    for (let key in window.cart) { totalItems += window.cart[key].qty; totalPrice += (window.cart[key].price * window.cart[key].qty); }
    document.getElementById('cart-count').innerText = totalItems;
    if (totalItems > 0) {
        let itemStr = totalItems === 1 ? (currentLang === 'hi' ? "आइटम" : "ITEM") : (currentLang === 'hi' ? "आइटम" : "ITEMS");
        document.getElementById('float-items').innerText = `${totalItems} ${itemStr}`; document.getElementById('float-total').innerText = '₹' + totalPrice;
        floatingBar.classList.add('show'); if(bottomUi) bottomUi.style.paddingBottom = "140px";
        setTimeout(() => { const mainContent = document.querySelector('.main-content'); if(mainContent) { mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: "smooth" }); } }, 100);
    } else { floatingBar.classList.remove('show'); if(bottomUi) bottomUi.style.paddingBottom = "20px"; }
};

window.toggleCart = () => { const modal = document.getElementById('cart-modal'); if (!modal.classList.contains('show')) window.renderCartModal(); modal.classList.toggle('show'); };

window.renderCartModal = () => {
    const list = document.getElementById('cart-items-list'); list.innerHTML = ''; let totalPrice = 0; let isEmpty = true;
    for (let key in window.cart) {
        isEmpty = false; const item = window.cart[key]; totalPrice += (item.price * item.qty);
        list.innerHTML += `
        <div class="swipe-wrap">
            <div class="swipe-content">
                <div class="cart-item-info">
                    <b style="color:var(--text-main); font-size:14px; font-weight:700; letter-spacing:-0.3px;">${item.name}</b> 
                    <span style="font-size:12px; color:var(--text-sub);">${item.variant}</span>
                    <div style="font-weight:600; color:var(--text-sub); margin-top:5px;">₹${item.price} x ${item.qty} = <strong style="color:var(--text-main);">₹${item.price * item.qty}</strong></div>
                </div>
                <div class="cart-item-qty">
                    <button onclick="changeCartQty('${key}', -1)"><i class="ph-bold ph-minus"></i></button>
                    <span style="min-width:15px; text-align:center;">${item.qty}</span>
                    <button onclick="changeCartQty('${key}', 1)"><i class="ph-bold ph-plus"></i></button>
                </div>
            </div>
            <div class="swipe-action" onclick="deleteCartItem('${key}')"><i class="ph-bold ph-trash"></i></div>
        </div>`;
    }
    if (isEmpty) list.innerHTML = '<div style="text-align:center; padding:30px 0;"><i class="ph-fill ph-shopping-cart" style="font-size:40px; color:var(--text-sub); opacity:0.3; margin-bottom:10px;"></i><p style="color:var(--text-sub); font-weight:600; margin:0;">Your cart is empty!</p></div>';
    document.getElementById('bill-final').innerText = '₹' + totalPrice;
};

window.deleteCartItem = (key) => { delete window.cart[key]; window.saveCart(); window.triggerHapticPop(); window.updateGlobalCartUI(); window.checkCartForCurrentDish(); window.renderCartModal(); };

window.launchConfetti = function() {
    const canvas = document.getElementById('confetti-canvas'); const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let pieces = []; const colors = ['#E53935', '#24963F', '#FF9F00', '#FF5252', '#34C759'];
    for (let i = 0; i < 100; i++) pieces.push({ x: canvas.width / 2, y: canvas.height / 2 + 100, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 1) * 20 - 5, size: Math.random() * 8 + 5, color: colors[Math.floor(Math.random() * colors.length)], rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 10 });
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); let active = false;
        pieces.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.rot += p.rotSpeed; if (p.y < canvas.height) { active = true; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); ctx.restore(); } });
        if (active) requestAnimationFrame(animate); else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate(); window.triggerHapticPop();
}

// =========================================================
// 🚀 2-HOUR SESSION SECURITY & IN-APP SCANNER LOGIC 🚀
// =========================================================
const SESSION_LIMIT_HOURS = 2;
let html5QrCode;
let isQRProcessing = false; 

window.initDiningSession = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const nowTime = new Date().getTime();
    if (urlParams.get('scan') === 'true' || urlParams.get('rest')) {
        localStorage.setItem('dining_session_start', nowTime);
        if(urlParams.get('scan') === 'true') {
            urlParams.delete('scan'); let newUrl = window.location.pathname; if(urlParams.toString().length > 0) newUrl += '?' + urlParams.toString();
            window.history.replaceState({}, document.title, newUrl);
        }
    } else if (!localStorage.getItem('dining_session_start')) { localStorage.setItem('dining_session_start', nowTime); }
};

window.openInAppScanner = () => {
    const modal = document.getElementById('qrScannerModal'); if(modal) modal.classList.add('show');
    if(typeof window.triggerHapticPop === 'function') window.triggerHapticPop();
    html5QrCode = new Html5Qrcode("reader"); isQRProcessing = false; 
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

    html5QrCode.start( { facingMode: "environment" }, config, (decodedText, decodedResult) => {
        if (isQRProcessing) return; isQRProcessing = true;
        if(typeof window.triggerHapticPop === 'function') window.triggerHapticPop();
        if(decodedText.includes('rest=') || decodedText.includes('scan=')) {
            localStorage.setItem('dining_session_start', new Date().getTime());
            if(html5QrCode) { html5QrCode.stop().then(() => { setTimeout(() => { html5QrCode.clear(); window.closeScanner(); }, 100); }).catch(e => { console.log(e); window.closeScanner(); }); } 
            else { window.closeScanner(); }
            
            let scannedRestId = null; if(decodedText.includes('rest=')) scannedRestId = decodedText.split('rest=')[1].split('&')[0];
            const currentRestId = new URLSearchParams(window.location.search).get('rest');
            const customAlert = document.getElementById('customAlert'); if(customAlert) customAlert.classList.remove('show');

            if(scannedRestId && scannedRestId !== currentRestId) { window.location.href = window.location.pathname + '?rest=' + scannedRestId; } 
            else { if(typeof window.showToast === 'function') window.showToast("Table Unlocked Successfully! 🎉"); }
        } else {
            isQRProcessing = false; if(typeof window.showToast === 'function') window.showToast("Invalid QR Code!"); else alert("Invalid QR Code!");
        }
    }, (errorMessage) => {} ).catch((err) => { alert("Camera permission is required to scan the QR."); window.closeScanner(); });
};

window.closeScanner = () => {
    const modal = document.getElementById('qrScannerModal'); if(modal) modal.classList.remove('show');
    if (html5QrCode) { html5QrCode.stop().then(() => { setTimeout(() => { html5QrCode.clear(); }, 100); }).catch((err) => {}); }
    isQRProcessing = false;
};

window.checkSessionValid = () => {
    const startTime = localStorage.getItem('dining_session_start');
    if (!startTime) return true; 
    const diffHours = (new Date().getTime() - parseInt(startTime)) / (1000 * 60 * 60);
    
    if (diffHours >= SESSION_LIMIT_HOURS) {
        document.getElementById('alertIcon').innerHTML = '<i class="ph-fill ph-clock" style="color: var(--danger); font-size: 55px;"></i>';
        document.getElementById('alertMessage').innerText = 'Session Expired!';
        let alertBox = document.querySelector('#customAlert .alert-box'); let existingP = alertBox.querySelector('.split-desc');
        if(!existingP) { existingP = document.createElement('p'); existingP.className = 'split-desc'; existingP.style.color = 'var(--text-sub)'; existingP.style.marginBottom = '20px'; existingP.style.fontSize = '14px'; document.getElementById('alertMessage').after(existingP); }
        existingP.innerHTML = `Your dining session of ${SESSION_LIMIT_HOURS} hours has ended.<br><br><button onclick="openInAppScanner()" style="background:var(--primary-gradient); color:white; border:none; padding:15px; border-radius:50px; font-weight:800; cursor:pointer; margin-top:10px; width: 100%; box-shadow: 0 4px 15px rgba(229,57,53,0.3); display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 15px;"><i class="ph-bold ph-camera" style="font-size: 22px;"></i> Scan QR to Unlock</button>`;
        document.getElementById('customAlert').classList.add('show'); if(navigator.vibrate) navigator.vibrate([50, 100, 50]); return false;
    }
    return true;
};
window.initDiningSession();

window.placeOrder = async () => {
    if (!window.checkSessionValid()) { window.toggleCart(); return; }
    if (Object.keys(window.cart).length === 0) { alert("Please add items to your cart first!"); return; }
    
    const tableNo = document.getElementById('tableNumber').value; const custName = document.getElementById('customerName').value;
    const custPhone = document.getElementById('customerPhone').value; const notes = document.getElementById('cookingNotes').value; 
    if (window.currentOrderType === 'Dine-in' && !tableNo) { alert("Please enter your Table Number!"); return; }
    if (window.currentOrderType === 'Takeaway' && !custName) { alert("Please enter your name for takeaway!"); return; }

    const btn = document.getElementById('checkoutBtn'); btn.innerHTML = 'Processing...'; btn.style.background = "#FF9F00"; btn.style.boxShadow = "none"; btn.disabled = true;
    const modalContent = document.querySelector('.cart-content'); modalContent.style.opacity = "0.5";

    let orderItems = []; let grandTotal = 0;
    for (let k in window.cart) { 
        orderItems.push({ id: window.cart[k].id || "", name: window.cart[k].name || "", price: window.cart[k].price || 0, variant: window.cart[k].variant || "", qty: window.cart[k].qty || 1 }); 
        grandTotal += (window.cart[k].price * window.cart[k].qty); 
    }

    try {
        const docRef = await addDoc(collection(db, "orders"), { restaurantId: window.currentRestaurantId, orderType: window.currentOrderType || "Dine-in", tableNumber: String(tableNo || "N/A"), customerName: String(custName || "N/A"), customerPhone: String(custPhone || "N/A"), chefNotes: String(notes || "None"), items: orderItems, totalAmount: Number(grandTotal), status: 'New', paymentMethod: 'Cash', timestamp: new Date() });
        let activeOrdersList = []; try { activeOrdersList = JSON.parse(localStorage.getItem('craveActiveOrders') || '[]'); } catch(e) {}
        activeOrdersList.push(docRef.id); localStorage.setItem('craveActiveOrders', JSON.stringify(activeOrdersList)); window.listenToLiveOrder(docRef.id); 
        window.cart = {}; localStorage.removeItem('nextplate_cart'); document.getElementById('cookingNotes').value = ''; 
        window.updateGlobalCartUI(); window.checkCartForCurrentDish(); window.toggleCart(); modalContent.style.opacity = "1"; window.launchConfetti(); 
        setTimeout(() => { let earnedCoins = Math.floor(grandTotal / 10); document.getElementById('earnedCoins').innerText = earnedCoins; document.getElementById('coinModal').classList.add('show'); window.triggerHapticPop(); }, 1000);
        setTimeout(() => { window.switchOrderTab('live'); window.toggleTracker(); }, 3500); 
    } catch (e) { console.error("FIREBASE ERROR: ", e); modalContent.style.opacity = "1"; alert("Order Failed. Check connection."); 
    } finally { btn.innerHTML = `${currentLang === 'hi' ? i18n.hi.place : i18n.en.place} <i class="ph-bold ph-arrow-right"></i>`; btn.style.background = "var(--primary-gradient)"; btn.style.boxShadow = "0 8px 25px rgba(226, 55, 68, 0.3)"; btn.disabled = false; }
};

// 🔥 SAAS TRENDING FILTER 🔥
async function fetchTrendingDishes() {
    try {
        const q = query(collection(db, "orders"), where("restaurantId", "==", window.currentRestaurantId)); const snap = await getDocs(q); let counts = {};
        snap.forEach(d => { if(d.data().items) { d.data().items.forEach(i => { counts[i.id] = (counts[i.id] || 0) + i.qty; }); } });
        window.trendingIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5);
    } catch(e) {}
}

let savedOrdersList = []; try { savedOrdersList = JSON.parse(localStorage.getItem('craveActiveOrders') || '[]'); } catch(e) {}
savedOrdersList.forEach(id => window.listenToLiveOrder(id)); fetchTrendingDishes();

// 🔥 SUPER FAST MENU LOADING (CACHE LOGIC) 🔥
try {
    const cachedMenu = localStorage.getItem('nextplate_menu_cache');
    if (cachedMenu) {
        window.allDishes = JSON.parse(cachedMenu);
        if (window.allDishes.length > 0) { window.applyFilters(); if (!window.currentDish) window.loadDish(window.allDishes[0]); }
    }
} catch(e) {}

window.toggleDarkMode = () => {
    const body = document.body; const themeIcon = document.getElementById('theme-icon'); if(!themeIcon) return;
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) { themeIcon.classList.replace('ph-moon', 'ph-sun'); localStorage.setItem('theme', 'dark'); } 
    else { themeIcon.classList.replace('ph-sun', 'ph-moon'); localStorage.setItem('theme', 'light'); }
};

window.addEventListener('load', () => {
    if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); const themeIcon = document.getElementById('theme-icon'); if(themeIcon) themeIcon.classList.replace('ph-moon', 'ph-sun'); }
});

// 🚀 100% BULLETPROOF SPLIT BILL LOGIC 🚀
window.calculateSplitBill = window.openSplitPrompt = function(e) {
    if(e) e.preventDefault();
    let total = 0; for (let key in window.cart) { total += (window.cart[key].price * window.cart[key].qty); }
    if (total === 0) { window.showToast("Your cart is empty!"); return; }
    let splitModal = document.getElementById('splitPromptModal');
    if (!splitModal) {
        splitModal = document.createElement('div'); splitModal.className = 'custom-alert'; splitModal.id = 'splitPromptModal';
        splitModal.innerHTML = `<div class="alert-box"><div class="alert-icon"><i class="ph-fill ph-users" style="color: var(--green);"></i></div><h3>Split Bill</h3><p style="margin-bottom: 15px;">Kitne doston mein bill split karna hai?</p><input type="number" id="splitPeopleInput" class="input-field" placeholder="E.g., 2" value="2" min="2" style="margin-bottom: 25px; text-align: center; font-size: 20px; font-weight: 800; width: 100%; box-sizing: border-box;"><div style="display: flex; gap: 12px;"><button class="btn-cancel" style="background: var(--bg-light); color: var(--text-main); flex:1; padding: 15px; border-radius:50px; border:none; font-weight:700; cursor:pointer;" onclick="closeSplitPrompt()">Cancel</button><button class="alert-btn-primary" style="flex:1; margin:0; background: var(--green); box-shadow: 0 8px 20px rgba(36, 150, 63, 0.3);" onclick="confirmSplitBill()">Split Now</button></div></div>`;
        document.body.appendChild(splitModal);
    }
    document.getElementById('splitPeopleInput').value = '2'; splitModal.classList.add('show');
    if (typeof window.triggerHapticPop === 'function') window.triggerHapticPop();
};

window.closeSplitPrompt = function() { let m = document.getElementById('splitPromptModal'); if(m) m.classList.remove('show'); };
window.confirmSplitBill = function() {
    let total = 0; for (let key in window.cart) { total += (window.cart[key].price * window.cart[key].qty); }
    let people = document.getElementById('splitPeopleInput').value;
    if (people && !isNaN(people) && parseInt(people) > 1) {
        let perPerson = (total / parseInt(people)).toFixed(2); window.closeSplitPrompt();
        document.getElementById('alertIcon').innerHTML = '<i class="ph-fill ph-users" style="color: var(--green); font-size: 50px;"></i>';
        document.getElementById('alertMessage').innerText = 'Bill Split Done!';
        let alertBox = document.querySelector('#customAlert .alert-box'); let existingP = alertBox.querySelector('.split-desc');
        if(!existingP) { existingP = document.createElement('p'); existingP.className = 'split-desc'; existingP.style.color = 'var(--text-sub)'; existingP.style.marginBottom = '20px'; existingP.style.fontSize = '14px'; document.getElementById('alertMessage').after(existingP); }
        existingP.innerHTML = `Total Bill: ₹${total} <br><br> Har dost ko dene honge:<br> <strong style="font-size: 28px; color: var(--green);">₹${perPerson}</strong>`;
        setTimeout(() => { document.getElementById('customAlert').classList.add('show'); if(navigator.vibrate) navigator.vibrate(50); }, 300);
    } else { window.showToast("Kam se kam 2 log chahiye bro!"); }
};

// =========================================================
// 🗣️ VOICE TO TEXT FOR CHEF NOTES
// =========================================================
window.startChefVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { window.showToast("Voice typing not supported on this browser."); return; }
    const recognition = new SpeechRecognition(); recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
    const micBtn = document.getElementById('chefMicBtn');
    micBtn.style.color = 'white'; micBtn.style.background = 'var(--danger)'; micBtn.classList.add('bounce-pop');
    if(typeof window.triggerHapticPop === 'function') window.triggerHapticPop();
    recognition.start();
    recognition.onresult = (e) => { const noteInput = document.getElementById('cookingNotes'); noteInput.value += (noteInput.value ? ' ' : '') + e.results[0][0].transcript; };
    recognition.onspeechend = () => { micBtn.style.color = 'var(--primary)'; micBtn.style.background = 'var(--bg-light)'; micBtn.classList.remove('bounce-pop'); };
    recognition.onerror = () => { micBtn.style.color = 'var(--primary)'; micBtn.style.background = 'var(--bg-light)'; micBtn.classList.remove('bounce-pop'); };
};

// =========================================================
// ⭐ DISH RATING & REVIEW SYSTEM
// =========================================================
window.currentRatingVal = 0;
window.dishToRateId = null;

window.openRatingModal = () => {
    if(!window.currentDish) return;
    window.dishToRateId = window.currentDish.id; document.getElementById('ratingDishName').innerText = window.currentDish.name;
    window.setRating(0); document.getElementById('reviewText').value = ''; document.getElementById('ratingModal').classList.add('show');
};

window.closeRatingModal = () => { document.getElementById('ratingModal').classList.remove('show'); window.dishToRateId = null; };

window.setRating = (val) => {
    window.currentRatingVal = val; const stars = document.getElementById('starContainer').querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < val) { star.classList.add('active'); star.classList.add('bounce-pop'); setTimeout(() => star.classList.remove('bounce-pop'), 400); } 
        else { star.classList.remove('active'); }
    });
    if(val > 0 && typeof window.triggerHapticPop === 'function') window.triggerHapticPop();
};

window.submitRating = async () => {
    if (window.currentRatingVal === 0) {
        if (typeof window.showToast === 'function') window.showToast("Please select a star rating! ⭐");
        return;
    }

    const reviewInput = document.querySelector("textarea") || document.getElementById('reviewText') || document.getElementById('reviewInput');
    const commentText = reviewInput ? reviewInput.value.trim() : "Great dish!";
    
    // 🔥 URL YA APP SE RESTAURANT ID UTHAO (Taaki Admin POS se match ho)
    const urlParams = new URLSearchParams(window.location.search);
    const restId = window.currentRestaurantId || urlParams.get('rest') || 'rest_001';
    
    // Jis dish par review diya, uska naam
    const dishName = window.currentDish ? window.currentDish.name : "Foodie";

    try {
        // 🔥 ADMIN POS KE EXACT 'reviews' COLLECTION ME SAVE KARO
        await addDoc(collection(db, "reviews"), {
            restaurantId: restId,                     // 👈 Admin POS iske bina show nahi karta
            customerName: "Diner - " + dishName,      // 👈 Dish ka naam customer name ki jagah dikhega
            rating: Number(window.currentRatingVal),  // 👈 Star Rating (1 se 5)
            comment: commentText || "Loved the food! ⭐",
            timestamp: new Date()                     // 👈 Current date & time
        });

        window.closeRatingModal();
        if (typeof window.showToast === 'function') {
            window.showToast("Thank you for your review! ⭐");
        } else {
            alert("Thank you for your review! ⭐");
        }
    } catch (e) {
        console.error("Review error:", e);
        if (typeof window.showToast === 'function') window.showToast("Failed to submit review");
    }
};


const originalAddCurrentToCart = window.addCurrentToCart;
window.addCurrentToCart = (e) => {
    originalAddCurrentToCart(e); const cartIcon = document.getElementById('float-btn-view');
    if(cartIcon) { cartIcon.classList.remove('bounce-pop'); void cartIcon.offsetWidth; cartIcon.classList.add('bounce-pop'); }
};

// ==========================================
// 👨‍🍳 CHEF NOTE LOGIC
// ==========================================
window.openChefNotePrompt = () => {
    if (!window.currentDish) return;
    document.getElementById('tempChefNote').value = ''; 
    document.getElementById('chefNoteModal').classList.add('show');
    if(typeof window.triggerHapticPop === 'function') window.triggerHapticPop();
};

window.closeChefNotePrompt = () => {
    document.getElementById('chefNoteModal').classList.remove('show');
};

window.saveChefNote = () => {
    const note = document.getElementById('tempChefNote').value.trim();
    if (note) {
        const mainNoteInput = document.getElementById('cookingNotes');
        // Cart wale main text area me dish name ke sath note append kar denge
        mainNoteInput.value += (mainNoteInput.value ? ' | ' : '') + window.currentDish.name + ': ' + note;
        window.showToast("Note Added! 👨‍🍳");
    }
    window.closeChefNotePrompt();
};

async function loadDynamicMenu() {
    try {
        console.log("⏳ Fetching data from Database...");
        // Pehle hi smart greeting chalu kar do
        if(typeof window.updateSmartGreeting === 'function') window.updateSmartGreeting();

        const restaurant = await APIService.getRestaurant();
        const categories = await APIService.getCategories();
        const dishes = await APIService.getDishes();

        if (!restaurant) { console.error("❌ Restaurant not found! Default ID use ho rahi hai."); return; }
        document.title = `${restaurant.name} - Smart Menu`;

        // 🍔 1. Loader me Hotel ka asli naam dikhao aur Cache me Save karo
        const loaderBrand = document.getElementById('loader-brand-name');
        const loaderTagline = document.getElementById('loader-tagline');
        if (loaderBrand && restaurant.name) {
            loaderBrand.innerText = restaurant.name;
            if (loaderTagline) loaderTagline.innerText = "Setting up your digital table...";
            localStorage.setItem('crave_hotel_name_cache', restaurant.name);
        }

        // 🔥 BULLETPROOF SAAS NAME REPLACER 🔥
        if (restaurant.name !== "Smart Menu") {
            const replaceText = (node) => {
                if (node.nodeType === 3 && node.nodeValue) { if (node.nodeValue.includes("NextPlate")) { node.nodeValue = node.nodeValue.replace("NextPlate", restaurant.name); } } 
                else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') { node.childNodes.forEach(child => replaceText(child)); }
            };
            replaceText(document.body);
        }

        window.allDishes = dishes;
        if (typeof window.applyFilters === 'function') { window.applyFilters(); }
        if (window.allDishes.length > 0) { window.loadDish(window.allDishes[0]); }
        console.log("✅ Data Load & Render Successful!");
    } catch(e) { console.error("❌ Data load error:", e); }
}

window.addEventListener('DOMContentLoaded', () => {
    if(typeof initSession === 'function') initSession();
    loadDynamicMenu();
});
