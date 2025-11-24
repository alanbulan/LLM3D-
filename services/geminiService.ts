import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getExplanation = async (concept: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain the concept of "${concept}" in the context of Large Language Models (LLMs) and Transformers clearly and concisely in Chinese. Limit to 2 sentences. strictly plain text, no markdown.`,
    });
    return response.text || "暂无法获取解释。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 服务暂时不可用，请检查 API Key。";
  }
};

export const getPrediction = async (context: string): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Given the sentence: "${context}", what is the most likely next word? Just return the word and a fake probability percentage in this format: "word (95%)".`,
    });
    return response.text || "Unknown";
  } catch (error) {
    return "Error";
  }
}
