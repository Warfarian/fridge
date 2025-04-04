Goal: Build a backend server that handles item input and returns recipes.

Description: This project is a backend API for a smart fridge application. The system captures images of fridge contents and uses cloud-based inference to identify food items. The only input to this backend is a list of item names (e.g., "carrot", "spinach", "milk") that have already been identified by the upstream image processing pipeline.

The API's job is to: (this will be in the server folder.)

Fetch nutritional information for the items using the Nutritionix API.

Generate recipe suggestions using Nebius AI Studio’s DeepSeek v3, customized to the user's dietary restrictions and preferences (collected during sign-up).

All image handling, inference, and user preference management are handled outside this API.

 Initialize Node.js project and install necessary dependencies.

 Set up Express server with CORS and JSON parsing middleware.

 Define POST route /generate-recipes.

🔹 Phase 1: Integrate Nutritionix API
Goal: Fetch nutrition data for each identified ingredient.

 Create utility function to send each item to Nutritionix.

 Extract key nutrient data (calories, macros, etc.).

 Return structured nutrition data for frontend use.

🔹 Phase 2: Generate Recipes via Nebius AI (DeepSeek)
Goal: Use DeepSeek to generate custom recipes based on inputs.

 Build prompt using ingredient list, dietary restrictions, and preferences.

 Send prompt to Nebius AI Studio’s DeepSeek v3 API.

 Receive and format recipe data (name, ingredients, steps).

🔹 Phase 3: Endpoint Logic & Response Structure
Goal: Combine nutrition info and generated recipes into a single response.

 Accept ingredient list and user ID/preferences in request body.

 Fetch nutrition data and generate recipes in parallel.

 Return structured JSON with recipes and nutrition details.

🔹 Phase 4: Environment Configuration
Goal: Secure all API keys and configurations.

 Store Nutritionix and Nebius keys in .env.

 Load variables using dotenv.

 Validate keys on startup and handle missing configs gracefully.



 