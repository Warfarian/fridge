import { useState } from 'react';

export default function CheckNowButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheck = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://192.168.1.8:5000/run');
      
      if (!response.ok) {
        throw new Error('Failed to check fridge');
      }

      const result = await response.text();
      console.log('Pi Response:', result);
      setMessage(result);
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