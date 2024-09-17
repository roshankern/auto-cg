import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";

// Handle POST request for encryption
export async function POST(req: NextRequest) {
  // Parse the request body
  const { username, password } = await req.json();

  // Validate if username and password are present
  if (!username || !password) {
    return NextResponse.json(
      { message: "Missing username or password" },
      { status: 400 }
    );
  }

  // Get secret key from server-side environment variable
  const secretKey = process.env.PRIVATE_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { message: "Missing secret key" },
      { status: 500 }
    );
  }

  // Encrypt the username and password using the secret key
  const encryptedUsername = CryptoJS.AES.encrypt(
    username,
    secretKey
  ).toString();
  const encryptedPassword = CryptoJS.AES.encrypt(
    password,
    secretKey
  ).toString();

  // Return the encrypted username and password
  return NextResponse.json(
    { encryptedUsername, encryptedPassword },
    { status: 200 }
  );
}
