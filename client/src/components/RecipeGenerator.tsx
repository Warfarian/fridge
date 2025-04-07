import { useState, useEffect } from 'react';

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  nutritionEstimate: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

interface Preferences {
  restrictions: string[];
  cuisine: string;
}

interface ProcessedIngredient {
  name: string;
  nutritionData?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

// Parse ingredients from raw_output
const parseIngredients = (rawOutput: string): string[] => {
  console.log('Raw output to parse:', rawOutput);
  const ingredientSet = new Set<string>();
  
  // Split by newlines and process each line
  const lines = rawOutput.split('\n');
  
  lines.forEach(line => {
    // Extract ingredient name, removing quantities and prep instructions
    let ingredient = line
      .replace(/^[^a-zA-Z]+/, '') // Remove leading non-letter characters
      .split('-')[0] // Take only the part before any dash
      .split('(')[0] // Remove parenthetical notes
      .replace(/\d+(\.\d+)?(\s*\/\s*\d+)?/g, '') // Remove numbers and fractions
      .replace(/around|about|approximately/gi, '') // Remove approximation words
      .replace(/bunch(es)?|container[s]?|head[s]?/gi, '') // Remove container words
      .trim()
      .toLowerCase();
    
    console.log('Extracted ingredient:', ingredient);
    if (ingredient && !ingredient.includes('here') && ingredient !== 'list') {
      ingredientSet.add(ingredient);
    }
  });

  const result = Array.from(ingredientSet);
  console.log('Final parsed ingredients:', result);
  return result;
};

export default function RecipeGenerator() {
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    restrictions: [],
    cuisine: 'any'
  });

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const response = await fetch('http://localhost:3000/output/qwen_output.json');
        const data = await response.json();
        console.log('Fetched data:', data);
        if (data && data.raw_output) {
          const newIngredients = parseIngredients(data.raw_output);
          console.log('Parsed ingredients:', newIngredients);
          setDetectedIngredients(prev => {
            const currentSet = new Set(prev);
            const newSet = new Set(newIngredients);
            const areEqual = currentSet.size === newSet.size && 
              [...currentSet].every(value => newSet.has(value));
            return areEqual ? prev : newIngredients;
          });
        }
      } catch (err) {
        console.error('Failed to load ingredients:', err);
      }
    };

    loadIngredients();

    const interval = setInterval(loadIngredients, 30000);
    return () => clearInterval(interval);
  }, []);

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setDetectedIngredients(prev => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setDetectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const generateRecipe = async () => {
    if (detectedIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/generate-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: detectedIngredients,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      setRecipe(data.data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 transition-colors">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Detected Ingredients</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {detectedIngredients.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 transition-colors"
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(index)}
                className="ml-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="border-t dark:border-gray-700 pt-4">
          <h3 className="text-md font-medium mb-4 text-gray-900 dark:text-white">Add Additional Ingredients</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter an ingredient"
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 transition-colors"
            />
            <button
              onClick={addIngredient}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dietary Restrictions
              </label>
              <select
                multiple
                value={preferences.restrictions}
                onChange={(e) => setPreferences({
                  ...preferences,
                  restrictions: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 transition-colors"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten-free</option>
                <option value="dairy-free">Dairy-free</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cuisine Preference
              </label>
              <select
                value={preferences.cuisine}
                onChange={(e) => setPreferences({
                  ...preferences,
                  cuisine: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 transition-colors"
              >
                <option value="any">Any</option>
                <option value="italian">Italian</option>
                <option value="asian">Asian</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateRecipe}
            disabled={loading || detectedIngredients.length === 0}
            className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-gray-600 transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200 rounded-md transition-colors">
              {error}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 transition-colors">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Generating Recipe...</h2>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        </div>
      )}

      {recipe && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{recipe.name}</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Ingredients</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Nutrition Estimate</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(recipe.nutritionEstimate).map(([nutrient, value]) => (
                <div key={nutrient} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md transition-colors">
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{nutrient}</div>
                  <div className="font-medium text-gray-900 dark:text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}