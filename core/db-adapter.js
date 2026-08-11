import { getSessionData } from './session.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// 🔥 IMPORT ME 'query' AUR 'where' ADD KIYA 🔥
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Tumhara Asli Firebase Config
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

// The Pro Firebase Service
class FirebaseService {
    
    // 1. Restaurant Info Lana (Ab ye DYNAMIC hai)
    async fetchRestaurant(restId) {
        try {
            // Database se us hotel ka naam mangwa rahe hain
            const q = query(collection(db, "merchants"), where("restaurantId", "==", restId));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const data = snap.docs[0].data();
                return {
                    id: restId,
                    name: data.restaurantName || "Smart Menu",
                    currency: "₹",
                    isOpen: true
                };
            }
        } catch (error) {
            console.error("Restaurant details fetch error:", error);
        }
        
        // Agar net slow ho toh ye backup chalega
        return { id: restId, name: "Smart Menu", currency: "₹", isOpen: true };
    }

    // 2. Categories Lana
    async fetchCategories(restId) {
        return []; 
    }

  // 3. 🔥 ASLI MAGIC: BOUNCER HATA DIYA GAYA 🔥
    async fetchDishes(restId) {
        try {
            // Pehle sab aa raha tha, ab sirf 'restId' wala menu download hoga
            const qMenu = query(collection(db, "menu_items"), where("restaurantId", "==", restId));
            const querySnapshot = await getDocs(qMenu);
            
            let tempDishes = [];
            
            querySnapshot.forEach((doc) => { 
                let d = doc.data();
                
                // 🛑 Yahan ka Bouncer (if inStock !== false) hata diya gaya hai!
                
                let parsedImages = [];
                if (d.images && Array.isArray(d.images)) parsedImages = d.images;
                else if (d.image && typeof d.image === 'string') parsedImages = [d.image];
                else if (d.imageUrl && typeof d.imageUrl === 'string') parsedImages = [d.imageUrl];

                tempDishes.push({ 
                    id: doc.id, 
                    name: d.name || "Special Dish", 
                    emoji: d.emoji || "🍲", 
                    category: d.category || "Veg", 
                    price: d.price || 0, 
                    priceHalf: d.priceHalf || null, 
                    pricePiece: d.pricePiece || null, 
                    modelUrl: d.modelUrl || "", 
                    images: parsedImages,
                    restaurantId: restId,
                    // 🔥 NAYA JADOO: Ye front-end ko batayega ki stock me hai ya nahi!
                    inStock: d.inStock 
                }); 
            });
            return tempDishes;
        } catch(error) {
            console.error("❌ Firebase fetch error:", error);
            return [];
        }
    }
} // 🛑 <--- YE RAHA WO MISSING BRACKET JO MAINE ADD KAR DIYA HAI 🔥

// 🚀 Active Database Switcher
const database = new FirebaseService();

// 🌉 The API Gateway (🔥 STRICT SAAS UPDATE 🔥)
export const APIService = {
    getRestaurant: async () => {
        // Ab session memory par depend nahi rahenge, direct URL wali ID use karenge!
        return await database.fetchRestaurant(window.currentRestaurantId);
    },
    getCategories: async () => {
        return await database.fetchCategories(window.currentRestaurantId);
    },
    getDishes: async () => {
        return await database.fetchDishes(window.currentRestaurantId);
    }
};
