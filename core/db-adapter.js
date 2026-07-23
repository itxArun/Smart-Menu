import { getSessionData } from './session.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
    
    // 1. Restaurant Info Lana
    async fetchRestaurant(restId) {
        // Future me ye bhi Firebase se aayega. Abhi default bhej rahe hain taaki UI na toote.
        return {
            id: restId,
            name: "Thanos Kitchen", 
            currency: "₹",
            isOpen: true
        };
    }

    // 2. Categories Lana
    async fetchCategories(restId) {
        return []; 
    }

    // 3. 🔥 ASLI MAGIC: Tumhare Firebase se saari dishes wapas laana 🔥
    async fetchDishes(restId) {
        try {
            const querySnapshot = await getDocs(collection(db, "menu_items"));
            let tempDishes = [];
            
            querySnapshot.forEach((doc) => { 
                let d = doc.data();
                if (d.inStock !== false) { 
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
                        restaurantId: restId // Future multi-tenant matching ke liye
                    }); 
                }
            });
            return tempDishes;
        } catch(error) {
            console.error("❌ Firebase fetch error:", error);
            return [];
        }
    }
}

// 🚀 Active Database Switcher (Ab ye Firebase par set hai)
const database = new FirebaseService();

// 🌉 The API Gateway
export const APIService = {
    getRestaurant: async () => {
        const session = getSessionData();
        return await database.fetchRestaurant(session.rid);
    },
    getCategories: async () => {
        const session = getSessionData();
        return await database.fetchCategories(session.rid);
    },
    getDishes: async () => {
        const session = getSessionData();
        return await database.fetchDishes(session.rid);
    }
};
