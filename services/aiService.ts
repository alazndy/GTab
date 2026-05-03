
/**
 * AI Service for Gemini API integration
 */

export const generateResponse = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please add it in settings.');
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate response from Gemini');
    }

    const data = await response.json();
    
    // Extract text from Gemini response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while calling the AI service');
  }
};
