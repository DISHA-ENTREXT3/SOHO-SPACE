
import { GoogleGenAI } from '@google/genai';

/**
 * Soho Space AI Service
 * Handles AI analysis using free/open-source models.
 * Fallbacks between Hugging Face (Open Source) and Gemini (Free Tier).
 */

const HUGGINGFACE_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

async function callAI(prompt: string): Promise<string> {
  // Attempt 1: Hugging Face (Mistral - Open Source)
  const hfToken = (import.meta as any).env.VITE_HUGGINGFACE_API_KEY;
  if (hfToken) {
    try {
      console.log('[AI] Attempting Open Source analysis via Hugging Face...');
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`,
        {
          headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 1000 } }),
        }
      );
      const result = await response.json();
      if (result[0]?.generated_text) {
        return result[0].generated_text.replace(prompt, '').trim();
      }
    } catch (e) {
      console.warn('[AI] Hugging Face failed, falling back to Gemini Free Tier.', e);
    }
  }

  // Attempt 2: Gemini (Free Tier Fallback)
  const geminiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.VITE_GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      console.log('[AI] Attempting Gemini Free Tier analysis...');
      const genAI = new (GoogleGenAI as any)(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.error('[AI] Gemini failed:', e);
      throw new Error('AI Service currently matching high demand. Please try again in a moment.');
    }
  }

  throw new Error('Coming Soon: AI analysis features are currently being calibrated for public release.');
}

export const aiService = {
  /**
   * Generates analysis for a partner profile.
   */
  async analyzePartner(partnerData: any): Promise<string> {
    const prompt = `Role: You are an elite Venture Capital talent scout.
    Task: Analyze this Growth Partner profile for a high-growth startup founder.
    Output: Markdown report with:
    1. **Superpower Summary**: One punchy sentence describing their unique value.
    2. **Growth Vector**: How they specifically accelerate revenue or user acquisition based on their skills.
    3. **Risk Analysis**: Potential blind spots (e.g., if they are too specialized).
    4. **The 'Hard Thing' Questions**: 3 probing interview questions to test their actual expertise level in their top skills.
    
    Profile:
    Name: ${partnerData.name}
    Bio: ${partnerData.bio}
    Skills: ${partnerData.skills?.join(', ')}
    Past: ${partnerData.pastCollaborations?.join(', ')}`;

    return await callAI(prompt);
  },

  /**
   * Generates a professional CV based on partner profile data.
   */
  async generatePartnerCV(partnerData: any): Promise<string> {
    const prompt = `Role: Expert Executive CV Writer.
    Task: Create a high-converting, modern Professional CV for a Growth Partner.
    Output: Clean, well-structured Markdown CV including:
    - **Professional Summary**: High-impact narrative (3-4 sentences).
    - **Core Expertise**: Top 5 technical and strategic skills.
    - **Record of Success**: Strategic breakdown of managed brands and previously scaled projects.
    - **Operational Style**: Work mode preferences and geographic reach.
    
    Data:
    Name: ${partnerData.name}
    Bio: ${partnerData.bio}
    Skills: ${partnerData.skills?.join(', ')}
    Managed Brands: ${partnerData.managedBrands?.join(', ')}
    Location: ${partnerData.location}`;

    return await callAI(prompt);
  }
};
