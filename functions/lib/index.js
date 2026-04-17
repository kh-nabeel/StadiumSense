"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateLiveOccupancy = exports.broadcastAlert = exports.getCrowdRoutingSuggestion = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const generative_ai_1 = require("@google/generative-ai");
admin.initializeApp();
const db = admin.firestore();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
exports.getCrowdRoutingSuggestion = (0, https_1.onCall)(async (request) => {
    try {
        const { sections } = request.data;
        if (!sections || !Array.isArray(sections)) {
            throw new https_1.HttpsError("invalid-argument", "Missing sections array in request.");
        }
        const payloadString = sections.map((s) => `Section: ${s.name || 'Unknown'}, Occupancy: ${s.occupancyPct || 0}%`).join("\n");
        const prompt = `Based on the following occupancy at JN Stadium Kochi for a Kerala Blasters ISL match:
${payloadString}

Suggest crowd routing strategies or gate redirections to avoid critical crowding. Keep it highly specific, actionable and below 3 sentences. If the occupancy is completely safe, just say that everything looks good.`;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const suggestion = result.response.text();
        return { suggestion, success: true };
    }
    catch (error) {
        console.error("getCrowdRoutingSuggestion error:", error);
        return {
            suggestion: "AI Analysis currently unavailable. Please direct stewards manually based on visual crowd density.",
            success: false
        };
    }
});
exports.broadcastAlert = (0, https_1.onCall)(async (request) => {
    try {
        const { message, zone, type } = request.data;
        if (!message || !zone || !type) {
            throw new https_1.HttpsError("invalid-argument", "Missing required fields: message, zone, type");
        }
        const alertDoc = {
            message,
            zone,
            type,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection("alerts").add(alertDoc);
        return { success: true };
    }
    catch (error) {
        console.error("broadcastAlert error:", error);
        throw new https_1.HttpsError("internal", error.message);
    }
});
exports.simulateLiveOccupancy = (0, scheduler_1.onSchedule)("every 5 minutes", async (event) => {
    const snapshot = await db.collection("sections").get();
    if (snapshot.empty) {
        console.log("No sections found.");
        return;
    }
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const capacity = data.capacity || 1000;
        const current = data.currentOccupancy || 0;
        let fluctuation = Math.floor(Math.random() * 81) - 40;
        let newOccupancy = current + fluctuation;
        if (newOccupancy < 0)
            newOccupancy = 0;
        if (newOccupancy > capacity)
            newOccupancy = capacity;
        const occupancyPct = Math.round((newOccupancy / capacity) * 100);
        let status = "clear";
        if (occupancyPct >= 85)
            status = "critical";
        else if (occupancyPct >= 65)
            status = "busy";
        batch.update(doc.ref, {
            currentOccupancy: newOccupancy,
            occupancyPct,
            status
        });
    });
    await batch.commit();
    console.log(`Updated ${snapshot.size} sections with simulated live occupancy.`);
});
//# sourceMappingURL=index.js.map