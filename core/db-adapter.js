
import { getSessionData } from './session.js';

// JSON Data Fetching Service
class JsonService {
    constructor() {
        this.dbUrl = './data/mock-db.json';
        this.cache = null; // Ek baar load hoga toh cache me save rahega
    }

    // Database load karne ka function with Error Handling
    async loadDB() {
        if (!this.cache) {
            try {
                const response = await fetch(this.dbUrl);
                this.cache = await response.json();
            } catch (error) {
                console.error("Database connection error!", error);
                return null;
            }
        }
        return this.cache;
    }

    // 1. Restaurant Info Lana
    async fetchRestaurant(restId) {
        const data = await this.loadDB();
        return data ? (data.restaurants[restId] || null) : null;
    }

    // 2. Categories Lana
    async fetchCategories(restId) {
        const data = await this.loadDB();
        return data ? data.categories.filter(cat => cat.restaurantId === restId) : [];
    }

    // 3. Dishes Lana
    async fetchDishes(restId) {
        const data = await this.loadDB();
        return data ? data.dishes.filter(dish => dish.restaurantId === restId) : [];
    }
    
    // 4. Tables Lana (Future Proofing)
    async fetchTables(restId) {
        // Abhi ke liye empty chhod rahe hain, Firebase lagne par asli tables aayengi
        return [];
    }
    
    // 5. Order Place Karna (JSON read-only hota hai, isiliye console par show karenge)
    async saveOrder(restId, orderData) {
        console.log(`[Database] Order placed for ${restId}:`, orderData);
        // Fake order ID generate kar rahe hain testing ke liye
        return { success: true, orderId: "ORD" + Math.floor(Math.random() * 10000) };
    }
}

// 🚀 Active Database Switcher (Kal yahan FirebaseService likhenge)
const db = new JsonService();

// 🌉 The Ultimate API Gateway (UI hamesha isko call karega)
export const APIService = {
    getRestaurant: async () => {
        const session = getSessionData();
        return await db.fetchRestaurant(session.rid);
    },
    
    getCategories: async () => {
        const session = getSessionData();
        return await db.fetchCategories(session.rid);
    },
    
    getDishes: async () => {
        const session = getSessionData();
        return await db.fetchDishes(session.rid);
    },
    
    getTables: async () => {
        const session = getSessionData();
        return await db.fetchTables(session.rid);
    },
    
    placeOrder: async (orderData) => {
        const session = getSessionData();
        return await db.saveOrder(session.rid, orderData);
    }
};
