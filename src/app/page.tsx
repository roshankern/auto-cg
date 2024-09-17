"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [minDatetime, setMinDatetime] = useState("");

  useEffect(() => {
    // Get current time, add 5 minutes, and format it as YYYY-MM-DDTHH:MM
    const now = new Date();
    now.setMinutes(now.getMinutes());
    const formatted = now
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(" ", "T");
    setMinDatetime(formatted);
  }, []);

  const [loading, setLoading] = useState(false);
  const defaultEventLink =
    "https://community.case.edu/web/rsvp_boot?id=2258484";

  const handleAutoRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const eventLink = formData.get("eventLink") as string;
    const datetime = formData.get("datetime") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    console.log("Username:", username);
    console.log("Password:", password);

    // encrypt the username and password before api call
    const { encryptedUsername, encryptedPassword } = await encryptData(
      username,
      password
    );

    // Convert the datetime value to a Unix timestamp, subtracting 15 seconds
    const unixTimestamp = Math.floor(new Date(datetime).getTime() / 1000) - 15;

    console.log("Attempting to auto-register...");

    try {
      const response = await axios({
        method: "POST",
        url: "/api/proxy",
        data: {
          eventLink,
          encryptedUsername,
          encryptedPassword,
          unixTimestamp,
        },
      });

      console.log(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Failed to auto-register:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error occurred:", error);
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
        <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Auto Register for Campus Groups Event (CWRU)
        </h1>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="eventLink"
          >
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
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="datetime"
          >
            Auto Registration Date + Local Time
          </label>
          <input
            id="datetime"
            name="datetime"
            type="datetime-local"
            min={minDatetime}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
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
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
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
            {loading ? "Registering..." : "Auto Register"}
          </button>
        </div>

        <p className="mt-4 text-gray-500 text-sm">
          <strong>Attention</strong>: You should always be cautious when sharing
          login details. We use SOTA encryption to keep login info secure and
          never record usernames or passwords. CampusGroups is also the only
          service (to our knowledge) that does not require Duo authentication
          for a new login.
        </p>
      </form>
    </div>
  );
}

const encryptData = async (
  username: string,
  password: string
): Promise<{ encryptedUsername: string; encryptedPassword: string }> => {
  try {
    const response = await fetch("/api/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }), // Send both username and password to be encrypted
    });

    if (!response.ok) {
      throw new Error("Failed to encrypt the username and password");
    }

    // Parse the response to get the encrypted username and password
    const data: { encryptedUsername: string; encryptedPassword: string } =
      await response.json();
    return data;
  } catch (error) {
    console.error("Error encrypting username and password:", error);
    throw error; // Rethrow the error to be handled in the next step
  }
};
