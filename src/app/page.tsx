'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleAutoRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api', {
        method: 'GET',
      });

      if (response.ok) {
        // Parse the JSON response and log the success message
        const data = await response.json();
        console.log(data.message);
      } else {
        console.error('Failed to auto-register');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={handleAutoRegister}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Auto Register'}
      </button>
    </div>
  );
}
