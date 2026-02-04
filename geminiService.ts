
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Vite 环境变量使用 import.meta.env
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  private async callGemini(prompt: string, base64Image: string, aspectRatio?: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
            { text: prompt },
          ],
        },
        config: { imageConfig: { aspectRatio: (aspectRatio as any) || "1:1" } }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part?.inlineData) throw new Error('No image generated');
      return `data:image/png;base64,${part.inlineData.data}`;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async removeBackground(base64Image: string): Promise<string> {
    return this.callGemini("Extract the main subject and remove everything else from the background. Output ONLY the subject with a pure transparent background.", base64Image);
  }

  async idPhoto(base64Image: string, color: string): Promise<string> {
    return this.callGemini(`Remove background and replace with solid ${color}. Perform light professional face retouching and center the subject for an ID photo.`, base64Image, "3:4");
  }

  async createMeme(base64Image: string, topText: string, bottomText: string): Promise<string> {
    return this.callGemini(`Add professional-looking meme text: "${topText}" at the top and "${bottomText}" at the bottom.`, base64Image);
  }

  async upscale(base64Image: string): Promise<string> {
    return this.callGemini("Upscale this image, enhance details, and remove noise.", base64Image);
  }

  async restorePhoto(base64Image: string): Promise<string> {
    return this.callGemini("Restore this old photo: remove scratches, fix damages, sharpen blurry parts, and add natural colors if it's black and white.", base64Image);
  }

  async removeObject(base64Image: string, description: string): Promise<string> {
    return this.callGemini(`Smartly remove "${description}" from this image and fill the gap seamlessly with surrounding background textures.`, base64Image);
  }
}

export const geminiService = new GeminiService();
