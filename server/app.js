require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
const { exec } = require('child_process');

// Configuration validation
const requiredEnvVars = {
  'NUTRITIONIX_APP_ID': 'Nutritionix App ID',
  'NUTRITIONIX_APP_KEY': 'Nutritionix API Key',
  'NEBIUS_API_KEY': 'Nebius API Key'
};

function validateConfig() {
  const missingVars = [];
  const placeholderVars = [];
  
  for (const [key, name] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missingVars.push(name);
    } else if (
      process.env[key].includes('your_') || 
      process.env[key].includes('YOUR_') ||
      process.env[key].includes('here')
    ) {
      placeholderVars.push(name);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  if (placeholderVars.length > 0) {
    console.error('Found placeholder values for:', placeholderVars.join(', '));
    console.error('Please replace placeholder values in .env with actual API keys');
    process.exit(1);
  }
}

// Validate configuration on startup
validateConfig();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/output', express.static('output')); // Serve the output directory

// Nutritionix API configuration
const NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2';

async function getNutritionData(item) {
  try {
    const response = await axios.post(`${NUTRITIONIX_API_URL}/natural/nutrients`, {
      query: item
    }, {
      headers: {
        'x-app-id': process.env.NUTRITIONIX_APP_ID,
        'x-app-key': process.env.NUTRITIONIX_APP_KEY,
        'Content-Type': 'application/json'
      }
    });

    const food = response.data.foods[0];
    return {
      name: food.food_name,
      calories: food.nf_calories,
      protein: food.nf_protein,
      carbs: food.nf_total_carbohydrate,
      fat: food.nf_total_fat
    };
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(`Authentication failed for Nutritionix API. Please check your API credentials.`);
      throw new Error('Invalid API credentials');
    }
    console.error(`Error fetching nutrition data for ${item}:`, error.message);
    throw error;
  }
}

// Initialize Nebius client
const client = new OpenAI({
    baseURL: 'https://api.studio.nebius.com/v1/',
    apiKey: process.env.NEBIUS_API_KEY,
});

async function generateRecipe(ingredients, preferences = {}) {
  try {
    const prompt = buildRecipePrompt(ingredients, preferences);
    const response = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3",
      max_tokens: 512,
      temperature: 0.3,
      top_p: 0.95,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful cooking assistant that generates recipes based on available ingredients and dietary preferences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return parseRecipeResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating recipe:', error.message);
    throw error;
  }
}

function buildRecipePrompt(ingredients, preferences) {
  const dietaryRestrictions = preferences.restrictions || [];
  const cuisinePreference = preferences.cuisine || 'any';
  
  return `Generate a recipe using some or all of these ingredients: ${ingredients.join(', ')}.
${dietaryRestrictions.length ? `Must be ${dietaryRestrictions.join(' and ')}.` : ''}
${cuisinePreference !== 'any' ? `Prefer ${cuisinePreference} cuisine.` : ''}
Return a raw JSON object (no markdown, no code blocks) with the following structure:
{
  "name": "Recipe Name",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "nutritionEstimate": {
    "calories": "approximate calories",
    "protein": "grams",
    "carbs": "grams",
    "fat": "grams"
  }
}`;
}

function parseRecipeResponse(content) {
  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Error parsing recipe response:', error);
    console.error('Raw content:', content);
    throw new Error('Invalid recipe format received');
  }
}

// Validation middleware
function validateRequest(req, res, next) {
  const { items, preferences } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Invalid request',
      details: 'Items must be a non-empty array of strings'
    });
  }

  if (preferences) {
    const { restrictions, cuisine } = preferences;
    if (restrictions && !Array.isArray(restrictions)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Dietary restrictions must be an array'
      });
    }
    if (cuisine && typeof cuisine !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Cuisine preference must be a string'
      });
    }
  }

  next();
}

// Test endpoint for nutrition data
app.post('/api/nutrition', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    const nutritionData = await Promise.all(
      items.map(item => getNutritionData(item))
    );

    res.json({ nutritionData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nutrition data' });
  }
});

// New endpoint for recipe generation
app.post('/api/generate-recipes', validateRequest, async (req, res) => {
  try {
    const { items, preferences } = req.body;
    
    // Set timeout for the entire operation
    const timeout = setTimeout(() => {
      res.status(504).json({ error: 'Request timeout' });
    }, 30000); // 30 second timeout

    try {
      // Get nutrition data and generate recipe in parallel
      const [nutritionData, recipe] = await Promise.all([
        Promise.all(items.map(item => getNutritionData(item))),
        generateRecipe(items, preferences)
      ]);

      clearTimeout(timeout);

      // Structure the response
      res.json({
        success: true,
        data: {
          ingredients: {
            provided: items,
            nutrition: nutritionData
          },
          recipe: {
            ...recipe,
            preferences: preferences || {}
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  } catch (error) {
    console.error('Error in generate-recipes:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to process request',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add health check endpoint with config status
app.get('/health', (req, res) => {
  const configStatus = {
    nutritionix: {
      configured: Boolean(process.env.NUTRITIONIX_APP_ID && process.env.NUTRITIONIX_APP_KEY)
    },
    nebius: {
      configured: Boolean(process.env.NEBIUS_API_KEY)
    }
  };
  
  res.json({
    status: 'healthy',
    config: configStatus,
    timestamp: new Date().toISOString()
  });
});

// Enhanced error handling for API errors
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Check if error is related to missing API keys
  if (error.message?.includes('API key')) {
    return res.status(500).json({
      error: 'API configuration error',
      details: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment configuration validated successfully');
});
