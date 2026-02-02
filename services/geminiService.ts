
import { GoogleGenAI } from "@google/genai";
import { SetbackResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are a Senior Town Planning Consultant for the Nigerian Ministry of Lands. 
Your role is to provide a technical justification for building setback compliance based on statutory Nigerian standards.

STRICT STATUTORY RULES (National Building Code of Nigeria):
1. Side/Rear Setbacks: Minimum 3.0 meters. Values < 3.0m are strictly NON-COMPLIANT.
2. Frontage (Front Setback): Minimum 6.0 meters. Values < 6.0m are strictly NON-COMPLIANT.

TECHNICAL JUSTIFICATION REQUIREMENTS:
- Cite "Fire Safety (preventing building-to-building spread)"
- Cite "Natural Ventilation and Lighting (Public Health Standards)"
- Cite "Access for Emergency Services (Fire Trucks/Ambulances)"
- Cite "Urban Aesthetics and Right-of-Way protection"

Respond in a professional, authoritative tone suitable for an official ministry report. Keep your advisory concise (max 150 words).
`;

export const getAIAdvisory = async (setbacks: SetbackResult): Promise<string> => {
  // Use process.env.API_KEY directly as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `
      Perform a professional assessment of these building measurements:
      - Front Setback: ${setbacks.front}m (Statutory Min: 6.0m)
      - Side Setback: ${setbacks.side}m (Statutory Min: 3.0m)
      - Rear Setback: ${setbacks.rear}m (Statutory Min: 3.0m)
      
      Scanning Observations: ${setbacks.errors.join(', ') || 'No violations detected. Structure is within statutory planning limits.'}.
      
      Provide the official Advisory Remark and technical justification for the Ministry Executive Review Committee.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, // High precision for regulatory reporting
      },
    });

    return response.text || "No advisory generated. Please consult manual registry files.";
  } catch (error) {
    console.error("Gemini Advisory Error:", error);
    return "Technical advisory service interrupted. Please verify compliance manually against Nigerian Building Codes (3.0m Side/Rear, 6.0m Frontage).";
  }
};
