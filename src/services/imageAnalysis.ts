// Image Analysis Service - Phase 3
// Uses OpenAI Vision (GPT-4o) for detailed furniture analysis
import { AnalysisResult } from '../types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_VISION_URL = 'https://api.openai.com/v1/chat/completions';

// Retry config
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Optimized prompt for furniture analysis
const FURNITURE_PROMPT = `Du bist ein Möbelexperte. Analysiere dieses Bild und identifiziere das Möbelstück.

Antworte NUR mit validem JSON im folgenden Format:
{
  "category": "sofa|chair|table|shelf|bed|lamp|cabinet|desk|wardrobe|other",
  "style": "modern|scandinavian|industrial|vintage|minimalist|mid-century|classic|bohemian|rustic|art-deco|bauhaus|other",
  "colors": ["hauptfarbe1", "hauptfarbe2"],
  "material": "wood|leather|fabric|metal|glass|plastic|rattan|marble|velvet|other",
  "description": "Kurze Beschreibung des Möbelstücks auf Deutsch (1-2 Sätze)",
  "confidence": 0.85,
  "searchTerms": ["suchbegriff1", "suchbegriff2", "suchbegriff3"]
}

Regeln:
- "colors" max 4 Farben, auf Englisch
- "confidence" zwischen 0 und 1
- "searchTerms" sind optimierte Suchbegriffe für Online-Shops (auf Englisch)
- "description" auf Deutsch
- Falls kein Möbelstück erkannt wird, setze category auf "other" und confidence unter 0.3
- Kein anderer Text außer dem JSON`;

export class ImageAnalysisService {
  /**
   * Analyze a furniture image using OpenAI Vision
   * Returns structured data about category, style, colors, material
   */
  static async analyzeImage(imageBase64: string): Promise<AnalysisResult> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
      console.warn('OpenAI API key not configured. Using mock data.');
      return this.getMockAnalysis();
    }

    // Retry loop
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          await this.delay(RETRY_DELAY_MS * attempt);
          console.log(`Retry attempt ${attempt}/${MAX_RETRIES}...`);
        }

        const result = await this.callOpenAIVision(imageBase64);
        const validated = this.validateResult(result);
        return validated;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);

        // Don't retry on auth errors
        if (lastError.message.includes('401') || lastError.message.includes('403')) {
          console.error('Authentication error - check API key');
          break;
        }
      }
    }

    console.error('All attempts failed, using mock data. Last error:', lastError);
    return this.getMockAnalysis();
  }

  /**
   * Call OpenAI Vision API
   */
  private static async callOpenAIVision(imageBase64: string): Promise<AnalysisResult> {
    const response = await fetch(OPENAI_VISION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: FURNITURE_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 600,
        temperature: 0.3, // Low temp for consistent structured output
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';

    // Clean up response (remove markdown code blocks if present)
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanContent) as AnalysisResult;
  }

  /**
   * Validate and sanitize the analysis result
   */
  private static validateResult(result: AnalysisResult): AnalysisResult {
    // Ensure required fields exist
    const validated: AnalysisResult = {
      category: result.category || 'other',
      style: result.style || 'modern',
      colors: Array.isArray(result.colors) ? result.colors.slice(0, 4) : ['unknown'],
      material: result.material || 'unknown',
      description: result.description || 'Keine Beschreibung verfügbar',
      confidence: typeof result.confidence === 'number' 
        ? Math.max(0, Math.min(1, result.confidence)) 
        : 0.5,
      searchTerms: Array.isArray(result.searchTerms) ? result.searchTerms : [],
    };

    // Generate search terms if not provided
    if (validated.searchTerms.length === 0) {
      validated.searchTerms = [
        `${validated.style} ${validated.category}`,
        `${validated.material} ${validated.category}`,
        `${validated.colors[0]} ${validated.category}`,
      ];
    }

    return validated;
  }

  /**
   * Delay helper for retry logic
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fallback mock data for testing without API keys
   */
  static getMockAnalysis(): AnalysisResult {
    return {
      category: 'chair',
      style: 'modern',
      colors: ['brown', 'black'],
      material: 'leather',
      description: 'Moderner Ledersessel mit Holzbeinen und eleganter Polsterung',
      confidence: 0.85,
      searchTerms: ['modern leather chair', 'leather armchair', 'brown accent chair'],
    };
  }
}
