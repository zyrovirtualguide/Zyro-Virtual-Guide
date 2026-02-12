
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GenAI client with safety checks for the browser environment
const getAI = () => {
  const apiKey = (window as any).process?.env?.API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn("ZYRO WARNING: API_KEY is missing. AI features will be unavailable.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
};

const GLOBAL_CONTEXT = `
You are a specialist in global tourism and cultural intelligence for the Zyro World Guide. 
Expertise: Worldwide heritage, local culinary traditions, hidden gems, and international logistics.
Tone: Professional, insightful, and culturally respectful.
Instructions: Provide accurate transit tips, safety advice, and "local-only" secrets for any destination worldwide.
`;

const safeParse = (text: string | undefined, fallback: any = []) => {
  if (!text) return fallback;
  try {
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemini JSON Parse Error:", e);
    return fallback;
  }
};

export const generateItinerary = async (city: string, days: number, interests: string[]) => {
  const ai = getAI();
  const prompt = `${GLOBAL_CONTEXT} Generate a comprehensive ${days}-day itinerary for ${city} focused on ${interests.join(', ')}. 
  Include specific timings, logistics between points, and cultural etiquette.
  Return a JSON array where each object has "day" (int) and "activities" (array of {time, activity, location, description, lat, lng}).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.INTEGER },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    location: { type: Type.STRING },
                    description: { type: Type.STRING },
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  },
                  required: ["time", "activity", "location", "description", "lat", "lng"]
                }
              }
            },
            required: ["day", "activities"]
          }
        }
      }
    });
    return safeParse(response.text, []);
  } catch (err) {
    console.error("Itinerary Service Error:", err);
    throw err;
  }
};

export const getTravelSuggestions = async (persona: string) => {
  const ai = getAI();
  const prompt = `${GLOBAL_CONTEXT} Suggest 4-5 diverse international destinations for the "${persona}" travel persona. 
  Include country, rationale (why), key highlight, best time to visit, and entry requirements (visa type). Return as JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              region: { type: Type.STRING },
              why: { type: Type.STRING },
              highlight: { type: Type.STRING },
              bestTime: { type: Type.STRING },
              logistics: { type: Type.STRING }
            },
            required: ["location", "region", "why", "highlight", "bestTime", "logistics"]
          }
        }
      }
    });
    return safeParse(response.text, []);
  } catch (err) {
    console.error("Suggestions Service Error:", err);
    return [];
  }
};

export const getPlaceRecommendations = async (city: string, lat?: number, lng?: number) => {
  const ai = getAI();
  const config: any = {
    tools: [{ googleMaps: {} }, { googleSearch: {} }]
  };

  if (lat && lng) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: { latitude: lat, longitude: lng }
      }
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${GLOBAL_CONTEXT} Provide a deep dive briefing on ${city}. Discuss historical significance, modern lifestyle, local transit systems, and must-visit landmarks. Use Google Search grounding for real-time events or weather updates.`,
      config
    });

    return {
      text: response.text || "No recommendations found.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c:any) => c.maps || c.web).map((chunk: any) => ({
        title: chunk.maps?.title || chunk.web?.title || 'World Registry Source',
        uri: chunk.maps?.uri || chunk.web?.uri
      })) || []
    };
  } catch (err) {
    console.error("Recommendations Service Error:", err);
    return { text: "Orbital link failed. Please retry discovery.", sources: [] };
  }
};

export const getMapMarkers = async (city: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List 8 significant global landmarks in ${city} with precise latitude and longitude. Return JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              category: { type: Type.STRING }
            },
            required: ["name", "lat", "lng", "category"]
          }
        }
      }
    });
    return safeParse(response.text, []);
  } catch (err) {
    console.error("Map Marker Service Error:", err);
    return [];
  }
};
