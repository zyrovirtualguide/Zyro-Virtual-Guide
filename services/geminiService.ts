
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const TACTICAL_DOSSIER_INSTRUCTION = `
You are the ZYRO STRATEGIC INTELLIGENCE AGENT. 
Your objective is to generate a series of "Data Packets" for specific strategic landmarks or zones within a city.
For each place, provide:
1. placeName: Name of the landmark/zone.
2. intelLevel: Security clearance level (e.g., UNCLASSIFIED, RESTRICTED, TOP SECRET).
3. significance: Why this site is a priority target for travelers (history/culture).
4. logistics: How to reach and navigate the site (transit/coordinates).
5. recommendedDays: Suggested duration to spend at this specific site (e.g., "1 Day", "4-6 Hours", "2 Days").
6. dayByDayStrategy: If duration > 1 day, provide a day-by-day breakdown. If < 1 day, provide a sequence of 3 key objectives (phases).
7. hospitality: Provide specific suggestions for:
   - "Base of Operations": 1-2 recommended hotels/stays nearby.
   - "Refueling Stations": 1-2 recommended local dining/cafes nearby.
8. operativesNotes: Hidden secrets, "local operative" tips, or warnings.
Format: Return as a JSON array of dossiers. Be concise and use tactical terminology.
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

export const getPlaceRecommendations = async (city: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `INITIATE DEEP SCAN: Sector ${city}. Generate 5 tactical data packets. For each, include a detailed "Day-by-Day Strategy" or "Phase sequence" for the recommended stay duration.`,
      config: {
        systemInstruction: TACTICAL_DOSSIER_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              placeName: { type: Type.STRING },
              intelLevel: { type: Type.STRING },
              significance: { type: Type.STRING },
              logistics: { type: Type.STRING },
              recommendedDays: { type: Type.STRING },
              dayByDayStrategy: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of daily objectives or phased sequences for the stay duration"
              },
              hospitality: { 
                type: Type.OBJECT,
                properties: {
                  stays: { type: Type.ARRAY, items: { type: Type.STRING } },
                  dining: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["stays", "dining"]
              },
              operativesNotes: { type: Type.STRING }
            },
            required: ["placeName", "intelLevel", "significance", "logistics", "recommendedDays", "dayByDayStrategy", "hospitality", "operativesNotes"]
          }
        }
      }
    });

    return safeParse(response.text, []);
  } catch (err) {
    console.error("Dossier Service Error:", err);
    return [];
  }
};

export const getMapMarkers = async (city: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List 8 significant tactical POIs in ${city} with precise lat/lng. Return JSON.`,
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
    return [];
  }
};

export const generateItinerary = async (city: string, days: number, interests: string[]) => {
  const ai = getAI();
  const prompt = `Generate a ${days}-day itinerary for ${city} focused on ${interests.join(', ')}. Return JSON.`;
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
                }
              }
            }
          }
        }
      }
    }
  });
  return safeParse(response.text, []);
};

export const getTravelSuggestions = async (persona: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 4 destinations for "${persona}". For each, include recommended stay duration and 1 hospitality stay suggestion. Return JSON.`,
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
            logistics: { type: Type.STRING },
            recommendedDays: { type: Type.STRING },
            baseOfOperations: { type: Type.STRING, description: "One recommended hotel name" }
          },
          required: ["location", "region", "why", "highlight", "bestTime", "logistics", "recommendedDays", "baseOfOperations"]
        }
      }
    }
  });
  return safeParse(response.text, []);
};
