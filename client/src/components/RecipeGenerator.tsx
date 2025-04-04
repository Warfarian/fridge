import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

interface Ingredient {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

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

export default function RecipeGenerator() {
  const { user } = useUser();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    restrictions: [],
    cuisine: 'any'
  });

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
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
          items: ingredients,
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

  return (
    <div className="space-y-8">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Add Ingredients</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
            placeholder="Enter an ingredient"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            onClick={addIngredient}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(index)}
                className="ml-2 text-indigo-600 hover:text-indigo-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dietary Restrictions
            </label>
            <select
              multiple
              value={preferences.restrictions}
              onChange={(e) => setPreferences({
                ...preferences,
                restrictions: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-free</option>
              <option value="dairy-free">Dairy-free</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cuisine Preference
            </label>
            <select
              value={preferences.cuisine}
              onChange={(e) => setPreferences({
                ...preferences,
                cuisine: e.target.value
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          disabled={loading || ingredients.length === 0}
          className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Recipe'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      {recipe && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{recipe.name}</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Ingredients</h3>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Nutrition Estimate</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">Calories</div>
                <div className="font-medium">{recipe.nutritionEstimate.calories}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">Protein</div>
                <div className="font-medium">{recipe.nutritionEstimate.protein}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">Carbs</div>
                <div className="font-medium">{recipe.nutritionEstimate.carbs}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">Fat</div>
                <div className="font-medium">{recipe.nutritionEstimate.fat}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}