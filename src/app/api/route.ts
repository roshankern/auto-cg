import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Increase max function duration

const CHROMIUM_PATH =
  "https://vomrghiulbmrfvmhlflk.supabase.co/storage/v1/object/public/chromium-pack/chromium-v123.0.0-pack.tar";

async function getBrowser() {
  if (process.env.VERCEL_ENV === "production") {
    const chromium = await import("@sparticuz/chromium-min").then(
      (mod) => mod.default
    );

    const puppeteerCore = await import("puppeteer-core").then(
      (mod) => mod.default
    );

    const executablePath = await chromium.executablePath(CHROMIUM_PATH);

    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    return browser;
  } else {
    const puppeteer = await import("puppeteer").then((mod) => mod.default);

    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
    });
    return browser;
  }
}

async function autoRegister(
  cg_login_url: string,
  cg_event_url: string,
  username: string,
  password: string
) {
  console.log("Attempting to auto-register...");

  const browser = await getBrowser();
  const page = (await browser.pages())[0];

  // Navigate to the login URL
  await page.goto(cg_login_url);

  // Wait until the username/password fields are present
  await page.waitForSelector("#username", { timeout: 20000 });
  await page.waitForSelector("#password", { timeout: 20000 });

  // Enter the credentials
  if (!username || !password) {
    throw new Error("Missing environment variables for USERNAME or PASSWORD.");
  }
  await page.type("#username", username);
  await page.type("#password", password);

  // Click the login button
  await page.click("#login-submit");

  console.log("CWRU Single Sign-On button clicked successfully.");

  await page.waitForSelector("#header__account-icon", { timeout: 20000 });

  // Navigate to the event URL
  await page.goto(cg_event_url);
  console.log(`Navigated to the event URL: ${cg_event_url}`);

  // Wait for the "Register" button to be clickable and click it
  await page.click("a[href='javascript:submitRegistrationForm()']");

  console.log("Register button clicked successfully.");

  // Wait for the check icon to appear
  await page.waitForSelector("div.check-icon", { timeout: 20000 });

  console.log("Registration successful!");
  await browser.close();
}

function decrypt(data: string, secretKey: string) {
  return CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
}

export async function POST(request: NextRequest) {
  const cg_login_url = "https://www.campusgroups.com/shibboleth/login?idp=cwru";
  const { eventLink, encryptedUsername, encryptedPassword } =
    await request.json();

  if (!eventLink || !encryptedUsername || !encryptedPassword) {
    return new NextResponse(
      JSON.stringify({ message: "Missing required fields" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  const secretKey = process.env.PRIVATE_KEY;

  if (!secretKey) {
    return new NextResponse(
      JSON.stringify({ message: "Encryption key is missing." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  // Decrypt the username and password
  let username;
  let password;
  try {
    username = decrypt(encryptedUsername, secretKey);
    password = decrypt(encryptedPassword, secretKey);
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Decryption failed." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  if (!username || !password) {
    return new NextResponse(
      JSON.stringify({ message: "Missing required fields" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  try {
    await autoRegister(cg_login_url, eventLink, username, password);

    return new NextResponse(
      JSON.stringify({ message: "Registration successful!" }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: `Error: ${error}` }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
