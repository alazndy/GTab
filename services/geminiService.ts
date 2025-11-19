import { GoogleGenAI, Type } from "@google/genai";
import { Category, ShortcutPayload } from "../types";

// Initialize Gemini Client
// Note: In a real production app, user might need to input their key via UI if .env is not set
// But per instructions, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a list of shortcut suggestions based on a user prompt.
 * E.g., "I want to learn Python" -> Returns Python.org, RealPython, etc.
 */
export const generateSmartShortcuts = async (prompt: string): Promise<ShortcutPayload[]> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: `Suggest 3-5 useful websites/shortcuts based on this request: "${prompt}". 
      Map them to the most appropriate category from the list: Sosyal, İş, Geliştirme, Eğlence, Alışveriş, Diğer.
      Return valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING },
              category: { 
                type: Type.STRING, 
                enum: Object.values(Category)
              }
            },
            required: ["title", "url", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as ShortcutPayload[];
    return data;

  } catch (error) {
    console.error("Gemini AI generation error:", error);
    return [];
  }
};

/**
 * Analyzes a single URL/Title to categorize it automatically.
 */
export const categorizeLink = async (title: string, url: string): Promise<Category> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize this website: Title: "${title}", URL: "${url}". 
      Return only one string value from this enum: Sosyal, İş, Geliştirme, Eğlence, Alışveriş, Diğer.`,
      config: {
        responseMimeType: "text/plain",
      }
    });
    
    const result = response.text?.trim();
    // Basic validation to ensure it matches our enum
    const validCategories = Object.values(Category);
    if (result && validCategories.includes(result as Category)) {
      return result as Category;
    }
    return Category.OTHER;
  } catch (error) {
    console.error("Gemini Categorization error:", error);
    return Category.OTHER;
  }
};