import { useState } from 'react';
import { useIngredients } from '../context/IngredientsContext';

export default function CheckNowButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { refreshIngredients } = useIngredients();

  const handleCheck = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      // First, trigger the camera capture and upload
      const runResponse = await fetch('http://192.168.1.8:5000/run');
      if (!runResponse.ok) {
        throw new Error('Failed to check fridge');
      }
      const runResult = await runResponse.text();
      console.log('Pi Camera Response:', runResult);
      
      // Then fetch the JSON data
      const jsonResponse = await fetch('http://192.168.1.8:5000/get_json');
      if (!jsonResponse.ok) {
        throw new Error('Failed to get ingredients');
      }
      const jsonData = await jsonResponse.json();
      console.log('Pi JSON Response:', jsonData);

      // Update the message with the camera response
      setMessage(runResult);

      // Trigger a refresh in RecipeGenerator
      await refreshIngredients();
    } catch (error) {
      console.error('Error checking fridge:', error);
      setMessage('❌ Failed to check fridge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCheck}
        disabled={isLoading}
        className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? 'Checking...' : 'Check Now'}
      </button>
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}