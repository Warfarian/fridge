require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
    console.error(`Error fetching nutrition data for ${item}:`, error.message);
    throw error;
  }
}

async function generateRecipe(ingredients, preferences = {}) {
  try {
    const prompt = buildRecipePrompt(ingredients, preferences);
    const response = await axios.post(process.env.NEBIUS_API_URL, {
      model: 'deepseek-v3',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful cooking assistant that generates recipes based on available ingredients and dietary preferences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.NEBIUS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return parseRecipeResponse(response.data.choices[0].message.content);
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
Format the response as JSON with the following structure:
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
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing recipe response:', error);
    throw new Error('Invalid recipe format received');
  }
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
app.post('/api/generate-recipes', async (req, res) => {
  try {
    const { items, preferences } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    // Get nutrition data and generate recipe in parallel
    const [nutritionData, recipe] = await Promise.all([
      Promise.all(items.map(item => getNutritionData(item))),
      generateRecipe(items, preferences)
    ]);

    res.json({
      nutritionData,
      recipe
    });
  } catch (error) {
    console.error('Error in generate-recipes:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
