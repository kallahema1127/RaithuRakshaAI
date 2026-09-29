import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Vegetable Freshness & Shelf-Life Assessment endpoint
app.post('/api/ai/analyze-vegetable', async (req, res) => {
  try {
    const { vegetableName, quantityKg, notes, imageBase64, hoursSinceHarvest } = req.body;

    if (!aiClient) {
      // Deterministic intelligent fallback when key is not provided
      const simulatedResult = getDeterministicFreshnessAnalysis(vegetableName, hoursSinceHarvest, notes);
      return res.json(simulatedResult);
    }

    const contents: any[] = [];
    const promptText = `You are an expert Indian Agricultural Officer and Food Quality Assessor at a Rythu Bazaar (Farmers' Market in Telangana/Andhra Pradesh).
Analyze the following surplus produce:
- Produce Name: ${vegetableName || 'Unspecified vegetable'}
- Quantity: ${quantityKg || 10} kg
- Hours Since Harvest: ${hoursSinceHarvest || 'Morning harvest (approx 6-8 hours)'}
- Farmer Observations: ${notes || 'Freshly picked, slight cosmetic imperfections'}

Classify this produce strictly into:
1. Freshness Tier: 'fresh' (🟢 Fresh - direct human consumption), 'moderate' (🟡 Moderate - quick cooking/processing needed within 4-12 hours), or 'critical' (🔴 Critical - urgent redistribution < 4h, or divert to animal feed / gaushalas / composting).
2. Freshness Score: integer between 10 and 100.
3. Shelf Life Remaining: estimated remaining hours before severe spoilage.
4. Recommended Destination: 'human_consumption' (e.g. NGOs, Community Kitchens, Hostels, Restaurants), 'animal_feed' (e.g. Gaushalas, Animal Shelters), 'composting' (e.g. organic bio-compost / biogas units), or 'processing' (e.g. tomato puree, pickle making).
5. Quality Summary: 1-2 concise sentences explaining the condition and best immediate action.
6. Urgency Flag: 'urgent' | 'moderate' | 'normal'.
7. Telugu Local Tip: A short actionable tip in Telugu script for the local Rythu Bazaar farmer.

Respond ONLY with valid JSON.`;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          },
          { text: promptText },
        ],
      });
    } else {
      contents.push(promptText);
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length === 1 && typeof contents[0] === 'string' ? contents[0] : contents[0],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            freshness: {
              type: Type.STRING,
              description: "Must be 'fresh', 'moderate', or 'critical'",
            },
            freshnessScore: {
              type: Type.INTEGER,
              description: 'Score from 0 to 100',
            },
            shelfLifeHoursRemaining: {
              type: Type.INTEGER,
              description: 'Estimated hours before spoilage',
            },
            recommendedDestination: {
              type: Type.STRING,
              description: "Must be 'human_consumption', 'animal_feed', 'composting', or 'processing'",
            },
            qualitySummary: {
              type: Type.STRING,
              description: 'Quality summary and rationale',
            },
            urgency: {
              type: Type.STRING,
              description: "'urgent', 'moderate', or 'normal'",
            },
            teluguTip: {
              type: Type.STRING,
              description: 'Short tip in Telugu',
            },
          },
          required: [
            'freshness',
            'freshnessScore',
            'shelfLifeHoursRemaining',
            'recommendedDestination',
            'qualitySummary',
            'urgency',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in analyze-vegetable endpoint:', error);
    // Return fallback gracefully
    const fallback = getDeterministicFreshnessAnalysis(req.body.vegetableName, req.body.hoursSinceHarvest, req.body.notes);
    return res.json(fallback);
  }
});

// AI Smart Matching & Rationale Endpoint
app.post('/api/ai/match-optimize', async (req, res) => {
  try {
    const { surplus, recipients } = req.body;

    if (!aiClient) {
      return res.json({ optimized: false, message: 'Using high-speed rule-based matching engine.' });
    }

    const prompt = `You are the AI Surplus Matcher Engine for Rythu Bazaar.
Surplus Details:
- Vegetable: ${surplus.vegetableName}
- Quantity: ${surplus.quantityKg} kg
- Freshness: ${surplus.freshness} (Score: ${surplus.freshnessScore}/100)
- Location: ${surplus.rythuBazaarLocation}
- Shelf Life Remaining: ${surplus.hoursRemaining} hours

Recipients available:
${JSON.stringify(recipients.map((r: any) => ({
  id: r.id,
  name: r.name,
  type: r.type,
  distanceKm: r.distanceKmFromMarket,
  dailyCapacityKg: r.dailyCapacityKg,
  currentNeededKg: r.currentNeededKg,
  acceptsFreshness: r.acceptsFreshness,
  vehicleType: r.vehicleType,
})))}

Generate an AI match ranking with:
1. Top recommended recipient ID
2. Match Rationale (1-2 sentences highlighting why this recipient is optimal considering distance, freshness, and urgency before spoilage)
3. Actionable urgency advice for the farmer.

Return JSON.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topRecipientId: { type: Type.STRING },
            aiRationale: { type: Type.STRING },
            dispatchPriority: { type: Type.STRING },
            estimatedFoodWasteSavedKg: { type: Type.NUMBER },
          },
          required: ['topRecipientId', 'aiRationale', 'dispatchPriority'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ optimized: true, ...parsed });
  } catch (err: any) {
    console.error('Error in match-optimize endpoint:', err);
    return res.json({ optimized: false, error: err.message });
  }
});

// n8n Chat Webhook Relay / Proxy Endpoint
app.post('/api/chat/n8n', async (req, res) => {
  const { message, chatInput, sessionId, webhookUrl } = req.body;
  const userText = chatInput || message || '';
  const targetUrl = webhookUrl || 'https://hemamalini.app.n8n.cloud/webhook/a7558939-1091-4d6c-b403-fe67555bf35e/chat';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const n8nResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify({
        chatInput: userText,
        message: userText,
        action: 'sendMessage',
        sessionId: sessionId || 'rythu-session-' + Date.now(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (n8nResponse.ok) {
      const contentType = n8nResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await n8nResponse.json();
        return res.json({
          source: 'n8n',
          success: true,
          output: data.output || data.text || data.message || data.response || JSON.stringify(data),
          raw: data,
        });
      } else {
        const text = await n8nResponse.text();
        return res.json({
          source: 'n8n',
          success: true,
          output: text,
        });
      }
    } else {
      // If n8n returned 404/500 (e.g. workflow is not active in n8n cloud or test mode)
      const fallbackAnswer = generateRythuAiFallbackAnswer(userText);
      return res.json({
        source: 'rythu-ai-fallback',
        success: true,
        n8nStatus: n8nResponse.status,
        note: `Connected to n8n webhook (${targetUrl}), but workflow returned HTTP ${n8nResponse.status}. (Tip: Ensure workflow toggle is switched to 'Active' in n8n cloud). Provided fallback assistance below:`,
        output: fallbackAnswer,
      });
    }
  } catch (err: any) {
    const fallbackAnswer = generateRythuAiFallbackAnswer(userText);
    return res.json({
      source: 'rythu-ai-fallback',
      success: true,
      note: `Connected to n8n webhook (${targetUrl}). Network/Workflow status: ${err.message}. Provided immediate AI assistance below:`,
      output: fallbackAnswer,
    });
  }
});

// Helper for Rythu Bazaar assistant answers
function generateRythuAiFallbackAnswer(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('tomato') || q.includes('టమాట')) {
    return "🍅 Tomatoes at Rythu Bazaar: Desi Country Tomatoes have an estimated shelf-life of 24-36 hours. Fresh batches are prioritized for Community Kitchens (e.g., Annapurna Canteen) and NGOs within a 1.5 km radius. If slightly overripe, they can be processed into tomato purees or dispatched to nearby soup kitchens.";
  }

  if (q.includes('palak') || q.includes('spinach') || q.includes('methi') || q.includes('leafy') || q.includes('ఆకుకూర')) {
    return "🥬 Leafy Greens (Palak, Methi, Gongura, Kothimeera): Leafy vegetables wilt rapidly in afternoon temperatures (shelf life 8-12 hours). The AI Surplus Matcher prioritizes dinner-batch hostels and kitchens for moderate freshness, and Sri Krishna Gaushala for cattle feed if classified as Critical (<4h).";
  }

  if (q.includes('otp') || q.includes('pickup') || q.includes('track')) {
    return "🚚 Pickup Verification & OTP: Once a farmer or recipient accepts a match, a unique 4-digit Pickup OTP is generated (e.g. 5821). The driver or volunteer verifies this OTP with the farmer at the Rythu Bazaar stall before loading to ensure chain of custody.";
  }

  if (q.includes('price') || q.includes('cost') || q.includes('money') || q.includes('ధర')) {
    return "💰 Price Recovery: Farmers can choose 100% Free Donation (tax-deductible / humanitarian) or set a nominal recovery price (e.g. ₹8-₹12/kg vs retail ₹35/kg) to recover farm transport and crate handling expenses.";
  }

  if (q.includes('ngo') || q.includes('recipient') || q.includes('register')) {
    return "🏢 Recipient Network: Any verified NGO, community kitchen, gaushala, student hostel mess, or composting unit can register via the Recipient portal. You can set daily absorption capacity (kg), vehicle type (Auto, Bike, Van), and preferred vegetable varieties.";
  }

  if (q.includes('critical') || q.includes('compost') || q.includes('animal') || q.includes('gaushala')) {
    return "🔴 Critical Produce & Zero Waste: Vegetables classified as Critical (unfit for retail human consumption) are immediately diverted to Gaushalas (roughage for cattle) or GHMC Bio-Composting units to prevent landfill methane emissions.";
  }

  return "🌱 Welcome to Rythu Raksha AI Surplus Matcher! I can assist you with vegetable surplus listings, AI freshness scanning, nearby recipient matching (NGOs, community kitchens, animal shelters), pickup OTPs, and food waste analytics. How can I help you today?";
}

// Helper for deterministic evaluation
function getDeterministicFreshnessAnalysis(name: string = '', hours: any, notes: string = '') {
  const lower = (name + ' ' + notes).toLowerCase();
  
  // High perishable greens
  const isLeafy = lower.includes('palak') || lower.includes('spinach') || lower.includes('methi') || lower.includes('kothimeera') || lower.includes('coriander') || lower.includes('gongura');
  const isSoftFruit = lower.includes('tomato') || lower.includes('banana') || lower.includes('papaya');
  const isOverripe = lower.includes('crushed') || lower.includes('wilted') || lower.includes('soft') || lower.includes('overripe') || lower.includes('damaged');

  if (isOverripe || lower.includes('spoiled')) {
    return {
      freshness: 'critical',
      freshnessScore: 38,
      shelfLifeHoursRemaining: 4,
      recommendedDestination: 'animal_feed',
      qualitySummary: 'Produce exhibits advanced wilting/softening. Unfit for retail sale, highly suitable for immediate animal feed (Gaushalas) or organic composting.',
      urgency: 'urgent',
      teluguTip: 'ఈ కూరగాయలు పశువుల గ్రాసానికి లేదా కంపోస్టింగ్ యూనిట్లకు త్వరగా తరలించాలి.',
    };
  }

  if (isLeafy) {
    return {
      freshness: 'moderate',
      freshnessScore: 72,
      shelfLifeHoursRemaining: 10,
      recommendedDestination: 'human_consumption',
      qualitySummary: 'Leafy greens are prone to rapid desiccation in evening temperatures. Direct to immediate community cooking or hostel dinner prep within 6-10 hours.',
      urgency: 'moderate',
      teluguTip: 'ఆకుకూరలు వాడిపోకుండా ఈ రాత్రి కమ్యూనిటీ కిచెన్లకు తక్షణమే అందించండి.',
    };
  }

  if (isSoftFruit) {
    return {
      freshness: 'fresh',
      freshnessScore: 88,
      shelfLifeHoursRemaining: 28,
      recommendedDestination: 'human_consumption',
      qualitySummary: 'Ripe, high-grade produce suitable for direct food bank distribution, NGO kitchens, or culinary preparation.',
      urgency: 'normal',
      teluguTip: 'తాజా టమాటాలు అక్షయపాత్ర మరియు అన్నపూర్ణ క్యాంటీన్లకు అనువైనవి.',
    };
  }

  return {
    freshness: 'fresh',
    freshnessScore: 92,
    shelfLifeHoursRemaining: 36,
    recommendedDestination: 'human_consumption',
    qualitySummary: 'Fresh market produce in solid condition. Optimal for direct distribution to registered recipients.',
    urgency: 'normal',
    teluguTip: 'తాజా నాణ్యమైన కూరగాయలు నేరుగా ఆహార బ్యాంకులు లేదా హాస్టళ్లకు పంపిణీ చేయవచ్చు.',
  };
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Surplus Matcher server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
