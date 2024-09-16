'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const defaultEventLink = 'https://community.case.edu/yoga/rsvp_boot?id=2258478';

  const handleAutoRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const eventLink = formData.get('eventLink') as string;
    const unixTimestamp = formData.get('unixTimestamp') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // encrypt the username and password before api call
    const encryptedUsername = "testEncryptedUsername";
    const encryptedPassword = "testEncryptedPassword";

    console.log('Attempting to auto-register...');

    try {
      const zeploToken = process.env.NEXT_PUBLIC_ZEPLO_TOKEN;
      const delayUntilTimestamp = parseInt(unixTimestamp);

      const response = await axios({
        method: 'POST',
        url: 'https://zeplo.to/auto-cg.vercel.app/api',
        params: {
          _token: zeploToken,
          _delay: delayUntilTimestamp,
        },
        data: {
          eventLink,
          encryptedUsername,
          encryptedPassword,
        },
      });

      console.log(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to auto-register:', error.response?.data || error.message);
      } else {
        console.error('Error occurred:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleAutoRegister}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventLink">
            Event Link
          </label>
          <input
            id="eventLink"
            name="eventLink"
            type="text"
            defaultValue={defaultEventLink}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter event link"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unixTimestamp">
            Unix Timestamp
          </label>
          <input
            id="unixTimestamp"
            name="unixTimestamp"
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter Unix timestamp"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Auto Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
