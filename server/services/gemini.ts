import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_ENV_VAR || ""
});

export async function generateSolutions(questionText: string): Promise<string> {
  try {
    if (!questionText.trim()) {
      throw new Error("Question text is required");
    }

    const prompt = `You are an expert tutor. Analyze the following question paper and provide detailed, step-by-step solutions for each question. Format your response in markdown with clear headings and explanations.

Question Paper:
${questionText}

Please provide:
1. Clear identification of each question
2. Step-by-step solution methodology
3. Final answers where applicable
4. Explanations of key concepts used

Format the response professionally with proper markdown formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const solution = response.text;
    
    if (!solution) {
      throw new Error("No solution generated from AI model");
    }

    return solution;
  } catch (error) {
    console.error("Error generating solutions:", error);
    throw new Error(`Failed to generate solutions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function validateApiKey(): Promise<boolean> {
  try {
    const testResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Test connection",
    });
    
    return !!testResponse.text;
  } catch (error) {
    console.error("API key validation failed:", error);
    return false;
  }
}
