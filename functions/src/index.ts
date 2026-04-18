import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getCrowdRoutingSuggestion = onCall(async (request) => {
  try {
    const { sections } = request.data;
    if (!sections || !Array.isArray(sections)) {
      throw new HttpsError("invalid-argument", "Missing sections array in request.");
    }

    const payloadString = sections.map((s: any) => 
      `Section: ${s.name || 'Unknown'}, Occupancy: ${s.occupancyPct || 0}%`
    ).join("\n");

    const prompt = `Based on the following occupancy at JN Stadium Kochi for a Kerala Blasters ISL match:
${payloadString}

Suggest crowd routing strategies or gate redirections to avoid critical crowding. Keep it highly specific, actionable and below 3 sentences. If the occupancy is completely safe, just say that everything looks good.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const suggestion = result.response.text();

    return { suggestion, success: true };
  } catch (error: any) {
    console.error("getCrowdRoutingSuggestion error:", error);
    return { 
      suggestion: "AI Analysis currently unavailable. Please direct stewards manually based on visual crowd density.", 
      success: false 
    };
  }
});

export const broadcastAlert = onCall(async (request) => {
  try {
    const { message, zone, type } = request.data;
    if (!message || !zone || !type) {
      throw new HttpsError("invalid-argument", "Missing required fields: message, zone, type");
    }

    const prompt = `Translate the following stadium alert message into Spanish, Hindi, and Malayalam. Format the response as a valid JSON object strictly with the keys "es", "hi", and "ml" containing the translated string in values. ONLY output the JSON object without any other text or markdown block. Message: "${message}"`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    
    let translations = {};
    try {
      let text = result.response.text().trim();
      if (text.startsWith("```json")) {
        text = text.substring(7, text.length - 3).trim();
      }
      translations = JSON.parse(text);
    } catch (e: any) {
      console.error("Translation parsing failed:", e);
    }

    const alertDoc = {
      message,
      translations,
      zone,
      type,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("alerts").add(alertDoc);

    return { success: true };
  } catch (error: any) {
    console.error("broadcastAlert error:", error);
    throw new HttpsError("internal", error.message);
  }
});

export const simulateLiveOccupancy = onSchedule("every 5 minutes", async (_event) => {
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

    const fluctuation = Math.floor(Math.random() * 81) - 40;
    let newOccupancy = current + fluctuation;

    if (newOccupancy < 0) newOccupancy = 0;
    if (newOccupancy > capacity) newOccupancy = capacity;

    const occupancyPct = Math.round((newOccupancy / capacity) * 100);
    
    let status = "clear";
    if (occupancyPct >= 85) status = "critical";
    else if (occupancyPct >= 65) status = "busy";

    batch.update(doc.ref, {
      currentOccupancy: newOccupancy,
      occupancyPct,
      status
    });
  });

  await batch.commit();
  console.log(`Updated ${snapshot.size} sections with simulated live occupancy.`);
});
