
import { GoogleGenAI } from "@google/genai";

/**
 * Esta es una función serverless de Node.js.
 * El entorno de Vercel proporciona los objetos req (request) y res (response).
 */
export default async function handler(req, res) {
  // Asegurarse de que solo se acepten peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // En el entorno Node.js de Vercel, el body ya está parseado en req.body
    const { level, enemyTypes } = req.body;

    // Validar la entrada
    if (!level || !Array.isArray(enemyTypes)) {
       return res.status(400).json({ error: 'Invalid input' });
    }

    // Inicializar la API de Gemini con la clave del entorno del servidor
    // process.env.API_KEY se debe configurar en el panel de control del hosting
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // Es mejor no exponer este error exacto al cliente por seguridad
      console.error("API_KEY environment variable not set on the server.");
      return res.status(500).json({ error: 'Internal server configuration error.' });
    }
    const ai = new GoogleGenAI({ apiKey });

    const enemyComposition = enemyTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const enemyString = Object.entries(enemyComposition).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ');

    const prompt = `
        You are the mission command AI for a top-secret space force.
        Generate a short, dramatic, and inspiring mission briefing for a lone starfighter pilot about to enter combat.
        Do not greet the pilot or use any introductory phrases like "Here is the briefing". Just start the briefing directly.
        Keep it to 2-3 short paragraphs.
        The mission is designated: Mission ${level}.
        The primary objective is to eliminate all hostile forces in the sector.
        Known enemy composition: ${enemyString}.
        Make it sound like a scene from a classic sci-fi movie like Star Wars or Wing Commander. Be creative and give the mission a cool codename.
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              temperature: 0.9,
              topK: 50,
              topP: 0.95,
          }
      });
      
      const briefingText = response.text;
      if (!briefingText) {
         throw new Error("Gemini API returned an empty response.");
      }
      
      return res.status(200).json({ briefing: briefingText });

  } catch (error) {
    console.error("Error in serverless function:", error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}
