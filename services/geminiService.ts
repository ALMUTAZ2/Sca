
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeContent(content: string): Promise<AnalysisResult> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following scraped web content and provide a structured summary: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A concise executive summary." },
            keyPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "The most important takeaways."
            },
            entities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key people, companies, or technologies mentioned."
            },
            sentiment: {
              type: Type.STRING,
              description: "The overall tone of the content."
            }
          },
          required: ["summary", "keyPoints", "entities", "sentiment"]
        }
      }
    });

    const text = response.text || "{}";
    try {
      return JSON.parse(text) as AnalysisResult;
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Analysis failed to generate valid structured data.");
    }
  }
}

export const gemini = new GeminiService();
