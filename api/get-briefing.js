
import { GoogleGenAI } from "@google/genai";

// Esta es una función Serverless/Edge. 
// La mayoría de los proveedores de hosting (Vercel, Netlify, etc.) la manejarán automáticamente.
// El objeto 'Request' es proporcionado por el entorno de ejecución del hosting.

export default async function handler(req) {
  // Asegurarse de que solo se acepten peticiones POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { level, enemyTypes } = await req.json();

    // Validar la entrada
    if (!level || !Array.isArray(enemyTypes)) {
       return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Inicializar la API de Gemini con la clave del entorno del servidor
    // process.env.API_KEY se debe configurar en el panel de control del hosting
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set on the server.");
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
      
      return new Response(JSON.stringify({ briefing: briefingText }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

  } catch (error) {
    console.error("Error in serverless function:", error);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
