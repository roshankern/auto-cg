'use client'

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
        // Handle the response as needed (e.g., download the PDF)
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'event.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
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
